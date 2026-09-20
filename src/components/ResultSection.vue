<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import VideoPlaylist from './VideoPlaylist.vue'

const props = defineProps({
  resultData: Object,
  isDownloading: Boolean,
  showBackup: Boolean,
  locale: String,
  formatNumber: Function,
  formatDuration: Function,
  currentVideoUrl: String,
  /** 选集状态（多 P 时可用） */
  selection: Object
})

const emit = defineEmits([
  'download-main', 'download-backup', 'download-all', 'download-music',
  'download-live-video', 'download-live-cover', 'download-all-live', 'download-all-live-covers',
  'copy-url', 'toggle-backup', 'switch-video',
  'select-video', 'toggle-video', 'select-all-videos', 'clear-selection',
  'select-collection',
  'download-index', 'download-selected', 'download-all-videos',
  'download-selected-zip', 'download-all-zip'
])

// ── computed state ──
const hasVideo = computed(() => !!props.resultData?.url)
const hasImages = computed(() => props.resultData?.images?.length > 0)
const hasMusic = computed(() => !!props.resultData?.music?.url)
const hasBackup = computed(() => props.resultData?.video_backup?.length > 0)
const isLive = computed(() => props.resultData?.type === 'live')
const hasLivePhotos = computed(() => (props.resultData?.live_photo?.length || 0) > 0)
const totalLivePhotos = computed(() => props.resultData?.live_photo?.length || 0)
const hasBothMedia = computed(() => hasVideo.value && hasImages.value)
const isImageType = computed(() => props.resultData?.type === 'image')
const isCollection = computed(() =>
  ['collection', 'collections', 'season', 'ugc_season'].includes(props.resultData?.type)
)
const isVideoType = computed(() => props.resultData?.type === 'video' || (!props.resultData?.type && hasVideo.value))
const isLiveType = computed(() => props.resultData?.type === 'live')
// 多集展示条件：视频条目 >1，或存在合集/分集元数据（合集仅回传 1 条时也要展示选集列表）
const isMulti = computed(
  () =>
    (props.resultData?.videos?.length || 0) > 1 ||
    (props.resultData?.collections?.length || 0) > 0 ||
    isCollection.value,
)

const activeImageIndex = ref(0)
const imageModalOpen = ref(false)
const activeTab = ref('info')
const collapsedSections = ref({})
const activeLiveIndex = ref(0)
const liveViewMode = ref('video')
const showCopyToast = ref(false)
const copyToastText = ref('')
const videoEl = ref(null)

// 选中集变更 → 播放器 reload 归零
watch(
  () => props.selection?.currentVideoUrl?.value,
  () => {
    if (videoEl.value) {
      videoEl.value.currentTime = 0
      // src 变更后主动 reload，防续播旧进度
      videoEl.value.load && videoEl.value.load()
    }
  }
)

const currentIndex = computed(() => props.selection?.selectedIndex?.value ?? 0)
// 选集展示列表：合集时为当前合集的分集，否则为全量 videos
const visibleVideos = computed(
  () => props.selection?.visibleList?.value ?? props.resultData?.videos ?? []
)
const collections = computed(() => props.selection?.collections?.value ?? [])
const activeCollection = computed(() => props.selection?.sectionIndex?.value ?? 0)
const selectedVideoUrl = computed(() => {
  const item = currentVideoItem.value
  // 未懒解析出直链的分集：不回退到顶层 url（避免播错集），交给解析遮罩
  if (item && !item.url && !item.error) return ''
  return (
    props.selection?.currentVideoUrl?.value ||
    props.currentVideoUrl ||
    props.resultData?.url ||
    ''
  )
})
const selectedCount = computed(() => props.selection?.selectedCount?.value ?? 0)
const selectedTotal = computed(() => props.selection?.total?.value ?? props.resultData?.videos?.length ?? 0)

// 当前选中的分集对象（用于解析中/缺链状态判断）
const currentVideoItem = computed(
  () => props.selection?.currentVideo?.value ?? visibleVideos.value?.[currentIndex.value] ?? null
)
// 该 P/合集分集正在懒解析中（B 站）
const isResolving = computed(() => !!currentVideoItem.value?._resolving)
// 当前分集既没有直链也没有顶层 url（等待解析 / 解析失败）
const noCurrentUrl = computed(
  () => !!currentVideoItem.value && !currentVideoItem.value.url && !currentVideoItem.value.error
)

