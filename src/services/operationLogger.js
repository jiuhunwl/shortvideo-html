export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
}

export class OperationLogger {
  constructor(options = {}) {
    this.maxLogs = options.maxLogs || 500
    this.logs = []
    this.listeners = []
    this.enableConsole = options.enableConsole !== false
    this.enableStorage = options.enableStorage || false
    this.storageKey = options.storageKey || 'bk_sv_operation_logs'
    if (this.enableStorage) {
      this._loadFromStorage()
    }
  }

  _loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.logs = JSON.parse(stored)
      }
    } catch (e) {
      console.warn('Failed to load logs from storage:', e)
    }
  }

  _saveToStorage() {
    if (!this.enableStorage) return
    try {
      const logsToSave = this.logs.slice(-this.maxLogs)
      localStorage.setItem(this.storageKey, JSON.stringify(logsToSave))
    } catch (e) {
      console.warn('Failed to save logs to storage:', e)
    }
  }

  _formatLog(level, message, data) {
    return {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data || null
    }
  }

  _notify(log) {
    this.listeners.forEach(listener => {
      try {
        listener(log)
      } catch (e) {
        console.error('Log listener error:', e)
      }
    })
  }

  _print(log) {
    if (!this.enableConsole) return
    const prefix = `[${log.timestamp}] [${log.level.toUpperCase()}]`
    switch (log.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, log.message, log.data || '')
        break
      case LogLevel.INFO:
        console.info(prefix, log.message, log.data || '')
        break
      case LogLevel.WARN:
        console.warn(prefix, log.message, log.data || '')
        break
      case LogLevel.ERROR:
        console.error(prefix, log.message, log.data || '')
        break
    }
  }

  debug(message, data) {
    const log = this._formatLog(LogLevel.DEBUG, message, data)
    this._addLog(log)
    return log
  }

  info(message, data) {
    const log = this._formatLog(LogLevel.INFO, message, data)
    this._addLog(log)
    return log
  }

  warn(message, data) {
    const log = this._formatLog(LogLevel.WARN, message, data)
    this._addLog(log)
    return log
  }

  error(message, data) {
    const log = this._formatLog(LogLevel.ERROR, message, data)
    this._addLog(log)
    return log
  }

  _addLog(log) {
    this.logs.push(log)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
    this._print(log)
    this._notify(log)
    this._saveToStorage()
  }

  addListener(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener)
    }
  }

  removeListener(listener) {
    const index = this.listeners.indexOf(listener)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  getLogs(options = {}) {
    const { level, since, until, limit } = options
    let filtered = this.logs
    if (level) {
      filtered = filtered.filter(log => log.level === level)
    }
    if (since) {
      const sinceTime = new Date(since).getTime()
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() >= sinceTime)
    }
    if (until) {
      const untilTime = new Date(until).getTime()
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() <= untilTime)
    }
    if (limit) {
      filtered = filtered.slice(-limit)
    }
    return filtered
  }

  clear() {
    this.logs = []
    if (this.enableStorage) {
      try {
        localStorage.removeItem(this.storageKey)
      } catch (e) {
        console.warn('Failed to clear logs from storage:', e)
      }
    }
  }

  export() {
    return JSON.stringify(this.logs, null, 2)
  }

  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      oldest: this.logs[0]?.timestamp || null,
      newest: this.logs[this.logs.length - 1]?.timestamp || null
    }
    Object.values(LogLevel).forEach(level => {
      stats.byLevel[level] = this.logs.filter(log => log.level === level).length
    })
    return stats
  }
}

export const operationLogger = new OperationLogger({
  enableConsole: true,
  enableStorage: false,
  maxLogs: 500
})

export default {
  LogLevel,
  OperationLogger,
  operationLogger
}
