const MD5 = (str) => {
  const rotateLeft = (val, bits) => (val << bits) | (val >>> (32 - bits))
  const cvtHex = (val) => (val >>> 0).toString(16).padStart(8, '0')
  let x0 = 1732584193, x1 = -271733879, x2 = -1732584194, x3 = 271733878
  const T = []
  for (let i = 0; i < 64; i++) T[i] = Math.abs(Math.sin(i + 1) * 4294967296) | 0
  const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22]
  let len = new TextEncoder().encode(str).length
  const words = new Int32Array(Math.ceil((len + 8) / 64) * 16)
  for (let i = 0; i < len; i++) words[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8)
  words[len >> 2] |= 0x80 << ((len % 4) * 8)
  words[words.length - 1] = len * 8
  for (let i = 0; i < words.length; i += 16) {
    let a = x0, b = x1, c = x2, d = x3
    for (let j = 0; j < 64; j++) {
      let F, g
      if (j < 16) {
        F = (b & c) | ((~b) & d)
        g = j
      } else if (j < 32) {
        F = (d & b) | ((~d) & c)
        g = (5 * j + 1) % 16
      } else if (j < 48) {
        F = b ^ c ^ d
        g = (3 * j + 5) % 16
      } else {
        F = c ^ (b | (~d))
        g = (7 * j) % 16
      }
      const temp = d
      d = c
      c = b
      b = (b + rotateLeft((a + F + T[j] + (words[i + g] | 0)) | 0, S[j % 4])) | 0
      a = temp
    }
    x0 = (x0 + a) | 0
    x1 = (x1 + b) | 0
    x2 = (x2 + c) | 0
    x3 = (x3 + d) | 0
  }
  return cvtHex(x0) + cvtHex(x1) + cvtHex(x2) + cvtHex(x3)
}

const generateNonce = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export class AntiReplay {
  constructor() {
    this.nonceMap = new Map()
    this.timestampWindow = 300000
    this.cleanupInterval = null
    this.secretKey = 'bk-sv-v3-antireplay-' + Date.now()
    this._startCleanup()
  }

  _startCleanup() {
    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this._cleanup()
      }, 60000)
    }
  }

  _cleanup() {
    const now = Date.now()
    for (const [key, value] of this.nonceMap.entries()) {
      if (now - value.timestamp > this.timestampWindow) {
        this.nonceMap.delete(key)
      }
    }
  }

  generateToken(action) {
    const timestamp = Date.now()
    const nonce = generateNonce(16)
    const data = `${action}:${timestamp}:${nonce}:${this.secretKey}`
    const signature = MD5(data)
    const token = `${timestamp}:${nonce}:${signature}`
    return { token, timestamp, nonce }
  }

  validateToken(tokenData, action) {
    if (!tokenData || !tokenData.token) return { valid: false, reason: 'no-token' }
    const { token, timestamp } = tokenData
    const parts = token.split(':')
    if (parts.length !== 3) return { valid: false, reason: 'invalid-format' }
    const [timestampStr, nonce, signature] = parts
    const tokenTimestamp = parseInt(timestampStr, 10)
    const now = Date.now()
    if (isNaN(tokenTimestamp)) return { valid: false, reason: 'invalid-timestamp' }
    if (now - tokenTimestamp > this.timestampWindow) return { valid: false, reason: 'expired' }
    if (now - tokenTimestamp < -30000) return { valid: false, reason: 'future-timestamp' }
    if (this.nonceMap.has(token)) return { valid: false, reason: 'replay' }
    const data = `${action}:${tokenTimestamp}:${nonce}:${this.secretKey}`
    const expectedSignature = MD5(data)
    if (signature !== expectedSignature) return { valid: false, reason: 'invalid-signature' }
    this.nonceMap.set(token, { timestamp: tokenTimestamp, action })
    return { valid: true }
  }

  invalidateToken(token) {
    this.nonceMap.delete(token)
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.nonceMap.clear()
  }
}

export const antiReplayInstance = new AntiReplay()

export default {
  AntiReplay,
  antiReplayInstance,
  MD5,
  generateNonce
}
