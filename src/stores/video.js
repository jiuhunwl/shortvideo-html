import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVideoStore = defineStore('video', () => {
  const resultData = ref(null)
  const toasts = ref([])
  const showProgress = ref(false)
  const progressText = ref('')
  const progressStatus = ref('')
  const progressPercent = ref(0)
  const downloads = ref([])
  const activeDownloads = ref(new Map())
  let swiperInstance = null

  const setResult = (data) => {
    resultData.value = data
  }

  const clearResult = () => {
    resultData.value = null
  }

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const setProgress = ({ text, status, percent = 0 }) => {
    showProgress.value = true
    progressText.value = text
    progressStatus.value = status
    progressPercent.value = percent
  }

  const hideProgress = () => {
    showProgress.value = false
    progressText.value = ''
    progressStatus.value = ''
    progressPercent.value = 0
  }

  const addDownload = (download) => {
    const id = Date.now() + Math.random()
    downloads.value.push({
      id,
      filename: download.filename || 'download',
      status: 'preparing',
      percent: 0,
      loaded: 0,
      total: 0,
      speed: 0,
      error: null,
      statusText: '准备中...',
      show: true,
      abortController: null,
      ...download
    })
    return id
  }

  const updateDownload = (id, updates) => {
    const index = downloads.value.findIndex(d => d.id === id)
    if (index !== -1) {
      downloads.value[index] = { ...downloads.value[index], ...updates }
    }
  }

  const removeDownload = (id) => {
    const index = downloads.value.findIndex(d => d.id === id)
    if (index !== -1) {
      const download = downloads.value[index]
      if (download.abortController) {
        download.abortController.abort()
      }
      downloads.value.splice(index, 1)
    }
  }

  const cancelDownload = (id) => {
    const download = downloads.value.find(d => d.id === id)
    if (download) {
      if (download.abortController) {
        download.abortController.abort()
      }
      updateDownload(id, { status: 'cancelled', statusText: '已取消' })
    }
  }

  const clearCompletedDownloads = () => {
    downloads.value = downloads.value.filter(d =>
      d.status !== 'completed' && d.status !== 'cancelled' && d.status !== 'failed'
    )
  }

  const initSwiper = () => {
    if (swiperInstance) {
      swiperInstance.destroy()
      swiperInstance = null
    }
    
    if (typeof window.Swiper !== 'undefined' && document.querySelector('.swiper')) {
      swiperInstance = new window.Swiper('.swiper', {
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false
        }
      })
    }
  }

  const initParticles = () => {
    const canvas = document.getElementById('particle-canvas')
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    let particles = []
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1
    })
    
    resize()
    for (let i = 0; i < 50; i++) {
      particles.push(createParticle())
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`
        ctx.fill()
      })
      requestAnimationFrame(draw)
    }
    
    window.addEventListener('resize', resize)
    draw()
  }

  return {
    resultData,
    toasts,
    showProgress,
    progressText,
    progressStatus,
    progressPercent,
    downloads,
    activeDownloads,
    setResult,
    clearResult,
    addToast,
    removeToast,
    setProgress,
    hideProgress,
    addDownload,
    updateDownload,
    removeDownload,
    cancelDownload,
    clearCompletedDownloads,
    initSwiper,
    initParticles
  }
})
