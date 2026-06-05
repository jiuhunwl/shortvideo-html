<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  isDark: Boolean,
  locale: String,
  t: Function
})

const emit = defineEmits(['toggle-theme', 'set-locale'])

const isMobileMenuOpen = ref(false)
const scrollProgress = ref(0)

const updateScrollProgress = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0
}

onMounted(() => {
  window.addEventListener('scroll', updateScrollProgress, { passive: true })
  updateScrollProgress()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollProgress)
})

const navLinks = [
  { href: '/', labelKey: 'nav.home' },
  { href: '#Supported_Platforms', labelKey: 'nav.platforms' },
  { href: '#course', labelKey: 'nav.course' },
  { href: '#faq', labelKey: 'nav.faq' },
  { href: '#ours', labelKey: 'nav.about' }
]

const labels = {
  'zh-CN': { brand: '短视频解析', subtitle: '无水印 · 免费', home: '首页', course: '解析教程', platforms: '支持平台', faq: '常见问题', about: '关于我们', menu: '菜单', close: '关闭' },
  'en': { brand: 'Video Parser', subtitle: 'No Watermark · Free', home: 'Home', course: 'Tutorial', platforms: 'Platforms', faq: 'FAQ', about: 'About', menu: 'Menu', close: 'Close' }
}

const getLabel = (locale, key) => labels[locale]?.[key] || labels['zh-CN'][key]

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleNavClick = (href) => {
  closeMobileMenu()
  if (href === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else if (href && href.startsWith('#')) {
    setTimeout(() => {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    closeMobileMenu()
  }
}
</script>

<template>
  <header
    class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50 transition-all duration-300"
    role="banner"
  >
    <div class="absolute top-0 left-0 right-0 h-0.5 bg-slate-200/30 dark:bg-slate-700/30 overflow-hidden">
      <div
        class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-150 ease-out"
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 sm:h-18">
        <a
          href="/"
          class="flex items-center gap-3 group ux-focus"
          aria-label="BK-SV 短视频解析"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
            <img src="https://static.esa.ifphp.com/img/bugpk-Api-256×256.ico" alt="Logo" class="w-8 h-8 object-contain" />
          </div>
          <div class="hidden xs:block">
            <h1 class="font-bold text-lg text-slate-800 dark:text-white tracking-tight">
              {{ getLabel(locale, 'brand') }}
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ getLabel(locale, 'subtitle') }}
            </p>
          </div>
        </a>

        <nav class="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200 ux-focus"
          >
            {{ getLabel(locale, link.labelKey.split('.')[1]) }}
          </a>
        </nav>

        <div class="flex items-center gap-2 sm:gap-3">
          <div class="relative">
            <select
              :value="locale"
              @change="emit('set-locale', $event.target.value)"
              class="appearance-none text-sm pl-3 pr-8 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-0 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label="Select language"
            >
              <option value="zh-CN">中文</option>
              <option value="en">EN</option>
            </select>
            <i class="fas fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none"></i>
          </div>

          <button
            @click="emit('toggle-theme')"
            class="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 ux-focus"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <i :class="['fas text-sm transition-transform duration-300', isDark ? 'fa-sun' : 'fa-moon']"></i>
          </button>

          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 ux-focus"
            :aria-expanded="isMobileMenuOpen"
            aria-controls="mobile-menu"
            :aria-label="getLabel(locale, isMobileMenuOpen ? 'close' : 'menu')"
          >
            <i :class="['fas text-sm transition-transform duration-300', isMobileMenuOpen ? 'fa-times' : 'fa-bars']"></i>
          </button>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMobileMenuOpen"
        id="mobile-menu"
        class="md:hidden border-t border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
        @keydown="handleKeydown"
      >
        <nav class="px-4 py-3 space-y-1" role="navigation" aria-label="Mobile navigation">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            @click.prevent="handleNavClick(link.href)"
            class="block px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 ux-focus"
          >
            {{ getLabel(locale, link.labelKey.split('.')[1]) }}
          </a>
        </nav>
      </div>
    </Transition>
  </header>
</template>