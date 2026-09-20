import { ref, type Ref } from "vue";
import JSZip from "jszip";
import type {
  LivePhoto,
  MediaVideo,
  MusicResource,
  ToastType,
  VideoBackup,
} from "../types/media";
import { getDownloadFilename } from "../utils/downloadFilename";
import { buildMediaFilename } from "../utils/videoFilename";
import {
  detectSegmentContainer,
  mergeAndDownload,
  mergeSegments,
  prepareSegments,
  looksLikeHlsManifest,
  type HlsSegment,
} from "../utils/segmentDownload";
import { useVideoStore } from "../stores/video";
import type { VideoSelection } from "./useVideoSelection";

/** 懒解析回调返回的结构 */
interface ResolvedVideo {
  url: string;
  video_backup?: VideoBackup[];
}

interface UseMediaDownloadOptions {
  videoStore: ReturnType<typeof useVideoStore>;
  currentVideoUrl: Ref<string>;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  /** 可选的选集状态；用于批量下载与 downloadMainVideo 的源选择 */
  selection?: VideoSelection;
  /** B 站多 P 懒解析：根据 video._cid/index 返回真实直链；null 表示解析失败 */
  resolveVideoUrl?: (video: MediaVideo) => Promise<ResolvedVideo | null>;
}

interface EnqueueOptions {
  /** 显式文件名（已可读）；缺省用 getDownloadFilename */
  filename?: string;
  /** 扩展名，默认 "mp4" */
  ext?: string;
}

