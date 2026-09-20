/**
 * 分段视频合并下载工具。
 *
 * 用于修复「只能下载单个切片」的问题：当解析结果携带 `segments`（多分片直链）
 * 或 URL 为 HLS 清单时，将 N 个分片依次拉取并拼接为完整视频后下载。
 *
 * 设计要点：
 * - 每段独立请求，记录每段已收字节与总字节，向外部汇报整体进度；
 * - 全部收齐后才拼接并触发下载，避免「只下到第一片」；
 * - 支持 HLS BYTERANGE 清单（fMP4：EXT-X-MAP 初始化段 + 分片字节区间），
 *   按区间用 Range 头精确抓取，避免把分片文件的头部字节混进合并结果；
 * - 支持 AbortSignal 取消；
 * - 提供按分片打包为 ZIP 的能力（配合 JSZip）。
 */

/** 带可选字节区间的分片描述（HLS BYTERANGE / 普通整文件分片通用） */
export interface HlsSegment {
  url: string;
  /** Range 起始字节（含）；缺省表示整个文件 */
  start?: number;
  /** 区间字节数；与 start 同时存在时按 Range 抓取 */
  length?: number;
}

export interface SegmentProgress {
  loaded: number;
  total: number;
  percent: number;
  /** 当前正在下载的分片序号（1 起始） */
  segment: number;
  segmentCount: number;
}

export interface MergeOptions {
  signal?: AbortSignal;
  filename: string;
  onProgress?: (progress: SegmentProgress) => void;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // 延迟回收，确保下载已开始
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** 字节区间 → Range 头值；无区间返回 undefined */
function rangeHeader(segment: HlsSegment): string | undefined {
  if (segment.start === undefined || segment.length === undefined) return undefined;
  return `bytes=${segment.start}-${segment.start + segment.length - 1}`;
}

/** 分片声明的字节数（BYTERANGE 时可直接算出，用于总进度） */
function segmentLength(segment: HlsSegment): number {
  return segment.length ?? 0;
}

/** 单分片抓取，失败自动重试（默认 2 次，间隔 400ms/800ms）：
 * 快手等 CDN 分片 CORS 头会随节点/请求漂移，瞬时失败重试可显著提高合并成功率 */
async function fetchArrayBuffer(
  url: string,
  signal: AbortSignal | undefined,
  onChunk?: (loaded: number, total: number) => void,
  range?: { start: number; length: number },
  retries = 2,
): Promise<ArrayBuffer> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      const headers: Record<string, string> = {};
      if (range) headers.Range = `bytes=${range.start}-${range.start + range.length - 1}`;
      const response = await fetch(url, { method: "GET", mode: "cors", headers, signal });
      if (!response.ok) throw new Error(`分片请求失败（HTTP ${response.status}）`);
      if (!response.body) throw new Error("该分片不支持流式读取");

