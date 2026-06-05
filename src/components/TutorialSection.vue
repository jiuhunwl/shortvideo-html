<script setup>
defineProps({
  locale: String
})

const content = {
  'zh-CN': {
    badge: '三步搞定',
    title: '使用教程',
    steps: [
      { title: '复制视频链接', body: '在抖音、快手等平台打开作品，通过分享复制链接。', icon: 'fa-copy' },
      { title: '粘贴并解析', body: '回到本页，将链接粘贴到输入框，可选对应平台接口。', icon: 'fa-paste' },
      { title: '下载保存', body: '点击「开始解析」，完成后下载无水印视频或图集。', icon: 'fa-download' }
    ]
  },
  'en': {
    badge: '3 Steps',
    title: 'How to Use',
    steps: [
      { title: 'Copy Video Link', body: 'Open the video in Douyin, Kuaishou, etc. Copy the share link.', icon: 'fa-copy' },
      { title: 'Paste & Parse', body: 'Come back, paste the link, optionally select a platform.', icon: 'fa-paste' },
      { title: 'Download', body: 'Click "Start Parsing", then download the watermark-free video or album.', icon: 'fa-download' }
    ]
  }
}

const getContent = (locale) => content[locale] || content['zh-CN']
</script>

<template>
  <section id="course" class="mb-16 scroll-mt-16 sm:scroll-mt-18">
    <div class="text-center mb-10">
      <span class="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm mb-4">
        {{ getContent(locale).badge }}
      </span>
      <h3 class="text-3xl font-bold">{{ getContent(locale).title }}</h3>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      <div v-for="step in getContent(locale).steps" :key="step.title" 
           class="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center hover:shadow-xl transition-all">
        <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <i :class="['fas', step.icon, 'text-white text-xl']"></i>
        </div>
        <h4 class="font-semibold mb-2">{{ step.title }}</h4>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ step.body }}</p>
      </div>
    </div>
  </section>
</template>
