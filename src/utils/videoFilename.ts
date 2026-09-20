/**
 * 文件名可读化与构造工具。
 * 用于浏览器 `download` 属性与 JSZip 归档文件名，规避 Windows 非法字符。
 */

const ILLEGAL_CHARS = /[\\/:*?"<>|\u0000-\u001f\u007f]/g;
/** 保留扩展名情况下 base 部分的上限字符数 */
const MAX_BASE_LENGTH = 64;
/** 扩展名长度上限 */
const MAX_EXT_LENGTH = 12;

function splitExt(name: string): { base: string; ext: string } {
  const dot = name.lastIndexOf(".");
  if (dot > 0 && dot < name.length - 1) {
    return { base: name.slice(0, dot), ext: name.slice(dot) };
  }
  return { base: name, ext: "" };
}

/** 剔除 Windows/\0 非法字符，截断 base 至 64 字符、保扩展名；空则回退 "video" */
export function sanitizeFilename(name: string): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "video.mp4";
  const { base, ext } = splitExt(trimmed);
  const cleanedBase = base
    .replace(ILLEGAL_CHARS, "")
    .replace(/\s+/g, " ")
    .trim();
  const safeBase = (cleanedBase || "video").slice(0, MAX_BASE_LENGTH);
  const safeExt = ext
    .replace(ILLEGAL_CHARS, "")
    .slice(0, MAX_EXT_LENGTH)
    .replace(/^\.+/, "");
  return safeExt ? `${safeBase}.${safeExt}` : safeBase;
}

/** 简单 URL 文本哈希 → 16 位十六进制 */
export function hashMediaName(input: string): string {
  let h1 = 2166136261;
  let h2 = 2246822519;
  const bytes = new TextEncoder().encode(input || "video");
  for (const byte of bytes) {
    h1 = Math.imul(h1 ^ byte, 16777619);
    h2 = Math.imul(h2 ^ byte, 3266489917);
  }
  const seg = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  return `${seg(h1)}${seg(h2)}`;
}

/** 清理后的基本名（无扩展名），供后续拼接 */
function cleanBase(title: string): string {
  const cleaned = (title || "")
    .replace(ILLEGAL_CHARS, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, MAX_BASE_LENGTH);
}

/** 由标题+index 构造可读文件名：`标题_P{index}.mp4`，无标题回退哈希名 */
export function buildMediaFilename(input: {
  title?: string;
  index?: number;
  fallback: string;
}): string {
  const rawTitle = (input.title ?? "").trim();
  const page = typeof input.index === "number" ? input.index : undefined;
  const pageTag = page !== undefined && page > 0 ? `_P${page}` : "";
  if (rawTitle) {
    const base = cleanBase(rawTitle);
    return `${base}${pageTag}.mp4`;
  }
  return `${hashMediaName(input.fallback)}.mp4`;
}