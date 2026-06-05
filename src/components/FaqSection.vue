<script setup>
import { ref } from 'vue'

defineProps({
  locale: String
})

const content = {
  'zh-CN': {
    badge: '帮助',
    title: '常见问题',
    faqs: [
      { q: '为什么有些视频无法解析？', a: '部分平台会更新防护策略，可能导致暂时失败，我们会持续维护。受版权限制的内容也可能无法解析。' },
      { q: '下载的视频仍有水印怎么办？', a: '若仍有水印，可能是平台策略变化导致去水印逻辑需更新，欢迎反馈以便我们尽快处理。' },
      { q: '解析和下载是否收费？', a: '本站服务免费。请警惕声称「高级解析」的收费陷阱。' }
    ]
  },
  'en': {
    badge: 'Help',
    title: 'FAQ',
    faqs: [
      { q: 'Why can\'t some videos be parsed?', a: 'Some platforms update their protection mechanisms, causing temporary failures. We maintain continuously. Copyrighted content may also not be parseable.' },
      { q: 'What if the downloaded video still has a watermark?', a: 'If a watermark remains, the platform may have changed its strategy. Please report it so we can update the logic.' },
      { q: 'Is parsing and downloading free?', a: 'Our service is completely free. Beware of paid "premium parsing" scams.' }
    ]
  }
}

const getContent = (locale) => content[locale] || content['zh-CN']

const openIndex = ref(null)

const toggle = (idx) => {
  openIndex.value = openIndex.value === idx ? null : idx
}
</script>

<template>
  <section id="faq" class="mb-16 scroll-mt-16 sm:scroll-mt-18">
    <div class="text-center mb-10">
      <span class="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm mb-4">
        {{ getContent(locale).badge }}
      </span>
      <h3 class="text-3xl font-bold">{{ getContent(locale).title }}</h3>
    </div>

    <div class="max-w-3xl mx-auto space-y-4">
      <div v-for="(faq, idx) in getContent(locale).faqs" :key="idx"
           class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <button 
          @click="toggle(idx)"
          class="w-full px-6 py-4 text-left font-medium flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <span>{{ faq.q }}</span>
          <i :class="['fas', openIndex === idx ? 'fa-chevron-up' : 'fa-chevron-down', 'text-gray-400']"></i>
        </button>
        <div v-if="openIndex === idx" class="px-6 pb-4 text-gray-600 dark:text-gray-400 text-sm">
          {{ faq.a }}
        </div>
      </div>
    </div>
  </section>
</template>
