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
</script>

<template>
  <div class="fixed top-20 right-4 z-[100] space-y-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in videoStore.toasts"
        :key="toast.id"
        class="bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 min-w-[200px]"
      >
        <i :class="['fas', getIcon(toast.type)]"></i>
        <span class="text-sm">{{ toast.message }}</span>
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