const copyToClipboard = async (text, index = -1) => {
  try {
    await navigator.clipboard.writeText(text)
    copyToastText.value = text.length > 20 ? text.substring(0, 20) + '...' : text
    showCopyToast.value = true
    setTimeout(() => {
      showCopyToast.value = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

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
  let id = ''
  if (props.resultData.author && typeof props.resultData.author === 'object') {
    id = props.resultData.author.id || ''
  }
  const likeCount = props.resultData?.extra?.statistics?.digg_count
  const likeCountNum = likeCount !== undefined && likeCount !== null ? props.formatNumber(likeCount) : '0'
  return { name, avatar, id, likeCountNum }
})

const infoCards = computed(() => {
  if (!props.resultData) return []
  const data = props.resultData
  const cards = []
  cards.push({ label: content[props.locale]?.infoTitle || '作品标题', value: data.title || content[props.locale]?.unknownTitle || '未知标题', icon: 'fa-pen' })
  const publishTs = (data.extra && data.extra.create_time) || data.time
  cards.push({ label: content[props.locale]?.publishTime || '发布时间', value: formatDate(publishTs) || content[props.locale]?.unknownTime || '未知时间', icon: 'fa-calendar' })
  let typeText = content[props.locale]?.unknownType || '未知'
  const type = data.type || (data.images && data.images.length > 0 ? 'images' : 'video')
  if (['video', 'videos'].includes(type)) typeText = content[props.locale]?.video || '视频'
  else if (isCollection.value) typeText = content[props.locale]?.collection || '合集'
  else if (['image', 'images', 'normal'].includes(type)) typeText = content[props.locale]?.images || '图片集'
  else if (type === 'live') typeText = content[props.locale]?.live || '实况解析'
  else typeText = data.images && data.images.length > 0 ? (content[props.locale]?.images || '图片集') : (content[props.locale]?.video || '视频')
  cards.push({ label: content[props.locale]?.type || '类型', value: typeText, icon: 'fa-cube' })
  if (type !== 'live' && data.quality) {
    cards.push({ label: content[props.locale]?.quality || '画质', value: data.quality, icon: 'fa-expand' })
  }
  if (data.duration) {
    cards.push({ label: content[props.locale]?.duration || '时长', value: props.formatDuration(data.duration), icon: 'fa-clock' })
  }
  return cards
})

const stats = computed(() => {
  if (!props.resultData?.extra?.statistics) return []
  const s = props.resultData.extra.statistics
  const statMap = [
    { key: 'play_count', label: content[props.locale]?.statPlay || '播放', value: s.play_count, icon: 'fa-play-circle' },
    { key: 'digg_count', label: content[props.locale]?.statLike || '点赞', value: s.digg_count, icon: 'fa-heart' },
    { key: 'comment_count', label: content[props.locale]?.statComment || '评论', value: s.comment_count, icon: 'fa-comment-dots' },
    { key: 'collect_count', label: content[props.locale]?.statCollect || '收藏', value: s.collect_count, icon: 'fa-star' },
    { key: 'share_count', label: content[props.locale]?.statShare || '分享', value: s.share_count, icon: 'fa-share-alt' },
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
    downloadLive: '下载实况',
    downloadAll: '下载全部',
    downloadSelected: '下载选中',
    downloadAllVideos: '下载全部',
    downloadSelectedZip: '选中打包ZIP',
    downloadAllZip: '全部打包ZIP',
    resolving: '解析中…',
    episodes: '分集',
    collections: '合集',
    copyVideo: '复制链接',
    backupTitle: '备用画质',
    unknown: '未知',
    allImages: '下载全部图片',
    downloadAllLive: '下载全部实况',
    downloadAllCovers: '下载全部封面',
    musicTitle: '背景音乐',
    unknownMusic: '未知音乐',
    unknownAuthor: '未知作者',
    liveVideo: '实况',
    infoTitle: '作品标题',
    unknownTitle: '未知标题',
    publishTime: '发布时间',
    unknownTime: '未知时间',
    type: '作品类型',
    video: '视频',
    images: '图片集',
    live: '实况',
    collection: '合集',
    unknownType: '未知',
    quality: '画质',
    duration: '时长',
    unknownQuality: '未知',
    overlayVideo: '下载视频',
    overlayCover: '下载封面',
    infoLikes: '获赞 {count}',
    copied: '已复制',
    copiedHint: '链接已复制到剪贴板',
    statPlay: '播放',
    statLike: '点赞',
    statComment: '评论',
    statCollect: '收藏',
    statShare: '分享',
    tabInfo: '详情',
    tabStats: '数据',
    tabTags: '标签',
    tabMusic: '音乐',
    tabBackup: '画质选项',
    imagesTitle: '图片集',
    imagesCount: '{count} 张',
    liveCount: '{count} 组',
    bitRate: '码率',
    codec: '编码',
    resolution: '分辨率',
    currentPlaying: '当前播放',
    preview: '预览',
    close: '关闭',
    page: '页',
    videoSource: '视频源',
    imageSource: '图片来源',
    liveSource: '实况来源',
    noBackups: '暂无备用画质',
    selectQuality: '选择画质',
  },
  'en': {
    resultTitle: 'Result',
    sourceHint: 'Using direct source link',
    downloadSingle: 'Download Video',
    downloadLive: 'Download Live',
    downloadAll: 'Download All',
    downloadSelected: 'Download Selected',
    downloadAllVideos: 'Download All',
    downloadSelectedZip: 'Selected as ZIP',
    downloadAllZip: 'All as ZIP',
    resolving: 'Resolving…',
    episodes: 'Episodes',
    collections: 'Collections',
    copyVideo: 'Copy URL',
    backupTitle: 'Backup Quality',
    unknown: 'Unknown',
    allImages: 'Download Images',
    downloadAllLive: 'Download All Live',
    downloadAllCovers: 'Download All Covers',
    musicTitle: 'Background Music',
    unknownMusic: 'Unknown Music',
    unknownAuthor: 'Unknown Artist',
    liveVideo: 'Live',
    infoTitle: 'Title',
    unknownTitle: 'Unknown Title',
    publishTime: 'Published',
    unknownTime: 'Unknown',
    type: 'Type',
    video: 'Video',
    images: 'Album',
    live: 'Live',
    collection: 'Collection',
    unknownType: 'Unknown',
    quality: 'Quality',
    duration: 'Duration',
    unknownQuality: 'Unknown',
    overlayVideo: 'Download Video',
    overlayCover: 'Download Cover',
    infoLikes: '{count} likes',
    copied: 'Copied',
    copiedHint: 'URL copied to clipboard',
    statPlay: 'Plays',
    statLike: 'Likes',
    statComment: 'Comments',
    statCollect: 'Favorites',
    statShare: 'Shares',
    tabInfo: 'Details',
    tabStats: 'Stats',
    tabTags: 'Tags',
    tabMusic: 'Music',
    tabBackup: 'Quality',
    imagesTitle: 'Album',
    imagesCount: '{count} images',
    liveCount: '{count} groups',
    bitRate: 'Bitrate',
    codec: 'Codec',
    resolution: 'Resolution',
    currentPlaying: 'Now Playing',
    preview: 'Preview',
    close: 'Close',
    page: 'page',
    videoSource: 'Video Source',
    imageSource: 'Image Source',
    liveSource: 'Live Source',
    noBackups: 'No backup qualities',
    selectQuality: 'Select Quality',
  }
}

const t = (locale, key) => content[locale]?.[key] || content['zh-CN'][key] || key

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  if (isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatBitrate = (val) => {
  const n = Number(val || 0)
  if (n <= 0) return ''
  if (n >= 1000000) return (n / 1000000).toFixed(1) + ' Mbps'
  if (n >= 1000) return (n / 1000).toFixed(0) + ' Kbps'
  return n + ' bps'
}

const mediaTypeBadge = computed(() => {
  if (isLiveType.value) return { icon: 'fa-broadcast-tower', text: t(props.locale, 'live'), style: 'live' }
  if (isImageType.value) return { icon: 'fa-images', text: t(props.locale, 'images'), style: 'image' }
  if (isCollection.value) return { icon: 'fa-layer-group', text: t(props.locale, 'collection'), style: 'video' }
  return { icon: 'fa-play', text: t(props.locale, 'video'), style: 'video' }
})

// ── image modal ──
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

const handleKeydown = (e) => {
  if (!imageModalOpen.value) return
  if (e.key === 'Escape') closeImageModal()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

const tabs = computed(() => {
  const items = [{ key: 'info', icon: 'fa-info-circle', label: t(props.locale, 'tabInfo') }]
  if (stats.value.length > 0) items.push({ key: 'stats', icon: 'fa-chart-bar', label: t(props.locale, 'tabStats') })
  if (hasBackup.value) items.push({ key: 'backup', icon: 'fa-layer-group', label: t(props.locale, 'tabBackup') })
  if (allTags.value.length > 0) items.push({ key: 'tags', icon: 'fa-tags', label: t(props.locale, 'tabTags') })
  if (hasMusic.value) items.push({ key: 'music', icon: 'fa-music', label: t(props.locale, 'tabMusic') })
  return items
})

const toggleSection = (key) => {
  collapsedSections.value[key] = !collapsedSections.value[key]
}
</script>

<template>
  <section
    v-if="resultData"
    class="rs"
    role="region"
    :aria-label="t(locale, 'resultTitle')"
  >
    <!-- ════════════════════════════════════════════════════════
         HEADER BAR
         ════════════════════════════════════════════════════════ -->
    <div class="rs-header">
      <div class="rs-header-inner">
        <div class="rs-header-left">
          <div class="rs-status-dot-wrapper">
            <div class="rs-status-dot"></div>
            <div class="rs-status-dot-pulse"></div>
          </div>
          <span class="rs-header-title">{{ t(locale, 'resultTitle') }}</span>
          <span class="rs-header-badge" :class="'rs-header-badge--' + mediaTypeBadge.style">
            <i :class="['fas', mediaTypeBadge.icon]"></i>
            {{ mediaTypeBadge.text }}
          </span>
        </div>
        <div class="rs-header-right">
          <span class="rs-header-hint">
            <i class="fas fa-link rs-header-hint-icon"></i>
            <span class="rs-header-hint-text">{{ t(locale, 'sourceHint') }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════
         TITLE ROW
         ════════════════════════════════════════════════════════ -->
    <div class="rs-title-row">
      <h2 class="rs-title">{{ resultData.title || t(locale, 'unknownTitle') }}</h2>
    </div>

    <!-- ════════════════════════════════════════════════════════
         MAIN GRID: media-left + info-right (desktop)
                     stacked on mobile/tablet
         ════════════════════════════════════════════════════════ -->
    <div class="rs-main">
      <!-- ============================================================
           LEFT COLUMN: Media Content
           ============================================================ -->
      <div class="rs-media-col">
        <!-- ── MULTI-EPISODE：播放器 + 选集列表 ── -->
        <template v-if="isMulti">
          <div class="rs-card rs-card--video">
            <div class="rs-card-hd">
              <div class="rs-card-hd-left">
                <i class="fas fa-play-circle rs-card-icon"></i>
                <span>{{ t(locale, 'videoSource') }}</span>
              </div>
              <span v-if="resultData.quality" class="rs-quality-tag">{{ resultData.quality }}</span>
            </div>
            <div class="rs-video-stage">
              <video
                ref="videoEl"
                :src="selectedVideoUrl || resultData.url"
                controls
                referrerpolicy="no-referrer"
                class="rs-video"
                :poster="resultData.cover || undefined"
              >
                <track kind="captions" :src="undefined" />
              </video>
              <!-- B 站多 P 解析遮罩 -->
              <div
                v-if="isResolving || (noCurrentUrl && !currentVideoItem?.error)"
                class="rs-stage-overlay"
              >
                <div class="rs-stage-spinner"></div>
                <span>{{ t(locale, 'resolving') }}</span>
              </div>
            </div>
            <div class="rs-card-actions">
              <button
                @click="emit('download-index', currentIndex)"
                class="rs-btn rs-btn--primary"
                :disabled="isDownloading"
              >
                <i class="fas fa-download"></i>
                <span>{{ t(locale, 'downloadSingle') }}</span>
              </button>
              <template v-if="selectedCount > 0">
                <button
                  @click="emit('download-selected')"
                  class="rs-btn rs-btn--accent"
                  :disabled="isDownloading"
                >
                  <i class="fas fa-layer-group"></i>
                  <span>{{ t(locale, 'downloadSelected') }}（{{ selectedCount }}）</span>
                </button>
                <button
                  @click="emit('download-selected-zip', props.selection?.getBatchVideos?.() ?? [])"
                  class="rs-btn rs-btn--ghost"
                  :disabled="isDownloading"
                >
                  <i class="fas fa-file-archive"></i>
                  <span>{{ t(locale, 'downloadSelectedZip') }}</span>
                </button>
              </template>
              <template v-else>
                <button
                  @click="emit('download-all-videos')"
                  class="rs-btn rs-btn--accent"
                  :disabled="isDownloading"
                >
                  <i class="fas fa-download"></i>
                  <span>{{ t(locale, 'downloadAllVideos') }}</span>
                </button>
                <button
                  @click="emit('download-all-zip', resultData.videos ?? [])"
                  class="rs-btn rs-btn--ghost"
                  :disabled="isDownloading"
                >
                  <i class="fas fa-file-archive"></i>
                  <span>{{ t(locale, 'downloadAllZip') }}</span>
                </button>
              </template>
              <button
                @click="emit('copy-url', selectedVideoUrl)"
                class="rs-btn rs-btn--ghost-light"
              >
                <i class="fas fa-copy"></i>
                <span>{{ t(locale, 'copyVideo') }}</span>
              </button>
            </div>
          </div>

          <div class="rs-card rs-card--playlist">
            <div class="rs-card-hd">
              <div class="rs-card-hd-left">
                <i class="fas fa-list rs-card-icon"></i>
                <span>{{ t(locale, 'episodes') }}（{{ visibleVideos.length }}）</span>
              </div>
              <span v-if="collections.length > 1" class="rs-count-tag">
                {{ collections.length }} {{ t(locale, 'collections') }}
              </span>
            </div>
            <div class="rs-playlist">
              <VideoPlaylist
                :videos="visibleVideos"
                :current-index="currentIndex"
                :selected-set="props.selection?.selectedSet?.value"
                :total="selectedTotal"
                :disabled="isDownloading"
                :collections="collections"
                :active-collection="activeCollection"
                @select="emit('select-video', $event)"
                @toggle="emit('toggle-video', $event)"
                @select-all="emit('select-all-videos')"
                @clear-selection="emit('clear-selection')"
                @select-collection="emit('select-collection', $event)"
              />
            </div>
          </div>
        </template>

        <!-- ── VIDEO PLAYER（单集）── -->
        <div v-else-if="hasVideo" class="rs-card rs-card--video">
          <div class="rs-card-hd">
            <div class="rs-card-hd-left">
              <i class="fas fa-play-circle rs-card-icon"></i>
              <span>{{ t(locale, 'videoSource') }}</span>
            </div>
            <span v-if="resultData.quality" class="rs-quality-tag">{{ resultData.quality }}</span>
          </div>
          <div class="rs-video-stage">
            <video
              ref="videoEl"
              :src="currentVideoUrl || resultData.url"
              controls
              referrerpolicy="no-referrer"
              class="rs-video"
              :poster="resultData.cover || undefined"
            >
              <track kind="captions" :src="undefined" />
            </video>
          </div>
          <div class="rs-card-actions">
            <button @click="emit('download-main')" class="rs-btn rs-btn--primary">
              <i class="fas fa-download"></i>
              <span>{{ isLive ? t(locale, 'downloadLive') : t(locale, 'downloadSingle') }}</span>
            </button>
            <button
              v-if="hasBothMedia || isLive || hasLivePhotos"
              @click="emit('download-all')"
              class="rs-btn rs-btn--accent"
            >
              <i class="fas fa-layer-group"></i>
              <span>{{ t(locale, 'downloadAll') }}</span>
            </button>
            <button @click="emit('copy-url', currentVideoUrl || resultData.url)" class="rs-btn rs-btn--ghost-light">
              <i class="fas fa-copy"></i>
              <span>{{ t(locale, 'copyVideo') }}</span>
            </button>
          </div>
        </div>

        <!-- ── IMAGE GALLERY ── -->
        <div v-if="hasImages && !isLiveType" class="rs-card rs-card--gallery">
          <div class="rs-card-hd">
            <div class="rs-card-hd-left">
              <i class="fas fa-images rs-card-icon"></i>
              <span>{{ t(locale, 'imageSource') }}</span>
            </div>
            <span class="rs-count-tag">{{ t(locale, 'imagesCount').replace('{count}', resultData.images.length) }}</span>
          </div>

          <div
            class="rs-gallery"
            :class="{
              'rs-gallery--1': resultData.images.length === 1,
              'rs-gallery--2': resultData.images.length === 2,
              'rs-gallery--3': resultData.images.length >= 3 && resultData.images.length <= 6,
              'rs-gallery--4': resultData.images.length > 6
            }"
          >
            <button
              v-for="(img, idx) in resultData.images"
              :key="idx"
              @click="openImageModal(idx)"
              class="rs-gallery-item"
              :aria-label="`${t(locale, 'preview')} ${idx + 1}`"
            >
              <img :src="img" class="rs-gallery-img" :alt="`${t(locale, 'imagesTitle')} ${idx + 1}`" loading="lazy" />
              <div class="rs-gallery-mask">
                <i class="fas fa-search-plus"></i>
              </div>
            </button>
          </div>

          <div class="rs-card-actions">
            <button @click="emit('download-all')" class="rs-btn rs-btn--primary">
              <i class="fas fa-download"></i>
              <span>{{ t(locale, 'allImages') }} ({{ resultData.images.length }})</span>
            </button>
          </div>
        </div>

        <!-- ── LIVE PHOTOS ── -->
        <div v-if="hasLivePhotos" class="rs-card rs-card--live">
          <div class="rs-live-carousel">
            <!-- 顶部标签栏 -->
            <div class="rs-live-carousel-hd">
              <span class="rs-live-badge">
                <span class="rs-live-dot"></span>
                {{ t(locale, 'live') }} {{ activeLiveIndex + 1 }}/{{ totalLivePhotos }}
              </span>
              <div class="rs-live-toggle">
                <button
                  @click="liveViewMode = 'video'"
                  class="rs-live-toggle-btn"
                  :class="{ 'rs-live-toggle-btn--on': liveViewMode === 'video' }"
                >
                  <i class="fas fa-video"></i>
                  {{ t(locale, 'overlayVideo') }}
                </button>
                <button
                  @click="liveViewMode = 'cover'"
                  class="rs-live-toggle-btn"
                  :class="{ 'rs-live-toggle-btn--on': liveViewMode === 'cover' }"
                >
                  <i class="fas fa-image"></i>
                  {{ t(locale, 'overlayCover') }}
                </button>
              </div>
            </div>

            <!-- 媒体内容区 -->
            <div class="rs-live-carousel-body">
              <!-- 导航箭头 -->
              <button
                @click="activeLiveIndex = activeLiveIndex === 0 ? totalLivePhotos - 1 : activeLiveIndex - 1"
                class="rs-live-nav rs-live-nav--prev"
                :disabled="totalLivePhotos <= 1"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button
                @click="activeLiveIndex = (activeLiveIndex + 1) % totalLivePhotos"
                class="rs-live-nav rs-live-nav--next"
                :disabled="totalLivePhotos <= 1"
              >
                <i class="fas fa-chevron-right"></i>
              </button>

              <!-- 视频/图片展示 -->
              <div class="rs-live-carousel-content">
                <template v-if="liveViewMode === 'video'">
                  <video
                    :src="resultData.live_photo[activeLiveIndex]?.video"
                    :poster="resultData.live_photo[activeLiveIndex]?.image"
                    controls
                    referrerpolicy="no-referrer"
                    class="rs-live-carousel-video"
                  >
                    <track kind="captions" :src="undefined" />
                  </video>
                </template>
                <template v-else>
                  <img
                    :src="resultData.live_photo[activeLiveIndex]?.image"
                    class="rs-live-carousel-image"
                    :alt="`${t(locale, 'live')} ${activeLiveIndex + 1}`"
                  />
                </template>
              </div>
            </div>

            <!-- 当前项操作按钮 -->
            <div class="rs-live-carousel-actions">
              <button
                @click="emit('download-live-video', resultData.live_photo[activeLiveIndex])"
                class="rs-btn rs-btn--ghost rs-btn--sm"
              >
                <i class="fas fa-video"></i>
                {{ t(locale, 'overlayVideo') }}
              </button>
              <button
                @click="emit('download-live-cover', resultData.live_photo[activeLiveIndex])"
                class="rs-btn rs-btn--ghost rs-btn--sm"
              >
                <i class="fas fa-image"></i>
                {{ t(locale, 'overlayCover') }}
              </button>
            </div>
          </div>

          <!-- 底部批量下载 -->
          <div class="rs-live-bulk-bar">
            <button @click="emit('download-all-live')" class="rs-btn rs-btn--primary rs-btn--block">
              <i class="fas fa-download"></i>
              {{ t(locale, 'downloadAllLive') }} ({{ totalLivePhotos }} {{ t(locale, 'live') }})
            </button>
            <button @click="emit('download-all-live-covers')" class="rs-btn rs-btn--ghost rs-btn--block">
              <i class="fas fa-images"></i>
              {{ t(locale, 'downloadAllCovers') }} ({{ totalLivePhotos }})
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================
           RIGHT COLUMN: Info Panel
           ============================================================ -->
      <div class="rs-info-col">
        <!-- ── AUTHOR CARD ── -->
        <div v-if="author && (author.name || author.avatar)" class="rs-card rs-card--author">
          <div class="rs-author-inner">
            <div class="rs-author-avatar-wrap">
              <img
                v-if="author.avatar"
                :src="author.avatar"
                class="rs-author-avatar"
                :alt="author.name || 'Author'"
                @error="$event.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 48 48%22><rect fill=%22%23e2e8f0%22 width=%2248%22 height=%2248%22/><text x=%2224%22 y=%2228%22 text-anchor=%22middle%22 fill=%22%2394a3b8%22 font-size=%2216%22>?</text></svg>'"
              />
              <div v-else class="rs-author-avatar-fb">
                <i class="fas fa-user"></i>
              </div>
            </div>
            <div class="rs-author-detail">
              <div 
                class="rs-author-name rs-copyable" 
                @click="copyToClipboard(author.name)"
              >
                {{ author.name }}
              </div>
              <div 
                v-if="author.id" 
                class="rs-author-id rs-copyable"
                @click="copyToClipboard(author.id)"
              >
                @{{ author.id }}
              </div>
              <div v-if="author.likeCountNum !== '0'" class="rs-author-likes">
                <i class="fas fa-heart"></i>
                {{ t(locale, 'infoLikes').replace('{count}', author.likeCountNum) }}
              </div>
            </div>
          </div>
        </div>

        <!-- ── TAB NAVIGATION ── -->
        <div class="rs-card rs-card--info">
          <nav class="rs-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              class="rs-tab"
              :class="{ 'rs-tab--on': activeTab === tab.key }"
            >
              <i :class="['fas', tab.icon]"></i>
              <span>{{ tab.label }}</span>
            </button>
          </nav>

          <!-- ── TAB: 详情 ── -->
          <div v-if="activeTab === 'info'" class="rs-tab-panel">
            <div class="rs-info-list">
              <div 
                v-for="(card, idx) in infoCards" 
                :key="idx" 
                class="rs-info-row rs-copyable"
                @click="copyToClipboard(card.value)"
              >
                <div class="rs-info-icon">
                  <i :class="['fas', card.icon]"></i>
                </div>
                <div class="rs-info-text">
                  <span class="rs-info-key">{{ card.label }}</span>
                  <span class="rs-info-val">{{ card.value }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ── TAB: 数据统计 ── -->
          <div v-if="activeTab === 'stats'" class="rs-tab-panel">
            <div class="rs-stat-grid">
              <div v-for="(stat, idx) in stats" :key="idx" class="rs-stat-cell">
                <div class="rs-stat-icon">
                  <i :class="['fas', stat.icon]"></i>
                </div>
                <div class="rs-stat-num">{{ formatNumber(stat.value) }}</div>
                <div class="rs-stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <!-- ── TAB: 画质选项 ── -->
          <div v-if="activeTab === 'backup'" class="rs-tab-panel">
            <template v-if="hasBackup">
              <div class="rs-backup-label-row">
                <span>{{ t(locale, 'selectQuality') }}</span>
              </div>
              <div class="rs-backup-list">
                <button
                  v-for="(backup, idx) in resultData.video_backup"
                  :key="idx"
                  @click="emit('switch-video', backup)"
                  class="rs-backup-item"
                  :class="{ 'rs-backup-item--cur': currentVideoUrl === backup.url }"
                >
                  <div class="rs-backup-hd">
                    <span class="rs-backup-name">{{ backup.quality || backup.label || t(locale, 'unknown') }}</span>
                    <i v-if="currentVideoUrl === backup.url" class="fas fa-circle-check rs-backup-cur"></i>
                  </div>
                  <div class="rs-backup-meta">
                    <span v-if="backup.bit_rate" class="rs-backup-meta-tag">
                      <i class="fas fa-wave-square"></i>{{ formatBitrate(backup.bit_rate) }}
                    </span>
                    <span v-if="backup.width && backup.height" class="rs-backup-meta-tag">
                      <i class="fas fa-arrows-alt"></i>{{ backup.width }}×{{ backup.height }}
                    </span>
                    <span v-if="backup.codec" class="rs-backup-meta-tag">
                      <i class="fas fa-microchip"></i>{{ backup.codec }}
                    </span>
                  </div>
                  <div v-if="currentVideoUrl === backup.url" class="rs-backup-playing">
                    <i class="fas fa-headphones"></i> {{ t(locale, 'currentPlaying') }}
                  </div>
                </button>
              </div>
            </template>
            <div v-else class="rs-empty">
              <i class="fas fa-inbox"></i>
              <span>{{ t(locale, 'noBackups') }}</span>
            </div>
          </div>

          <!-- ── TAB: 标签 ── -->
          <div v-if="activeTab === 'tags'" class="rs-tab-panel">
            <div class="rs-tags-wrap">
              <span 
                v-for="(tag, idx) in hashtags" 
                :key="'ht-' + idx" 
                class="rs-tag rs-tag--hash rs-copyable-tag"
                @click="copyToClipboard(tag.name)"
              >
                # {{ tag.name }}
              </span>
              <span 
                v-for="(tag, idx) in videoTags" 
                :key="'vt-' + idx" 
                class="rs-tag rs-tag--vt rs-copyable-tag"
                @click="copyToClipboard(tag.name)"
              >
                <i class="fas fa-tag"></i> {{ tag.name }}
              </span>
            </div>
          </div>

          <!-- ── TAB: 背景音乐 ── -->
          <div v-if="activeTab === 'music'" class="rs-tab-panel">
            <div class="rs-music">
              <div class="rs-music-cover-wrap">
                <img
                  v-if="resultData.music.cover"
                  :src="resultData.music.cover"
                  class="rs-music-cover"
                  :alt="resultData.music.title || 'Cover'"
                  @error="$event.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 80%22><rect fill=%22%23e2e8f0%22 width=%2280%22 height=%2280%22 rx=%2240%22/><text x=%2240%22 y=%2245%22 text-anchor=%22middle%22 fill=%22%2394a3b8%22 font-size=%2228%22>♪</text></svg>'"
                />
                <div v-else class="rs-music-cover-fb">
                  <i class="fas fa-music"></i>
                </div>
                <div class="rs-music-disc"></div>
              </div>
              <div class="rs-music-info">
                <div class="rs-music-title">{{ resultData.music.title || t(locale, 'unknownMusic') }}</div>
                <div class="rs-music-artist">{{ resultData.music.author || t(locale, 'unknownAuthor') }}</div>
              </div>
              <audio :src="resultData.music.url" controls class="rs-music-player">
                <track kind="captions" :src="undefined" />
              </audio>
              <button @click="emit('download-music', resultData.music)" class="rs-btn rs-btn--primary rs-btn--sm rs-btn--block">
                <i class="fas fa-download"></i>
                <span>{{ locale === 'zh-CN' ? '下载音乐' : 'Download' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════
         IMAGE MODAL
         ════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="rs-modal">
        <div
          v-if="imageModalOpen"
          class="rs-modal"
          @click.self="closeImageModal"
          role="dialog"
          aria-modal="true"
          :aria-label="t(locale, 'preview')"
        >
          <button @click="closeImageModal" class="rs-modal-close" :aria-label="t(locale, 'close')">
            <i class="fas fa-times"></i>
          </button>

          <button
            v-if="resultData.images?.length > 1"
            @click="prevImage"
            class="rs-modal-nav rs-modal-nav--prev"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button
            v-if="resultData.images?.length > 1"
            @click="nextImage"
            class="rs-modal-nav rs-modal-nav--next"
          >
            <i class="fas fa-chevron-right"></i>
          </button>

          <div class="rs-modal-body">
            <img
              :src="resultData.images[activeImageIndex]"
              class="rs-modal-img"
              :alt="`${t(locale, 'imagesTitle')} ${activeImageIndex + 1}`"
            />
          </div>

          <div v-if="resultData.images?.length > 1" class="rs-modal-pager">
            <button
              v-for="(_, idx) in resultData.images"
              :key="idx"
              @click="activeImageIndex = idx"
              class="rs-modal-dot"
              :class="{ 'rs-modal-dot--on': idx === activeImageIndex }"
            ></button>
          </div>
          <div class="rs-modal-num">
            {{ activeImageIndex + 1 }} / {{ resultData.images?.length }}
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ════════════════════════════════════════════════════════
         COPY TOAST
         ════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="rs-toast">
        <div v-if="showCopyToast" class="rs-copy-toast">
          <div class="rs-copy-toast-icon">
            <i class="fas fa-check"></i>
          </div>
          <div class="rs-copy-toast-content">
            <div class="rs-copy-toast-title">{{ locale === 'zh-CN' ? '复制成功' : 'Copied' }}</div>
            <div class="rs-copy-toast-text">{{ copyToastText }}</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — enterprise-grade design system
   ═══════════════════════════════════════════════════════════════ */
.rs {
  /* palette */
  --c-accent: #6c5ce7;
  --c-accent-light: #818cf8;
  --c-accent-dark: #4f46e5;
  --c-accent-2: #a855f7;
  --c-accent-3: #ec4899;
  --c-accent-4: #f472b6;
  --c-success: #10b981;
  --c-success-light: #34d399;
  --c-danger: #ef4444;
  --c-danger-light: #f87171;
  --c-warn: #f59e0b;
  --c-warn-light: #fbbf24;
  --c-info: #06b6d4;
  /* surfaces */
  --c-bg: #fff;
  --c-bg-2: #f8fafc;
  --c-bg-3: #f1f5f9;
  --c-bg-elevated: #ffffff;
  --c-fg: #0f172a;
  --c-fg-2: #475569;
  --c-fg-3: #94a3b8;
  --c-fg-4: #cbd5e1;
  --c-border: #e2e8f0;
  --c-border-2: #f1f5f9;
  --c-border-light: #f8fafc;
  /* shadows */
  --sh-sm: 0 1px 2px rgba(0,0,0,.03);
  --sh-md: 0 4px 12px rgba(0,0,0,.06);
  --sh-lg: 0 8px 28px rgba(0,0,0,.08);
  --sh-xl: 0 16px 48px rgba(0,0,0,.12);
  --sh-2xl: 0 24px 72px rgba(0,0,0,.16);
  --sh-glow: 0 0 40px rgba(108,92,231,.15);
  /* radii */
  --r-sm: .5rem;
  --r-md: .75rem;
  --r-lg: 1rem;
  --r-xl: 1.25rem;
  --r-2xl: 1.5rem;
  --r-3xl: 2rem;
  --r-full: 9999px;
  /* motion */
  --t-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --t-base: 220ms cubic-bezier(0.4, 0, 0.2, 1);
  --t-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
  /* layout */
  --content-max: 1320px;
  --sidebar-w: 380px;
  --sidebar-w-xl: 420px;
  --gap: 1.5rem;
  --gap-lg: 2rem;

  max-width: var(--content-max);
  margin: 0 auto 4rem;
  padding: 0 1rem;
  font-family: inherit;
  color: var(--c-fg);
  background: linear-gradient(180deg, rgba(108,92,231,.02) 0%, rgba(168,85,247,.01) 100%);
  border-radius: var(--r-2xl);
  padding: 1.5rem;
}

/* dark mode overrides（注意：不要用 :global(.dark) 前缀——编译器会丢弃 .rs 部分，
   导致 token 变成 html 全局变量被 .rs 的浅色定义覆盖；普通后代选择器才会编译为 .dark .rs[data-v] */
.dark .rs {
  --c-bg: #0f172a;
  --c-bg-2: #1e293b;
  --c-bg-3: #334155;
  --c-bg-elevated: #1e293b;
  --c-fg: #f1f5f9;
  --c-fg-2: #cbd5e1;
  --c-fg-3: #94a3b8;
  --c-fg-4: #64748b;
  --c-border: #334155;
  --c-border-2: #1e293b;
  --c-border-light: #334155;
  --sh-sm: 0 1px 2px rgba(0,0,0,.2);
  --sh-md: 0 4px 12px rgba(0,0,0,.25);
  --sh-lg: 0 8px 28px rgba(0,0,0,.35);
  --sh-xl: 0 16px 48px rgba(0,0,0,.45);
  --sh-2xl: 0 24px 72px rgba(0,0,0,.5);
  --sh-glow: 0 0 40px rgba(108,92,231,.25);
  background: linear-gradient(180deg, rgba(108,92,231,.08) 0%, rgba(168,85,247,.04) 100%);
}

/* ═══════════════════════════════════════════════════════════════
   HEADER BAR - Modern Style
   ═══════════════════════════════════════════════════════════════ */
.rs-header {
  position: relative;
  margin-bottom: 1.25rem;
  border-radius: var(--r-xl);
  overflow: hidden;
}
.rs-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(108,92,231,.08) 0%, 
    rgba(168,85,247,.06) 50%, 
    rgba(236,72,153,.04) 100%
  );
  border: 1px solid rgba(108,92,231,.12);
}
.rs-header-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: .625rem;
  padding: 1rem 1.25rem;
  backdrop-filter: blur(12px);
}
.rs-header-left,
.rs-header-right {
  display: flex;
  align-items: center;
  gap: .75rem;
}

/* Status Dot with Pulse Animation */
.rs-status-dot-wrapper {
  position: relative;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rs-status-dot {
  width: .55rem; 
  height: .55rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #34d399);
  box-shadow: 
    0 0 0 3px rgba(16,185,129,.2),
    0 0 10px rgba(16,185,129,.4);
  position: relative;
  z-index: 2;
}
.rs-status-dot-pulse {
  position: absolute;
  width: .55rem; 
  height: .55rem;
  border-radius: 50%;
  background: rgba(16,185,129,.5);
  animation: rsStatusPulse 2s ease-in-out infinite;
}
@keyframes rsStatusPulse {
  0%, 100% {
    transform: scale(1);
    opacity: .6;
  }
  50% {
    transform: scale(2.4);
    opacity: 0;
  }
}

/* Header Title */
.rs-header-title {
  font-size: .875rem;
  font-weight: 700;
  color: var(--c-fg);
  letter-spacing: .02em;
}

/* Header Badge */
.rs-header-badge {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  padding: .25rem .65rem;
  border-radius: 999px;
  font-size: .7rem;
  font-weight: 600;
  transition: all var(--t-fast);
}
.rs-header-badge--video { 
  background: linear-gradient(135deg, rgba(108,92,231,.2), rgba(108,92,231,.1)); 
  color: var(--c-accent);
  border: 1px solid rgba(108,92,231,.25);
}
.rs-header-badge--image { 
  background: linear-gradient(135deg, rgba(236,72,153,.2), rgba(236,72,153,.1)); 
  color: var(--c-accent-3);
  border: 1px solid rgba(236,72,153,.25);
}
.rs-header-badge--live  { 
  background: linear-gradient(135deg, rgba(239,68,68,.2), rgba(239,68,68,.1)); 
  color: var(--c-danger);
  border: 1px solid rgba(239,68,68,.25);
}
.rs-header-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0,0,0,.1);
}

/* Header Hint */
.rs-header-hint {
  display: flex;
  align-items: center;
  gap: .4rem;
  padding: .35rem .75rem;
  background: rgba(108,92,231,.06);
  border-radius: 999px;
  border: 1px solid rgba(108,92,231,.1);
  transition: all var(--t-fast);
}
.rs-header-hint:hover {
  background: rgba(108,92,231,.1);
  border-color: rgba(108,92,231,.18);
}
.rs-header-hint-icon {
  font-size: .65rem;
  color: var(--c-accent);
}
.rs-header-hint-text {
  font-size: .6875rem;
  color: var(--c-fg-3);
  display: flex;
  align-items: center;
  gap: .25rem;
}

/* ═══════════════════════════════════════════════════════════════
   TITLE ROW
   ═══════════════════════════════════════════════════════════════ */
.rs-title-row { margin-bottom: 1.25rem; }
.rs-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.45;
  color: var(--c-fg);
  word-break: break-word;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN GRID — responsive: stack → side-by-side
   ═══════════════════════════════════════════════════════════════ */
.rs-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap);
  align-items: start;
}

/* Tablet: still stacked but wider inner columns for small cards */
@media (min-width: 768px) {
  .rs-main { gap: 1.75rem; }
}

/* Desktop: side-by-side */
@media (min-width: 1040px) {
  .rs-main {
    grid-template-columns: 1fr var(--sidebar-w);
  }
}
@media (min-width: 1300px) {
  .rs-main {
    grid-template-columns: 1fr var(--sidebar-w-xl);
  }
}

/* ═══════════════════════════════════════════════════════════════
   MEDIA COLUMN
   ═══════════════════════════════════════════════════════════════ */
.rs-media-col {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

/* ═══════════════════════════════════════════════════════════════
   INFO COLUMN — sticky on desktop
   ═══════════════════════════════════════════════════════════════ */
.rs-info-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media (min-width: 1040px) {
  .rs-info-col {
    position: sticky;
    top: 1rem;
  }
}

/* ═══════════════════════════════════════════════════════════════
   CARD base
   ═══════════════════════════════════════════════════════════════ */
.rs-card {
  background: var(--c-bg-elevated);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  box-shadow: var(--sh-md);
  overflow: hidden;
  transition: all var(--t-base);
  position: relative;
}
.rs-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(108,92,231,.4) 20%, 
    rgba(168,85,247,.3) 50%, 
    rgba(236,72,153,.3) 80%, 
    transparent 100%
  );
  opacity: 0;
  transition: opacity var(--t-base);
}
.rs-card:hover { 
  box-shadow: var(--sh-xl); 
  transform: translateY(-2px);
}
.rs-card:hover::before {
  opacity: 1;
}

/* 视频主体卡片：常驻渐变描边 + 柔光，突出当前播放内容 */
.rs-card--video {
  background:
    linear-gradient(var(--c-bg-elevated), var(--c-bg-elevated)) padding-box,
    linear-gradient(135deg, var(--c-accent), var(--c-accent-2), var(--c-accent-3)) border-box;
  border: 1.5px solid transparent;
}
.rs-card--video::before { opacity: 0; }
.rs-card--video:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 50px -22px rgba(108, 92, 231, 0.5);
}
/* 选集卡片入场动画 */
.rs-card--playlist { animation: rsFadeIn 0.35s ease; }

