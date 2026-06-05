<script setup>
import { computed } from 'vue'

const props = defineProps({
  inputUrl: String,
  isLoading: Boolean,
  isError: Boolean,
  locale: String,
  currentPlatform: String
})

const emit = defineEmits(['update:inputUrl', 'parse', 'select-platform'])

const content = {
  'zh-CN': {
    badge: 'BK-SV v3.0 · 多平台解析',
    title1: '轻松解析',
    title2: '任何',
    title3: '短视频',
    desc: 'v3.0 全新升级！支持抖音、快手、B 站、小红书等平台，一键提取无水印视频与图集，简单免费。',
    feature1: '无水印',
    feature2: '高速解析',
    feature3: '完全免费',
    inputLabel: '视频链接',
    placeholder: '粘贴分享链接或含链接的文本…',
    button: '开始解析',
    loading: '正在解析…',
    error: '解析失败',
    features: [
      { icon: 'fa-check-circle', color: 'text-emerald-500', label: '无水印' },
      { icon: 'fa-bolt', color: 'text-amber-500', label: '高速解析' },
      { icon: 'fa-gift', color: 'text-indigo-500', label: '完全免费' }
    ]
  },
  'en': {
    badge: 'BK-SV v3.0 · Multi-Platform',
    title1: 'Parse ',
    title2: 'Any',
    title3: ' Short Video',
    desc: 'v3.0 Upgrade! Support Douyin, Kuaishou, Bilibili, Xiaohongshu and more. Extract videos & albums without watermark, simple and free.',
    feature1: 'No Watermark',
    feature2: 'Fast Parse',
    feature3: 'Free',
    inputLabel: 'Video URL',
    placeholder: 'Paste a share link or text containing a link…',
    button: 'Start Parsing',
    loading: 'Parsing…',
    error: 'Failed',
    features: [
      { icon: 'fa-check-circle', color: 'text-emerald-500', label: 'No Watermark' },
      { icon: 'fa-bolt', color: 'text-amber-500', label: 'Fast Parse' },
      { icon: 'fa-gift', color: 'text-indigo-500', label: 'Free' }
    ]
  }
}

const getContent = (locale) => content[locale] || content['zh-CN']

const buttonClass = computed(() => {
  if (this?.isLoading) return 'opacity-70 cursor-not-allowed'
  return ''
})

const platformTabs = {
  'zh-CN': [
    { key: 'all', label: '所有', icon: 'fa-globe' },
    { key: 'douyin', label: '抖音', icon: 'fa-music' },
    { key: 'kuaishou', label: '快手', icon: 'fa-bolt' },
    { key: 'bilibili', label: 'B站', icon: 'fa-play-circle' },
    { key: 'xhs', label: '小红书', icon: 'fa-bookmark' }
  ],
  'en': [
    { key: 'all', label: 'All', icon: 'fa-globe' },
    { key: 'douyin', label: 'Douyin', icon: 'fa-music' },
    { key: 'kuaishou', label: 'Kuaishou', icon: 'fa-bolt' },
    { key: 'bilibili', label: 'Bilibili', icon: 'fa-play-circle' },
    { key: 'xhs', label: 'Xiaohongshu', icon: 'fa-bookmark' }
  ]
}

const getPlatformTabs = (locale) => platformTabs[locale] || platformTabs['zh-CN']

const selectPlatform = (key) => {
  emit('select-platform', key)
}
</script>

