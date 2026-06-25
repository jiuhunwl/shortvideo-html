<script setup>
import { useVideoStore } from '../stores/video'

const videoStore = useVideoStore()

const getIcon = (type) => {
  switch (type) {
    case 'error': return 'fa-exclamation-circle text-red-500'
    case 'warning': return 'fa-exclamation-triangle text-amber-500'
    case 'info': return 'fa-info-circle text-blue-500'
    default: return 'fa-check-circle text-green-500'
  }
}

const getToastClass = (type) => {
  switch (type) {
    case 'error': return 'border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-100'
    case 'warning': return 'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100'
    case 'info': return 'border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100'
    default: return 'border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100'
  }
}
</script>

<template>
  <div class="fixed top-20 right-4 left-4 sm:left-auto z-[100] space-y-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in videoStore.toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto ml-auto px-4 py-3 rounded-xl shadow-xl flex items-start gap-3 w-full sm:w-[360px] max-w-full border',
          getToastClass(toast.type)
        ]"
        role="status"
        aria-live="polite"
      >
        <i :class="['fas mt-0.5 shrink-0', getIcon(toast.type)]"></i>
        <span class="text-sm leading-5 min-w-0 flex-1 break-words">{{ toast.message }}</span>
        <button
          type="button"
          class="shrink-0 text-current/50 hover:text-current transition-colors"
          aria-label="关闭提示"
          @click="videoStore.removeToast(toast.id)"
        >
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
</style>