      const total = Number(response.headers.get("content-length")) || 0;
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        onChunk?.(loaded, total);
      }
      // 有 content-length 时校验完整性
      if (total > 0 && loaded !== total) {
        throw new Error(`分片下载不完整：期望 ${total} 字节，实际 ${loaded} 字节`);
      }
      // 拼接为连续 ArrayBuffer
      const merged = new Uint8Array(loaded);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      return merged.buffer;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      lastError = error;
      if (attempt < retries) {
        await new Promise<void>((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("分片下载失败");
}

/** 是否为「分片命名」的视频 URL（形如 xxx_0.mp4 / xxx-12.ts）：
 *  要求文件名以 `_数字` 或 `-数字` 结尾（数字前有明确分隔符），
 *  避免把 `...c2c33608.mp4` 这类哈希/时间戳结尾的完整文件误判为分片。 */
export function looksLikeSegmentUrl(url: string): boolean {
  return /[_-]\d+\.[a-z0-9]+(?:$|\?)/i.test(url);
}

/**
 * 探测可能的兄弟分片（仅作兜底）：
 * 当 URL 的文件名形如 `xxx_<n>.mp4` 时，尝试枚举 n, n+1, n+2...；
 * 用 Range 头做轻量存在性校验，遇到首个不可达即停止。
 */
export async function probeSiblingSegments(
  url: string,
  maxSegments = 24,
  signal?: AbortSignal,
): Promise<string[]> {
  try {
    const parsed = new URL(url);
    const lastSeg = parsed.pathname.split("/").pop() || "";
    // 仅当数字前有 _ 或 - 分隔时才探测，避免误伤哈希/时间戳命名
    const match = lastSeg.match(/^(.*?[_-])(\d+)(\.[a-z0-9]+)$/i);
    if (!match) return [];
    const prefix = match[1];
    const start = Number(match[2]);
    const ext = match[3];
    const digits = match[2].length;

    const candidates: string[] = [];
    for (let i = start; i < start + maxSegments; i++) {
      const idx = String(i).padStart(digits, "0");
      const basename = `${prefix}${idx}${ext}`;
      const candidate =
        parsed.origin + parsed.pathname.replace(/[^/]+$/, basename) + parsed.search;
      if (i === start) {
        candidates.push(candidate);
        continue;
      }
      // 轻量校验：请求首字节
      const ok = await fetch(candidate, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        mode: "cors",
        signal,
      })
        .then((r) => r.status === 206 || r.status === 200)
        .catch(() => false);
      if (!ok) break;
      candidates.push(candidate);
    }
    return candidates;
  } catch {
    return [];
  }
}

/** 解析 BYTERANGE 值 `len[@offset]`；offset 缺省时延续上一区间末尾（RFC 8216） */
function parseByteRange(
  value: string,
  previousEndExclusive: number | null,
): { start: number; length: number } | null {
  const match = /^(\d+)(?:@(\d+))?$/.exec(value.trim());
  if (!match) return null;
  const length = Number(match[1]);
  const start =
    match[2] !== undefined ? Number(match[2]) : (previousEndExclusive ?? 0);
  return { start, length };
}

/**
 * 解析 HLS m3u8 清单，返回全部分片（按播放顺序，含 BYTERANGE 字节区间）。
 * - 非 m3u8 / 清单请求失败（含 CORS 拦截）→ null
 * - 清单含 `#EXT-X-KEY`（AES 加密分片）→ null（前端无法解密，放弃合并）
 * - 多码率（#EXT-X-STREAM-INF）→ 递归解析第一条子清单
 * - fMP4（#EXT-X-MAP）→ init 段（含其 BYTERANGE）置于最前
 * - 只返回 >1 段，避免把单段清单当分片处理
 */
export async function resolveHlsSegments(
  url: string,
  signal?: AbortSignal,
): Promise<HlsSegment[] | null> {
  try {
    // 轻量预探测：只读前 4KB 就取消，判断是否为 m3u8 清单，
    // 避免对完整 mp4（几十 MB）做全量下载后再丢弃（探测 = 白下整个文件）。
    const probeResponse = await fetch(url, {
      method: "GET",
      mode: "cors",
      signal,
      headers: { Range: "bytes=0-4095" },
    });
    if (!probeResponse.ok || !probeResponse.body) return null;
    const reader = probeResponse.body.getReader();
    const firstChunk = await reader.read();
    void reader.cancel();
    const headBytes = firstChunk.value ?? new Uint8Array(0);
    const probeText = new TextDecoder().decode(headBytes);
    if (!probeText.includes("#EXTM3U")) return null;
    if (/^#EXT-X-KEY:/m.test(probeText)) return null; // 加密流，前端无法合并

    // 确认为清单后再全量拉取
    const response = await fetch(url, { method: "GET", mode: "cors", signal });
    if (!response.ok) return null;
    const text = await response.text();
    if (!text.includes("#EXTM3U")) return null;

    const base = new URL(url);
    const toAbs = (uri: string) => new URL(uri, base).href;
    const lines = text.split(/\r?\n/).map((line) => line.trim());

    // 多码率清单：递归解析第一条子清单
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
        const sub = lines[i + 1];
        if (sub && !sub.startsWith("#")) {
          return resolveHlsSegments(toAbs(sub), signal);
        }
      }
    }

    const segments: HlsSegment[] = [];
    let previousEndExclusive: number | null = null;
    let pendingRange: { start: number; length: number } | null = null;

    const pushSegment = (uri: string, range: { start: number; length: number } | null) => {
      segments.push({
        url: toAbs(uri),
        ...(range ? { start: range.start, length: range.length } : {}),
      });
    };

    for (const line of lines) {
      if (!line || line.startsWith("#")) {
        if (line.startsWith("#EXT-X-MAP")) {
          const uri = /URI="([^"]+)"/.exec(line)?.[1];
          if (!uri) continue;
          const rangeMatch = /BYTERANGE="([^"]+)"/.exec(line)?.[1];
          const range = rangeMatch ? parseByteRange(rangeMatch, null) : null;
          pushSegment(uri, range);
        } else if (line.startsWith("#EXT-X-BYTERANGE:")) {
          pendingRange = parseByteRange(line.slice("#EXT-X-BYTERANGE:".length), previousEndExclusive);
        }
        continue;
      }
      const range = pendingRange;
      pendingRange = null;
      pushSegment(line, range);
      previousEndExclusive = range ? range.start + range.length : null;
      if (segments.length >= 2000) break; // 安全上限
    }
    return segments.length > 1 ? segments : null;
  } catch {
    return null;
  }
}

