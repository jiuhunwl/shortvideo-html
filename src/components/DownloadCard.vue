<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  downloads: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['cancel', 'retry', 'clear-completed'])

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatSpeed = (bytesPerSecond) => {
  if (!bytesPerSecond || bytesPerSecond === 0) return ''
  return formatBytes(bytesPerSecond) + '/s'
}

const getStatusColor = (status) => {
  switch (status) {
    case 'downloading': return 'text-blue-500'
    case 'completed': return 'text-green-500'
    case 'failed': return 'text-red-500'
    case 'cancelled': return 'text-gray-500'
    default: return 'text-slate-500'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'downloading': return 'fa-spinner fa-spin'
    case 'completed': return 'fa-check-circle'
    case 'failed': return 'fa-exclamation-circle'
    case 'cancelled': return 'fa-times-circle'
    default: return 'fa-hourglass-half'
  }
}

const getProgressColor = (status) => {
  switch (status) {
    case 'downloading': return 'bg-blue-500'
    case 'completed': return 'bg-green-500'
    case 'failed': return 'bg-red-500'
    case 'cancelled': return 'bg-gray-400'
    default: return 'bg-slate-400'
  }
}

const visibleDownloads = computed(() => {
  return props.downloads.filter(d => d.status !== 'completed' || d.show)
})

const hasActiveDownloads = computed(() => {
  return props.downloads.some(d => d.status === 'downloading')
})

const allCompleted = computed(() => {
  return props.downloads.length > 0 && props.downloads.every(d => d.status === 'completed' || d.status === 'cancelled' || d.status === 'failed')
})
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
    <TransitionGroup name="slide-up">
      <div
        v-for="item in visibleDownloads"
        :key="item.id"
        class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 mb-3 overflow-hidden"
      >
        <div class="p-4">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1 min-w-0 mr-3">
              <div class="font-medium text-slate-800 dark:text-slate-200 truncate text-sm">
                {{ item.filename || '下载文件' }}
              </div>
              <div class="flex items-center gap-2 mt-1">
                <i :class="['fas', getStatusIcon(item.status), getStatusColor(item.status)]"></i>
                <span class="text-xs" :class="getStatusColor(item.status)">
                  {{ item.statusText || (item.status === 'downloading' ? '下载中...' : item.status) }}
                </span>
                <span v-if="item.speed && item.status === 'downloading'" class="text-xs text-slate-400">
                  {{ formatSpeed(item.speed) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                v-if="item.status === 'failed'"
                @click="emit('retry', item.id)"
                class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-500 transition-colors"
                title="重试"
              >
                <i class="fas fa-redo text-sm"></i>
              </button>

              <button
                v-if="item.status === 'downloading' || item.status === 'preparing'"
                @click="emit('cancel', item.id)"
                class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-red-500 transition-colors"
                title="取消"
              >
                <i class="fas fa-times text-sm"></i>
              </button>

              <button
                v-if="item.status === 'completed' || item.status === 'cancelled' || item.status === 'failed'"
                @click="emit('clear-completed', item.id)"
                class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                title="清除"
              >
                <i class="fas fa-times text-sm"></i>
              </button>
            </div>
          </div>

          <div v-if="item.status === 'downloading'" class="mb-2">
            <div class="flex justify-between text-xs text-slate-500 mb-1">
              <span>{{ formatBytes(item.loaded || 0) }} / {{ formatBytes(item.total || 0) }}</span>
              <span>{{ item.percent || 0 }}%</span>
            </div>
            <div class="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-300 rounded-full"
                :class="getProgressColor(item.status)"
                :style="{ width: (item.percent || 0) + '%' }"
              ></div>
            </div>
          </div>

          <div v-if="item.status === 'completed'" class="mb-2">
            <div class="h-2 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
              <div
                class="h-full bg-green-500 rounded-full"
                style="width: 100%"
              ></div>
            </div>
          </div>

          <div v-if="item.status === 'failed' && item.error" class="text-xs text-red-500 mt-1">
            {{ item.error }}
          </div>
        </div>
      </div>
    </TransitionGroup>

    <div
      v-if="visibleDownloads.length > 0"
      class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 px-4 py-2 flex items-center justify-between"
    >
      <div class="text-sm text-slate-600 dark:text-slate-400">
        <span v-if="hasActiveDownloads">
          <i class="fas fa-cloud-download-alt mr-1"></i>
          {{ visibleDownloads.filter(d => d.status === 'downloading').length }} 个下载中
        </span>
        <span v-else-if="allCompleted">
          <i class="fas fa-check-circle text-green-500 mr-1"></i>
          全部完成
        </span>
        <span v-else>
          {{ visibleDownloads.length }} 个任务
        </span>
      </div>

      <button
        v-if="allCompleted"
        @click="emit('clear-completed', 'all')"
        class="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      >
        清除全部
      </button>
    </div>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
