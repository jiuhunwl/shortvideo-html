<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  resultData: Object,
  isDownloading: Boolean,
  showBackup: Boolean,
  locale: String,
  formatNumber: Function,
  formatDuration: Function,
  currentVideoUrl: String
})

const emit = defineEmits([
  'download-main', 'download-backup', 'download-all', 'download-music',
  'download-live-video', 'download-live-cover', 'download-all-live', 'download-all-live-covers',
  'copy-url', 'toggle-backup', 'switch-video'
])

const hasVideo = computed(() => !!props.resultData?.url)
const hasImages = computed(() => props.resultData?.images?.length > 0)
const hasMusic = computed(() => !!props.resultData?.music?.url)
const hasBackup = computed(() => props.resultData?.video_backup?.length > 0)
const isLive = computed(() => props.resultData?.type === 'live')
const hasLivePhotos = computed(() => (props.resultData?.live_photo?.length || 0) > 0)
const totalLivePhotos = computed(() => props.resultData?.live_photo?.length || 0)
const hasBothMedia = computed(() => hasVideo.value && hasImages.value)
const canDownloadAll = computed(() => (hasVideo.value || hasImages.value || hasLivePhotos.value) && (hasBothMedia.value || isLive.value || hasLivePhotos.value))

const activeImageIndex = ref(0)
const imageModalOpen = ref(false)
const expandedCardIndex = ref(null)

const author = computed(() => {
  if (!props.resultData) return null
  let name = ''
  if (props.resultData.author) {
    if (typeof props.resultData.author === 'string') name = props.resultData.author
    else if (typeof props.resultData.author === 'object') {
      name = props.resultData.author.name || props.resultData.author.nickname || props.resultData.author.user_name || ''
    }
  }
  let avatar = ''
  if (props.resultData.avatar) avatar = props.resultData.avatar
  else if (props.resultData.author && typeof props.resultData.author === 'object') {
    avatar = props.resultData.author.avatar || props.resultData.author.avatar_thumb || props.resultData.author.cover || ''
  }
  const diggCount = props.resultData?.extra?.statistics?.digg_count
  const likeCountNum = diggCount !== undefined && diggCount !== null ? props.formatNumber(diggCount) : '0'
  return { name, avatar, likeCountNum }
})

const infoCards = computed(() => {
  if (!props.resultData) return []
  const data = props.resultData
  const cards = []
  cards.push({ label: content[props.locale]?.infoTitle || '作品标题', value: data.title || content[props.locale]?.unknownTitle || '未知标题' })
  const publishTs = (data.extra && data.extra.create_time) || data.time
  cards.push({ label: content[props.locale]?.publishTime || '发布时间', value: formatDate(publishTs) || content[props.locale]?.unknownTime || '未知时间' })
  let typeText = content[props.locale]?.unknownType || '未知'
  const type = data.type || (data.images && data.images.length > 0 ? 'images' : 'video')
  if (['video', 'videos'].indexOf(type) !== -1) typeText = content[props.locale]?.video || '视频'
  else if (['image', 'images', 'normal'].indexOf(type) !== -1) typeText = content[props.locale]?.images || '图片集'
  else if (type === 'live') typeText = content[props.locale]?.live || '实况解析'
  else typeText = data.images && data.images.length > 0 ? (content[props.locale]?.images || '图片集') : (content[props.locale]?.video || '视频')
  cards.push({ label: content[props.locale]?.type || '类型', value: typeText })
  if (type !== 'live') {
    cards.push({ label: content[props.locale]?.quality || '画质', value: data.quality || content[props.locale]?.unknownQuality || '未知' })
  }
  return cards
})

const stats = computed(() => {
  if (!props.resultData?.extra?.statistics) return []
  const s = props.resultData.extra.statistics
  const statMap = [
    { key: 'digg_count', label: content[props.locale]?.statLike || '点赞', value: s.digg_count, icon: 'fa-heart' },
    { key: 'comment_count', label: content[props.locale]?.statComment || '评论', value: s.comment_count, icon: 'fa-comment' },
    { key: 'collect_count', label: content[props.locale]?.statCollect || '收藏', value: s.collect_count, icon: 'fa-bookmark' },
    { key: 'share_count', label: content[props.locale]?.statShare || '分享', value: s.share_count, icon: 'fa-share' },
    { key: 'admire_count', label: content[props.locale]?.statAdmire || '赞赏', value: s.admire_count, icon: 'fa-gem' },
    { key: 'play_count', label: content[props.locale]?.statPlay || '播放', value: s.play_count, icon: 'fa-play' },
  ]
  return statMap.filter(item => Number(item.value || 0) > 0)
})

