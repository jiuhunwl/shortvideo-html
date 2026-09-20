<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import JSZip from 'jszip'
import { useVideoStore } from './stores/video'
import HeaderNav from './components/HeaderNav.vue'
import HeroSection from './components/HeroSection.vue'
import PlatformTabs from './components/PlatformTabs.vue'
import ResultSection from './components/ResultSection.vue'
import PlatformGrid from './components/PlatformGrid.vue'
import TutorialSection from './components/TutorialSection.vue'
import FaqSection from './components/FaqSection.vue'
import FooterSection from './components/FooterSection.vue'
import ToastContainer from './components/ToastContainer.vue'
import ProgressModal from './components/ProgressModal.vue'
import ParticlesCanvas from './components/ParticlesCanvas.vue'
import DownloadCard from './components/DownloadCard.vue'
import { useVideoParser } from './composables/useVideoParser'
import { useMediaDownload } from './composables/useMediaDownload'
import { useVideoSelection } from './composables/useVideoSelection'
import { getDownloadFilename } from './utils/downloadFilename'
import { buildMediaFilename, sanitizeFilename } from './utils/videoFilename'

const videoStore = useVideoStore()
const isDark = ref(false)

const isDownloading = computed(() =>
  videoStore.downloads.some((task) =>
    ['preparing', 'downloading'].includes(task.status)
  )
)
const showBackup = ref(false)
const locale = ref(localStorage.getItem('lang') || (navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en'))
const currentVideoUrl = ref('')
const { inputUrl, parseError, currentPlatform, parseButton, parseVideo, selectPlatform, resolveBilibiliPage } = useVideoParser({
  videoStore,
  locale,
  showBackup,
  currentVideoUrl,
  showToast: (message, type, duration) => videoStore.addToast(message, type, duration)
})

const selection = useVideoSelection({ videoStore })

// 解析成功后同步选集状态：重置并定位入口命中的分集/合集
watch(
  () => videoStore.resultData,
  (data) => {
    if (data) selection.syncResult()
  }
)

const showToast = (message, type = 'success', duration = 3000) => {
  videoStore.addToast(message, type, duration)
}

// B 站懒解析（多 P / 合集分集）：封装解析器的 resolveBilibiliVideo，供下载/选集复用
const resolveVideoUrl = async (video) => {
  const resolved = await resolveBilibiliPage(video)
  if (!resolved) return null
  return {
    url: resolved.url,
    video_backup: resolved.video_backup ?? [],
  }
}

const {
  downloadFile,
  downloadMainVideo,
  downloadVideoByIndex,
  downloadSelected,
  downloadAllVideos,
  downloadVideosAsZip,
  downloadBackupVideo,
  downloadMusic,
  downloadLiveVideo,
  downloadLiveCover,
  handleCancelDownload,
  handleRetryDownload,
  handleClearCompleted
} = useMediaDownload({
  videoStore,
  currentVideoUrl,
  showToast,
  selection,
  resolveVideoUrl
})

// 选中某集时：若该 P/合集分集尚未解析（B 站多 P 或合集），自动懒解析回填真链，刷新播放器
watch(
  () => selection.currentVideo.value,
  async (video) => {
    if ((video?._cid || video?._bvid) && !video.url && resolveVideoUrl) {
      videoStore.patchVideo(video, { _resolving: true })
      const resolved = await resolveVideoUrl(video)
      if (resolved?.url) {
        videoStore.patchVideo(video, {
          url: resolved.url,
          _resolved: true,
          _resolving: false,
        })
      } else {
        videoStore.patchVideo(video, {
          _resolving: false,
          error: '解析失败，暂不支持下载',
        })
      }
    }
  }
)

const fetchMediaBlob = async (url) => {
  const response = await fetch(url, { method: 'GET', mode: 'cors' })
  if (!response.ok) {
    throw new Error(`资源请求失败（HTTP ${response.status}）`)
  }
  return response.blob()
}

const copyUrl = async (url) => {
  if (!url) {
    showToast('复制失败', 'error')
    return
  }
  try {
    await navigator.clipboard.writeText(String(url))
    showToast('已复制到剪贴板')
  } catch (e) {
    showToast('复制失败', 'error')
  }
}

const downloadAll = async () => {
  const resultData = videoStore.resultData
  if (!resultData) return

  const hasVideo = !!resultData.url
  const hasImages = resultData.images?.length > 0
  const livePhotos = resultData.live_photo || []
  const hasLivePhotos = livePhotos.length > 0

  if (!hasVideo && !hasImages && !hasLivePhotos) {
    showToast('没有可下载的资源', 'warning')
    return
  }

  const zipFilename = `download_${Date.now()}.zip`
  const downloadId = videoStore.addDownload({ filename: zipFilename, status: 'preparing', statusText: '准备中...' })
  videoStore.updateDownload(downloadId, { status: 'downloading', statusText: '正在打包...', percent: 0 })

  try {
    const zip = new JSZip()
    let totalItems = (hasVideo ? 1 : 0) + (hasImages ? resultData.images.length : 0) + (hasLivePhotos ? livePhotos.length * 2 : 0)
    let processedItems = 0

    if (hasVideo) {
      videoStore.updateDownload(downloadId, { percent: Math.round(((processedItems + 1) / totalItems) * 50), statusText: '打包视频...' })
      const blob = await fetchMediaBlob(resultData.url)
      zip.file(getDownloadFilename(resultData.url, 'mp4'), blob)
      processedItems++
    }

    if (hasLivePhotos) {
      for (let i = 0; i < livePhotos.length; i++) {
        const item = livePhotos[i]
        videoStore.updateDownload(downloadId, { percent: Math.round(((processedItems + 1) / totalItems) * 50), statusText: `打包实况 ${i + 1}/${livePhotos.length}...` })
        const imgBlob = await fetchMediaBlob(item.image)
        zip.file(getDownloadFilename(item.image, 'jpg'), imgBlob)
        processedItems++

        videoStore.updateDownload(downloadId, { percent: Math.round(((processedItems + 1) / totalItems) * 50), statusText: `打包实况 ${i + 1}/${livePhotos.length}...` })
        const videoBlob = await fetchMediaBlob(item.video)
        zip.file(getDownloadFilename(item.video, 'mp4'), videoBlob)
        processedItems++
      }
    }

    if (hasImages) {
      for (let i = 0; i < resultData.images.length; i++) {
        videoStore.updateDownload(downloadId, { percent: Math.round(((processedItems + 1) / totalItems) * 50), statusText: `打包图片 ${i + 1}/${resultData.images.length}...` })
        const imgBlob = await fetchMediaBlob(resultData.images[i])
        const ext = imgBlob.type.includes('png') ? 'png' : 'jpg'
        zip.file(getDownloadFilename(resultData.images[i], ext), imgBlob)
        processedItems++
      }
    }

    videoStore.updateDownload(downloadId, { percent: 70, statusText: '正在压缩...' })

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    }, (metadata) => {
      videoStore.updateDownload(downloadId, {
        percent: 70 + Math.round(metadata.percent * 0.3),
        statusText: `压缩中 ${Math.round(metadata.percent)}%`
      })
    })

    videoStore.updateDownload(downloadId, { percent: 95, statusText: '正在下载...' })

    const zipUrl = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = zipUrl
    a.download = zipFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(zipUrl)

    videoStore.updateDownload(downloadId, { status: 'completed', statusText: '已完成', percent: 100 })
    showToast('下载完成')
  } catch (e) {
    console.error(e)
    videoStore.updateDownload(downloadId, { status: 'failed', statusText: '下载失败', error: e.message })
    showToast('下载失败', 'error')
  }
}

