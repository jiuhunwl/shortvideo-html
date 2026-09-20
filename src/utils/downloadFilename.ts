const counters = new Map<string, number>();

function hashUrl(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let first = 2166136261;
  let second = 2246822519;
  for (const byte of bytes) {
    first = Math.imul(first ^ byte, 16777619);
    second = Math.imul(second ^ byte, 3266489917);
  }
  const segment = (number: number) => (number >>> 0).toString(16).padStart(8, "0");
  return `${segment(first)}${segment(second)}${segment(first ^ second)}${segment(Math.imul(first, second))}`;
}

export function getDownloadFilename(url: string, extension: string): string {
  const base = hashUrl(url);
  const next = (counters.get(base) || 0) + 1;
  counters.set(base, next);
  return `${base}_${next}.${extension.replace(/^\./, "")}`;
}

export function resetDownloadFilenameCounters(): void {
  counters.clear();
}