.rs-card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  padding: .875rem 1.125rem;
  background: var(--c-bg-2);
  border-bottom: 1px solid var(--c-border);
  font-size: .8125rem;
  font-weight: 600;
  color: var(--c-fg-2);
}
.rs-card-hd-left {
  display: flex;
  align-items: center;
  gap: .5rem;
}
.rs-card-icon {
  font-size: .875rem;
  color: var(--c-accent);
}
.rs-card-icon--live { color: var(--c-danger); }

.rs-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  justify-content: center;
  padding: .875rem 1.125rem;
  border-top: 1px solid var(--c-border-2);
}

/* ═══════════════════════════════════════════════════════════════
   TAGS (quality / count)
   ═══════════════════════════════════════════════════════════════ */
.rs-quality-tag {
  font-size: .6875rem;
  padding: .15rem .55rem;
  border-radius: 999px;
  background: rgba(108,92,231,.08);
  color: var(--c-accent);
  font-weight: 600;
}
.rs-count-tag {
  font-size: .6875rem;
  padding: .15rem .55rem;
  border-radius: 999px;
  background: rgba(236,72,153,.08);
  color: var(--c-accent-3);
  font-weight: 600;
}
.rs-count-tag--live {
  background: rgba(239,68,68,.08);
  color: var(--c-danger);
}