const hashtags = computed(() => {
  if (!props.resultData?.extra?.hashtags) return []
  return props.resultData.extra.hashtags.map(item => ({ name: item.name || '', type: 'hashtag' }))
})

const videoTags = computed(() => {
  if (!props.resultData?.extra?.video_tags) return []
  return props.resultData.extra.video_tags.map(item => ({ name: item.name || '', type: 'tag' }))
})

const allTags = computed(() => [...hashtags.value, ...videoTags.value])

const content = {
  'zh-CN': {
    resultTitle: '解析结果',
    sourceHint: '当前使用源链接直连播放与下载',
    downloadSingle: '下载视频',
    downloadLive: '下载实况视频',
    downloadAll: '下载全部',
    copyVideo: '复制链接',
    backupTitle: '备用画质',
    unknown: '未知',
    allImages: '下载全部图片',
    downloadAllLive: '下载全部实况',
    downloadAllCovers: '下载全部封面',
    musicTitle: '视频原声',
    unknownMusic: '未知音乐',
    unknownAuthor: '未知作者',
    liveVideo: '实况视频',
    infoTitle: '作品标题',
    unknownTitle: '未知标题',
    publishTime: '发布时间',
    unknownTime: '未知时间',
    type: '作品类型',
    video: '视频',
    images: '图片集',
    live: '实况解析',
    unknownType: '未知类型',
    quality: '主画质',
    unknownQuality: '未知',
    overlayVideo: '视频',
    overlayCover: '封面',
    infoLikes: '获赞 {count}',
    copied: '已复制',
    copiedHint: '链接已复制到剪贴板',
  },
  'en': {
    resultTitle: 'Result',
    sourceHint: 'Using direct source link',
    downloadSingle: 'Download Video',
    downloadLive: 'Download Live',
    downloadAll: 'Download All',
    copyVideo: 'Copy URL',
    backupTitle: 'Backup',
    unknown: 'Unknown',
    allImages: 'Download Images',
    downloadAllLive: 'Download All Live',
    downloadAllCovers: 'Download All Covers',
    musicTitle: 'Original Audio',
    unknownMusic: 'Unknown Music',
    unknownAuthor: 'Unknown Artist',
    liveVideo: 'Live Video',
    infoTitle: 'Title',
    unknownTitle: 'Unknown Title',
    publishTime: 'Published',
    unknownTime: 'Unknown',
    type: 'Type',
    video: 'Video',
    images: 'Album',
    live: 'Live',
    unknownType: 'Unknown',
    quality: 'Quality',
    unknownQuality: 'Unknown',
    overlayVideo: 'Video',
    overlayCover: 'Cover',
    infoLikes: '{count} likes',
    copied: 'Copied',
    copiedHint: 'URL copied to clipboard',
  }
}