const downloadAllLivePhotos = async () => {
  if (!videoStore.resultData?.live_photo?.length) return
  const photos = videoStore.resultData.live_photo

  const zipFilename = `live_photos_${Date.now()}.zip`
  const downloadId = videoStore.addDownload({ filename: zipFilename, status: 'preparing', statusText: '准备中...' })

  try {
    const zip = new JSZip()
    let processedItems = 0
    const totalItems = photos.length * 2

    for (let i = 0; i < photos.length; i++) {
      const item = photos[i]
      videoStore.updateDownload(downloadId, { status: 'downloading', percent: Math.round(((processedItems + 1) / totalItems) * 80), statusText: `打包实况 ${i + 1}/${photos.length}...` })

      if (item.image) {
        const imgBlob = await fetchMediaBlob(item.image)
        zip.file(getDownloadFilename(item.image, 'jpg'), imgBlob)
        processedItems++
      }

      if (item.video) {
        const videoBlob = await fetchMediaBlob(item.video)
        zip.file(getDownloadFilename(item.video, 'mp4'), videoBlob)
        processedItems++
      }
    }

    videoStore.updateDownload(downloadId, { percent: 90, statusText: '生成压缩包...' })
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const blobUrl = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = zipFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)

    videoStore.updateDownload(downloadId, { status: 'completed', percent: 100, statusText: '下载完成' })
    setTimeout(() => videoStore.removeDownload(downloadId), 3000)
    showToast(`已下载 ${photos.length} 组实况文件`)
  } catch (e) {
    console.error('下载失败:', e)
    videoStore.updateDownload(downloadId, { status: 'failed', statusText: '下载失败' })
    showToast('下载失败，请重试', 'error')
  }
}