/* ═══════════════════════════════════════════════════════════════
   VIDEO
   ═══════════════════════════════════════════════════════════════ */
.rs-video-stage {
  background: #0a0a14;
  position: relative;
}
/* B 站多 P 解析中遮罩 */
.rs-stage-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  background: rgba(10, 10, 20, 0.62);
  backdrop-filter: blur(2px);
}
.rs-stage-spinner {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: var(--color-primary, #6366f1);
  animation: rs-spin 0.8s linear infinite;
}
@keyframes rs-spin {
  to { transform: rotate(360deg); }
}
.rs-playlist {
  padding: 1rem 1.125rem;
}
.rs-video {
  display: block;
  width: 100%;
  max-height: 520px;
  object-fit: contain;
  background: #000;
}
@media (max-width: 640px) {
  .rs-video { max-height: 260px; }
}
@media (min-width: 641px) and (max-width: 1039px) {
  .rs-video { max-height: 400px; }
}

/* ═══════════════════════════════════════════════════════════════
   GALLERY — adaptive grid
   ═══════════════════════════════════════════════════════════════ */
.rs-gallery {
  display: grid;
  gap: .625rem;
  padding: 1rem 1.125rem;
}
/* 1 张 */
.rs-gallery--1 { grid-template-columns: 1fr; }
/* 2 张 */
.rs-gallery--2 { grid-template-columns: 1fr 1fr; }
/* 3~6 张: 3 columns desktop, 2 on mobile/tablet */
.rs-gallery--3 { grid-template-columns: repeat(3, 1fr); }
/* >6 张: 4 columns desktop, 3 tablet, 2 mobile */
.rs-gallery--4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 767px) {
  .rs-gallery--3 { grid-template-columns: repeat(2, 1fr); }
  .rs-gallery--4 { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 768px) and (max-width: 1039px) {
  .rs-gallery--4 { grid-template-columns: repeat(3, 1fr); }
}

.rs-gallery-item {
  position: relative;
  border-radius: var(--r-md);
  overflow: hidden;
  aspect-ratio: 4/3;
  cursor: pointer;
  border: none;
  padding: 0;
  background: var(--c-bg-3);
  transition: transform var(--t-base), box-shadow var(--t-base);
}
.rs-gallery-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--sh-xl);
}
.rs-gallery-item:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}
.rs-gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--t-slow);
}
.rs-gallery-item:hover .rs-gallery-img {
  transform: scale(1.07);
}
.rs-gallery-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0);
  color: #fff;
  font-size: 1.25rem;
  opacity: 0;
  transition: all var(--t-base);
}
.rs-gallery-item:hover .rs-gallery-mask {
  background: rgba(0,0,0,.35);
  opacity: 1;
}