const t = (locale, key) => content[locale]?.[key] || content['zh-CN'][key]

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  if (isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const openImageModal = (index) => {
  activeImageIndex.value = index
  imageModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeImageModal = () => {
  imageModalOpen.value = false
  document.body.style.overflow = ''
}

const nextImage = () => {
  if (props.resultData?.images) {
    activeImageIndex.value = (activeImageIndex.value + 1) % props.resultData.images.length
  }
}

const prevImage = () => {
  if (props.resultData?.images) {
    activeImageIndex.value = (activeImageIndex.value - 1 + props.resultData.images.length) % props.resultData.images.length
  }
}

const toggleCard = (index) => {
  expandedCardIndex.value = expandedCardIndex.value === index ? null : index
}

const handleKeydown = (e) => {
  if (!imageModalOpen.value) return
  if (e.key === 'Escape') closeImageModal()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}
</script>

<template>
  <section
    v-if="resultData"
    class="mb-16 ux-section-reveal"
    role="region"
    aria-label="解析结果"
  >
    <div class="text-center mb-8">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-400/10 dark:to-purple-400/10 border border-indigo-200 dark:border-indigo-800 mb-4">
        <i class="fas fa-check-circle text-indigo-500 dark:text-indigo-400 text-sm"></i>
        <span class="text-sm font-medium text-indigo-600 dark:text-indigo-400">{{ t(locale, 'resultTitle') }}</span>
      </div>
      <h3 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">
        {{ resultData.title || t(locale, 'unknownTitle') }}
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        <i class="fas fa-link mr-1"></i>
        {{ t(locale, 'sourceHint') }}
      </p>
    </div>

    <div class="result-card">
      <div v-if="author && (author.name || author.avatar)" class="flex items-center gap-4 mb-6 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
        <img
          v-if="author.avatar"
          :src="author.avatar"
          class="w-14 h-14 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg ux-img-hover"
          :alt="author.name || 'User avatar'"
          @error="$event.target.src = 'https://via.placeholder.com/56x56?text=U'"
        >
        <div class="flex-1 min-w-0">
          <div v-if="author.name" class="font-semibold text-slate-800 dark:text-white truncate">
            {{ author.name }}
          </div>
          <div v-if="author.likeCountNum !== '0'" class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <i class="fas fa-heart text-rose-500"></i>
            <span>{{ t(locale, 'infoLikes').replace('{count}', author.likeCountNum) }}</span>
          </div>
        </div>
      </div>

      <div v-if="hasVideo" class="mb-8">
        <div v-if="isLive" class="mb-4">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-400/10 dark:to-orange-400/10 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-medium">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <i class="fas fa-broadcast-moving"></i>
            <span>{{ t(locale, 'liveVideo') }}</span>
          </div>
        </div>

        <div class="video-container rounded-2xl overflow-hidden bg-black shadow-2xl">
          <video
            :src="currentVideoUrl || resultData.url"
            controls
            referrerpolicy="no-referrer"
            class="video-element"
            :poster="resultData.cover || undefined"
          >
            <track kind="captions" :src="undefined" />
          </video>
        </div>

        <div class="flex flex-wrap gap-3 mt-5 justify-center">
          <button
            @click="emit('download-main')"
            class="btn-primary ux-btn-hover flex items-center gap-2 text-sm px-5 py-2.5"
          >
            <i class="fas fa-download"></i>
            <span>{{ isLive ? t(locale, 'downloadLive') : t(locale, 'downloadSingle') }}</span>
          </button>

          <button
            v-if="canDownloadAll"
            @click="emit('download-all')"
            class="btn-secondary ux-btn-hover flex items-center gap-2 text-sm px-5 py-2.5"
          >
            <i class="fas fa-layer-group"></i>
            <span>{{ t(locale, 'downloadAll') }}</span>
          </button>

          <button
            @click="emit('copy-url', currentVideoUrl || resultData.url)"
            class="btn-ghost ux-btn-hover flex items-center gap-2 text-sm px-5 py-2.5"
          >
            <i class="fas fa-copy"></i>
            <span>{{ t(locale, 'copyVideo') }}</span>
          </button>
        </div>

        <div v-if="hasBackup" class="mt-6">
          <button
            @click="emit('toggle-backup')"
            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-600 dark:text-slate-300 ux-focus"
          >
            <i :class="['fas', showBackup ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
            <span>{{ t(locale, 'backupTitle') }} ({{ resultData.video_backup.length }})</span>
          </button>

          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="showBackup" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <button
                v-for="(backup, idx) in resultData.video_backup"
                :key="idx"
                @click="emit('switch-video', backup)"
                class="p-4 rounded-xl text-left transition-all duration-200 group"
                :class="currentVideoUrl === backup.url
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'"
                :aria-pressed="currentVideoUrl === backup.url"
              >
                <div class="font-semibold text-sm mb-1">{{ backup.quality || t(locale, 'unknown') }}</div>
                <div class="text-xs opacity-70">{{ backup.bitrate ? backup.bitrate + 'kbps' : '' }}</div>
                <div v-if="currentVideoUrl === backup.url" class="mt-2">
                  <i class="fas fa-check-circle text-xs"></i>
                </div>
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <div v-if="hasLivePhotos" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-400/10 dark:to-orange-400/10 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-medium">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <i class="fas fa-broadcast-moving"></i>
            <span>{{ t(locale, 'liveVideo') }}</span>
            <span class="ml-1 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-xs">{{ totalLivePhotos }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="emit('download-all-live-covers')"
              class="btn-ghost ux-btn-hover flex items-center gap-2 text-xs px-3 py-1.5"
            >
              <i class="fas fa-images"></i>
              <span class="hidden sm:inline">{{ t(locale, 'downloadAllCovers') }}</span>
            </button>
            <button
              @click="emit('download-all-live')"
              class="btn-primary ux-btn-hover flex items-center gap-2 text-xs px-3 py-1.5"
            >
              <i class="fas fa-download"></i>
              <span class="hidden sm:inline">{{ t(locale, 'downloadAllLive') }}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(item, idx) in resultData.live_photo"
            :key="idx"
            class="relative group live-photo-card rounded-2xl overflow-hidden bg-black"
          >
            <div class="absolute top-3 left-3 z-10">
              <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
                {{ idx + 1 }}
              </span>
            </div>

            <div class="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                @click="emit('download-live-video', item)"
                class="p-2 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white text-xs font-medium transition-colors"
                :title="t(locale, 'overlayVideo')"
              >
                <i class="fas fa-video"></i>
              </button>
              <button
                @click="emit('download-live-cover', item)"
                class="p-2 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white text-xs font-medium transition-colors"
                :title="t(locale, 'overlayCover')"
              >
                <i class="fas fa-image"></i>
              </button>
            </div>

            <video
              :src="item.video"
              :poster="item.image"
              controls
              referrerpolicy="no-referrer"
              class="w-full aspect-video object-contain"
              :preload="idx < 2 ? 'metadata' : 'none'"
            >
              <track kind="captions" :src="undefined" />
            </video>
          </div>
        </div>
      </div>

      <div v-if="hasImages" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-semibold text-slate-800 dark:text-white">
            {{ t(locale, 'images') }} ({{ resultData.images.length }})
          </h4>
        </div>

        <div
          class="image-gallery"
          :class="{
            'grid-cols-1': resultData.images.length === 1,
            'grid-cols-2': resultData.images.length === 2,
            'grid-cols-2 md:grid-cols-3': resultData.images.length >= 3 && resultData.images.length <= 4,
            'grid-cols-2 md:grid-cols-3 lg:grid-cols-4': resultData.images.length > 4
          }"
        >
          <button
            v-for="(img, idx) in resultData.images"
            :key="idx"
            @click="openImageModal(idx)"
            class="image-item ux-img-hover relative overflow-hidden rounded-xl aspect-[4/3] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            :aria-label="`查看图片 ${idx + 1}`"
          >
            <img
              :src="img"
              class="image-element w-full h-full object-cover"
              :alt="`Image ${idx + 1}`"
              loading="lazy"
            >
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <i class="fas fa-expand text-white opacity-0 group-hover:opacity-100 transition-opacity text-lg"></i>
            </div>
          </button>
        </div>

        <div class="flex flex-wrap gap-3 mt-5 justify-center">
          <button
            @click="emit('download-all')"
            class="btn-primary ux-btn-hover flex items-center gap-2 text-sm px-5 py-2.5"
          >
            <i class="fas fa-images"></i>
            <span>{{ t(locale, 'allImages') }} ({{ resultData.images.length }})</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          v-for="(card, idx) in infoCards"
          :key="idx"
          @click="toggleCard(idx)"
          class="info-card cursor-pointer"
          :class="{ 'expanded': expandedCardIndex === idx }"
          :tabindex="0"
          @keydown.enter="toggleCard(idx)"
          @keydown.space.prevent="toggleCard(idx)"
          role="button"
          :aria-expanded="expandedCardIndex === idx"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ card.label }}</span>
            <i :class="['fas text-slate-400 transition-transform duration-200', expandedCardIndex === idx ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
          </div>
          <div class="font-semibold text-slate-800 dark:text-white line-clamp-2" :title="card.value">{{ card.value }}</div>
        </div>
      </div>

      <div v-if="stats.length > 0 || allTags.length > 0" class="space-y-6 mb-8">
        <div v-if="stats.length > 0">
          <h4 class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            <i class="fas fa-chart-bar mr-1"></i>
            {{ locale === 'zh-CN' ? '数据统计' : 'Statistics' }}
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            <div
              v-for="(stat, idx) in stats"
              :key="idx"
              class="stat-card"
            >
              <div class="flex items-center gap-2 mb-2">
                <i :class="['fas', stat.icon, 'text-indigo-500 dark:text-indigo-400 text-sm']"></i>
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ stat.label }}</span>
              </div>
              <div class="font-bold text-lg text-slate-800 dark:text-white">{{ formatNumber(stat.value) }}</div>
            </div>
          </div>
        </div>

        <div v-if="allTags.length > 0">
          <h4 class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            <i class="fas fa-tags mr-1"></i>
            {{ locale === 'zh-CN' ? '相关标签' : 'Tags' }}
          </h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(tag, idx) in hashtags"
              :key="'htag-' + idx"
              class="tag-hashtag"
            >
              # {{ tag.name }}
            </span>
            <span
              v-for="(tag, idx) in videoTags"
              :key="'vtag-' + idx"
              class="tag-video"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="hasMusic" class="music-player mb-6">
        <div class="flex items-start gap-4 p-5 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-400/5 dark:via-purple-400/5 dark:to-pink-400/5 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
          <img
            v-if="resultData.music.avatar"
            :src="resultData.music.avatar"
            class="w-20 h-20 rounded-xl object-cover shrink-0 shadow-lg"
            :alt="resultData.music.title || 'Music cover'"
            @error="$event.target.src = 'https://via.placeholder.com/80x80?text=Cover'"
          >
          <div class="flex-1 min-w-0">
            <div class="mb-3">
              <h4 class="font-semibold text-slate-800 dark:text-white truncate">
                {{ resultData.music.title || t(locale, 'unknownMusic') }}
              </h4>
              <p class="text-sm text-slate-500 dark:text-slate-400 truncate">
                <i class="fas fa-user mr-1"></i>
                {{ resultData.music.author || t(locale, 'unknownAuthor') }}
              </p>
            </div>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <audio
                :src="resultData.music.url"
                controls
                class="audio-element flex-1 w-full min-w-0"
              >
                <track kind="captions" :src="undefined" />
              </audio>
              <button
                @click="emit('download-music', resultData.music)"
                class="btn-primary shrink-0 px-4 py-2 ux-btn-hover flex items-center justify-center gap-2"
              >
                <i class="fas fa-download"></i>
                <span>{{ locale === 'zh-CN' ? '下载' : 'Download' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="imageModalOpen"
          class="image-modal"
          @click.self="closeImageModal"
          @keydown="handleKeydown"
          role="dialog"
          aria-modal="true"
          aria-label="图片查看器"
          tabindex="-1"
        >
          <button
            @click="closeImageModal"
            class="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            aria-label="关闭"
          >
            <i class="fas fa-times"></i>
          </button>

          <button
            v-if="resultData.images?.length > 1"
            @click="prevImage"
            class="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            aria-label="上一张"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <button
            v-if="resultData.images?.length > 1"
            @click="nextImage"
            class="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            aria-label="下一张"
          >
            <i class="fas fa-chevron-right"></i>
          </button>

          <div class="flex items-center justify-center h-full p-4">
            <img
              :src="resultData.images[activeImageIndex]"
              class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              :alt="`Image ${activeImageIndex + 1}`"
            >
          </div>

          <div v-if="resultData.images?.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <span
              v-for="(_, idx) in resultData.images"
              :key="idx"
              @click="activeImageIndex = idx"
              class="w-2 h-2 rounded-full transition-all cursor-pointer"
              :class="idx === activeImageIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'"
              :aria-label="`跳转到图片 ${idx + 1}`"
            ></span>
          </div>

          <div class="absolute bottom-4 right-4 text-white text-sm">
            {{ activeImageIndex + 1 }} / {{ resultData.images?.length }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.result-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.25rem;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  border: 1px solid #e2e8f0;
}

.dark .result-card {
  background: #1e293b;
  border-color: #334155;
}

.ux-section-reveal {
  animation: sectionReveal 0.5s ease forwards;
}

@keyframes sectionReveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.video-container {
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.video-element {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
}

@media (max-width: 640px) {
  .video-element {
    max-height: 280px;
  }
}

.live-photo-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.live-photo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.image-gallery {
  display: grid;
  gap: 0.75rem;
}

.image-item {
  position: relative;
  overflow: hidden;
}

.image-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-radius: inherit;
  transition: border-color 0.2s ease;
  pointer-events: none;
  z-index: 1;
}

.image-item:focus::before,
.image-item:hover::before {
  border-color: var(--color-primary, #6366f1);
}

.image-element {
  transition: transform 0.3s ease;
}

.image-item:hover .image-element {
  transform: scale(1.05);
}

.info-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.dark .info-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-color: rgba(51, 65, 85, 0.5);
}

.info-card:hover,
.info-card.expanded {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.dark .stat-card {
  background: #1e293b;
  border-color: #334155;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
}

.tag-hashtag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.875rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6366f1;
  transition: all 0.2s ease;
}

.tag-hashtag:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  transform: translateY(-1px);
}

.tag-video {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.875rem;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #ec4899;
  transition: all 0.2s ease;
}

.tag-video:hover {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
  transform: translateY(-1px);
}

.music-player {
  position: relative;
  overflow: hidden;
}

.music-player::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
}

.audio-element {
  height: 40px;
  border-radius: 9999px;
}

.audio-element::-webkit-media-controls-panel {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-weight: 600;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  color: white;
  font-weight: 600;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.45);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(148, 163, 184, 0.1);
  color: #475569;
  font-weight: 600;
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark .btn-ghost {
  color: #cbd5e1;
}

.btn-ghost:hover {
  background: rgba(148, 163, 184, 0.2);
  border-color: rgba(148, 163, 184, 0.3);
}

.ux-btn-hover {
  transition: all 0.2s ease;
}

.ux-btn-hover:hover {
  transform: translateY(-2px);
}

.ux-btn-hover:active {
  transform: scale(0.98);
}

.ux-img-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.ux-img-hover:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.ux-focus:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
}

.image-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>