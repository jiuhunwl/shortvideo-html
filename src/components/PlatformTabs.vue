<script setup>
defineProps({
  currentPlatform: String,
  locale: String
})

const emit = defineEmits(['select'])

const platforms = {
  'zh-CN': [
    { key: 'all', label: '所有平台', icon: 'fa-globe' },
    { key: 'douyin', label: '抖音', icon: 'fa-music' },
    { key: 'kuaishou', label: '快手', icon: 'fa-bolt' },
    { key: 'bilibili', label: 'B站', icon: 'fa-play-circle', iconColor: '#FB7299' },
    { key: 'xhs', label: '小红书', icon: 'fa-bookmark', iconColor: '#FE2C55' },
    { key: 'toutiao', label: '今日头条', icon: 'fa-newspaper', iconColor: '#FE2C55' }
  ],
  'en': [
    { key: 'all', label: 'All', icon: 'fa-globe' },
    { key: 'douyin', label: 'Douyin', icon: 'fa-music' },
    { key: 'kuaishou', label: 'Kuaishou', icon: 'fa-bolt' },
    { key: 'bilibili', label: 'Bilibili', icon: 'fa-play-circle', iconColor: '#FB7299' },
    { key: 'xhs', label: 'Xiaohongshu', icon: 'fa-bookmark', iconColor: '#FE2C55' },
    { key: 'toutiao', label: 'Toutiao', icon: 'fa-newspaper', iconColor: '#FE2C55' }
  ]
}

const getPlatforms = (locale) => platforms[locale] || platforms['zh-CN']
</script>

<template>
  <section class="mb-12">
    <div class="flex flex-wrap justify-center gap-2">
      <button
        v-for="tab in getPlatforms(locale)"
        :key="tab.key"
        @click="emit('select', tab.key)"
        :class="[
          'px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2',
          currentPlatform === tab.key
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
            : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
        ]"
      >
        <i :class="['fas', tab.icon]" :style="tab.iconColor ? { color: tab.iconColor } : {}"></i>
        <span>{{ tab.label }}</span>
      </button>
    </div>
  </section>
</template>