/**
 * 判断 URL 是否「疑似 HLS 清单」：.m3u8 后缀，或快手 remux / hlsob 备用流地址。
 * 用途：分片解析失败（如清单请求被 CORS 拦截）时拦截，避免把清单文本当 mp4 下载
 * （表现为只得到几十字节的文本文件，即「只下到分片片段」）。
 */
export function looksLikeHlsManifest(url: string): boolean {
  const lower = (url ?? "").toLowerCase();
  if (!lower) return false;
  return (
    /\.m3u8(?:\?|$)/.test(lower) ||
    lower.includes("hlsob") ||
    lower.includes("remux")
  );
}

/** 判断分片合并后的容器：存在 .ts 分片 → ts（TS 流直接拼接），否则按 mp4（fMP4 拼接） */
export function detectSegmentContainer(segments: (HlsSegment | string)[]): "ts" | "mp4" {
  const probe =
    segments.find((s) => /\.ts(?:\?|$)/i.test(typeof s === "string" ? s : s.url)) ??
    segments[0] ??
    "";
  const url = typeof probe === "string" ? probe : probe.url;
  return /\.ts(?:\?|$)/i.test(url) ? "ts" : "mp4";
}

/**
 * 下载前的统一智能识别：按候选顺序逐个探测（首个成功者胜出）。
 * 每个候选依次尝试：
 * 1) HLS 清单解析（清单请求被 CORS 拦截或格式不符时立即失败，代价极小）；
 * 2) 分片命名（xxx_0.mp4）的兄弟分片探测。
 * 典型场景：快手主清单无 CORS 头、备用清单（video_backup）开放 CORS，
 * 按候选探测即可纯前端拿到可下载的完整分片列表。
 * @returns 分片列表（≥2 段），null 表示全部候选都不是可用分片流
 */
export async function prepareSegments(
  candidates: (string | null | undefined)[],
  signal?: AbortSignal,
): Promise<HlsSegment[] | null> {
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const url = (candidate ?? "").trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const hls = await resolveHlsSegments(url, signal);
    if (hls) return hls;
    if (looksLikeSegmentUrl(url)) {
      const siblings = await probeSiblingSegments(url, 24, signal);
      if (siblings.length > 1) return siblings.map((s) => ({ url: s }));
    }
  }
  return null;
}

/** 归一化：字符串分片 → 整文件 HlsSegment */
function normalizeSegments(segments: (HlsSegment | string)[]): HlsSegment[] {
  return segments
    .map((s) => (typeof s === "string" ? ({ url: s } as HlsSegment) : s))
    .filter((s) => Boolean(s.url));
}

/**
 * 合并分片为单个连续 Uint8Array（不触发下载）。
 * 用于「分片合并为单文件」与「多集打包进 ZIP」两种场景。
 * @returns 合并后的视频字节
 */
