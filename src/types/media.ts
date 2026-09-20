export interface AuthorInfo {
  id?: string;
  name?: string;
  nickname?: string;
  avatar?: string;
  avatar_thumb?: string;
  cover?: string;
  user_name?: string;
  [key: string]: unknown;
}
export interface VideoBackup {
  url: string;
  quality?: string;
  width?: number;
  height?: number;
  bitrate?: number;
  format?: string;
  [key: string]: unknown;
}
export interface LivePhoto {
  image?: string;
  video?: string;
  [key: string]: unknown;
}
export interface MusicResource {
  url?: string;
  title?: string;
  author?: string;
  cover?: string;
  [key: string]: unknown;
}
/** 单个视频/单集（用于 P 分集、多视频返回） */
export interface MediaVideo {
  /** 1 起始（后端 `index`） */
  index: number;
  /** 展示名称，缺省回退 `P${index}` */
  title?: string;
  /** 完整直链（可用）；B 站多 P 合集中的某一 P 在解析前可能为空，需按 `index`/`_cid` 懒解析 */
  url: string;
  /** 时长（秒），可空 */
  duration?: number | null;
  /** 已格式化时长文本（如 "00:15:22"）；无则由前端按 duration 推导 */
  durationFormat?: string;
  /** 单集封面链接，可空 */
  cover?: string;
  /** 画质/规格标签（可空） */
  quality?: string;
  /** 该集不可用时的错误文案；有 error 则 url 为空且不可下载/不可选中 */
  error?: string;
  /** 分段视频（快手长视频等分片）；下载时合并为单文件 */
  segments?: string[];
  /** B 站分 P 的 cid，用于懒解析该 P 的真实地址 */
  _cid?: string;
  /** B 站合集分集所属视频的 BV/av 号，用于懒解析该集真实地址 */
  _bvid?: string;
  /** 合集分集在其 BV 内的分 P 号（该分集视频本身是多 P 时 >1） */
  _page?: number;
  /** 所属合集序号（0 起始；合集/多合集解析时存在） */
  _sectionIndex?: number;
  /** 合集内序号（1 起始，仅用于展示） */
  _epNo?: number;
  /** 解析入口命中的当前集（合集解析时用于初始定位） */
  _current?: boolean;
  /** 该集 url 是否已解析（B 站多 P 懒解析状态） */
  _resolved?: boolean;
  /** 该集正在解析中（UI 状态） */
  _resolving?: boolean;
  [key: string]: unknown;
}
/** 单个合集（B 站合集/多合集中的一个分区） */
export interface MediaCollection {
  /** 0 起始合集序号 */
  index: number;
  /** 合集标题（如 "正片"、"番外"） */
  title: string;
  /** 合集封面，可空 */
  cover?: string;
  /** 合集内分集 */
  episodes: MediaVideo[];
}
export interface ParsedMedia {
  type?: "video" | "image" | "live" | string;
  title?: string;
  desc?: string;
  author?: string | AuthorInfo;
  avatar?: string;
  cover?: string;
  url?: string | null;
  quality?: string;
  duration?: number | null;
  images: string[];
  live_photo: LivePhoto[];
  video_backup: VideoBackup[];
  music: MusicResource;
  extra: Record<string, unknown>;
  /** 多集/多P 条目；单集时可为空；合集解析时为所有合集拍平后的全量分集（带 _sectionIndex） */
  videos?: MediaVideo[];
  /** 合集/多合集列表（B 站合集解析时存在） */
  collections?: MediaCollection[];
  /** 总集数（后端字段），缺失时取 videos.length */
  totalVideos?: number;
  /** 分段视频（快手长视频等）：多个直链分片，下载时合并为单文件 */
  segments?: string[];
  /** 是否为分段视频（仅第一个分片作为 url） */
  segmented?: boolean;
  /** 解析时的原始输入链接（用于 B 站多 P 按 p=N 二次解析） */
  _sourceUrl?: string;
  /** 目标当前选中索引，0 起始（UI 状态）
   * @deprecated 由 useVideoSelection 持有，此字段仅透传用 */
  currentVideoIndex?: number;
  /** 平台 key 透传，如 "kuaishou" / "bilibili" */
  platform?: string;
  [key: string]: unknown;
}
export type ToastType = "success" | "error" | "warning" | "info";
export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
export type DownloadStatus =
  "preparing" | "downloading" | "completed" | "cancelled" | "failed";
export interface DownloadTask {
  id: number;
  filename: string;
  url?: string;
  status: DownloadStatus;
  percent: number;
  loaded: number;
  total: number;
  speed: number;
  error: string | null;
  statusText: string;
  show: boolean;
  abortController: AbortController | null;
  [key: string]: unknown;
}
export type DownloadInput = Partial<Omit<DownloadTask, "id">> &
  Pick<DownloadTask, "filename">;
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}