function triggerBrowserDownload(url: string, filename: string, newTab = false): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  // 无 Referer 直连，降低 CDN 防盗链拒绝概率
  anchor.referrerPolicy = "no-referrer";
  if (newTab) {
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  }
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function useMediaDownload(options: UseMediaDownloadOptions) {
  const { videoStore, currentVideoUrl, showToast, selection, resolveVideoUrl } =
    options;

  /** 单文件抓取（用于 ZIP 打包，复用 store 之外的简单 fetch） */
  async function fetchBlob(url: string, signal?: AbortSignal): Promise<Blob> {
    const response = await fetch(url, { method: "GET", mode: "cors", signal });
    if (!response.ok) throw new Error(`资源请求失败（HTTP ${response.status}）`);
    return response.blob();
  }

  /**
   * B 站懒解析（多 P / 合集分集）：当 video.url 为空但带 _cid/_bvid 时，
   * 通过 resolveVideoUrl 取真实直链并写回 store，使播放器与下载都可用。
   */
  async function resolveVideo(video: MediaVideo): Promise<MediaVideo> {
    if (video.url || (!video._cid && !video._bvid) || !resolveVideoUrl) return video;
    const resolved = await resolveVideoUrl(video);
    if (!resolved?.url) return video;
    videoStore.patchVideo(video, { url: resolved.url, _resolved: true });
    return { ...video, url: resolved.url, _resolved: true };
  }

  async function downloadFile(url: string, filename: string, downloadId: number): Promise<void> {
    if (!url) return;
    // 兜底防线：HLS 清单地址不可当作完整 mp4 下载（只会得到清单文本）。
    // 分片合并应走 downloadSegments；此处拦截可覆盖重试等旁路调用。
    if (looksLikeHlsManifest(url)) {
      videoStore.updateDownload(downloadId, {
        status: "failed",
        statusText: "下载失败",
        error: "该地址是 HLS 清单，需分片合并下载",
      });
      showToast("该视频为分片流且清单不可访问，无法合并下载", "warning");
      return;
    }
    const abortController = new AbortController();
    videoStore.updateDownload(downloadId, { abortController });

    try {
      videoStore.updateDownload(downloadId, {
        status: "downloading",
        statusText: "下载中...",
        percent: 0,
        loaded: 0,
        total: 0,
      });
      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        signal: abortController.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error("下载响应不支持流式读取");

      const total = Number(response.headers.get("content-length")) || 0;
      const reader = response.body.getReader();
      const chunks: BlobPart[] = [];
      let loaded = 0;
      let lastTime = Date.now();
      let lastLoaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value.slice().buffer as ArrayBuffer);
        loaded += value.length;
        const now = Date.now();
        const elapsed = (now - lastTime) / 1000;
        if (elapsed >= 0.3) {
          videoStore.updateDownload(downloadId, {
            loaded,
            total,
            percent: total > 0 ? Math.round((loaded / total) * 100) : 0,
            speed: (loaded - lastLoaded) / elapsed,
          });
          lastTime = now;
          lastLoaded = loaded;
        }
      }

      // R2: 有 Content-Length 时必须完整收齐，否则失败（fallback 新窗口兜底）
      if (total > 0 && loaded !== total) {
        throw new Error(`下载不完整：期望 ${total} 字节，实际 ${loaded} 字节`);
      }

      const blobUrl = URL.createObjectURL(new Blob(chunks));
      triggerBrowserDownload(blobUrl, filename);
      URL.revokeObjectURL(blobUrl);
      videoStore.updateDownload(downloadId, {
        status: "completed",
        statusText: "已完成",
        percent: 100,
        loaded,
        total: total || loaded,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        videoStore.updateDownload(downloadId, { status: "cancelled", statusText: "已取消" });
        return;
      }
      const message = error instanceof Error ? error.message : "下载失败";
      videoStore.updateDownload(downloadId, {
        status: "failed",
        statusText: "下载失败",
        error: message,
      });
      triggerBrowserDownload(url, filename, true);
      showToast("浏览器无法直接下载，已在新窗口打开资源", "warning");
    }
  }

  /** 分片下载（写入 store 进度） */
  async function downloadSegments(
    segments: (HlsSegment | string)[],
    filename: string,
    downloadId: number,
  ): Promise<void> {
    const abortController = new AbortController();
    videoStore.updateDownload(downloadId, { abortController });
    try {
      videoStore.updateDownload(downloadId, {
        status: "downloading",
        statusText: "下载分片中...",
        percent: 0,
        loaded: 0,
        total: 0,
      });
      const ok = await mergeAndDownload(segments, {
        signal: abortController.signal,
        filename,
        onProgress: (p) =>
          videoStore.updateDownload(downloadId, {
            loaded: p.loaded,
            total: p.total,
            percent: p.percent,
            statusText: `下载分片 ${p.segment}/${p.segmentCount}（${p.percent}%）`,
          }),
      });
      if (!ok) throw new Error("没有可用的分片");
      videoStore.updateDownload(downloadId, {
        status: "completed",
        statusText: "已完成",
        percent: 100,
        loaded: 0,
        total: 0,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        videoStore.updateDownload(downloadId, { status: "cancelled", statusText: "已取消" });
        return;
      }
      const message = error instanceof Error ? error.message : "下载失败";
      videoStore.updateDownload(downloadId, {
        status: "failed",
        statusText: "下载失败",
        error: message,
      });
      showToast("分片下载失败：" + message, "error");
    }
  }

  /** 入队一个下载任务；兼容 `enqueue(url, "mp4")` 旧调用 */
  function enqueue(url: string, extension?: string): void;
  function enqueue(url: string, options?: EnqueueOptions): void;
  function enqueue(
    url: string,
    extensionOrOptions?: string | EnqueueOptions,
  ): void {
    const options: EnqueueOptions =
      typeof extensionOrOptions === "string"
        ? { ext: extensionOrOptions }
        : (extensionOrOptions ?? {});
    // 防线：HLS 清单（.m3u8 / remux 备用流）绝不能当普通 mp4 下载，
    // 否则只会拿到几十字节的清单文本（表现为「只下载到分片片段」）。
    // 走到这里说明上游分片解析全部失败（通常是清单被 CORS 拦截）。
    if (looksLikeHlsManifest(url)) {
      showToast("该视频为分片流且清单不可访问，无法合并下载", "warning");
      return;
    }
    const ext = options.ext ?? "mp4";
    const filename = options.filename ?? getDownloadFilename(url, ext);
    const id = videoStore.addDownload({ filename, url });
    void downloadFile(url, filename, id);
  }

  /** 主直链 + 备用画质链接按顺序去重（分片流候选：首个探测成功者胜出） */
  function segmentCandidates(urls: (string | null | undefined)[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const url of urls) {
      if (!url) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      result.push(url);
    }
    return result;
  }

  function firstSegmentUrl(segments: (HlsSegment | string)[]): string {
    const first = segments[0];
    return typeof first === "string" ? first : first.url;
  }

  /** 为某集构造可读文件名并入队（自动处理分片合并与 B 站懒解析） */
  async function enqueueVideo(video: MediaVideo, fallbackTitle?: string): Promise<void> {
    if (!video) return;
    const resolved = await resolveVideo(video);
    const url = resolved.url || "";
    const resultData = videoStore.resultData;
    // 无显式 segments 时，按候选顺序探测分片流（清单/兄弟分片）：
    // 主直链被 CORS 拦截时（如快手 remux 清单），备用画质清单可能开放 CORS
    let segments: (HlsSegment | string)[] | null =
      resolved.segments && resolved.segments.length > 1
        ? resolved.segments
        : await prepareSegments(
            segmentCandidates([
              url,
              ...((video.video_backup as VideoBackup[] | undefined) ?? []).map((b) => b.url),
              ...(resultData?.video_backup ?? []).map((b) => b.url),
            ]),
          );
    const filename = buildMediaFilename({
      title: resolved.title || fallbackTitle,
      index: resolved.index,
      fallback: url || firstSegmentUrl(segments ?? []),
    });
    if (segments && segments.length > 1) {
      // HLS/分片：合并为单文件；ts 分片存 .ts，其余按 mp4
      const ext = detectSegmentContainer(segments);
      const finalName = filename.replace(/\.mp4$/i, `.${ext}`);
      const id = videoStore.addDownload({
        filename: finalName,
        url: firstSegmentUrl(segments),
        segments: segments.map((s) => (typeof s === "string" ? s : s.url)),
      });
      void downloadSegments(segments, finalName, id);
      return;
    }
    if (!url) {
      showToast("该分集暂不支持下载", "warning");
      return;
    }
    enqueue(url, { filename, ext: "mp4" });
  }

  /** 下载第 index 集（当前合集展示列表内的序号），无则拒之 */
  function downloadVideoByIndex(index: number): void {
    const resultData = videoStore.resultData;
    const video =
      selection?.visibleList.value?.[index] ?? resultData?.videos?.[index];
    if (!video) {
      showToast("该分集不存在", "warning");
      return;
    }
    void enqueueVideo(video, resultData?.title);
  }

  /** 当前集（多选或单选）逐个入队下载 */
  async function downloadSelected(): Promise<void> {
    const resultData = videoStore.resultData;
    if (!resultData) return;

    let videos: MediaVideo[] = [];
    if (selection) {
      videos = selection.getBatchVideos();
    } else {
      // 无 selection 环境：退化为当前单选（videos[0] ?? url）
      const first = resultData.videos?.[0];
      if (first?.url) videos = [first];
      else if (resultData.url) videos = [{ index: 1, url: resultData.url } as MediaVideo];
    }
    const usable = videos.filter(
      (video) =>
        Boolean(video.url) ||
        Boolean(video._cid) ||
        Boolean(video._bvid) ||
        (video.segments?.length ?? 0) > 0,
    );
    if (usable.length === 0) {
      showToast("没有可下载的分集", "warning");
      return;
    }
    for (const video of usable) {
      await enqueueVideo(video, resultData.title);
      await new Promise<void>((resolve) => window.setTimeout(resolve, 200));
    }
    showToast(`已添加 ${usable.length} 个下载任务`);
  }

  /** 下载全部集（逐个 enqueue，不打包） */
  async function downloadAllVideos(): Promise<void> {
    const resultData = videoStore.resultData;
    if (!resultData) return;
    const videos = resultData.videos ?? [];
    const usable = videos.filter(
      (video) =>
        Boolean(video.url) ||
        Boolean(video._cid) ||
        Boolean(video._bvid) ||
        (video.segments?.length ?? 0) > 0,
    );
    if (usable.length === 0) {
      downloadMainVideo();
      return;
    }
    for (const video of usable) {
      await enqueueVideo(video, resultData.title);
      await new Promise<void>((resolve) => window.setTimeout(resolve, 200));
    }
    showToast(`已添加 ${usable.length} 个下载任务`);
  }

  // ── 根因修复：下载源不再读 currentVideoUrl，改为 resultData.videos[selectedIndex] ?? resultData.url
  async function downloadMainVideo(): Promise<void> {
    const resultData = videoStore.resultData;
    if (!resultData) return;
    // 分段视频（快手长视频等）：合并分片为单文件下载
    if (resultData.segments && resultData.segments.length > 1) {
      const filename = buildMediaFilename({
        title: resultData.title ?? "",
        index: undefined,
        fallback: resultData.segments[0],
      });
      const id = videoStore.addDownload({
        filename,
        url: resultData.segments[0],
        segments: resultData.segments,
      });
      void downloadSegments(resultData.segments, filename, id);
      return;
    }
    const idx = selection?.selectedIndex.value ?? 0;
    const list = resultData.videos ?? [];
    // 合集/多 P 场景下优先取选集状态的当前集（合集时为当前合集内选中项）
    const video: MediaVideo | null =
      selection?.currentVideo.value ?? (list.length > idx ? list[idx] : null);
    const url = video?.url ?? resultData.url ?? "";
    if (!url) {
      // 可能是 B 站未解析的分集：尝试懒解析后再下载
      if ((video?._cid || video?._bvid) && resolveVideoUrl) {
        void (async () => {
          const resolved = await resolveVideo(video);
          if (resolved.url) {
            const resolvedSegments = await prepareSegments(
              segmentCandidates([resolved.url, ...(resultData.video_backup ?? []).map((b) => b.url)]),
            );
            if (resolvedSegments && resolvedSegments.length > 1) {
              const filename = buildMediaFilename({
                title: resolved.title ?? resultData.title ?? "",
                index: resolved.index,
                fallback: resolved.url,
              });
              const id = videoStore.addDownload({
                filename,
                url: firstSegmentUrl(resolvedSegments),
                segments: resolvedSegments.map((s) =>
                  typeof s === "string" ? s : s.url,
                ),
              });
              void downloadSegments(resolvedSegments, filename, id);
              return;
            }
            enqueue(resolved.url, {
              filename: buildMediaFilename({
                title: resolved.title ?? resultData.title ?? "",
                index: resolved.index,
                fallback: resolved.url,
              }),
              ext: "mp4",
            });
          } else {
            showToast("该分集暂不支持下载", "warning");
          }
        })();
      }
      return;
    }
    // 疑似分片/清单的 URL：按候选顺序智能识别（主清单被 CORS 拦截时备用清单可能开放）并合并下载
    const segments = await prepareSegments(
      segmentCandidates([
        url,
        ...((video?.video_backup as VideoBackup[] | undefined) ?? []).map((b) => b.url),
        ...(resultData.video_backup ?? []).map((b) => b.url),
      ]),
    );
    if (segments && segments.length > 1) {
      const filename = buildMediaFilename({
        title: video?.title ?? resultData.title ?? "",
        index: video?.index,
        fallback: url,
      });
      const id = videoStore.addDownload({
        filename,
        url: firstSegmentUrl(segments),
        segments: segments.map((s) => (typeof s === "string" ? s : s.url)),
      });
      void downloadSegments(segments, filename, id);
      return;
    }
    enqueue(url, {
      filename: buildMediaFilename({
        title: video?.title ?? resultData.title ?? "",
        index: video?.index,
        fallback: url,
      }),
      ext: "mp4",
    });
  }

  /** 多集打包为 ZIP（分片集先合并为单 mp4，再逐个抓取入包） */
  async function downloadVideosAsZip(videos: MediaVideo[], zipName?: string): Promise<void> {
    const resultData = videoStore.resultData;
    const usable = videos.filter(
      (video) =>
        Boolean(video.url) ||
        Boolean(video._cid) ||
        Boolean(video._bvid) ||
        (video.segments?.length ?? 0) > 0,
    );
    if (usable.length === 0) {
      showToast("没有可下载的分集", "warning");
      return;
    }
    const safeName = zipName && zipName.endsWith(".zip") ? zipName : `videos_${Date.now()}.zip`;
    const downloadId = videoStore.addDownload({
      filename: safeName,
      status: "preparing",
      statusText: "准备中...",
    });
    try {
      const zip = new JSZip();
      for (let i = 0; i < usable.length; i++) {
        const video = await resolveVideo(usable[i]);
        videoStore.updateDownload(downloadId, {
          status: "downloading",
          percent: Math.round((i / usable.length) * 90),
          statusText: `打包第 ${i + 1}/${usable.length} 集...`,
        });
        const base = buildMediaFilename({
          title: video.title,
          index: video.index,
          fallback: video.url || (video.segments?.[0] ?? ""),
        }).replace(/\.mp4$/i, "");
        // 分片流优先：显式 segments → 候选探测（CORS 开放的备用清单）→ 单文件抓取
        const zipSegments =
          video.segments && video.segments.length > 1
            ? video.segments
            : await prepareSegments(
                segmentCandidates([
                  video.url,
                  ...(resultData?.video_backup ?? []).map((b) => b.url),
                ]),
              );
        if (zipSegments && zipSegments.length > 1) {
          const ext = detectSegmentContainer(zipSegments);
          const merged = await mergeSegments(zipSegments);
          zip.file(`${base}.${ext}`, merged);
        } else if (video.url) {
          const blob = await fetchBlob(video.url);
          zip.file(`${base}.mp4`, blob);
        }
      }
      videoStore.updateDownload(downloadId, { percent: 92, statusText: "生成压缩包..." });
      const zipBlob = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
        (metadata) =>
          videoStore.updateDownload(downloadId, {
            percent: 92 + Math.round(metadata.percent * 0.08),
            statusText: `压缩中 ${Math.round(metadata.percent)}%`,
          }),
      );
      videoStore.updateDownload(downloadId, { percent: 98, statusText: "正在下载..." });
      const zipUrl = URL.createObjectURL(zipBlob);
      const anchor = document.createElement("a");
      anchor.href = zipUrl;
      anchor.download = safeName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(zipUrl);
      videoStore.updateDownload(downloadId, {
        status: "completed",
        statusText: "已完成",
        percent: 100,
      });
      showToast(`已打包 ${usable.length} 个视频`);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "打包失败";
      videoStore.updateDownload(downloadId, {
        status: "failed",
        statusText: "下载失败",
        error: message,
      });
      showToast("打包下载失败：" + message, "error");
    }
  }

  function downloadBackupVideo(backup: VideoBackup): void {
    if (backup?.url) enqueue(backup.url, "mp4");
  }

  function downloadMusic(music: MusicResource): void {
    if (!music?.url) return;
    const extension = music.url.includes(".m4a") ? "m4a" : "mp3";
    enqueue(music.url, extension);
  }

  function downloadLiveVideo(item: LivePhoto): void {
    if (item?.video) enqueue(item.video, "mp4");
  }

  function downloadLiveCover(item: LivePhoto): void {
    if (item?.image) enqueue(item.image, "jpg");
  }

  async function downloadAllImages(): Promise<void> {
    const images = videoStore.resultData?.images || [];
    if (images.length === 0) return;
    for (const image of images) {
      enqueue(image, "jpg");
      await new Promise<void>((resolve) => window.setTimeout(resolve, 300));
    }
    showToast(`成功添加 ${images.length} 个下载任务`);
  }

  function handleCancelDownload(id: number): void {
    videoStore.cancelDownload(id);
  }

  function handleRetryDownload(id: number): void {
    const task = videoStore.downloads.find((download) => download.id === id);
    if (!task) return;
    // 分片任务重试：重走合并下载，避免退化成只下首片
    const rawSegments = task.segments;
    if (Array.isArray(rawSegments) && rawSegments.length > 1) {
      const segments = rawSegments.map((s) =>
        typeof s === "string" ? s : (s as HlsSegment),
      );
      void downloadSegments(segments, task.filename, id);
      return;
    }
    if (task.url) void downloadFile(task.url, task.filename, id);
  }

  function handleClearCompleted(id: number | "all"): void {
    if (id === "all") videoStore.clearCompletedDownloads();
    else videoStore.removeDownload(id);
  }

  return {
    downloadFile,
    downloadMainVideo,
    downloadVideoByIndex,
    downloadSelected,
    downloadAllVideos,
    downloadVideosAsZip,
    downloadBackupVideo,
    downloadMusic,
    downloadLiveVideo,
    downloadLiveCover,
    downloadAllImages,
    handleCancelDownload,
    handleRetryDownload,
    handleClearCompleted,
  };
}
