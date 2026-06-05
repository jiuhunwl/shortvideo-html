export const RetryStrategy = {
  EXPONENTIAL: 'exponential',
  LINEAR: 'linear',
  FIBONACCI: 'fibonacci'
}

export class RetryManager {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3
    this.baseDelay = options.baseDelay || 1000
    this.maxDelay = options.maxDelay || 30000
    this.strategy = options.strategy || RetryStrategy.EXPONENTIAL
    this.retryableErrors = options.retryableErrors || [
      'network',
      'timeout',
      'server',
      500,
      502,
      503,
      504
    ]
    this.onRetry = options.onRetry || null
    this.onConfirmRetry = options.onConfirmRetry || null
    this.pendingRetries = new Map()
  }

  isRetryable(error) {
    if (!error) return false
    const errorStr = String(error).toLowerCase()
    return this.retryableErrors.some(e => {
      if (typeof e === 'number') return error.status === e
      return errorStr.includes(e.toLowerCase())
    })
  }

  calculateDelay(attempt) {
    let delay = this.baseDelay
    switch (this.strategy) {
      case RetryStrategy.EXPONENTIAL:
        delay = this.baseDelay * Math.pow(2, attempt)
        break
      case RetryStrategy.LINEAR:
        delay = this.baseDelay * (attempt + 1)
        break
      case RetryStrategy.FIBONACCI:
        delay = this.baseDelay * this.fibonacci(attempt + 1)
        break
    }
    return Math.min(delay, this.maxDelay)
  }

  fibonacci(n) {
    if (n <= 1) return 1
    let a = 1, b = 1
    for (let i = 2; i < n; i++) {
      const temp = a + b
      a = b
      b = temp
    }
    return b
  }

  async execute(fn, context = null) {
    let lastError = null
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await fn.apply(context)
        return { success: true, data: result, attempts: attempt + 1 }
      } catch (error) {
        lastError = error
        if (attempt === this.maxRetries || !this.isRetryable(error)) {
          return { success: false, error, attempts: attempt + 1 }
        }
        const delay = this.calculateDelay(attempt)
        if (this.onRetry) {
          this.onRetry({
            attempt: attempt + 1,
            maxRetries: this.maxRetries,
            delay,
            error
          })
        }
        await this._sleep(delay)
      }
    }
    return { success: false, error: lastError, attempts: this.maxRetries + 1 }
  }

  async executeWithConfirm(fn, context = null) {
    let lastError = null
    let attempt = 0
    while (attempt <= this.maxRetries) {
      try {
        const result = await fn.apply(context)
        return { success: true, data: result, attempts: attempt + 1 }
      } catch (error) {
        lastError = error
        if (attempt === this.maxRetries || !this.isRetryable(error)) {
          return { success: false, error, attempts: attempt + 1, confirmed: true }
        }
        const delay = this.calculateDelay(attempt)
        const confirmed = await this._requestConfirm({
          attempt: attempt + 1,
          maxRetries: this.maxRetries,
          delay,
          error
        })
        if (!confirmed) {
          return { success: false, error: new Error('User cancelled retry'), attempts: attempt + 1, confirmed: false }
        }
        attempt++
        await this._sleep(delay)
      }
    }
    return { success: false, error: lastError, attempts: this.maxRetries + 1, confirmed: true }
  }

  _requestConfirm({ attempt, maxRetries, delay, error }) {
    return new Promise((resolve) => {
      if (this.onConfirmRetry) {
        this.onConfirmRetry({
          attempt,
          maxRetries,
          delay,
          error,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false)
        })
      } else {
        const confirmed = window.confirm(
          `操作失败，是否重试？\n\n` +
          `错误: ${error?.message || error}\n` +
          `第 ${attempt}/${maxRetries} 次重试\n` +
          `等待 ${Math.round(delay / 1000)} 秒后重试`
        )
        resolve(confirmed)
      }
    })
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  setMaxRetries(max) {
    this.maxRetries = max
  }

  setBaseDelay(delay) {
    this.baseDelay = delay
  }

  setStrategy(strategy) {
    this.strategy = strategy
  }

  clear() {
    this.pendingRetries.clear()
  }
}

export const retryManager = new RetryManager({
  maxRetries: 3,
  baseDelay: 1000,
  strategy: RetryStrategy.EXPONENTIAL
})

export default {
  RetryStrategy,
  RetryManager,
  retryManager
}
