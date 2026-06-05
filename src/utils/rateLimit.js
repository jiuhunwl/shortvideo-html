export const debounce = (fn, delay = 300, immediate = false) => {
  let timeoutId = null
  let lastResult = null
  return function (...args) {
    const context = this
    const doImmediate = immediate && timeoutId === null
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      timeoutId = null
      if (!doImmediate) {
        lastResult = fn.apply(context, args)
      }
    }, delay)
    if (doImmediate) {
      lastResult = fn.apply(context, args)
    }
    return lastResult
  }
}

export const throttle = (fn, delay = 300, options = {}) => {
  let lastRun = 0
  let timeoutId = null
  const { trailing = true, leading = true } = options
  return function (...args) {
    const context = this
    const now = Date.now()
    const isFirstRun = lastRun === 0
    if (!isFirstRun && now - lastRun < delay) {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (trailing) {
        timeoutId = setTimeout(() => {
          lastRun = now
          timeoutId = null
          fn.apply(context, args)
        }, delay - (now - lastRun))
      }
      return
    }
    if (leading) {
      lastRun = now
      return fn.apply(context, args)
    } else if (trailing && timeoutId === null) {
      timeoutId = setTimeout(() => {
        lastRun = Date.now()
        timeoutId = null
        fn.apply(context, args)
      }, delay)
    }
  }
}

export const debounceAsync = (fn, delay = 300) => {
  let timeoutId = null
  let pendingPromise = null
  return function (...args) {
    const context = this
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        timeoutId = null
        try {
          const result = await fn.apply(context, args)
          resolve(result)
        } catch (e) {
          reject(e)
        }
      }, delay)
    })
  }
}

export const throttleAsync = (fn, delay = 300, options = {}) => {
  let lastRun = 0
  let pendingCall = null
  let timeoutId = null
  const { trailing = true, leading = true } = options
  const execute = async (args, context) => {
    try {
      return await fn.apply(context, args)
    } catch (e) {
      throw e
    }
  }
  return function (...args) {
    const context = this
    const now = Date.now()
    const isFirstRun = lastRun === 0
    if (!isFirstRun && now - lastRun < delay) {
      if (trailing) {
        if (pendingCall) {
          pendingCall.args = args
          return pendingCall.promise
        }
        return new Promise(async (resolve, reject) => {
          pendingCall = { args, promise: Promise.resolve().then(async () => {
            const result = await execute(args, context)
            resolve(result)
            pendingCall = null
          }).catch(reject) }
          timeoutId = setTimeout(() => {
            lastRun = Date.now()
          }, delay - (now - lastRun))
        })
      }
      return Promise.resolve()
    }
    if (leading || isFirstRun) {
      lastRun = now
      return execute(args, context)
    }
    return Promise.resolve()
  }
}

export function createOnceRunner() {
  let lastArgs = null
  let lastThis = null
  let lastResult = null
  let hasRun = false
  return {
    run(fn) {
      return function (...args) {
        if (hasRun) {
          return lastResult
        }
        hasRun = true
        lastArgs = args
        lastResult = fn.apply(this, args)
        return lastResult
      }
    },
    reset() {
      hasRun = false
      lastArgs = null
      lastThis = null
      lastResult = null
    }
  }
}

export default {
  debounce,
  throttle,
  debounceAsync,
  throttleAsync,
  createOnceRunner
}
