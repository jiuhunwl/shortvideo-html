export type PlatformKey =
  "all" | "douyin" | "kuaishou" | "bilibili" | "xhs" | "toutiao";
export type AppLocale = "zh-CN" | "en";

export interface SecureSessionResponse {
  sessionId: string;
  serverPublicKey: string;
  expiresAt: string;
  protocolVersion: string;
}

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  requestId: string;
  data: T;
}

export interface EncryptedEnvelope {
  iv: string;
  ciphertext: string;
}

export interface ParseRequest {
  platform: PlatformKey;
  url: string;
  locale: AppLocale;
}

export interface ParserResult<T = Record<string, unknown>> {
  platform: PlatformKey;
  payload: T;
  cached: boolean;
}
