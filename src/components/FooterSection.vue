<script setup>
defineProps({
  locale: String
})

const content = {
  'zh-CN': {
    brand: '短视频解析',
    version: 'BK-SV v3.0',
    desc: '简单易用的短视频解析工具，支持多平台无水印视频与图集解析，让分享更自由。',
    quickLinks: '快速链接',
    home: '首页',
    course: '使用教程',
    platforms: '支持平台',
    help: '帮助与支持',
    faq: '常见问题',
    about: '关于我们',
    contact: '联系我们',
    service: '在线客服',
    copyright: '© 2026 BugPk & JH-Ahua · 保留所有权利',
    poweredBy: 'Powered by BugPk',
    madeWith: '用心打造',
    starUs: '给我们 Star',
    issues: '问题反馈'
  },
  'en': {
    brand: 'Video Parser',
    version: 'BK-SV v3.0',
    desc: 'Simple & easy video parsing tool. Support multi-platform watermark-free video & album extraction.',
    quickLinks: 'Quick Links',
    home: 'Home',
    course: 'Tutorial',
    platforms: 'Platforms',
    help: 'Help & Support',
    faq: 'FAQ',
    about: 'About',
    contact: 'Contact Us',
    service: 'Online Support',
    copyright: '© 2026 BugPk & JH-Ahua · All Rights Reserved',
    poweredBy: 'Powered by BugPk',
    madeWith: 'Made with care',
    starUs: 'Star Us',
    issues: 'Report Issues'
  }
}

const getContent = (locale) => content[locale] || content['zh-CN']

const socialLinks = [
  { icon: 'fab fa-github', url: 'https://github.com/jiuhunwl/shortvideo-html', label: 'GitHub', color: '#333' },
  { icon: 'fas fa-globe', url: 'https://www.jiuhunwl.cn', label: 'Blog', color: '#6366f1' },
  { icon: 'fas fa-envelope', url: 'mailto:admin@bugpk.com', label: 'Email', color: '#ef4444' },
]

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer id="ours" class="footer-section relative overflow-hidden scroll-mt-16 sm:scroll-mt-18">
    <div class="footer-glow"></div>

    <div class="max-w-7xl mx-auto px-4 py-8 md:py-16 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 footer-grid">
        <div class="footer-brand">
          <div class="flex items-center gap-3 mb-5">
            <div class="brand-icon">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
                <img src="https://static.esa.ifphp.com/img/bugpk-Api-256×256.ico" alt="Logo" class="w-8 h-8 object-contain" />
              </div>
              <div class="brand-icon-glow"></div>
            </div>
            <div>
              <h4 class="font-bold text-lg text-slate-800 dark:text-white">{{ getContent(locale).brand }}</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ getContent(locale).version }}</p>
            </div>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
            {{ getContent(locale).desc }}
          </p>

          <div class="flex items-center gap-3">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="social-link"
              :aria-label="social.label"
            >
              <i :class="['fab', social.icon]"></i>
            </a>
          </div>
        </div>

        <div class="footer-links">
          <h5 class="footer-heading">
            <i class="fas fa-link mr-2 text-indigo-500"></i>
            {{ getContent(locale).quickLinks }}
          </h5>
          <ul class="space-y-3">
            <li>
              <a href="/" class="footer-link">
                <i class="fas fa-home text-xs mr-2"></i>
                {{ getContent(locale).home }}
              </a>
            </li>
            <li>
              <a href="#course" class="footer-link">
                <i class="fas fa-book text-xs mr-2"></i>
                {{ getContent(locale).course }}
              </a>
            </li>
            <li>
              <a href="#Supported_Platforms" class="footer-link">
                <i class="fas fa-th text-xs mr-2"></i>
                {{ getContent(locale).platforms }}
              </a>
            </li>
          </ul>
        </div>

        <div class="footer-links">
          <h5 class="footer-heading">
            <i class="fas fa-question-circle mr-2 text-purple-500"></i>
            {{ getContent(locale).help }}
          </h5>
          <ul class="space-y-3">
            <li>
              <a href="#faq" class="footer-link">
                <i class="fas fa-comments text-xs mr-2"></i>
                {{ getContent(locale).faq }}
              </a>
            </li>
            <li>
              <a href="#ours" class="footer-link">
                <i class="fas fa-info-circle text-xs mr-2"></i>
                {{ getContent(locale).about }}
              </a>
            </li>
            <li>
              <a :href="socialLinks[0].url" target="_blank" rel="noopener noreferrer" class="footer-link">
                <i class="fab fa-github text-xs mr-2"></i>
                {{ getContent(locale).issues }}
              </a>
            </li>
          </ul>
        </div>

        <div class="footer-links">
          <h5 class="footer-heading">
            <i class="fas fa-id-card mr-2 text-pink-500"></i>
            {{ getContent(locale).contact }}
          </h5>
          <ul class="space-y-3">
            <li class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <i class="fas fa-user text-xs text-indigo-400"></i>
              <span>BugPk & Jh-Ahua</span>
            </li>
            <li>
              <a :href="socialLinks[0].url" target="_blank" rel="noopener noreferrer" class="footer-link">
                <i class="fab fa-github text-xs mr-2"></i>
                <span class="truncate">jiuhunwl/shortvideo-html</span>
              </a>
            </li>
            <li class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <i class="fas fa-globe text-xs text-emerald-400"></i>
              <span>api.bugpk.com</span>
            </li>
          </ul>

          <div class="mt-5 flex items-center gap-2">
            <a
              :href="socialLinks[0].url"
              target="_blank"
              rel="noopener noreferrer"
              class="github-btn"
            >
              <i class="fab fa-github"></i>
              <span>{{ getContent(locale).starUs }}</span>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-divider"></div>

      <div class="flex flex-col sm:flex-row items-center justify-center md:justify-between gap-4 pt-8 text-center footer-bottom">
        <div class="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-slate-500 dark:text-slate-400">
          <p>{{ getContent(locale).copyright }}</p>
        </div>

        <div class="flex items-center gap-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ getContent(locale).poweredBy }}
          </p>
          <a
            :href="socialLinks[0].url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            <i class="fab fa-github text-xs"></i>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </div>

    <div class="footer-pattern"></div>
  </footer>
