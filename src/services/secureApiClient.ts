import type {
  ApiEnvelope,
  EncryptedEnvelope,
  ParseRequest,
  ParserResult,
  SecureSessionResponse,
} from "../types/api";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const toBase64Url = (value: ArrayBuffer | Uint8Array) => {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};
const fromBase64Url = (value: string) => {
  const padded =
    value.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((value.length + 3) % 4);
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};
const toHex = (value: ArrayBuffer) =>
  Array.from(new Uint8Array(value), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

interface SecureSession {
  id: string;
  key: CryptoKey;
  hmacKey: CryptoKey;
  expiresAt: number;
}

export class SecureApiClient {
  private readonly baseUrl: string;
  private session: SecureSession | null = null;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }
  async parse<T = Record<string, unknown>>(
    payload: ParseRequest,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await this.secureRequest<ParserResult<T>>(
      "/api/v1/parse",
      payload,
      options,
    );
    return response.payload;
  }
  async secureRequest<T>(
    path: string,
    payload: unknown,
    { signal }: RequestInit = {},
  ): Promise<T> {
    const session = await this.ensureSession(signal);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = encoder.encode(JSON.stringify(payload));
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, additionalData: encoder.encode(session.id) },
      session.key,
      plaintext,
    );
    const body = JSON.stringify({
      iv: toBase64Url(iv),
      ciphertext: toBase64Url(ciphertext),
    });
    const timestamp = new Date().toISOString();
    const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(18)));
    const bodyHash = toHex(
      await crypto.subtle.digest("SHA-256", encoder.encode(body)),
    );
    const canonical = [
      "POST",
      path,
      timestamp,
      nonce,
      bodyHash,
      session.id,
    ].join("\n");
    const signature = toBase64Url(
      await crypto.subtle.sign(
        "HMAC",
        session.hmacKey,
        encoder.encode(canonical),
      ),
    );
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        "X-Session-ID": session.id,
        "X-Timestamp": timestamp,
        "X-Nonce": nonce,
        "X-Request-Signature": signature,
        "X-Protocol-Version": "1",
      },
      body,
    });
    const envelope = (await response
      .json()
      .catch(() => null)) as ApiEnvelope<EncryptedEnvelope> | null;
    if (!response.ok) {
      if (response.status === 401) this.session = null;
      throw new Error(
        envelope?.message || `请求失败（HTTP ${response.status}）`,
      );
    }
    if (!envelope?.data?.iv || !envelope.data.ciphertext)
      throw new Error("安全响应格式无效");
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: fromBase64Url(envelope.data.iv),
        additionalData: encoder.encode(session.id),
      },
      session.key,
      fromBase64Url(envelope.data.ciphertext),
    );
    return JSON.parse(decoder.decode(decrypted)) as T;
  }
  private async ensureSession(
    signal: AbortSignal | null | undefined,
  ): Promise<SecureSession> {
    if (this.session && this.session.expiresAt > Date.now() + 15000)
      return this.session;
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveBits"],
    );
    const clientPublicKey = await crypto.subtle.exportKey(
      "raw",
      keyPair.publicKey,
    );
    const response = await fetch(`${this.baseUrl}/api/v1/session`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientPublicKey: toBase64Url(clientPublicKey) }),
    });
    const envelope = (await response
      .json()
      .catch(() => null)) as ApiEnvelope<SecureSessionResponse> | null;
    if (!response.ok || !envelope?.data)
      throw new Error(envelope?.message || "无法建立安全会话");
    const data = envelope.data;
    const serverPublicKey = await crypto.subtle.importKey(
      "raw",
      fromBase64Url(data.serverPublicKey),
      { name: "ECDH", namedCurve: "P-256" },
      false,
      [],
    );
    const sharedSecret = await crypto.subtle.deriveBits(
      { name: "ECDH", public: serverPublicKey },
      keyPair.privateKey,
      256,
    );
    const hkdfKey = await crypto.subtle.importKey(
      "raw",
      sharedSecret,
      "HKDF",
      false,
      ["deriveKey"],
    );
    const parameters = {
      name: "HKDF",
      hash: "SHA-256",
      salt: encoder.encode(data.sessionId),
      info: encoder.encode("bk-sv-protocol-v1"),
    } as HkdfParams;
    const key = await crypto.subtle.deriveKey(
      parameters,
      hkdfKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    const hmacKey = await crypto.subtle.deriveKey(
      parameters,
      hkdfKey,
      { name: "HMAC", hash: "SHA-256", length: 256 },
      false,
      ["sign"],
    );
    this.session = {
      id: data.sessionId,
      key,
      hmacKey,
      expiresAt: new Date(data.expiresAt).getTime(),
    };
    return this.session;
  }
}

export const secureApiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || ""
).trim();
export const secureApiClient = secureApiBaseUrl
  ? new SecureApiClient(secureApiBaseUrl)
  : null;