export async function mergeSegments(
  segments: (HlsSegment | string)[],
  options?: {
    signal?: AbortSignal;
    onProgress?: (progress: SegmentProgress) => void;
  },
): Promise<Uint8Array<ArrayBuffer>> {
  const usable = normalizeSegments(segments);
  if (usable.length === 0) throw new Error("没有可用的分片");

  const { signal, onProgress } = options || {};
  const buffers: ArrayBuffer[] = [];
  let totalLoaded = 0;
  // BYTERANGE 分片的总字节数可直接得出；整文件分片用 HEAD 探测
  let totalBytes = usable.every((s) => s.length !== undefined)
    ? usable.reduce((sum, s) => sum + segmentLength(s), 0)
    : 0;
  if (totalBytes === 0) {
    try {
      const heads = await Promise.all(
        usable.map((u) =>
          fetch(u.url, { method: "HEAD", mode: "cors", signal }).then((r) => ({
            len: Number(r.headers.get("content-length")) || 0,
            ok: r.ok,
          })),
        ),
      );
      if (heads.every((h) => h.ok)) {
        totalBytes = heads.reduce((sum, h) => sum + h.len, 0);
      }
    } catch {
      totalBytes = 0;
    }
  }

  for (let i = 0; i < usable.length; i++) {
    const segment = usable[i];
    const buf = await fetchArrayBuffer(
      segment.url,
      signal,
      (loaded, total) => {
        const segTotal = totalBytes > 0 ? totalBytes : total * usable.length;
        onProgress?.({
          loaded: totalBytes > 0 ? totalLoaded + loaded : ((i + loaded / (total || 1)) / usable.length) * (totalBytes || 1),
          total: totalBytes || segTotal,
          percent: totalBytes > 0
            ? Math.round(((totalLoaded + loaded) / totalBytes) * 100)
            : Math.round(((i + loaded / (total || 1)) / usable.length) * 100),
          segment: i + 1,
          segmentCount: usable.length,
        });
      },
      segment.start !== undefined && segment.length !== undefined
        ? { start: segment.start, length: segment.length }
        : undefined,
    );
    buffers.push(buf);
    totalLoaded += buf.byteLength;
    onProgress?.({
      loaded: totalLoaded,
      total: totalBytes || totalLoaded,
      percent: totalBytes > 0
        ? Math.round((totalLoaded / totalBytes) * 100)
        : Math.round(((i + 1) / usable.length) * 100),
      segment: i + 1,
      segmentCount: usable.length,
    });
  }

  const merged = new Uint8Array(totalLoaded);
  let offset = 0;
  for (const buf of buffers) {
    merged.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  return merged;
}

/**
 * 合并分片并下载为单个文件。
 * @param segments 分片列表（按播放顺序，支持 BYTERANGE 区间）
 * @returns 下载是否成功触发
 */
export async function mergeAndDownload(
  segments: (HlsSegment | string)[],
  options: MergeOptions,
): Promise<boolean> {
  const { signal, filename } = options;
  const merged = await mergeSegments(segments, { signal, onProgress: options.onProgress });
  triggerDownload(new Blob([merged]), filename);
  return true;
}

/** 把分片列表打包为 ZIP（依赖调用方传入的 zip 工厂） */
export async function appendSegmentsToZip(
  zip: { file: (name: string, data: Uint8Array | ArrayBuffer) => void },
  segments: (HlsSegment | string)[],
  baseName: string,
  signal?: AbortSignal,
): Promise<void> {
  const usable = normalizeSegments(segments);
  for (let i = 0; i < usable.length; i++) {
    const segment = usable[i];
    const buf = await fetchArrayBuffer(
      segment.url,
      signal,
      undefined,
      segment.start !== undefined && segment.length !== undefined
        ? { start: segment.start, length: segment.length }
        : undefined,
    );
    const ext = /\.([a-z0-9]+)(\?|$)/i.exec(segment.url)?.[1] || "mp4";
    zip.file(`${baseName}_part${String(i + 1).padStart(2, "0")}.${ext}`, buf);
  }
}
