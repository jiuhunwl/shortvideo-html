import { ref, computed, onUnmounted } from 'vue'

export const useRequestTimeout = (options = {}) => {
  const {
    defaultTimeout = 30000,
    onTimeout = null,
    autoCleanup = true
  } = options

  const activeTimeouts = ref(new Map())
  const counter = ref(0)

  const createTimeout = (callback, timeout = defaultTimeout) => {
    const id = ++counter.value
    const timeoutId = window.setTimeout(() => {
      activeTimeouts.value.delete(id)
      if (onTimeout) {
        onTimeout(id)
      } else {
        callback()
      }
    }, timeout)
    activeTimeouts.value.set(id, { timeoutId, callback, timeout, startTime: Date.now() })
    return id
  }

  const clearTimeout = (id) => {
    const entry = activeTimeouts.value.get(id)
    if (entry) {
      window.clearTimeout(entry.timeoutId)
      activeTimeouts.value.delete(id)
      return true
    }
    return false
  }

  const clearAll = () => {
    activeTimeouts.value.forEach(entry => {
      window.clearTimeout(entry.timeoutId)
    })
    activeTimeouts.value.clear()
  }

  const isActive = (id) => {
    return activeTimeouts.value.has(id)
  }

  const getRemainingTime = (id) => {
    const entry = activeTimeouts.value.get(id)
    if (!entry) return 0
    const elapsed = Date.now() - entry.startTime
    return Math.max(0, entry.timeout - elapsed)
  }

  const extend = (id, additionalTime) => {
    const entry = activeTimeouts.value.get(id)
    if (entry) {
      window.clearTimeout(entry.timeoutId)
      entry.timeout += additionalTime
      entry.timeoutId = window.setTimeout(() => {
        activeTimeouts.value.delete(id)
        if (onTimeout) {
          onTimeout(id)
        } else {
          entry.callback()
        }
      }, entry.timeout - (Date.now() - entry.startTime))
      return true
    }
    return false
  }

  const count = computed(() => activeTimeouts.value.size)
  const hasActive = computed(() => activeTimeouts.value.size > 0)

  if (autoCleanup) {
    onUnmounted(() => {
      clearAll()
    })
  }

  return {
    createTimeout,
    clearTimeout,
    clearAll,
    isActive,
    getRemainingTime,
    extend,
    count,
    hasActive
  }
}

export default useRequestTimeout