/* ═══════════════════════════════════════════════════════════════
   LIVE PHOTOS - CAROUSEL MODE
   ═══════════════════════════════════════════════════════════════ */
.rs-live-dot {
  display: inline-block;
  width: .45rem; height: .45rem;
  border-radius: 50%;
  background: var(--c-danger);
  animation: rsPulse 1.8s ease infinite;
}

/* Carousel Container */
.rs-live-carousel {
  background: #0a0a14;
}

/* Header Bar */
.rs-live-carousel-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .625rem .875rem;
  background: rgba(0,0,0,.3);
}

/* Live Badge */
.rs-live-badge {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .25rem .65rem;
  background: linear-gradient(135deg, rgba(108,92,231,.9), rgba(168,85,247,.9));
  border-radius: 999px;
  font-size: .7rem;
  font-weight: 600;
  color: #fff;
}

/* Toggle Buttons */
.rs-live-toggle {
  display: flex;
  gap: .3rem;
  background: rgba(255,255,255,.08);
  border-radius: .45rem;
  padding: .15rem;
}
.rs-live-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: .25rem;
  padding: .25rem .55rem;
  border: none;
  background: transparent;
  border-radius: .35rem;
  color: rgba(255,255,255,.6);
  font-size: .65rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--t-fast);
  font-family: inherit;
}
.rs-live-toggle-btn:hover { color: rgba(255,255,255,.9); }
.rs-live-toggle-btn--on {
  background: rgba(255,255,255,.15);
  color: #fff;
}
.rs-live-toggle-btn:disabled { opacity: .4; cursor: not-allowed; }

