<script setup>
import { useVideoStore } from '../stores/video'

const videoStore = useVideoStore()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="videoStore.showProgress" 
           class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
          <div class="text-4xl mb-4">
            <i class="fas fa-spinner fa-spin text-indigo-500"></i>
          </div>
          <h3 class="text-xl font-semibold mb-2">{{ videoStore.progressText || '下载进度' }}</h3>
          <div class="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 mb-4">
            <div 
              class="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
              :style="{ width: videoStore.progressPercent + '%' }"
            ></div>
          </div>
          <p class="text-sm text-gray-500 mb-4">{{ videoStore.progressStatus }}</p>
          <button 
            v-if="videoStore.progressStatus"
            @click="videoStore.hideProgress"
            class="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            取消下载
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