<template>
    <section class="relative text-center py-4 sm:py-6 lg:py-8 overflow-hidden">
    <div class="absolute inset-0 -z-10">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium mb-6 sm:mb-8 ux-animate-fade-in">
        <i class="fas fa-sparkles"></i>
        <span>{{ getContent(locale).badge }}</span>
      </div>

      <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 tracking-tight ux-animate-slide-up" style="animation-delay: 100ms">
        <span class="ux-gradient-text">{{ getContent(locale).title1 }}</span>
        <span class="text-slate-700 dark:text-slate-200">{{ getContent(locale).title2 }}</span>
        <span class="ux-gradient-text">{{ getContent(locale).title3 }}</span>
      </h2>

      <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed ux-animate-slide-up" style="animation-delay: 200ms">
        {{ getContent(locale).desc }}
      </p>

      <div class="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10 sm:mb-12 ux-animate-slide-up" style="animation-delay: 300ms">
        <div
          v-for="(feature, index) in getContent(locale).features"
          :key="index"
          class="flex items-center gap-2 text-sm sm:text-base text-slate-600 dark:text-slate-300"
        >
          <i :class="['fas', feature.icon, feature.color]"></i>
          <span>{{ feature.label }}</span>
        </div>
      </div>

      <div class="max-w-xl sm:max-w-2xl mx-auto ux-animate-slide-up" style="animation-delay: 400ms">
        <div class="flex flex-wrap justify-center gap-2 mb-4">
          <button
            v-for="tab in getPlatformTabs(locale)"
            :key="tab.key"
            @click="selectPlatform(tab.key)"
            :class="[
              'px-3 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5',
              currentPlatform === tab.key
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700 border border-indigo-200 dark:border-slate-700'
            ]"
          >
            <i :class="['fas', tab.icon]"></i>
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <div class="relative group">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
          <div class="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden transition-all duration-300 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10">
            <input
              :value="inputUrl"
              @input="emit('update:inputUrl', $event.target.value)"
              @keyup.enter="emit('parse')"
              type="text"
              :placeholder="getContent(locale).placeholder"
              class="flex-1 px-4 sm:px-6 py-4 sm:py-5 bg-transparent text-slate-800 dark:text-slate-100 text-sm sm:text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
              :disabled="isLoading"
            />
            <button
              @click="emit('parse')"
              :disabled="isLoading"
              class="m-1 sm:m-1.5 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 whitespace-nowrap enterprise-btn"
              :class="isLoading
                ? 'bg-slate-400 dark:bg-slate-500 cursor-not-allowed opacity-60'
                : isError
                  ? 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800 text-white shadow-lg shadow-rose-500/20 dark:shadow-rose-900/30 border border-rose-500/30 dark:border-rose-600/30 error-state-btn'
                  : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 dark:shadow-indigo-900/40 border border-indigo-500/40 dark:border-indigo-500/30 parse-state-btn'"
            >
              <i :class="['fas text-xs sm:text-sm transition-transform duration-300', isLoading ? 'fa-spinner fa-spin' : isError ? 'fa-exclamation-circle' : 'fa-bolt']"></i>
              <span class="hidden sm:inline text-sm">{{ isLoading ? getContent(locale).loading : isError ? getContent(locale).error : getContent(locale).button }}</span>
              <span class="sm:hidden text-sm">{{ isLoading ? '...' : isError ? '!' : '>' }}</span>
            </button>
          </div>
        </div>

        <p class="text-xs text-slate-400 dark:text-slate-500 mt-3 px-2">
          <i class="fas fa-info-circle mr-1"></i>
          {{ locale === 'zh-CN' ? '支持抖音、快手、B站、小红书等平台' : 'Support Douyin, Kuaishou, Bilibili, Xiaohongshu & more' }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-stops));
}

.ux-gradient-text {
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ux-animate-fade-in {
  animation: uxFadeIn 0.5s ease forwards;
  opacity: 0;
}

.ux-animate-slide-up {
  animation: uxSlideUp 0.6s ease forwards;
  opacity: 0;
}

@keyframes uxFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes uxSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ux-animate-fade-in,
  .ux-animate-slide-up {
    animation: none;
    opacity: 1;
  }
}

.enterprise-btn {
  position: relative;
  overflow: hidden;
  font-family: inherit;
  letter-spacing: 0.02em;
}

.enterprise-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0) 50%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.enterprise-btn:hover::before {
  opacity: 1;
}

.parse-state-btn {
  background: linear-gradient(
    180deg,
    #6366f1 0%,
    #4f46e5 50%,
    #4338ca 100%
  );
}

.parse-state-btn:hover {
  background: linear-gradient(
    180deg,
    #818cf8 0%,
    #6366f1 50%,
    #4f46e5 100%
  );
  transform: translateY(-2px);
  box-shadow:
    0 8px 20px rgba(99, 102, 241, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.parse-state-btn:active {
  transform: translateY(0);
  background: linear-gradient(
    180deg,
    #4f46e5 0%,
    #4338ca 50%,
    #3730a3 100%
  );
  transition-duration: 0.1s;
}

.parse-state-btn .fa-bolt {
  animation: subtlePulse 2s ease-in-out infinite;
}

@keyframes subtlePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(0.95); }
}

.error-state-btn {
  background: linear-gradient(
    180deg,
    #f43f5e 0%,
    #e11d48 50%,
    #be123c 100%
  );
}

.error-state-btn:hover {
  background: linear-gradient(
    180deg,
    #fb7185 0%,
    #f43f5e 50%,
    #e11d48 100%
  );
  transform: translateY(-2px);
  box-shadow:
    0 8px 20px rgba(244, 63, 94, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.error-state-btn:active {
  transform: translateY(0);
  background: linear-gradient(
    180deg,
    #e11d48 0%,
    #be123c 50%,
    #9f1239 100%
  );
  transition-duration: 0.1s;
}

@media (max-width: 480px) {
  .enterprise-btn {
    padding-left: 0.875rem;
    padding-right: 0.875rem;
  }
}
</style>