</template>

<style scoped>
.footer-section {
  background: linear-gradient(180deg, transparent 0%, rgba(248, 250, 252, 0.5) 50%, rgba(248, 250, 252, 1) 100%);
  border-top: 1px solid #e2e8f0;
}

.dark .footer-section {
  background: linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.5) 50%, rgba(15, 23, 42, 1) 100%);
  border-top-color: #334155;
}

.footer-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 200px;
  background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.footer-brand {
  position: relative;
}

.brand-icon {
  position: relative;
  display: inline-block;
}

.brand-icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(15px);
  z-index: -1;
}

.footer-heading {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #1e293b;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
}

.dark .footer-heading {
  color: #f1f5f9;
}

.footer-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-link {
  display: inline-flex;
  align-items: center;
  color: #64748b;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 0.25rem 0;
}

.dark .footer-link {
  color: #94a3b8;
}

.footer-link:hover {
  color: #6366f1;
  transform: translateX(4px);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  background: #f1f5f9;
  color: #64748b;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.dark .social-link {
  background: #334155;
  color: #94a3b8;
}

.social-link:hover {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.github-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #24292e 0%, #1b1f23 100%);
  color: white;
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.github-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent);
}

.footer-pattern {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background-image: radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.05) 1px, transparent 0);
  background-size: 24px 24px;
  pointer-events: none;
  mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.1), transparent);
  -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.1), transparent);
}

@media (max-width: 768px) {
  .footer-section {
    padding-bottom: 1.5rem;
  }

  .footer-glow,
  .footer-pattern {
    display: none;
  }

  .footer-links {
    text-align: center;
  }

  .footer-heading {
    justify-content: center;
  }

  .footer-link {
    justify-content: center;
    width: 100%;
  }

  .social-link {
    width: 40px;
    height: 40px;
  }

  .footer-grid {
    display: none;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 1rem;
  }
}
</style>