/* Carousel Body */
.rs-live-carousel-body {
  position: relative;
  aspect-ratio: 16/9;
}

/* Navigation Arrows */
.rs-live-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 2.5rem; height: 2.5rem;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.2);
  background: rgba(0,0,0,.4);
  color: #fff;
  font-size: .9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--t-fast);
}
.rs-live-nav:hover:not(:disabled) {
  background: rgba(255,255,255,.15);
  border-color: rgba(255,255,255,.3);
}
.rs-live-nav--prev { left: .5rem; }
.rs-live-nav--next { right: .5rem; }
.rs-live-nav:disabled {
  opacity: .2;
  cursor: not-allowed;
}

/* Content Area */
.rs-live-carousel-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rs-live-carousel-video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.rs-live-carousel-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

/* Item Actions */
.rs-live-carousel-actions {
  display: flex;
  justify-content: center;
  gap: .5rem;
  padding: .5rem .875rem;
  background: rgba(0,0,0,.2);
  border-top: 1px solid rgba(255,255,255,.05);
}

/* Bulk Download Bar */
.rs-live-bulk-bar {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  padding: .875rem 1.125rem;
  border-top: 1px solid var(--c-border);
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .rs-live-carousel-hd {
    padding: .5rem .625rem;
  }
  .rs-live-badge {
    font-size: .65rem;
    padding: .2rem .5rem;
  }
  .rs-live-toggle-btn {
    padding: .2rem .4rem;
    font-size: .6rem;
  }
  .rs-live-nav {
    width: 2rem; height: 2rem;
    font-size: .75rem;
  }
}

/* Old grid styles kept for compatibility */
.rs-live-bulk {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  padding: .75rem 1.125rem 0;
}

.rs-live-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: .75rem;
  padding: 1rem 1.125rem;
}
@media (min-width: 640px) {
  .rs-live-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1040px) {
  .rs-live-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1300px) {
  .rs-live-grid { grid-template-columns: repeat(3, 1fr); }
}

