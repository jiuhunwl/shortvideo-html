import { nextTick, shallowRef, watch, type Ref } from "vue";
import { useButtonControl } from "./useButtonControl";
import { secureApiClient } from "../services/secureApiClient";
import type { AppLocale, PlatformKey } from "../types/api";
import type {
  MediaCollection,
  MediaVideo,
  ParsedMedia,
} from "../types/media";
import type { useVideoStore } from "../stores/video";

const MULTI_KEYS = ["videos", "video_list", "episodes", "pages", "list"] as const;
type RawVideo = Record<string, unknown>;
type RawVideoItem = string | RawVideo;

const API: Record<PlatformKey, string> = {
  all: "https://api.bugpk.com/api/short_videos",
  douyin: "https://api.bugpk.com/api/douyin",
  kuaishou: "https://api.bugpk.com/api/ksjx",
  bilibili: "https://api.bugpk.com/api/bilibili",
  xhs: "https://api.bugpk.com/api/xhsjx",
  toutiao: "https://api.bugpk.com/api/toutiao",
};
type VideoStore = ReturnType<typeof useVideoStore>;
class ParseError extends Error {
  code?: unknown;
  status?: number;
  response?: unknown;
  constructor(
    message: string,
    options: { code?: unknown; status?: number; response?: unknown } = {},
  ) {
    super(message);
    this.name = "ParseError";
    Object.assign(this, options);
  }
}
const extractURL = (text: string) =>
  text
    .match(/\bhttps?:\/\/[^\s<>"{}|\\^`\[\]]+/i)?.[0]
    .replace(/[),.;!?，。；！？]+$/, "") || null;
const messageOf = (value: unknown) => {
  if (!value || typeof value !== "object") return "";
  const x = value as Record<string, unknown>;
  const data =
    x.data && typeof x.data === "object"
      ? (x.data as Record<string, unknown>)
      : {};
  return (
    ([
      x.msg,
      x.message,
      x.error,
      x.errmsg,
      x.reason,
      data.msg,
      data.message,
      data.error,
    ].find((item) => typeof item === "string" && item.trim()) as string) || ""
  );
};
const hasResources = (data: Record<string, unknown>) =>
  (typeof data.url === "string" && data.url.trim()) ||
  (Array.isArray(data.images) && data.images.some(Boolean)) ||
  (Array.isArray(data.live_photo) &&
    data.live_photo.some(
      (item) =>
        item &&
        typeof item === "object" &&
        ("image" in item || "video" in item),
    )) ||
  (Array.isArray(data.video_backup) &&
    data.video_backup.some(
      (item) => item && typeof item === "object" && "url" in item,
    )) ||
  (data.music &&
    typeof data.music === "object" &&
    typeof (data.music as Record<string, unknown>).url === "string") ||
  collectionSectionsOf(data).length > 0 ||
  collectVideos(data, typeof data.url === "string" ? data.url : null).some(
    (video) => Boolean(video.url),
  );

type SectionMeta = {
  title: string;
  cover: string;
  episodes: RawVideo[];
};

/** 读取 B 站 ugc_season.sections[].episodes[] 多合集结构 */
const seasonSections = (season: unknown): SectionMeta[] => {
  if (!season || typeof season !== "object") return [];
  const sections = (season as Record<string, unknown>).sections;
  if (!Array.isArray(sections)) return [];
  const result: SectionMeta[] = [];
  for (const section of sections) {
    if (!section || typeof section !== "object") continue;
    const raw = section as Record<string, unknown>;
    const episodes = Array.isArray(raw.episodes) ? raw.episodes : [];
    const title = String(raw.title ?? "").trim();
    if (!episodes.length && !title) continue;
    result.push({
      title: title || `合集 ${result.length + 1}`,
      cover: String(raw.cover ?? ""),
      episodes: episodes as RawVideo[],
    });
  }
  return result;
};

/** 读取自定义合集数组（collections / sections / seasons），兼容 {name,title}/{list,episodes,videos} */
const customSections = (data: Record<string, unknown>): SectionMeta[] => {
  const result: SectionMeta[] = [];
  for (const key of ["collections", "sections", "seasons"] as const) {
    const list = data[key];
    if (!Array.isArray(list)) continue;
    for (const section of list) {
      if (!section || typeof section !== "object") continue;
      const raw = section as Record<string, unknown>;
      const episodesRaw =
        (Array.isArray(raw.episodes) && raw.episodes) ||
        (Array.isArray(raw.videos) && raw.videos) ||
        (Array.isArray(raw.list) && raw.list) ||
        [];
      const title =
        String(raw.title ?? raw.name ?? raw.season_title ?? "").trim() ||
        `合集 ${result.length + 1}`;
      const cover = String(raw.cover ?? raw.pic ?? "");
      if (Array.isArray(episodesRaw))
        result.push({ title, cover, episodes: episodesRaw as RawVideo[] });
    }
    if (result.length) break;
  }
  return result;
};

/** 提取分集所属视频的 BV/av 号（episodes[].bvid / bv_id / 对象字段 /.arc.bvid） */
const episodeBvid = (raw: RawVideo): string => {
  const direct = raw.bvid ?? raw.bv_id ?? raw.bv ?? raw.video_bvid;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const arc = raw.arc && typeof raw.arc === "object" ? (raw.arc as RawVideo) : null;
  const arcBvid = arc?.bvid;
  if (typeof arcBvid === "string" && arcBvid.trim()) return arcBvid.trim();
  const id = typeof raw.id === "string" ? raw.id : "";
  return /^BV[0-9A-Za-z]+$/i.test(id) ? id : "";
};

/** 把单个分集条目转成 MediaVideo（带 _bvid/_page/_sectionIndex/_epNo/_current） */
const toEpisodeVideo = (
  raw: RawVideoItem,
  sectionIndex: number,
  epNo: number,
  currentEpisode: string,
  fallbackTitlePrefix = "EP",
): MediaVideo | null => {
  if (typeof raw === "string") {
    const url = raw.trim();
    if (!url) return null;
    return {
      index: epNo,
      title: `${fallbackTitlePrefix}${epNo}`,
      url,
      _sectionIndex: sectionIndex,
      _epNo: epNo,
      _resolved: true,
    };
  }
  const bvid = episodeBvid(raw);
  const page = Math.max(1, Math.floor(Number(raw.page ?? raw.page_no)) || 1);
  const cid = typeof raw.cid === "string" && raw.cid ? raw.cid : "";
  const title =
    String(raw.title ?? raw.part ?? raw.name ?? "").trim() ||
    `${fallbackTitlePrefix}${epNo}`;
  const duration = Number.isFinite(Number(raw.duration))
    ? Number(raw.duration)
    : Number.isFinite(Number(raw.duration_ms))
      ? Number(raw.duration_ms)
      : null;
  // 入口命中：current_episode 匹配 bvid / "bvid-page" / cid 任一形式
  const isCurrent =
    Boolean(currentEpisode) &&
    (currentEpisode === bvid ||
      (Boolean(bvid) && currentEpisode === `${bvid}-${page}`) ||
      (Boolean(cid) && currentEpisode === cid));
  return {
    index: epNo,
    title,
    url: typeof raw.url === "string" && raw.url.trim() ? raw.url : "",
    duration,
    durationFormat: String(raw.durationFormat ?? raw.duration_format ?? ""),
    cover: String(raw.cover ?? raw.pic ?? raw.image ?? ""),
    quality: String(raw.quality ?? ""),
    _cid: cid || undefined,
    _bvid: bvid || undefined,
    _page: page > 1 ? page : undefined,
    _sectionIndex: sectionIndex,
    _epNo: epNo,
    _current: isCurrent,
    _resolved: Boolean(raw.url),
  };
};

/** 合集类型标识：后端把 data.type 标成以下值之一时按合集解析 */
const COLLECTION_TYPES = new Set([
  "collection",
  "collections",
  "season",
  "ugc_season",
]);
const isCollectionType = (data: Record<string, unknown>) =>
  COLLECTION_TYPES.has(String(data.type ?? ""));

/** 优先 ugc_season（data 或 extra），其次自定义合集数组 */
const collectionSectionsOf = (data: Record<string, unknown>): SectionMeta[] => {
  const extra =
    data.extra && typeof data.extra === "object"
      ? (data.extra as Record<string, unknown>)
      : {};
  const sections = seasonSections(data.ugc_season ?? extra.ugc_season);
  return sections.length ? sections : customSections(data);
};

/** 取第一个非空多数组的原始条目（合成单一合集时用，保留 bvid 等原始字段） */
const firstMultiRaw = (data: Record<string, unknown>): RawVideo[] | null => {
  for (const key of MULTI_KEYS) {
    const list = data[key];
    if (Array.isArray(list) && list.some((x) => x)) return list as RawVideo[];
  }
  return null;
};

/** 由合集结构（season / 自定义 collections）构建拍平的 videos + collections */
function synthesizeCollections(
  data: Record<string, unknown>,
  primaryUrl: string | null,
  sourceUrl?: string,
): { videos: MediaVideo[]; collections: MediaCollection[] } | null {
  const extra =
    data.extra && typeof data.extra === "object"
      ? (data.extra as Record<string, unknown>)
      : {};
  // 入口命中的分集：extra.current_episode（"bvid" / "bvid-page" / cid），
  // 缺失时回退用入口链接里的 BV 号匹配
  const currentEpisode =
    typeof extra.current_episode === "string" && extra.current_episode.trim()
      ? extra.current_episode.trim()
      : (sourceUrl?.match(/\bBV[0-9A-Za-z]{8,}/i)?.[0] ?? "");
  let sections = collectionSectionsOf(data);
  if (sections.length === 0) {
    // 合集标识 + 顶层多数组（无分区结构）：包装为单一合集
    if (!isCollectionType(data)) return null;
    const flat = firstMultiRaw(data);
    if (!flat) return null;
    sections = [
      {
        title: String(data.title ?? "").trim() || "全部",
        cover: String(data.cover ?? ""),
        episodes: flat,
      },
    ];
  }

  const videos: MediaVideo[] = [];
  const collections: MediaCollection[] = [];
  let epNo = 0;
  for (const [sectionIndex, section] of sections.entries()) {
    const episodes: MediaVideo[] = [];
    for (const raw of section.episodes) {
      const video = toEpisodeVideo(raw, sectionIndex, ++epNo, currentEpisode);
      if (video) episodes.push(video);
    }
    if (episodes.length === 0) continue;
    collections.push({
      index: collections.length,
      title: section.title,
      cover: section.cover || episodes[0]?.cover || "",
      episodes,
    });
    videos.push(...episodes);
  }
  if (collections.length === 0) return null;
  // 入口命中的分集直接回填顶层直链，免去二次解析
  if (primaryUrl) {
    const current = videos.find((video) => video._current);
    if (current && !current.url) {
      current.url = primaryUrl;
      current._resolved = true;
    }
  }
  return { videos, collections };
}

/** 单个原始条目 → MediaVideo */
export function toMediaVideo(
  raw: RawVideoItem,
  index: number,
  fallbackUrl?: string,
): MediaVideo {
  if (typeof raw === "string")
    return { index: index + 1, title: `P${index + 1}`, url: raw };
  const url =
    (typeof raw.url === "string" && raw.url.trim() ? raw.url : "") ||
    (typeof raw.video_url === "string" && raw.video_url) ||
    (typeof raw.url2 === "string" && raw.url2) ||
    fallbackUrl ||
    "";
  const pIndex = Math.floor(Number(raw.index));
  return {
    index: Number.isFinite(pIndex) && pIndex > 0 ? pIndex : index + 1,
    title: String(raw.title ?? raw.part ?? raw.name ?? `P${index + 1}`),
    url,
    duration:
      typeof raw.duration === "number"
        ? raw.duration
        : Number.isFinite(Number(raw.duration_ms))
          ? Number(raw.duration_ms)
          : null,
    durationFormat: String(raw.durationFormat ?? raw.duration_format ?? ""),
    cover: String(raw.cover ?? raw.pic ?? ""),
    quality: String(raw.quality ?? ""),
    error:
      typeof raw.error === "string" && raw.error ? raw.error : undefined,
  };
}

/** 从 data 对象收集多视频；没有多数组才返回 [] */
export function collectVideos(
  data: Record<string, unknown>,
  primaryUrl: string | null,
): MediaVideo[] {
  for (const key of MULTI_KEYS) {
    const list = data[key];
    if (!Array.isArray(list) || list.length === 0) continue;
    if (!list.some((x) => x)) continue;
    return list
      .filter(
        (x): x is RawVideoItem =>
          (typeof x === "string" && Boolean(x.trim())) ||
          (!!x && typeof x === "object"),
      )
      .map((x, i) => toMediaVideo(x, i, primaryUrl ?? undefined));
  }
  return [];
}

/**
 * 由 B 站多 P 的 `extra.pages` 元数据合成 videos[]。
 * 每一 P 携带 `_cid` 与 `index`（= 分 P 序号），当前 P 直接回填 url，其余留空待按 P 解析。
 */
function synthesizeBilibiliPages(
  data: Record<string, unknown>,
  primaryUrl: string | null,
): MediaVideo[] {
  const extra = (data.extra && typeof data.extra === "object"
    ? (data.extra as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const pages = Array.isArray(extra.pages) ? (extra.pages as RawVideo[]) : [];
  if (pages.length < 2) return []; // 单 P 走普通视频逻辑
  const currentPage = Number(extra.current_page) || 1;
  return pages.map((p, i) => {
    const pageNo = Number((p as Record<string, unknown>).page) || i + 1;
    const isCurrent = pageNo === currentPage;
    const title = String(
      (p as Record<string, unknown>).title ||
        (p as Record<string, unknown>).part ||
        `P${pageNo}`,
    );
    const dur =
      typeof (p as Record<string, unknown>).duration === "number"
        ? ((p as Record<string, unknown>).duration as number)
        : null;
    return {
      index: pageNo,
      title,
      url: isCurrent && typeof primaryUrl === "string" ? primaryUrl : "",
      duration: dur,
      _cid: String((p as Record<string, unknown>).cid || ""),
      _resolved: isCurrent && typeof primaryUrl === "string",
    } as MediaVideo;
  });
}
/** 接口数据 → ParsedMedia（导出仅供测试） */
/**
 * 归一化作者信息。
 * 兼容：author（对象/字符串）、user{name,avatar}、auther（bilibili.php 的拼写变体）
 * 与顶层 avatar。
 */
const normalizeAuthor = (
  data: Record<string, unknown>,
): ParsedMedia["author"] => {
  const raw = data.author;
  if (typeof raw === "string" && raw.trim())
    return { name: raw.trim(), avatar: String(data.avatar ?? "") };
  if (raw && typeof raw === "object") return raw as ParsedMedia["author"];
  const user =
    data.user && typeof data.user === "object"
      ? (data.user as Record<string, unknown>)
      : {};
  const name =
    (typeof data.auther === "string" && data.auther.trim()) ||
    (typeof user.name === "string" && user.name.trim()) ||
    "";
  const avatar =
    (typeof data.avatar === "string" && data.avatar) ||
    (typeof user.avatar === "string" && user.avatar) ||
    "";
  return name || avatar ? { name, avatar } : {};
};

/** 接口数据 → ParsedMedia（导出仅供测试） */
export const normalizeData = (raw: unknown, sourceUrl?: string): ParsedMedia => {
  const candidate = Array.isArray(raw) ? raw[0] : raw;
  if (!candidate || typeof candidate !== "object")
    throw new ParseError("解析接口没有返回有效数据");
  const data = candidate as Record<string, unknown>;
  if (!hasResources(data))
    throw new ParseError("解析完成，但没有找到可用的视频、图片或音乐资源");
  const images = Array.isArray(data.images)
    ? data.images.filter(
        (item): item is string => typeof item === "string" && Boolean(item),
      )
    : [];
  const type =
    typeof data.type === "string"
      ? data.type
      : Array.isArray(data.live_photo) && data.live_photo.length
        ? "live"
        : images.length && !data.url
          ? "image"
          : "video";
  const primaryUrl = typeof data.url === "string" ? data.url : null;
  // 优先级：B 站合集 / 自定义合集 → 通用多数组 → B 站多 P pages 合成
  let videos: MediaVideo[] = [];
  let collections: MediaCollection[] | undefined;
  if (isCollectionType(data) || collectionSectionsOf(data).length > 0) {
    const synthesized = synthesizeCollections(data, primaryUrl, sourceUrl);
    if (synthesized) {
      videos = synthesized.videos;
      collections = synthesized.collections;
    }
  }
  if (videos.length === 0) {
    videos = collectVideos(data, primaryUrl);
  }
  if (videos.length === 0) {
    videos = synthesizeBilibiliPages(data, primaryUrl);
  }
  const totalVideos =
    (typeof data.totalVideos === "number" && Number.isFinite(data.totalVideos)
      ? Number(data.totalVideos)
      : Array.isArray(data.videos) && data.videos.length
        ? data.videos.length
        : videos.length) || undefined;
  const platform =
    (typeof data.platform === "string" && data.platform) ||
    (typeof data.source === "string" && data.source) ||
    undefined;
  return {
    ...data,
    type,
    title: String(data.title || data.desc || data.description || ""),
    desc: String(data.desc || data.description || data.title || ""),
    author: normalizeAuthor(data),
    cover: String(data.cover || images[0] || ""),
    url: typeof data.url === "string" ? data.url : null,
    quality: String(data.quality || ""),
    duration: typeof data.duration === "number" ? data.duration : null,
    videos: videos.length ? videos : undefined,
    collections: collections?.length ? collections : undefined,
    totalVideos,
    platform,
    images,
    live_photo: Array.isArray(data.live_photo) ? data.live_photo : [],
    video_backup: Array.isArray(data.video_backup)
      ? data.video_backup.filter(
          (item) => item && typeof item === "object" && "url" in item,
        )
      : [],
    music: data.music && typeof data.music === "object" ? data.music : {},
    extra:
      data.extra && typeof data.extra === "object"
        ? (data.extra as Record<string, unknown>)
        : {},
    _sourceUrl: sourceUrl || undefined,
  } as ParsedMedia;
};
const normalizeResponse = (payload: unknown, sourceUrl?: string) => {
  if (!payload || typeof payload !== "object")
    throw new ParseError("接口返回为空，请稍后重试");
  const root = payload as Record<string, unknown>;
  const rawCode = root.code ?? root.status ?? root.errCode;
  const numeric = Number(rawCode);
  const explicit = rawCode !== undefined && rawCode !== null && rawCode !== "";
  const success = explicit
    ? numeric === 200 || rawCode === "success" || rawCode === true
    : Boolean(root.data || root.url || root.images || root.live_photo);
  if (!success)
    throw new ParseError(
      messageOf(root) ||
        (numeric === 404
          ? "作品不存在、已删除或暂时无法访问"
          : numeric === 400
            ? "链接格式不正确或缺少必要参数"
            : "解析失败，请稍后重试"),
      { code: rawCode, response: root },
    );
  return normalizeData(root.data ?? root.result ?? root, sourceUrl);
};
async function fetchJSON(url: string, timeout = 55000) {
  const controller = new AbortController(),
    timer = window.setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
      throw new ParseError(
        messageOf(data) || `接口请求失败（HTTP ${response.status}）`,
        { status: response.status, response: data },
      );
    if (data === null) throw new ParseError("接口返回格式异常，请稍后再试");
    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw new ParseError("请求超时，请稍后重试或切换平台接口", {
        code: "timeout",
      });
    if (error instanceof ParseError) throw error;
    if (error instanceof TypeError)
      throw new ParseError("网络连接失败，请检查网络后重试");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function useVideoParser(options: {
  videoStore: VideoStore;
  locale: Ref<AppLocale>;
  showBackup: Ref<boolean>;
  currentVideoUrl: Ref<string>;
  showToast: (
    message: string,
    type?: "success" | "error" | "warning" | "info",
    duration?: number,
  ) => unknown;
}) {
  const { videoStore, locale, showBackup, currentVideoUrl, showToast } =
      options,
    inputUrl = shallowRef(""),
    parseError = shallowRef(""),
    currentPlatform = shallowRef<PlatformKey>("all");
  const parseButton = useButtonControl({
    action: "parse",
    throttleDelay: 1000,
    antiReplay: true,
    timeout: 60000,
    retry: false,
  });
  async function parseVideo() {
    parseError.value = "";
    const extracted = extractURL(inputUrl.value);
    if (extracted) inputUrl.value = extracted;
    const url = extracted || inputUrl.value;
    if (!url || !url.startsWith("http")) {
      const message = "请输入有效的视频分享链接";
      parseError.value = message;
      showToast(message, "warning", 4000);
      return;
    }
    const result = await parseButton.execute(
      async () => {
        videoStore.clearResult();
        currentVideoUrl.value = "";
        showBackup.value = false;
        const data = secureApiClient
          ? await secureApiClient.parse({
              platform: currentPlatform.value,
              url,
              locale: locale.value,
            })
          : await fetchJSON(
              `${API[currentPlatform.value]}?url=${encodeURIComponent(url)}`,
            );
        const normalized = normalizeResponse(data, url);
        videoStore.setResult(normalized);
        await nextTick();
        videoStore.initSwiper();
        return normalized;
      },
      { disableRetry: true, disableTimeout: true },
    );
    if (!result) {
      const buttonError = parseButton.error.value as unknown;
      const message =
        buttonError instanceof Error
          ? buttonError.message
          : "解析失败，请稍后重试";
      parseError.value = message;
      showToast(message, "error", 6000);
    } else {
      showToast("解析成功", "success", 2200);
    }
  }
  function selectPlatform(key: PlatformKey) {
    currentPlatform.value = key;
    parseError.value = "";
  }

  /** 在 url 上补/覆盖 p 参数（URLSearchParams 会替换同名旧值） */
  function withPageParam(url: string, page: number): string {
    const bare = url.split("#")[0];
    try {
      const parsed = new URL(bare);
      parsed.searchParams.set("p", String(page));
      return parsed.toString();
    } catch {
      const sep = bare.includes("?") ? "&" : "?";
      return `${bare}${sep}p=${page}`;
    }
  }

  /**
   * 懒解析 B 站某一集/某一 P 的真实地址。
   * - 合集分集（带 _bvid）：跨 BV 直接构造视频页；同 BV（或入口自身多 P）复用入口链接并覆盖 p 参数。
   * - 多 P（无 _bvid）：按 `video.index`（= 分 P 序号）追加 `?p=N`。
   * 返回该集的直链与备用画质；失败返回 null。
   */
  async function resolveBilibiliVideo(
    video: Pick<MediaVideo, "index"> &
      Partial<Pick<MediaVideo, "_bvid" | "_page" | "_cid">>,
  ): Promise<{ url: string; video_backup: unknown[]; quality: string } | null> {
    const source = videoStore.resultData?._sourceUrl || inputUrl.value;
    if (!source) return null;
    const bvid = video._bvid ?? "";
    let pageUrl: string;
    if (bvid) {
      const sameEntry = source.toLowerCase().includes(bvid.toLowerCase());
      const target = sameEntry
        ? source
        : `https://www.bilibili.com/video/${bvid}`;
      pageUrl = withPageParam(target, Math.max(1, Number(video._page) || 1));
    } else {
      pageUrl = withPageParam(
        source,
        Math.max(1, Math.floor(Number(video.index)) || 1),
      );
    }
    try {
      const data = secureApiClient
        ? await secureApiClient.parse({
            platform: "bilibili",
            url: pageUrl,
            locale: locale.value,
          })
        : await fetchJSON(
            `${API.bilibili}?url=${encodeURIComponent(pageUrl)}`,
          );
      const normalized = normalizeResponse(data, source);
      // bilibili.php 型后端会一次返回该 BV 所有分P（videos，各带直链），
      // 且顶层 url 不一定对应当前页：按目标页码取对应分集的直链
      const wantPage = bvid
        ? Math.max(1, Number(video._page) || 1)
        : Math.max(1, Math.floor(Number(video.index)) || 1);
      const pageItem = (normalized.videos ?? []).find(
        (item) => Number(item.index) === wantPage && Boolean(item.url),
      );
      return {
        url: pageItem?.url || (typeof normalized.url === "string" ? normalized.url : ""),
        video_backup: normalized.video_backup || [],
        quality: pageItem?.quality || normalized.quality || "",
      };
    } catch {
      return null;
    }
  }

  watch(inputUrl, () => {
    if (parseError.value) parseError.value = "";
  });
  return {
    inputUrl,
    parseError,
    currentPlatform,
    parseButton,
    parseVideo,
    selectPlatform,
    resolveBilibiliPage: resolveBilibiliVideo,
  };
}