const downloadAllLiveCovers = async () => {
  if (!videoStore.resultData?.live_photo?.length) return
  const photos = videoStore.resultData.live_photo

  const zipFilename = `live_covers_${Date.now()}.zip`
  const downloadId = videoStore.addDownload({ filename: zipFilename, status: 'preparing', statusText: '准备中...' })

  try {
    const zip = new JSZip()
    let processedItems = 0
    const totalItems = photos.length

    for (let i = 0; i < photos.length; i++) {
      const item = photos[i]
      if (item.image) {
        videoStore.updateDownload(downloadId, { status: 'downloading', percent: Math.round(((processedItems + 1) / totalItems) * 90), statusText: `打包封面 ${i + 1}/${photos.length}...` })
        const imgBlob = await fetchMediaBlob(item.image)
        zip.file(getDownloadFilename(item.image, 'jpg'), imgBlob)
        processedItems++
      }
    }

    videoStore.updateDownload(downloadId, { percent: 95, statusText: '生成压缩包...' })
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const blobUrl = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = zipFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)

    videoStore.updateDownload(downloadId, { status: 'completed', percent: 100, statusText: '下载完成' })
    setTimeout(() => videoStore.removeDownload(downloadId), 3000)
    showToast(`已下载 ${photos.length} 张封面`)
  } catch (e) {
    console.error('下载失败:', e)
    videoStore.updateDownload(downloadId, { status: 'failed', statusText: '下载失败' })
    showToast('下载失败，请重试', 'error')
  }
}

const switchVideo = (backup) => {
  if (backup?.url) {
    currentVideoUrl.value = backup.url
  }
}

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  const n = Number(num)
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '亿'
  if (n >= 1e4) return (n / 1e4).toFixed(1) + '万'
  return String(n)
}

const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDark.value)
}

const setLocale = (lang) => {
  locale.value = lang
  localStorage.setItem('lang', lang)
  document.documentElement.lang = lang
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.classList.toggle('dark', isDark.value)
  document.documentElement.lang = locale.value
})
</script>

<template>
  <div class="min-h-screen">
    <ParticlesCanvas />
    <ToastContainer />
    <ProgressModal />
    <DownloadCard
      :downloads="videoStore.downloads"
      @cancel="handleCancelDownload"
      @retry="handleRetryDownload"
      @clear-completed="handleClearCompleted"
    />

    <HeaderNav
      :is-dark="isDark"
      :locale="locale"
      @toggle-theme="toggleTheme"
      @set-locale="setLocale"
    />

    <main class="max-w-7xl mx-auto px-4 pb-8 pt-0 relative z-10">
      <HeroSection
        v-model:input-url="inputUrl"
        :is-loading="parseButton.isLoading.value"
        :is-error="!!parseError || parseButton.state.value === 'error'"
        :parse-error="parseError"
        :locale="locale"
        :current-platform="currentPlatform"
        @parse="parseVideo"
        @select-platform="selectPlatform"
      />

      <ResultSection
        :result-data="videoStore.resultData"
        :is-downloading="isDownloading"
        :show-backup="showBackup"
        :locale="locale"
        :selection="selection"
        :format-number="formatNumber"
        :format-duration="formatDuration"
        :current-video-url="currentVideoUrl"
        @download-main="downloadMainVideo"
        @download-backup="downloadBackupVideo"
        @download-all="downloadAll"
        @download-music="downloadMusic"
        @download-live-video="downloadLiveVideo"
        @download-live-cover="downloadLiveCover"
        @download-all-live="downloadAllLivePhotos"
        @download-all-live-covers="downloadAllLiveCovers"
        @copy-url="copyUrl"
        @toggle-backup="showBackup = !showBackup"
        @switch-video="switchVideo"
        @select-video="selection.selectIndex"
        @toggle-video="selection.toggleSelect"
        @select-all-videos="selection.selectAll"
        @clear-selection="selection.clearSelection"
        @select-collection="selection.setSection"
        @download-index="downloadVideoByIndex"
        @download-selected="downloadSelected"
        @download-all-videos="downloadAllVideos"
        @download-selected-zip="(videos) => downloadVideosAsZip(videos, undefined)"
        @download-all-zip="(videos) => downloadVideosAsZip(videos, undefined)"
      />

      <PlatformGrid :locale="locale" />
      <TutorialSection :locale="locale" />
      <FaqSection :locale="locale" />
    </main>

    <FooterSection :locale="locale" />
  </div>
</template>