.rs-live-item {
  position: relative;
  border-radius: var(--r-lg);
  overflow: hidden;
  background: #000;
  transition: transform var(--t-base), box-shadow var(--t-base);
}
.rs-live-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0,0,0,.35);
}
.rs-live-num {
  position: absolute;
  top: .5rem; left: .5rem; z-index: 2;
  min-width: 1.35rem; height: 1.35rem;
  border-radius: .35rem;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: .625rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rs-live-video {
  display: block;
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: contain;
}

/* ═══════════════════════════════════════════════════════════════
   AUTHOR CARD
   ═══════════════════════════════════════════════════════════════ */
.rs-card--author {
  background: linear-gradient(135deg, 
    rgba(108,92,231,.05) 0%, 
    rgba(168,85,247,.03) 50%, 
    rgba(236,72,153,.02) 100%
  );
  border: 1px solid rgba(108,92,231,.1);
}
.rs-author-inner {
  display: flex;
  align-items: center;
  gap: .875rem;
  padding: 1.125rem 1.25rem;
}
.rs-author-avatar-wrap { 
  position: relative; 
  flex-shrink: 0; 
}
.rs-author-avatar {
  width: 3rem; 
  height: 3rem;
  border-radius: var(--r-md);
  object-fit: cover;
  box-shadow: 
    0 0 0 2px var(--c-bg-elevated), 
    0 0 0 4px rgba(108,92,231,.15),
    0 4px 12px rgba(0,0,0,.08);
  transition: transform var(--t-fast);
}
.rs-author-avatar-fb {
  width: 3rem; 
  height: 3rem;
  border-radius: var(--r-md);
  background: linear-gradient(135deg, var(--c-bg-3), var(--c-bg-2));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-fg-3);
  font-size: 1.125rem;
  box-shadow: 
    0 0 0 2px var(--c-bg-elevated), 
    0 0 0 4px rgba(108,92,231,.1),
    0 4px 12px rgba(0,0,0,.06);
}
.rs-author-inner:hover .rs-author-avatar {
  transform: scale(1.05);
}
.rs-author-detail { min-width: 0; }
.rs-author-name {
  font-size: .875rem;
  font-weight: 700;
  color: var(--c-fg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rs-author-id {
  font-size: .6875rem;
  color: var(--c-fg-3);
  margin-top: .1rem;
}
.rs-author-likes {
  display: flex;
  align-items: center;
  gap: .2rem;
  font-size: .6875rem;
  color: var(--c-accent-3);
  margin-top: .15rem;
}

/* Copyable Elements */
.rs-copyable {
  position: relative;
  cursor: pointer;
  transition: all var(--t-fast);
}
.rs-copyable:hover {
  color: var(--c-accent);
}
.rs-copy-success {
  position: absolute;
  right: -1.25rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: .55rem;
  color: var(--c-success);
}

/* Info Row Copy Style */
.rs-info-row.rs-copyable {
  padding-right: 1.5rem;
}
.rs-info-row.rs-copyable:hover {
  background: rgba(108,92,231,.04);
  border-radius: var(--r-sm);
}

/* ═══════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════ */
.rs-tabs {
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  border-bottom: 1px solid var(--c-border);
  padding: 0 .5rem;
  gap: 0;
}
.rs-tabs::-webkit-scrollbar { display: none; }
.rs-tab {
  display: flex;
  align-items: center;
  gap: .3rem;
  padding: .7rem .75rem;
  border: none;
  background: none;
  font-size: .75rem;
  font-weight: 500;
  color: var(--c-fg-3);
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all var(--t-fast);
  font-family: inherit;
}
.rs-tab:hover { color: var(--c-fg-2); }
.rs-tab--on {
  color: var(--c-accent);
  border-bottom-color: var(--c-accent);
  font-weight: 600;
}

.rs-tab-panel {
  padding: 1rem 1.125rem;
  animation: rsFadeIn .2s ease;
}

/* ═══════════════════════════════════════════════════════════════
   INFO LIST
   ═══════════════════════════════════════════════════════════════ */
.rs-info-list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}
.rs-info-row {
  display: flex;
  gap: .625rem;
  padding: .625rem .75rem;
  background: var(--c-bg-2);
  border-radius: var(--r-md);
  border: 1px solid var(--c-border-2);
  transition: border-color var(--t-fast), background var(--t-fast);
}
.rs-info-row:hover {
  border-color: rgba(108,92,231,.2);
  background: linear-gradient(135deg, rgba(108,92,231,.02) 0%, rgba(168,85,247,.02) 100%);
}
.rs-info-icon {
  width: 1.75rem; height: 1.75rem;
  border-radius: .4rem;
  background: rgba(108,92,231,.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-accent);
  font-size: .7rem;
  flex-shrink: 0;
}
.rs-info-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.rs-info-key {
  font-size: .625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--c-fg-3);
}
.rs-info-val {
  font-size: .8125rem;
  font-weight: 600;
  color: var(--c-fg);
  line-height: 1.35;
  word-break: break-all;
}

/* ═══════════════════════════════════════════════════════════════
   STATS
   ═══════════════════════════════════════════════════════════════ */
.rs-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
  gap: .5rem;
}
.rs-stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .15rem;
  padding: .75rem .4rem;
  background: var(--c-bg-2);
  border-radius: var(--r-md);
  border: 1px solid var(--c-border-2);
  transition: all var(--t-fast);
}
.rs-stat-cell:hover {
  border-color: rgba(108,92,231,.18);
  transform: translateY(-1px);
  box-shadow: var(--sh-sm);
}
.rs-stat-icon {
  font-size: .95rem;
  color: var(--c-accent);
}
.rs-stat-num {
  font-size: .95rem;
  font-weight: 700;
  color: var(--c-fg);
  font-variant-numeric: tabular-nums;
}
.rs-stat-label {
  font-size: .625rem;
  color: var(--c-fg-3);
  font-weight: 500;
}

/* ═══════════════════════════════════════════════════════════════
   BACKUP QUALITIES
   ═══════════════════════════════════════════════════════════════ */
.rs-backup-label-row {
  font-size: .6875rem;
  color: var(--c-fg-3);
  margin-bottom: .5rem;
  font-weight: 500;
}
.rs-backup-list {
  display: flex;
  flex-direction: column;
  gap: .4rem;
}
.rs-backup-item {
  display: flex;
  flex-direction: column;
  gap: .35rem;
  padding: .7rem .75rem;
  background: var(--c-bg-2);
  border: 1px solid var(--c-border-2);
  border-radius: var(--r-md);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  width: 100%;
  transition: all var(--t-fast);
}
.rs-backup-item:hover {
  border-color: rgba(108,92,231,.25);
  background: linear-gradient(135deg, rgba(108,92,231,.03) 0%, rgba(168,85,247,.03) 100%);
}
.rs-backup-item--cur {
  border-color: var(--c-accent);
  background: rgba(108,92,231,.06);
  box-shadow: 0 0 0 1px var(--c-accent);
}
.rs-backup-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.rs-backup-name {
  font-size: .8125rem;
  font-weight: 600;
  color: var(--c-fg);
}
.rs-backup-cur {
  color: var(--c-accent);
  font-size: .8rem;
}
.rs-backup-meta {
  display: flex;
  flex-wrap: wrap;
  gap: .35rem;
}
.rs-backup-meta-tag {
  display: inline-flex;
  align-items: center;
  gap: .2rem;
  font-size: .625rem;
  color: var(--c-fg-3);
  background: var(--c-bg);
  padding: .1rem .45rem;
  border-radius: .25rem;
}
.rs-backup-playing {
  font-size: .625rem;
  font-weight: 600;
  color: var(--c-accent);
  text-align: center;
}

/* empty */
.rs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .35rem;
  padding: 1.5rem 0;
  color: var(--c-fg-3);
  font-size: .8125rem;
}
.rs-empty i { font-size: 1.5rem; }

/* ═══════════════════════════════════════════════════════════════
   TAGS
   ═══════════════════════════════════════════════════════════════ */
.rs-tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}
.rs-tag {
  display: inline-flex;
  align-items: center;
  gap: .25rem;
  padding: .35rem .75rem;
  border-radius: 999px;
  font-size: .6875rem;
  font-weight: 600;
  transition: all var(--t-fast);
  position: relative;
  overflow: hidden;
}
.rs-tag::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity var(--t-fast);
}
.rs-tag--hash {
  background: linear-gradient(135deg, rgba(108,92,231,.08) 0%, rgba(168,85,247,.06) 100%);
  color: var(--c-accent);
  border: 1px solid rgba(108,92,231,.15);
  box-shadow: 0 1px 2px rgba(108,92,231,.08);
}
.rs-tag--hash::before {
  background: linear-gradient(135deg, rgba(108,92,231,.1) 0%, rgba(168,85,247,.08) 100%);
}
.rs-tag--hash:hover {
  background: linear-gradient(135deg, rgba(108,92,231,.12) 0%, rgba(168,85,247,.1) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108,92,231,.15);
}
.rs-tag--vt {
  background: linear-gradient(135deg, rgba(236,72,153,.08) 0%, rgba(244,114,182,.06) 100%);
  color: var(--c-accent-3);
  border: 1px solid rgba(236,72,153,.15);
  box-shadow: 0 1px 2px rgba(236,72,153,.08);
}
.rs-tag--vt::before {
  background: linear-gradient(135deg, rgba(236,72,153,.1) 0%, rgba(244,114,182,.08) 100%);
}
.rs-tag--vt:hover {
  background: linear-gradient(135deg, rgba(236,72,153,.12) 0%, rgba(244,114,182,.1) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(236,72,153,.15);
}

/* Tag Copy Styles */
.rs-copyable-tag {
  position: relative;
  cursor: pointer;
}
.rs-tag-copy-success {
  position: absolute;
  right: -.25rem;
  top: 50%;
  transform: translateY(-50%) translateX(100%);
  font-size: .5rem;
  color: var(--c-success);
}

/* ═══════════════════════════════════════════════════════════════
   MUSIC
   ═══════════════════════════════════════════════════════════════ */
.rs-music {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .75rem;
}
.rs-music-cover-wrap {
  position: relative;
}
.rs-music-cover {
  width: 4.5rem; height: 4.5rem;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: var(--sh-md);
  animation: rsSpin 14s linear infinite paused;
}
.rs-music:hover .rs-music-cover { animation-play-state: running; }
.rs-music-cover-fb {
  width: 4.5rem; height: 4.5rem;
  border-radius: 50%;
  background: rgba(108,92,231,.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-accent);
  font-size: 1.35rem;
}
.rs-music-disc {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 1.25rem; height: 1.25rem;
  border-radius: 50%;
  background: var(--c-bg);
  box-shadow: 0 1px 4px rgba(0,0,0,.1);
}
.rs-music-info {
  text-align: center;
}
.rs-music-title {
  font-size: .8125rem;
  font-weight: 600;
  color: var(--c-fg);
}
.rs-music-artist {
  font-size: .6875rem;
  color: var(--c-fg-3);
  margin-top: .1rem;
}
.rs-music-player {
  width: 100%;
  height: 2.25rem;
  border-radius: 999px;
}

/* ═══════════════════════════════════════════════════════════════
   BUTTONS - Modern Style
   ═══════════════════════════════════════════════════════════════ */
.rs-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  padding: .65rem 1.25rem;
  font-size: .7875rem;
  font-weight: 600;
  border-radius: var(--r-lg);
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--t-base);
  white-space: nowrap;
  line-height: 1.4;
  position: relative;
  overflow: hidden;
}
.rs-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity var(--t-base);
}
.rs-btn:hover::before { opacity: 1; }
.rs-btn:active { transform: scale(.96); }
.rs-btn--sm { 
  padding: .45rem .85rem; 
  font-size: .7rem; 
  border-radius: .55rem; 
  gap: .35rem;
}
.rs-btn--block { width: 100%; }
.rs-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
  transform: none;
}

/* Primary Button - Purple Gradient */
.rs-btn--primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  color: #fff;
  box-shadow: 
    0 4px 16px rgba(108,92,231,.35),
    0 1px 3px rgba(0,0,0,.1);
}
.rs-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 28px rgba(108,92,231,.45),
    0 2px 6px rgba(0,0,0,.12);
}

/* Accent Button - Pink Gradient */
.rs-btn--accent {
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
  color: #fff;
  box-shadow: 
    0 4px 16px rgba(168,85,247,.35),
    0 1px 3px rgba(0,0,0,.1);
}
.rs-btn--accent:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 28px rgba(168,85,247,.45),
    0 2px 6px rgba(0,0,0,.12);
}

/* Ghost Button - 跟随主题 token（浅色下为浅灰描边，深色下为暗底半透明） */
.rs-btn--ghost {
  background: var(--c-bg-3);
  color: var(--c-fg-2);
  border: 1px solid var(--c-border);
}
.rs-btn--ghost:hover {
  background: var(--c-bg-2);
  border-color: var(--c-accent);
  color: var(--c-fg);
  transform: translateY(-1px);
}

/* 深色实底区域（实况轮播操作条）内保持白色玻璃按钮 */
.rs-live-carousel-actions .rs-btn--ghost {
  background: rgba(255,255,255,.08);
  color: rgba(255,255,255,.85);
  border: 1px solid rgba(255,255,255,.15);
  backdrop-filter: blur(8px);
}
.rs-live-carousel-actions .rs-btn--ghost:hover {
  background: rgba(255,255,255,.15);
  border-color: rgba(255,255,255,.25);
  color: #fff;
  transform: translateY(-1px);
}

/* Ghost Button for Light Background */
.rs-btn--ghost-light {
  background: var(--c-bg-2);
  color: var(--c-fg-2);
  border: 1px solid var(--c-border);
}
.rs-btn--ghost-light:hover {
  background: var(--c-bg-3);
  border-color: var(--c-accent);
  color: var(--c-fg);
  transform: translateY(-1px);
}

/* Bulk Download Button */
.rs-btn--bulk {
  padding: .8rem 1.5rem;
  font-size: .825rem;
  font-weight: 700;
  border-radius: var(--r-xl);
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  color: #fff;
  box-shadow: 
    0 6px 24px rgba(108,92,231,.4),
    0 2px 8px rgba(0,0,0,.15);
}
.rs-btn--bulk:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 12px 36px rgba(108,92,231,.5),
    0 3px 10px rgba(0,0,0,.2);
}

/* ═══════════════════════════════════════════════════════════════
   IMAGE MODAL
   ═══════════════════════════════════════════════════════════════ */
.rs-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0,0,0,.96);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.rs-modal-close {
  position: absolute;
  top: 1rem; right: 1rem; z-index: 10;
  width: 2.5rem; height: 2.5rem;
  border-radius: 50%;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--t-fast);
}
.rs-modal-close:hover { background: rgba(255,255,255,.18); }

.rs-modal-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 2.75rem; height: 2.75rem;
  border-radius: 50%;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--t-fast);
}
.rs-modal-nav:hover { background: rgba(255,255,255,.2); }
.rs-modal-nav--prev { left: 1rem; }
.rs-modal-nav--next { right: 1rem; }
@media (max-width: 640px) {
  .rs-modal-nav { width: 2.25rem; height: 2.25rem; font-size: .8rem; }
  .rs-modal-nav--prev { left: .4rem; }
  .rs-modal-nav--next { right: .4rem; }
}

.rs-modal-body {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 90vw;
  max-height: 85vh;
  padding: 2rem;
}
.rs-modal-img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: .5rem;
  box-shadow: 0 24px 64px rgba(0,0,0,.5);
}

.rs-modal-pager {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: .4rem;
}
.rs-modal-dot {
  width: .4rem; height: .4rem;
  border-radius: 50%;
  background: rgba(255,255,255,.3);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all var(--t-fast);
}
.rs-modal-dot:hover { background: rgba(255,255,255,.55); }
.rs-modal-dot--on {
  background: #fff;
  width: 1.25rem;
  border-radius: 999px;
}
.rs-modal-num {
  position: absolute;
  bottom: 1.25rem;
  right: 1.25rem;
  color: rgba(255,255,255,.55);
  font-size: .75rem;
  font-variant-numeric: tabular-nums;
}

/* transition */
.rs-modal-enter-active { transition: opacity .25s ease; }
.rs-modal-leave-active { transition: opacity .18s ease; }
.rs-modal-enter-from,
.rs-modal-leave-to { opacity: 0; }

/* ═══════════════════════════════════════════════════════════════
   KEYFRAMES
   ═══════════════════════════════════════════════════════════════ */
@keyframes rsFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rsPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: .45; transform: scale(.75); }
}
@keyframes rsSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .rs-tab-panel { animation: none; }
  .rs-music-cover { animation: none !important; }
  .rs-live-dot { animation: none; }
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE FINE-TUNING
   ═══════════════════════════════════════════════════════════════ */
@media (max-width: 480px) {
  .rs {
    padding: 0 .5rem;
    margin-bottom: 2.5rem;
    --gap: 1rem;
  }
  .rs-title { font-size: 1rem; }
  .rs-header {
    border-radius: var(--r-md);
    padding: .5rem .75rem;
  }
  .rs-card { border-radius: var(--r-lg); }
  .rs-card-hd { padding: .65rem .875rem; }
  .rs-card-actions { padding: .65rem .875rem; }
  .rs-video { max-height: 220px; }
  .rs-stat-grid { grid-template-columns: repeat(3, 1fr); }
  .rs-live-grid { grid-template-columns: 1fr; }
}

@media (min-width: 481px) and (max-width: 767px) {
  .rs-live-grid { grid-template-columns: repeat(2, 1fr); }
  .rs-video { max-height: 320px; }
}

/* ═══════════════════════════════════════════════════════════════
   COPY TOAST
   ═══════════════════════════════════════════════════════════════ */
.rs-copy-toast {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .75rem 1rem;
  background: var(--c-bg-elevated);
  border-radius: var(--r-lg);
  box-shadow: var(--sh-lg);
  border: 1px solid var(--c-border);
  z-index: 9999;
  min-width: 180px;
}
.rs-copy-toast-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981, #34d399);
  border-radius: 50%;
  flex-shrink: 0;
}
.rs-copy-toast-icon i {
  color: white;
  font-size: .75rem;
}
.rs-copy-toast-content {
  display: flex;
  flex-direction: column;
  gap: .125rem;
}
.rs-copy-toast-title {
  font-size: .75rem;
  font-weight: 600;
  color: var(--c-fg);
}
.rs-copy-toast-text {
  font-size: .65rem;
  color: var(--c-fg-3);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Toast Animation */
.rs-toast-enter-active {
  animation: toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.rs-toast-leave-active {
  animation: toast-out 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%) translateY(20%);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%) translateY(20%);
  }
}

/* Dark Mode：复制 Toast 随 .rs 内 token 自动翻转，无需单独覆盖 */
</style>