/**
 *@Author: JH-Ahua
 *@CreateTime: 2026/5/5 23:34
 *@email: admin@bugpk.com
 *@blog: www.jiuhunwl.cn
 *@Api: api.bugpk.com
 *@tip: 短视频解析 v3.0
 */
(function () {
    'use strict';

    // ============================================================
    // DEBUG FLAG - Set to false in production
    // ============================================================
    var DEBUG = false;
    function dbg() { if (DEBUG) console.log.apply(console, arguments); }

    // ============================================================
    // CACHE - Memoization for expensive operations
    // ============================================================
    var memoCache = {
        urlClean: new Map(),
        urlValid: new Map(),
        domEl: new Map()
    };

    function memoize(cache, key, fn) {
        if (cache.has(key)) return cache.get(key);
        var result = fn();
        cache.set(key, result);
        return result;
    }

    function clearMemoCache() {
        memoCache.urlClean.clear();
        memoCache.urlValid.clear();
        memoCache.domEl.clear();
    }

    // ============================================================
    // 1. I18N — 多语言
    // ============================================================
    var LANG = {
        'zh-CN': {
            'page.title': 'BK-SV v3.0 短视频去水印解析工具 | 一键解析各大平台视频',
            'header.brand': '短视频解析',
            'header.subtitle': '无水印 · 免费',
            'hero.badge': 'BK-SV v3.0 · 多平台解析',
            'hero.title1': '轻松解析',
            'hero.title2': '任何',
            'hero.title3': '短视频',
            'hero.desc': 'v3.0 全新升级！支持抖音、快手、B 站、小红书等平台，一键提取无水印视频与图集，简单免费。',
            'input.label': '视频链接',
            'input.placeholder': '粘贴分享链接或含链接的文本…',
            'parse.button': '开始解析',
            'result.title': '解析结果',
            'result.sourceHint': '当前使用源链接直连播放与下载',
            'loading.title': '正在解析…',
            'loading.desc': '通常几秒内完成，请稍候',
            'error.title': '解析失败',
            'platforms.badge': '生态覆盖',
            'platforms.title': '支持的平台',
            'tutorial.badge': '三步搞定',
            'tutorial.title': '使用教程',
            'faq.badge': '帮助',
            'faq.title': '常见问题',
            'footer.brand': '短视频解析工具',
            'footer.desc': 'BK-SV v3.0 — 简单易用的短视频解析工具，支持多平台无水印视频与图集解析。',
            'footer.quickLinks': '快速链接',
            'footer.contact': '联系我们',
            'footer.onlineService': '在线客服',
            'footer.copyright': '短视频解析工具 · 保留所有权利',
            'nav.home': '首页',
            'nav.course': '解析教程',
            'nav.platforms': '支持平台',
            'nav.about': '关于我们',
            'nav.faq': '常见问题',
            'hero.feature1': '无水印',
            'hero.feature2': '高速解析',
            'hero.feature3': '完全免费',
            'platform.tab.all': '所有平台',
            'tutorial.step1.title': '复制视频链接',
            'tutorial.step1.body': '在抖音、快手等平台打开作品，通过分享复制链接。',
            'tutorial.step2.title': '粘贴并解析',
            'tutorial.step2.body': '回到本页，将链接粘贴到输入框，可选对应平台接口。',
            'tutorial.step3.title': '下载保存',
            'tutorial.step3.body': '点击「开始解析」，完成后下载无水印视频或图集。',
            'faq.q1': '为什么有些视频无法解析？',
            'faq.a1': '部分平台会更新防护策略，可能导致暂时失败，我们会持续维护。受版权限制的内容也可能无法解析。',
            'faq.q2': '下载的视频仍有水印怎么办？',
            'faq.a2': '若仍有水印，可能是平台策略变化导致去水印逻辑需更新，欢迎反馈以便我们尽快处理。',
            'faq.q3': '解析和下载是否收费？',
            'faq.a3': '本站服务免费。请警惕声称「高级解析」的收费陷阱。',
            'download.single': '下载无水印视频',
            'download.allImages': '下载全部图片（{count} 张）',
            'download.batchLive': '批量下载（{count} 个文件）',
            'download.singleLive': '下载实况视频',
            'download.coverLive': '下载实况封面',
            'download.batchLiveZip': '批量下载封面与视频',
            'music.title': '视频原声',
            'music.unknown': '未知音乐',
            'music.unknownAuthor': '未知作者',
            'copy.cover': '复制封面链接',
            'copy.video': '复制视频链接',
            'quality.select': '画质选择：',
            'backup.title': '备用画质 ({count})',
            'progress.title': '下载进度',
            'progress.starting': '准备中…',
            'progress.cancel': '取消下载',
            'progress.downloading': '正在下载 ({current}/{total})',
            'progress.compressing': '正在压缩…',
            'progress.complete': '下载完成！',
            'progress.cancelled': '已取消',
            'progress.error': '下载出错',
            'overlay.dl': '下载',
            'overlay.video': '视频',
            'overlay.cover': '封面',
            'overlay.live': '实况',
            'download.inprogress': '正在下载…',
            'download.loading': '准备下载…',

            'toast.copied': '已复制到剪贴板',
            'toast.copyError': '无法复制',
            'toast.shareCopied': '链接已复制到剪贴板',
            'toast.shareError': '分享失败',
            'toast.downloadStart': '开始下载并压缩图片（{count} 张）',
            'toast.downloadSuccess': '成功下载 {count} 张图片',
            'toast.downloadAllFailed': '所有图片下载失败，请重试',
            'toast.zipError': '压缩文件生成失败',
            'toast.zipLoadError': '压缩库加载失败，请重试',
            'toast.downloadSingleSuccess': '成功下载 {count} 个文件',
            'toast.singleDownloadAllFailed': '所有文件下载失败，请重试',
            'toast.liveProcessing': '开始处理 {count} 组实况…',
            'toast.swiperError': '幻灯片组件加载失败，将以普通图片显示',
            'info.author': '作者',
            'info.likes': '点赞 {count}',
            'info.title': '作品标题',
            'info.unknownTitle': '未知标题',
            'info.publishTime': '发布时间',
            'info.unknownTime': '未知时间',
            'info.type': '作品类型',
            'info.video': '视频',
            'info.images': '图片集',
            'info.live': '实况解析',
            'info.unknownType': '未知类型',
            'info.quality': '主画质',
            'info.unknownQuality': '未知',
            'stat.like': '点赞',
            'stat.comment': '评论',
            'stat.collect': '收藏',
            'stat.share': '分享',
            'stat.admire': '赞赏',
            'stat.play': '播放',
            'error.inputEmpty': '请输入视频链接或包含链接的文本',
            'error.invalidUrl': '无法从输入中提取有效的 URL',
            'error.timeout': '请求超时，请重试',
            'error.network': '网络错误，请检查连接',
            'error.parseFailed': '解析失败，请稍后再试',
            'error.noCopyUrl': '没有可复制的{type}',
            'error.copyFailed': '无法复制{type}',
            'quality.line': '线路{idx}',
        },
        en: {
            'page.title': 'BK-SV v3.0 Video Parser | Remove Watermarks',
            'header.brand': 'Video Parser',
            'header.subtitle': 'No Watermark · Free',
            'hero.badge': 'BK-SV v3.0 · Multi-Platform',
            'hero.title1': 'Parse ',
            'hero.title2': 'Any',
            'hero.title3': ' Short Video',
            'hero.desc': 'v3.0 Upgrade! Support Douyin, Kuaishou, Bilibili, Xiaohongshu and more. Extract videos & albums without watermark, simple and free.',
            'input.label': 'Video URL',
            'input.placeholder': 'Paste a share link or text containing a link…',
            'parse.button': 'Start Parsing',
            'result.title': 'Result',
            'result.sourceHint': 'Using direct source link for playback & download',
            'loading.title': 'Parsing…',
            'loading.desc': 'Usually completes in seconds, please wait',
            'error.title': 'Parse Failed',
            'platforms.badge': 'Coverage',
            'platforms.title': 'Supported Platforms',
            'tutorial.badge': '3 Steps',
            'tutorial.title': 'How to Use',
            'faq.badge': 'Help',
            'faq.title': 'FAQ',
            'footer.brand': 'Video Parser Tool',
            'footer.desc': 'BK-SV v3.0 — Simple & easy video parsing tool. Support multi-platform watermark-free video & album extraction.',
            'footer.quickLinks': 'Quick Links',
            'footer.contact': 'Contact Us',
            'footer.onlineService': 'Online Support',
            'footer.copyright': 'Video Parser Tool · All Rights Reserved',
            'nav.home': 'Home',
            'nav.course': 'Tutorial',
            'nav.platforms': 'Platforms',
            'nav.about': 'About',
            'nav.faq': 'FAQ',
            'hero.feature1': 'No Watermark',
            'hero.feature2': 'Fast Parse',
            'hero.feature3': 'Free',
            'platform.tab.all': 'All Platforms',
            'tutorial.step1.title': 'Copy Video Link',
            'tutorial.step1.body': 'Open the video in Douyin, Kuaishou, etc. Copy the share link.',
            'tutorial.step2.title': 'Paste & Parse',
            'tutorial.step2.body': 'Come back, paste the link, optionally select a platform.',
            'tutorial.step3.title': 'Download',
            'tutorial.step3.body': 'Click "Start Parsing", then download the watermark-free video or album.',
            'faq.q1': 'Why can\'t some videos be parsed?',
            'faq.a1': 'Some platforms update their protection mechanisms, causing temporary failures. We maintain continuously. Copyrighted content may also not be parseable.',
            'faq.q2': 'What if the downloaded video still has a watermark?',
            'faq.a2': 'If a watermark remains, the platform may have changed its strategy. Please report it so we can update the logic.',
            'faq.q3': 'Is parsing and downloading free?',
            'faq.a3': 'Our service is completely free. Beware of paid "premium parsing" scams.',
            'download.single': 'Download Video',
            'download.allImages': 'Download All ({count} images)',
            'download.batchLive': 'Batch Download ({count} files)',
            'download.singleLive': 'Download Live Video',
            'download.coverLive': 'Download Live Cover',
            'download.batchLiveZip': 'Batch Download Cover & Video',
            'music.title': 'Original Audio',
            'music.unknown': 'Unknown Music',
            'music.unknownAuthor': 'Unknown Artist',
            'copy.cover': 'Copy Cover URL',
            'copy.video': 'Copy Video URL',
            'quality.select': 'Quality: ',
            'backup.title': 'Backup ({count})',
            'progress.title': 'Download Progress',
            'progress.starting': 'Preparing…',
            'progress.cancel': 'Cancel',
            'progress.downloading': 'Downloading ({current}/{total})',
            'progress.compressing': 'Compressing…',
            'progress.complete': 'Download Complete!',
            'progress.cancelled': 'Cancelled',
            'progress.error': 'Download Error',
            'overlay.dl': 'DL',
            'overlay.video': 'Vid',
            'overlay.cover': 'Cvr',
            'overlay.live': 'Live',
            'download.inprogress': 'Downloading…',
            'download.loading': 'Preparing…',
            'toast.copied': 'Copied to clipboard',
            'toast.copyError': 'Copy failed',
            'toast.shareCopied': 'Link copied to clipboard',
            'toast.shareError': 'Share failed',
            'toast.downloadStart': 'Downloading & compressing ({count} images)',
            'toast.downloadSuccess': 'Successfully downloaded {count} images',
            'toast.downloadAllFailed': 'All images failed to download',
            'toast.zipError': 'Failed to generate zip archive',
            'toast.zipLoadError': 'Zip library failed to load',
            'toast.downloadSingleSuccess': 'Successfully downloaded {count} files',
            'toast.singleDownloadAllFailed': 'All files failed to download',
            'toast.liveProcessing': 'Processing {count} live photos…',
            'toast.swiperError': 'Swiper failed to load, showing images normally',
            'info.author': 'Author',
            'info.likes': '{count} likes',
            'info.title': 'Title',
            'info.unknownTitle': 'Unknown Title',
            'info.publishTime': 'Published',
            'info.unknownTime': 'Unknown',
            'info.type': 'Type',
            'info.video': 'Video',
            'info.images': 'Album',
            'info.live': 'Live Photo',
            'info.unknownType': 'Unknown',
            'info.quality': 'Quality',
            'info.unknownQuality': 'Unknown',
            'stat.like': 'Likes',
            'stat.comment': 'Comments',
            'stat.collect': 'Favorites',
            'stat.share': 'Shares',
            'stat.admire': 'Admire',
            'stat.play': 'Plays',
            'error.inputEmpty': 'Please enter a video URL or text containing a link',
            'error.invalidUrl': 'Unable to extract a valid URL from the input',
            'error.timeout': 'Request timeout, please retry',
            'error.network': 'Network error, please check connection',
            'error.parseFailed': 'Parse failed, please try again later',
            'error.noCopyUrl': 'No {type} available to copy',
            'error.copyFailed': 'Failed to copy {type}',
            'quality.line': 'Line {idx}',
        },
    };

    // ============================================================
    // 2. Data
    // ============================================================
    const NAV_LINKS = [
        { href: '/', labelKey: 'nav.home' },
        { href: '#Supported_Platforms', labelKey: 'nav.platforms' },
        { href: '#course', labelKey: 'nav.course' },
        { href: '#faq', labelKey: 'nav.faq' },
        { href: '#ours', labelKey: 'nav.about' },
    ];

    const FOOTER_LINKS = [
        ...NAV_LINKS,
    ];

    const HERO_FEATURES = [
        { icon: 'fa-check-circle', iconClass: 'text-emerald-500', textKey: 'hero.feature1' },
        { icon: 'fa-bolt', iconClass: 'text-amber-500', textKey: 'hero.feature2' },
        { icon: 'fa-gift', iconClass: 'text-primary', textKey: 'hero.feature3' },
    ];

    const PLATFORM_TABS = [
        { key: 'all', labelKey: 'platform.tab.all', icon: 'fa-globe' },
        { key: 'douyin', label: '抖音', icon: 'fa-music' },
        { key: 'kuaishou', label: '快手', icon: 'fa-bolt' },
        { key: 'bilibili', label: 'B站', icon: 'fa-play-circle', iconColor: '#FB7299' },
        { key: 'xhs', label: '小红书', icon: 'fa-bookmark', iconColor: '#FE2C55' },
        { key: 'toutiao', label: '今日头条', icon: 'fa-newspaper', iconColor: '#FE2C55' },
    ];

    const PLATFORM_API_MAP = {
        all: 'https://api.bugpk.com/api/short_videos',
        douyin: 'https://api.bugpk.com/api/douyin',
        kuaishou: 'https://api.bugpk.com/api/ksjx',
        bilibili: 'https://api.bugpk.com/api/bilibili',
        xhs: 'https://api.bugpk.com/api/xhsjx',
        toutiao: 'https://api.bugpk.com/api/toutiao',
    };

    const SUPPORTED_PLATFORMS = [
        { name: '抖音', url: 'https://www.douyin.com', desc: '解析抖音无水印视频', gradient: 'from-slate-900 to-slate-700', img: 'https://lf-douyin-pc-web.douyinstatic.com/obj/douyin-pc-web/2025_0313_logo.png' },
        { name: '快手', url: 'https://www.kuaishou.com', desc: '解析快手无水印视频', gradient: 'from-red-500 to-amber-400', img: 'https://p4-plat.wskwai.com/kos/nlav111422/ks-web/favicon.ico' },
        { name: 'B站', url: 'https://www.bilibili.com', desc: '解析B站视频', gradient: 'from-sky-500 to-violet-500', img: 'https://www.bilibili.com/favicon.ico' },
        { name: '小红书', url: 'https://www.xiaohongshu.com', desc: '解析小红书视频', gradient: 'from-rose-500 to-red-500', img: 'https://www.xiaohongshu.com/favicon.ico' },
        { name: '微博', url: 'https://weibo.com', desc: '解析微博短视频', gradient: 'from-orange-500 to-amber-400', img: 'https://isee.weishi.qq.com/favicon.ico' },
        { name: '微视', url: 'https://weishi.qq.com', desc: '解析微视短视频', gradient: 'from-blue-600 to-cyan-400', img: 'https://isee.weishi.qq.com/favicon.ico' },
        { name: '皮皮虾', url: 'https://www.pipix.com', desc: '解析皮皮虾视频', gradient: 'from-purple-600 to-pink-500', img: 'https://lf-toutiao-ug-dns.toutiaocdn.com/obj/toutiao-ug-tos/ppx/mp/static/media/favicon.9cfbabbf.ico' },
        { name: '皮皮搞笑', url: 'https://www.pipigx.com', desc: '解析搞笑短视频', gradient: 'from-green-600 to-lime-400', img: 'https://www.pipigx.com/favicon.ico' },
        { name: '西瓜视频', url: 'https://www.ixigua.com', desc: '解析西瓜短视频', gradient: 'from-emerald-600 to-teal-500', img: 'https://www.ixigua.com/favicon.ico' },
        { name: '好看视频', url: 'https://haokan.baidu.com', desc: '解析百度系短视频', gradient: 'from-blue-800 to-sky-400', img: 'https://haokan.baidu.com/favicon.ico' },
        { name: '最右', url: 'https://www.izuiyou.com', desc: '解析最右短视频', gradient: 'from-purple-800 to-fuchsia-500', img: 'https://www.izuiyou.com/favicon.ico' },
        { name: '火山小视频', url: 'https://www.huoshan.com', desc: '解析火山平台视频', gradient: 'from-orange-800 to-amber-500', img: 'https://sj-fd.zol-img.com.cn/t_s180x180/g2/M00/09/0A/ChMlWl5TM3qIEGKDAACLMVr64W0AANcDwHGiFgAAItJ628.png' },
        { name: '更多平台', url: '#', desc: '持续更新中…', gradient: 'from-slate-500 to-slate-400', more: true },
    ];

    const TUTORIAL_STEPS = [
        { step: '1', titleKey: 'tutorial.step1.title', bodyKey: 'tutorial.step1.body' },
        { step: '2', titleKey: 'tutorial.step2.title', bodyKey: 'tutorial.step2.body' },
        { step: '3', titleKey: 'tutorial.step3.title', bodyKey: 'tutorial.step3.body' },
    ];

    const FAQ_ITEMS = [
        { qKey: 'faq.q1', aKey: 'faq.a1' },
        { qKey: 'faq.q2', aKey: 'faq.a2' },
        { qKey: 'faq.q3', aKey: 'faq.a3' },
    ];

    const UI = {
        btnPrimary: 'btn-primary-gradient px-6 py-3 text-white font-semibold flex items-center justify-center gap-2 mb-4',
        btnPrimaryFull: 'btn-primary-gradient w-full py-3 text-white font-bold flex items-center justify-center gap-2',
        btnOutline: 'bg-white dark:bg-slate-800 border border-primary text-primary dark:text-blue-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors rounded-xl px-6 py-3 font-medium flex items-center justify-center flex-1 gap-2',
        previewWrap: 'rounded-2xl overflow-hidden mb-6 shadow-card border border-slate-100/80 dark:border-slate-700/50',
        placeholder: 'w-full min-h-[14rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center',
        platformCard: 'surface-card rounded-2xl p-5 sm:p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:hover:shadow-card-dark border border-white/50',
    };

    const JSZIP_CDN = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
    let jsZipPromise = null;
    let currentLang = 'zh-CN';
    let particlesInitialized = false;
    let currentProgressController = null;
    var parseFormHandlersInstalled = false;

    // ============================================================
    // 3. Helpers
    // ============================================================

    // ----- i18n -----
    function t(key, vars) {
        const dict = LANG[currentLang] || LANG['zh-CN'];
        let val = dict[key];
        if (val === undefined) val = LANG['zh-CN'][key] || key;
        if (vars) {
            Object.keys(vars).forEach((k) => {
                val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
            });
        }
        return val;
    }

    function applyI18n() {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = t(key);
        });
        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            const key = el.getAttribute('data-i18n-title');
            el.title = t(key);
        });
        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            const key = el.getAttribute('data-i18n-html');
            el.innerHTML = t(key);
        });
        const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
        if (titleKey) document.title = t(titleKey);
        renderNavLinks();
        renderHeroFeatures();
        renderPlatformTabs();
        renderPlatformGrid();
        renderTutorial();
        renderFAQ();
        renderFooterLinks();
    }

    function setLang(lang) {
        if (lang === currentLang) return;
        currentLang = lang;
        localStorage.setItem('preferredLang', lang);
        document.documentElement.lang = lang;
        document.querySelectorAll('.lang-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        // 记住当前选中的平台，切换语言后恢复
        var prevPlatform = currentPlatform;
        applyI18n();
        // 切换语言后重建了 tab，恢复选中状态
        if (prevPlatform && prevPlatform !== 'all') {
            var tabBtn = document.querySelector('.platform-btn[data-platform="' + prevPlatform + '"]');
            if (tabBtn) {
                document.querySelectorAll('.platform-btn').forEach(function (b) { b.classList.remove('active'); });
                tabBtn.classList.add('active');
                currentPlatform = prevPlatform;
            }
        } else {
            // 默认选中 "全部"
            var allBtn = document.querySelector('.platform-btn[data-platform="all"]');
            if (allBtn) allBtn.classList.add('active');
        }
    }

    // ----- Theme -----
    function getPreferredTheme() {
        const stored = localStorage.getItem('themeMode');
        if (stored === 'light' || stored === 'dark') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        const isDark = theme === 'dark';
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('themeMode', theme || (isDark ? 'dark' : 'light'));
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        applyTheme(isDark ? 'light' : 'dark');
    }

    // ----- Scroll Reveal -----
    let revealObs = null;

    function initReveal() {
        if (revealObs) revealObs.disconnect();
        const els = document.querySelectorAll('.reveal');
        if (!els.length) return;
        if ('IntersectionObserver' in window) {
            revealObs = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('show');
                        revealObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
            els.forEach((el) => revealObs.observe(el));
        } else {
            els.forEach((el) => el.classList.add('show'));
        }
    }

    // ----- Particle Background -----
    function initParticles() {
        if (particlesInitialized) return;
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w, h, particles = [];
        const MAX_PARTICLES = 50;
        const CONNECTION_DIST = 120;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }

        function createParticle() {
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                alpha: Math.random() * 0.4 + 0.1,
            };
        }

        function init() {
            resize();
            particles = [];
            for (let i = 0; i < MAX_PARTICLES; i++) {
                particles.push(createParticle());
            }
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            const isDark = document.documentElement.classList.contains('dark');

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = isDark
                    ? `rgba(148, 163, 184, ${p.alpha})`
                    : `rgba(79, 70, 229, ${p.alpha * 0.7})`;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x;
                    const dy = p.y - q.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const lineAlpha = (1 - dist / CONNECTION_DIST) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = isDark
                            ? `rgba(148, 163, 184, ${lineAlpha})`
                            : `rgba(79, 70, 229, ${lineAlpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(draw);
        }

        init();
        draw();
        window.addEventListener('resize', resize);
        particlesInitialized = true;
    }

    // ----- Progress Card -----
    function showProgress(initialText) {
        const card = document.getElementById('progress-card');
        const bar = document.getElementById('progress-bar-fill');
        const text = document.getElementById('progress-text');
        const percent = document.getElementById('progress-percent');
        if (card) {
            card.classList.remove('closing', 'hidden');
            card.classList.add('show');
            card.style.display = 'block';
        }
        if (bar) { bar.style.width = '0%'; bar.classList.remove('done', 'error'); }
        if (text) text.textContent = initialText || t('progress.starting');
        if (percent) percent.textContent = '0%';
    }

    function updateProgress(current, total, statusText) {
        const bar = document.getElementById('progress-bar-fill');
        const text = document.getElementById('progress-text');
        const percent = document.getElementById('progress-percent');
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        if (bar) { bar.style.width = Math.min(pct, 100) + '%'; bar.classList.remove('done', 'error'); }
        if (text) text.textContent = statusText || t('progress.downloading', { current, total });
        if (percent) percent.textContent = pct + '%';
    }

    function setProgressComplete(message) {
        const bar = document.getElementById('progress-bar-fill');
        const text = document.getElementById('progress-text');
        const percent = document.getElementById('progress-percent');
        if (bar) { bar.style.width = '100%'; bar.classList.add('done'); bar.classList.remove('error'); }
        if (text) text.textContent = message || t('progress.complete');
        if (percent) percent.textContent = '100%';
        setTimeout(() => hideProgress(), 3500);
    }

    function setProgressError(message) {
        const bar = document.getElementById('progress-bar-fill');
        const text = document.getElementById('progress-text');
        const percent = document.getElementById('progress-percent');
        if (bar) { bar.classList.add('error'); bar.classList.remove('done'); }
        if (text) text.textContent = message || t('progress.error');
        if (percent) percent.textContent = '\u2014';
    }

    function hideProgress() {
        const card = document.getElementById('progress-card');
        if (!card) return;
        card.classList.add('closing');
        setTimeout(() => {
            card.classList.remove('show', 'closing');
            card.style.display = 'none';
        }, 400);
    }

    // ----- Async download functions with progress & cancel -----
    async function compressAndDownloadImages(imageUrls) {
        if (currentProgressController) { currentProgressController.abort(); }
        const controller = new AbortController();
        currentProgressController = controller;
        const signal = controller.signal;

        showProgress(t('progress.starting'));

        try {
            await ensureJSZip();
            if (signal.aborted) { hideProgress(); return; }

            updateProgress(0, imageUrls.length, t('progress.downloading', { current: 0, total: imageUrls.length }));

            var JSZip = window.JSZip;

            const CHUNK_SIZE = 5;
            const zip = new JSZip();
            const imageFolder = zip.folder('images');
            let loadedCount = 0;
            let errorCount = 0;
            const total = imageUrls.length;

            for (let start = 0; start < total; start += CHUNK_SIZE) {
                if (signal.aborted) {
                    setProgressError(t('progress.cancelled'));
                    setTimeout(hideProgress, 1500);
                    return;
                }
                const chunk = imageUrls.slice(start, start + CHUNK_SIZE);
                const promises = chunk.map(async (imgUrl, idx) => {
                    const cleanedUrl = getDirectUrl(imgUrl);
                    const fileName = `image_${start + idx + 1}.jpg`;
                    try {
                        const resp = await fetch(cleanedUrl, { signal });
                        if (!resp.ok) throw new Error(String(resp.status));
                        const blob = await resp.blob();
                        imageFolder.file(fileName, blob);
                        loadedCount++;
                    } catch (e) {
                        if (e.name === 'AbortError') throw e;
                        console.error('Download failed (' + (start + idx + 1) + '):', e);
                        errorCount++;
                    }
                });
                try { await Promise.all(promises); } catch (e) { if (e.name === 'AbortError') throw e; }
                const processed = Math.min(start + CHUNK_SIZE, total);
                updateProgress(processed, total, t('progress.downloading', { current: Math.min(processed, total), total }));
            }

            if (signal.aborted) { setProgressError(t('progress.cancelled')); setTimeout(hideProgress, 1500); return; }

            if (loadedCount > 0) {
                updateProgress(total, total, t('progress.compressing'));
                const content = await zip.generateAsync({ type: 'blob' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'images_' + Date.now() + '.zip';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(link.href); }, 2000);
                setProgressComplete(t('toast.downloadSuccess', { count: loadedCount }));
                showToast(t('toast.downloadSuccess', { count: loadedCount }));
            } else {
                setProgressError(t('toast.downloadAllFailed'));
                showToast(t('toast.downloadAllFailed'));
            }
        } catch (e) {
            if (e.name === 'AbortError') {
                setProgressError(t('progress.cancelled'));
                setTimeout(hideProgress, 1500);
                return;
            }
            console.error(e);
            setProgressError(e.message || t('toast.zipError'));
            showToast(t('toast.zipError'));
        } finally {
            if (currentProgressController === controller) currentProgressController = null;
        }
    }

    async function compressAndDownloadLiveContent(livePhotos) {
        if (currentProgressController) { currentProgressController.abort(); }
        const controller = new AbortController();
        currentProgressController = controller;
        const signal = controller.signal;

        showProgress(t('progress.starting'));

        try {
            await ensureJSZip();
            if (signal.aborted) { hideProgress(); return; }

            var JSZip = window.JSZip;

            const total = livePhotos.length * 2;
            updateProgress(0, total, t('progress.downloading', { current: 0, total }));

            const zip = new JSZip();
            const folder = zip.folder('live_photos');
            let successCount = 0;

            for (let index = 0; index < livePhotos.length; index++) {
                if (signal.aborted) {
                    setProgressError(t('progress.cancelled'));
                    setTimeout(hideProgress, 1500);
                    return;
                }
                const item = livePhotos[index];
                const prefix = 'live_' + (index + 1);
                const tasks = [];

                tasks.push(
                    fetch(getDirectUrl(item.image), { signal })
                        .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); })
                        .then(blob => { folder.file(prefix + '_cover.jpg', blob); successCount++; })
                        .catch(e => { if (e.name !== 'AbortError') console.error('Cover download failed', e); })
                );
                tasks.push(
                    fetch(getDirectUrl(item.video), { signal })
                        .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); })
                        .then(blob => { folder.file(prefix + '_video.mp4', blob); successCount++; })
                        .catch(e => { if (e.name !== 'AbortError') console.error('Video download failed', e); })
                );

                try { await Promise.all(tasks); } catch (e) { if (e.name === 'AbortError') throw e; }

                const processed = Math.min((index + 1) * 2, total);
                updateProgress(processed, total, t('progress.downloading', { current: Math.min(processed, total), total }));
            }

            if (signal.aborted) { setProgressError(t('progress.cancelled')); setTimeout(hideProgress, 1500); return; }

            if (successCount > 0) {
                updateProgress(total, total, t('progress.compressing'));
                const content = await zip.generateAsync({ type: 'blob' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'live_photos_' + Date.now() + '.zip';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(link.href); }, 2000);
                setProgressComplete(t('toast.downloadSingleSuccess', { count: successCount }));
                showToast(t('toast.downloadSingleSuccess', { count: successCount }));
            } else {
                setProgressError(t('toast.singleDownloadAllFailed'));
                showToast(t('toast.singleDownloadAllFailed'));
            }
        } catch (e) {
            if (e.name === 'AbortError') {
                setProgressError(t('progress.cancelled'));
                setTimeout(hideProgress, 1500);
                return;
            }
            console.error(e);
            setProgressError(e.message || t('toast.zipError'));
        } finally {
            if (currentProgressController === controller) currentProgressController = null;
        }
    }

    async function compressAndDownloadSingleLive(videoData) {
        if (currentProgressController) { currentProgressController.abort(); }
        const controller = new AbortController();
        currentProgressController = controller;
        const signal = controller.signal;

        showProgress(t('progress.starting'));

        try {
            await ensureJSZip();
            if (signal.aborted) { hideProgress(); return; }

            var JSZip = window.JSZip;

            const zip = new JSZip();
            const folder = zip.folder('live_photo');
            const total = 2;
            let successCount = 0;
            updateProgress(0, total, t('progress.downloading', { current: 0, total }));

            const videoUrl = getDirectUrl(videoData.url);
            const coverUrl = getDirectUrl(videoData.cover || videoData.coverUrl);

            const tasks = [];
            if (coverUrl) {
                tasks.push(
                    fetch(coverUrl, { signal })
                        .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); })
                        .then(blob => { folder.file('live_cover.jpg', blob); successCount++; })
                        .catch(e => { if (e.name !== 'AbortError') console.error('Cover download failed', e); })
                );
            }
            if (videoUrl) {
                tasks.push(
                    fetch(videoUrl, { signal })
                        .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); })
                        .then(blob => { folder.file('live_video.mp4', blob); successCount++; })
                        .catch(e => { if (e.name !== 'AbortError') console.error('Video download failed', e); })
                );
            }

            try { await Promise.all(tasks); } catch (e) { if (e.name === 'AbortError') throw e; }

            updateProgress(total, total, t('progress.downloading', { current: total, total }));

            if (signal.aborted) { setProgressError(t('progress.cancelled')); setTimeout(hideProgress, 1500); return; }

            if (successCount > 0) {
                updateProgress(total, total, t('progress.compressing'));
                const content = await zip.generateAsync({ type: 'blob' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'live_photo_' + Date.now() + '.zip';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(link.href); }, 2000);
                setProgressComplete(t('toast.downloadSingleSuccess', { count: successCount }));
                showToast(t('toast.downloadSingleSuccess', { count: successCount }));
            } else {
                setProgressError(t('toast.singleDownloadAllFailed'));
                showToast(t('toast.singleDownloadAllFailed'));
            }
        } catch (e) {
            if (e.name === 'AbortError') {
                setProgressError(t('progress.cancelled'));
                setTimeout(hideProgress, 1500);
                return;
            }
            console.error(e);
            setProgressError(e.message || t('toast.zipError'));
        } finally {
            if (currentProgressController === controller) currentProgressController = null;
        }
    }

    // ----- Button loading state helper -----
    function setButtonLoading(btn, loading, loadingText) {
        if (!btn) return;
        if (loading) {
            btn._origHTML = btn.innerHTML;
            btn.classList.add('is-loading');
            btn.disabled = true;
            var text = loadingText || t('loading.title');
            btn.innerHTML = '<span class="btn-spinner"></span><span class="btn-label">' + text + '</span>';
        } else {
            btn.classList.remove('is-loading');
            btn.disabled = false;
            if (btn._origHTML) btn.innerHTML = btn._origHTML;
        }
    }

    // Convenience wrappers for specific loading states
    function setParseLoading(btn, loading) {
        setButtonLoading(btn, loading, t('loading.title'));
    }

    function setDownloadLoading(btn, loading) {
        setButtonLoading(btn, loading, t('download.loading'));
    }

    function withDebounce(fn, delay) {
        if (delay === undefined) delay = 800;
        var locked = false;
        return function (btn) {
            console.log('[DEBUG] withDebounce called, locked=' + locked + ', btn=' + !!btn);
            if (locked) { console.warn('[DEBUG]   BLOCKED: locked=true, returning'); return; }
            locked = true;
            console.log('[DEBUG]   locked set to true');
            if (btn) setButtonLoading(btn, true);
            var rest = Array.prototype.slice.call(arguments, 1);
            var result = fn.apply(this, rest);
            var unlock = function () {
                setTimeout(function () {
                    console.log('[DEBUG]   unlock timeout fired, releasing locked');
                    locked = false;
                    if (btn) setButtonLoading(btn, false);
                }, delay);
            };
            if (result && typeof result.then === 'function') {
                console.log('[DEBUG]   result is Promise, attaching .finally(unlock)');
                return result.finally(unlock);
            }
            console.log('[DEBUG]   result is not Promise, calling unlock immediately');
            unlock();
            return result;
        };
    }

    // Shortcut: wraps an event handler with button state from event target
    function withButtonGuard(fn) {
        return function (e) {
            var btn = e.currentTarget;
            if (btn._locked) return;
            btn._locked = true;
            setButtonLoading(btn, true);
            var result = fn.call(this, e);
            var restore = function () {
                btn._locked = false;
                setButtonLoading(btn, false);
            };
            if (result && typeof result.then === 'function') {
                return result.then(restore, restore);
            }
            restore();
            return result;
        };
    }

    // ----- Toast System -----
    function showToast(message) {
        var toast = document.getElementById('toast-message');
        if (toast) {
            toast.classList.add('toast-leave');
            setTimeout(function () {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
                createToast(message);
            }, 250);
        } else {
            createToast(message);
        }
    }

    function createToast(message) {
        var toast = document.createElement('div');
        toast.id = 'toast-message';
        toast.className = 'fixed top-20 right-4 z-[100] flex items-center gap-2 rounded-xl bg-toast-bg dark:bg-slate-800 text-white px-5 py-3 shadow-xl toast-enter';
        toast.style.backgroundColor = 'var(--toast-bg, #0f172a)';
        toast.innerHTML = '<i class="fa fa-check-circle text-emerald-400" aria-hidden="true"></i><span>' + escapeHtml(message) + '</span>';
        document.body.appendChild(toast);
        setTimeout(function () {
            toast.classList.add('toast-leave');
            toast.classList.remove('toast-enter');
            setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 250);
        }, 3000);
    }

    // ----- Original helpers -----
    function loadScriptOnce(src) {
        var key = encodeURIComponent(src);
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[data-src-once="' + key + '"]');
            if (existing) {
                if (existing.dataset.loaded === '1') { resolve(); return; }
                existing.addEventListener('load', function () { resolve(); }, { once: true });
                existing.addEventListener('error', function () { reject(new Error('Script load failed')); }, { once: true });
                return;
            }
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.dataset.srcOnce = key;
            script.onload = function () { script.dataset.loaded = '1'; resolve(); };
            script.onerror = function () { reject(new Error('Script load failed')); };
            document.head.appendChild(script);
        });
    }

    function ensureJSZip() {
        if (typeof window.JSZip !== 'undefined') return Promise.resolve();
        if (!jsZipPromise) jsZipPromise = loadScriptOnce(JSZIP_CDN);
        return jsZipPromise;
    }

    function isValidUrl(url) {
        if (!url || typeof url !== 'string') return false;
        if (memoCache.urlValid.has(url)) return memoCache.urlValid.get(url);
        var valid = false;
        try { new URL(url); valid = true; } catch (e) { valid = false; }
        memoCache.urlValid.set(url, valid);
        return valid;
    }

    var ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    var ESCAPE_REGEX = /[&<>"']/g;

    function escapeHtml(unsafe) {
        if (typeof unsafe === 'object' && unsafe !== null) return '';
        if (!unsafe) return '';
        var str = unsafe.toString();
        return str.replace(ESCAPE_REGEX, function (m) { return ESCAPE_MAP[m]; });
    }

    function cleanUrl(url) {
        if (!url) return '';
        var key = typeof url === 'string' ? url : JSON.stringify(url);
        if (memoCache.urlClean.has(key)) return memoCache.urlClean.get(key);
        var result;
        if (Array.isArray(url)) result = cleanUrl(url[0]);
        else if (typeof url === 'object' && url !== null) {
            result = cleanUrl(url.url || url.src || url.href || (url.url_list ? url.url_list[0] : '') || '');
        } else {
            result = url.replace(/`/g, '') || '';
        }
        memoCache.urlClean.set(key, result);
        return result;
    }

    function getDirectUrl(url) { return cleanUrl(url); }

    function downloadFile(url, btn) {
        if (!url || typeof url !== 'string') return;
        if (btn) setDownloadLoading(btn, true);
        var a = document.createElement('a');
        a.href = url;
        a.download = url.split('/').pop().split('?')[0] || 'download';
        a.target = '_blank';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            if (a.parentNode) a.parentNode.removeChild(a);
            if (btn) setDownloadLoading(btn, false);
        }, 100);
    }

    var NUM_CACHE = new Map();
    function formatNumber(num) {
        if (num === undefined || num === null || typeof num === 'object') return '0';
        if (NUM_CACHE.has(num)) return NUM_CACHE.get(num);
        var result = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (NUM_CACHE.size > 1000) NUM_CACHE.clear();
        NUM_CACHE.set(num, result);
        return result;
    }

    function formatDate(timestamp) {
        if (!timestamp) return '';
        if (timestamp.toString().length <= 10) timestamp = timestamp * 1000;
        var date = new Date(timestamp);
        return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0') + ' ' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
    }

    function hideAllContainers() {
        ['result-container', 'loading-container', 'error-container', 'images-container'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
    }

    function showError(message) {
        hideAllContainers();
        var errorContainer = document.getElementById('error-container');
        var errorMessage = document.getElementById('error-message');
        if (errorContainer && errorMessage) {
            errorMessage.textContent = message;
            errorContainer.classList.remove('hidden');
            errorContainer.style.cssText = 'opacity:0;transform:translateY(10px);transition:opacity .3s ease,transform .3s ease';
            requestAnimationFrame(function () {
                errorContainer.style.opacity = '1';
                errorContainer.style.transform = 'translateY(0)';
            });
        }
    }

    function createInfoCard(label, value) {
        var card = document.createElement('div');
        card.className = 'bg-slate-50/90 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50';
        var labelEl = document.createElement('div');
        labelEl.className = 'text-xs font-medium text-slate-500 uppercase tracking-wide mb-1';
        labelEl.textContent = label;
        var valueEl = document.createElement('div');
        valueEl.className = 'font-medium text-slate-800 dark:text-slate-200';
        valueEl.textContent = escapeHtml(value);
        card.append(labelEl, valueEl);
        return card;
    }

    function updateVideoPreview(previewVideo, videoPlaceholder, videoCover, videoData) {
        previewVideo.src = '';
        videoCover.src = '';
        var coverUrl = cleanUrl(videoData.cover || videoData.coverUrl);
        if (videoData.url) {
            previewVideo.src = getDirectUrl(videoData.url);
            previewVideo.classList.remove('hidden');
            videoPlaceholder.classList.add('hidden');
            videoCover.classList.add('hidden');
            if (coverUrl) previewVideo.poster = coverUrl;
        } else {
            previewVideo.classList.add('hidden');
            if (coverUrl) {
                videoCover.src = coverUrl;
                videoCover.classList.remove('hidden');
                videoPlaceholder.classList.add('hidden');
            } else {
                videoCover.classList.add('hidden');
                videoPlaceholder.classList.remove('hidden');
            }
        }
    }

    function createMusicContainer(videoData) {
        var music = videoData.music || {};
        var musicContainer = document.createElement('div');
        var hasValidMusic = music && music.url && isValidUrl(music.url);

        if (!hasValidMusic) {
            musicContainer.className = 'bg-slate-50/90 dark:bg-slate-800/80 rounded-2xl p-6 mb-6 mt-6 border border-slate-100 dark:border-slate-700/50';
            var row = document.createElement('div');
            row.className = 'flex items-center gap-4';
            var icon = document.createElement('div');
            icon.className = 'w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0';
            icon.innerHTML = '<i class="fa fa-music text-primary" aria-hidden="true"></i>';
            var text = document.createElement('div');
            var h = document.createElement('h4');
            h.className = 'font-semibold text-slate-800 dark:text-slate-200';
            h.textContent = t('music.title');
            text.appendChild(h);
            row.append(icon, text);
            musicContainer.appendChild(row);
            return musicContainer;
        }

        var musicTitle = escapeHtml(music.title || t('music.unknown'));
        var musicAuthor = escapeHtml(music.author || t('music.unknownAuthor'));
        var musicAvatar = music.avatar ? cleanUrl(music.avatar) : '';
        var musicUrl = cleanUrl(music.url);

        musicContainer.className = 'bg-slate-50/90 dark:bg-slate-800/80 rounded-2xl p-6 mb-6 mt-6 border border-slate-100 dark:border-slate-700/50';
        var flex = document.createElement('div');
        flex.className = 'flex items-start gap-4';

        if (musicAvatar) {
            var avatarImg = document.createElement('img');
            avatarImg.src = musicAvatar;
            avatarImg.className = 'w-20 h-20 rounded-xl object-cover shrink-0';
            avatarImg.alt = '';
            avatarImg.onerror = function () { this.onerror = null; this.src = 'https://via.placeholder.com/80x80?text=Cover'; };
            flex.appendChild(avatarImg);
        }

        var info = document.createElement('div');
        info.className = 'flex-1 min-w-0';
        var meta = document.createElement('div');
        meta.className = 'mb-4';
        var titleHeading = document.createElement('h4');
        titleHeading.className = 'font-semibold text-slate-800 dark:text-slate-200';
        titleHeading.textContent = musicTitle;
        var authorPara = document.createElement('p');
        authorPara.className = 'text-sm text-slate-500';
        authorPara.textContent = musicAuthor;
        meta.append(titleHeading, authorPara);

        var controlsDiv = document.createElement('div');
        controlsDiv.className = 'flex flex-col sm:flex-row items-stretch sm:items-center gap-3';
        var audio = document.createElement('audio');
        audio.controls = true;
        audio.className = 'flex-1 w-full min-w-0';
        var source = document.createElement('source');
        source.src = musicUrl;
        source.type = 'audio/mpeg';
        audio.appendChild(source);
        var dl = document.createElement('button');
        dl.type = 'button';
        dl.className = 'shrink-0 rounded-xl bg-primary text-white px-4 py-2 hover:opacity-90 transition-opacity';
        dl.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i>';
        dl.addEventListener('click', function () { downloadFile(musicUrl, dl); });
        controlsDiv.append(audio, dl);
        info.append(meta, controlsDiv);
        flex.appendChild(info);
        musicContainer.appendChild(flex);
        return musicContainer;
    }

    function createAuthorContainer(videoData) {
        var authorNameStr = '';
        if (videoData.author) {
            if (typeof videoData.author === 'string') authorNameStr = videoData.author;
            else if (typeof videoData.author === 'object') {
                authorNameStr = videoData.author.name || videoData.author.nickname || videoData.author.user_name || '';
            }
        }
        var avatarUrl = '';
        if (videoData.avatar) avatarUrl = cleanUrl(videoData.avatar);
        else if (videoData.author && typeof videoData.author === 'object') {
            avatarUrl = cleanUrl(videoData.author.avatar || videoData.author.avatar_thumb || videoData.author.cover || '');
        }
        var diggCount = videoData && videoData.extra && videoData.extra.statistics ? videoData.extra.statistics.digg_count : undefined;
        var likeCountNum = '0';
        if (diggCount !== undefined && diggCount !== null && typeof diggCount !== 'object') {
            likeCountNum = formatNumber(diggCount);
        }
        var hasAuthor = !!authorNameStr;
        var hasAvatar = !!avatarUrl;
        if (!hasAuthor && !hasAvatar && !(likeCountNum !== '0' || diggCount === 0)) return null;

        var wrap = document.createElement('div');
        wrap.className = 'flex items-center gap-4 mb-6';
        if (hasAvatar) {
            var img = document.createElement('img');
            img.src = avatarUrl;
            img.className = 'w-12 h-12 rounded-full object-cover ring-2 ring-white shadow';
            img.alt = '';
            img.onerror = function () { this.onerror = null; this.src = 'https://via.placeholder.com/48x48?text=U'; };
            wrap.appendChild(img);
        }
        var info = document.createElement('div');
        if (hasAuthor) {
            var name = document.createElement('div');
            name.className = 'font-semibold text-slate-800 dark:text-slate-200';
            name.textContent = authorNameStr;
            info.appendChild(name);
        }
        if (likeCountNum !== '0' || diggCount === 0) {
            var likes = document.createElement('div');
            likes.className = 'text-sm text-slate-500';
            likes.textContent = t('info.likes', { count: likeCountNum });
            info.appendChild(likes);
        }
        if (info.children.length) wrap.appendChild(info);
        return wrap;
    }

    function createInfoContainer(videoData) {
        var grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6';
        grid.appendChild(createInfoCard(t('info.title'), videoData.title || t('info.unknownTitle')));
        var publishTs = (videoData.extra && videoData.extra.create_time) || videoData.time;
        grid.appendChild(createInfoCard(t('info.publishTime'), formatDate(publishTs) || t('info.unknownTime')));
        var typeText = t('info.unknownType');
        var type = videoData.type || (videoData.images && videoData.images.length > 0 ? 'images' : 'video');
        if (['video', 'videos'].indexOf(type) !== -1) typeText = t('info.video');
        else if (['image', 'images', 'normal'].indexOf(type) !== -1) typeText = t('info.images');
        else if (type === 'live') typeText = t('info.live');
        else typeText = videoData.images && videoData.images.length > 0 ? t('info.images') : t('info.video');
        grid.appendChild(createInfoCard(t('info.type'), typeText));
        var qualityText = videoData.quality || t('info.unknownQuality');
        grid.appendChild(createInfoCard(t('info.quality'), qualityText));
        return grid;
    }

    function createStatsAndTags(videoData) {
        var extra = videoData && videoData.extra || {};
        var stats = extra.statistics || {};
        var hasStats = ['digg_count', 'comment_count', 'collect_count', 'share_count', 'admire_count', 'play_count'].some(function (k) { return Number(stats[k] || 0) > 0; });
        var hashtags = Array.isArray(extra.hashtags) ? extra.hashtags : [];
        var tags = Array.isArray(extra.video_tags) ? extra.video_tags : [];
        if (!hasStats && !hashtags.length && !tags.length) return null;

        var wrap = document.createElement('div');
        wrap.className = 'space-y-4 mb-6';

        if (hasStats) {
            var statsWrap = document.createElement('div');
            statsWrap.className = 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3';
            var statMap = [
                [t('stat.like'), 'digg_count'],
                [t('stat.comment'), 'comment_count'],
                [t('stat.collect'), 'collect_count'],
                [t('stat.share'), 'share_count'],
                [t('stat.admire'), 'admire_count'],
                [t('stat.play'), 'play_count'],
            ];
            statMap.forEach(function (pair) {
                statsWrap.appendChild(createInfoCard(pair[0], formatNumber(stats[pair[1]] || 0)));
            });
            wrap.appendChild(statsWrap);
        }

        if (hashtags.length || tags.length) {
            var chips = document.createElement('div');
            chips.className = 'flex flex-wrap gap-2';
            hashtags.forEach(function (item) {
                var chip = document.createElement('span');
                chip.className = 'inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 text-xs font-medium';
                chip.textContent = '#' + (item.name || '');
                chips.appendChild(chip);
            });
            tags.forEach(function (item) {
                var chip = document.createElement('span');
                chip.className = 'inline-flex items-center rounded-full bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 px-3 py-1 text-xs font-medium';
                chip.textContent = item.name || '';
                chips.appendChild(chip);
            });
            wrap.appendChild(chips);
        }
        return wrap;
    }

    function createVideoBackupList(container, videoData) {
        if (!Array.isArray(videoData.video_backup) || !videoData.video_backup.length) return;
        var section = document.createElement('div');
        section.className = 'rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 p-4 mb-6';
        var title = document.createElement('h4');
        title.className = 'font-semibold text-slate-800 dark:text-slate-200 mb-3';
        title.textContent = t('backup.title', { count: videoData.video_backup.length });
        section.appendChild(title);

        var list = document.createElement('div');
        list.className = 'space-y-2';
        videoData.video_backup.forEach(function (item, idx) {
            var isObj = item && typeof item === 'object';
            var lineUrl = getDirectUrl(isObj ? item.url : item);
            if (!lineUrl) return;
            var quality = isObj ? (item.quality || item.label || t('quality.line', { idx: idx + 1 })) : t('quality.line', { idx: idx + 1 });
            var row = document.createElement('div');
            row.className = 'flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800 px-3 py-2';
            var tag = document.createElement('span');
            tag.className = 'inline-flex items-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 text-xs font-semibold';
            tag.textContent = quality;
            var downloadBtn = document.createElement('a');
            downloadBtn.href = lineUrl;
            downloadBtn.target = '_blank';
            downloadBtn.rel = 'noopener noreferrer';
            downloadBtn.className = 'ml-auto rounded-lg bg-primary text-white px-3 py-1.5 text-xs hover:opacity-90';
            downloadBtn.innerHTML = '<i class="fa fa-download mr-1" aria-hidden="true"></i><span data-i18n="overlay.dl">下载</span>';
            var copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className = 'rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-700';
            copyBtn.innerHTML = '<i class="fa fa-link mr-1" aria-hidden="true"></i>Copy';
            copyBtn.addEventListener('click', function () { copyUrl(lineUrl, t('copy.video')); });
            row.append(tag, copyBtn, downloadBtn);
            list.appendChild(row);
        });
        section.appendChild(list);
        container.appendChild(section);
    }

    function createVideoPlayer(container, videoData) {
        var previewContainer = document.createElement('div');
        previewContainer.className = UI.previewWrap;
        var videoPlaceholder = document.createElement('div');
        videoPlaceholder.id = 'video-placeholder';
        videoPlaceholder.className = UI.placeholder;
        videoPlaceholder.innerHTML = '<i class="fa fa-film text-5xl text-slate-300" aria-hidden="true"></i>';
        var previewVideo = document.createElement('video');
        previewVideo.id = 'preview-video';
        previewVideo.className = 'w-full hidden bg-black';
        previewVideo.setAttribute('controls', '');
        previewVideo.setAttribute('playsinline', '');
        var videoCover = document.createElement('img');
        videoCover.id = 'video-cover';
        videoCover.className = 'w-full hidden';
        videoCover.alt = 'video cover';

        updateVideoPreview(previewVideo, videoPlaceholder, videoCover, videoData);
        previewContainer.append(videoPlaceholder, previewVideo, videoCover);
        container.appendChild(previewContainer);

        var hasBackup = Array.isArray(videoData.video_backup) && videoData.video_backup.length > 0;
        var allQualities = [];
        if (videoData.url) {
            allQualities.push({ label: videoData.quality || 'Original', url: videoData.url, isMain: true });
        }
        if (hasBackup) {
            videoData.video_backup.forEach(function (item) {
                if (item.url) {
                    allQualities.push({ label: item.quality || item.label || 'Backup', url: item.url, isMain: false });
                }
            });
        }

        var downloadBtn = document.createElement('a');
        downloadBtn.id = 'download-btn';
        downloadBtn.href = cleanUrl(videoData.url);
        downloadBtn.className = UI.btnPrimary + ' download-pulse';
        downloadBtn.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i><span>' + t('download.single') + '</span>';
        downloadBtn.addEventListener('click', function () { this.classList.remove('download-pulse'); });
        container.appendChild(downloadBtn);

        if (allQualities.length > 1) {
            var qualityWrap = document.createElement('div');
            qualityWrap.className = 'mt-3 flex flex-wrap gap-2 items-center';
            var label = document.createElement('span');
            label.className = 'text-sm text-slate-500 font-medium mr-1';
            label.textContent = t('quality.select');
            qualityWrap.appendChild(label);

            var activeQuality = null;
            allQualities.forEach(function (q, idx) {
                var btn = document.createElement('button');
                btn.type = 'button';
                var isActive = q.isMain && idx === 0;
                btn.className = isActive
                    ? 'px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium'
                    : 'px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors';
                btn.textContent = q.label;
                btn.dataset.url = q.url;
                btn.dataset.quality = q.label;
                if (isActive) {
                    btn.dataset.active = 'true';
                    activeQuality = { btn: btn, quality: q };
                }
                btn.addEventListener('click', function () {
                    if (activeQuality && activeQuality.btn !== btn) {
                        activeQuality.btn.className = 'px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors';
                        delete activeQuality.btn.dataset.active;
                    }
                    btn.className = 'px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium';
                    btn.dataset.active = 'true';
                    downloadBtn.href = cleanUrl(q.url);
                    downloadBtn.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i><span>' + t('download.single') + ' ' + q.label + '</span>';
                    if (previewVideo.src && previewVideo.src !== window.location.href) {
                        previewVideo.src = q.url;
                        previewVideo.classList.remove('hidden');
                        videoPlaceholder.classList.add('hidden');
                        videoCover.classList.add('hidden');
                    }
                });
                qualityWrap.appendChild(btn);
            });
            container.appendChild(qualityWrap);
        }
    }

    function initSwiper(swiperEl, options) {
        if (options === undefined) options = {};
        if (typeof window.Swiper === 'undefined') {
            swiperEl.querySelectorAll('.swiper-slide').forEach(function (slide) { slide.classList.add('mb-4'); });
            showToast(t('toast.swiperError'));
            return null;
        }
        try {
            return new window.Swiper(swiperEl, {
                loop: options.loop !== false,
                pagination: { el: swiperEl.querySelector('.swiper-pagination'), clickable: true },
                navigation: {
                    nextEl: swiperEl.querySelector('.swiper-button-next'),
                    prevEl: swiperEl.querySelector('.swiper-button-prev'),
                },
                swiperOptions: options.swiperOptions,
            });
        } catch (e) {
            console.error(e);
            swiperEl.querySelectorAll('.swiper-slide').forEach(function (slide) { slide.classList.add('mb-4'); });
            showToast(t('toast.swiperError'));
            return null;
        }
    }

    function createImageGallery(container, videoData) {
        var imagesContainer = document.createElement('div');
        imagesContainer.id = 'images-container';
        imagesContainer.className = 'swiper w-full mb-6 relative pb-8';

        var wrapper = document.createElement('div');
        wrapper.className = 'swiper-wrapper';

        videoData.images.forEach(function (img) {
            var slide = document.createElement('div');
            slide.className = 'swiper-slide relative group';
            var imgElement = document.createElement('img');
            imgElement.src = cleanUrl(img);
            imgElement.className = 'w-full h-96 object-cover rounded-2xl';
            imgElement.loading = 'lazy';
            imgElement.alt = '';
            imgElement.onerror = function () { this.onerror = null; this.src = 'https://via.placeholder.com/800x600?text=Error'; };
            var downloadBtn = document.createElement('button');
            downloadBtn.type = 'button';
            downloadBtn.className = 'absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl shadow-md transition-all opacity-0 group-hover:opacity-100 text-xs font-medium z-10';
            downloadBtn.innerHTML = '<i class="fa fa-download mr-1" aria-hidden="true"></i><span data-i18n="overlay.dl">下载</span>';
            downloadBtn.addEventListener('click', function () { downloadFile(cleanUrl(img), downloadBtn); });
            slide.append(imgElement, downloadBtn);
            wrapper.appendChild(slide);
        });

        var pagination = document.createElement('div');
        pagination.className = 'swiper-pagination gallery-pagination';
        var prevButton = document.createElement('div');
        prevButton.className = 'swiper-button-prev gallery-nav-button';
        var nextButton = document.createElement('div');
        nextButton.className = 'swiper-button-next gallery-nav-button';

        imagesContainer.append(wrapper, pagination, prevButton, nextButton);
        container.appendChild(imagesContainer);

        var downloadAllBtn = document.createElement('button');
        downloadAllBtn.type = 'button';
        downloadAllBtn.className = UI.btnPrimaryFull;
        downloadAllBtn.innerHTML = '<i class="fa fa-images" aria-hidden="true"></i><span>' + t('download.allImages', { count: videoData.images.length }) + '</span>';
        downloadAllBtn.addEventListener('click', withButtonGuard(function () {
            return ensureJSZip()
                .then(function () { return compressAndDownloadImages(videoData.images); })
                .catch(function () { showError(t('toast.zipLoadError')); });
        }));
        container.appendChild(downloadAllBtn);

        initSwiper(imagesContainer, { loop: true });
    }

    function copyUrl(url, type) {
        if (!url) {
            showError(t('error.noCopyUrl', { type: type }));
            return;
        }
        navigator.clipboard.writeText(url).then(function () {
            showToast(t('toast.copied'));
            var btn = document.activeElement;
            if (btn && btn.id && btn.id.indexOf('copy-') === 0) {
                btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-500');
                btn.innerHTML = '<i class="fa fa-check mr-2" aria-hidden="true"></i><span>' + t('toast.copied') + '</span>';
                setTimeout(function () {
                    btn.classList.remove('bg-emerald-500', 'text-white', 'border-emerald-500');
                    btn.innerHTML = '<i class="fa fa-link mr-2" aria-hidden="true"></i><span>' + t('copy.video') + '</span>';
                }, 2000);
            }
        }).catch(function () { showError(t('error.copyFailed', { type: type })); });
    }

    var videosjson = '';

    function bindCopyButtonEvents() {
        var coverBtn = document.getElementById('copy-cover-btn');
        if (coverBtn) coverBtn.addEventListener('click', function () { copyUrl(videosjson && videosjson.cover, t('copy.cover')); });
        var urlBtn = document.getElementById('copy-url-btn');
        if (urlBtn) urlBtn.addEventListener('click', function () { copyUrl(videosjson && videosjson.url, t('copy.video')); });
    }

    function checkSwiper() {
        if (typeof window.Swiper !== 'undefined') return;
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js';
        script.onload = function () {
            var ic = document.getElementById('images-container');
            if (ic && !ic.classList.contains('hidden')) initSwiper(ic);
        };
        script.onerror = function () { console.error('Swiper load failed'); };
        document.head.appendChild(script);
    }

    function createLiveGallery(container, videoData) {
        var livePhotos = videoData.live_photo || [];
        if (!livePhotos.length && videoData.url) {
            createLivePlayer(container, videoData);
            createVideoCopyButtons(container);
            return;
        }

        var galleryContainer = document.createElement('div');
        galleryContainer.className = 'swiper w-full mb-6 relative pb-8';
        var wrapper = document.createElement('div');
        wrapper.className = 'swiper-wrapper';

        livePhotos.forEach(function (item, index) {
            var slide = document.createElement('div');
            slide.className = 'swiper-slide relative group rounded-2xl overflow-hidden bg-black';
            var video = document.createElement('video');
            video.className = 'w-full h-96 object-contain bg-black';
            video.controls = true;
            video.loop = true;
            video.poster = cleanUrl(item.image);
            video.preload = index === 0 ? 'metadata' : 'none';
            var videoUrl = cleanUrl(item.video);
            video.src = getDirectUrl(videoUrl);

            var badge = document.createElement('div');
            badge.className = 'absolute top-3 left-3 bg-primary/90 text-white text-xs px-2 py-1 rounded-lg shadow z-10 pointer-events-none';
            badge.innerHTML = '<i class="fa fa-bolt mr-1" aria-hidden="true"></i><span data-i18n="overlay.live">实况</span> ' + (index + 1) + '/' + livePhotos.length;

            var btnGroup = document.createElement('div');
            btnGroup.className = 'absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20';
            var b1 = document.createElement('button');
            b1.type = 'button';
            b1.className = 'bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-lg shadow text-xs font-medium';
            b1.innerHTML = '<i class="fa fa-video mr-1" aria-hidden="true"></i><span data-i18n="overlay.video">视频</span>';
            b1.addEventListener('click', function (e) { e.stopPropagation(); downloadFile(videoUrl, b1); });
            var b2 = document.createElement('button');
            b2.type = 'button';
            b2.className = 'bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-lg shadow text-xs font-medium';
            b2.innerHTML = '<i class="fa fa-image mr-1" aria-hidden="true"></i><span data-i18n="overlay.cover">封面</span>';
            b2.addEventListener('click', function (e) { e.stopPropagation(); downloadFile(cleanUrl(item.image), b2); });
            btnGroup.append(b1, b2);
            slide.append(video, badge, btnGroup);
            wrapper.appendChild(slide);
        });

        var pagination = document.createElement('div');
        pagination.className = 'swiper-pagination gallery-pagination';
        var prevButton = document.createElement('div');
        prevButton.className = 'swiper-button-prev gallery-nav-button';
        var nextButton = document.createElement('div');
        nextButton.className = 'swiper-button-next gallery-nav-button';
        galleryContainer.append(wrapper, pagination, prevButton, nextButton);
        container.appendChild(galleryContainer);

        if (typeof window.Swiper !== 'undefined') {
            new window.Swiper(galleryContainer, {
                loop: livePhotos.length > 1,
                pagination: { el: pagination, clickable: true },
                navigation: { nextEl: nextButton, prevEl: prevButton },
                on: { slideChange: function () { galleryContainer.querySelectorAll('video').forEach(function (v) { v.pause(); }); } },
            });
        }

        var downloadAllBtn = document.createElement('button');
        downloadAllBtn.type = 'button';
        downloadAllBtn.className = UI.btnPrimaryFull;
        downloadAllBtn.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i><span>' + t('download.batchLive', { count: livePhotos.length * 2 }) + '</span>';
        downloadAllBtn.addEventListener('click', withButtonGuard(function () {
            return ensureJSZip()
                .then(function () { return compressAndDownloadLiveContent(livePhotos); })
                .catch(function () { showError(t('toast.zipLoadError')); });
        }));
        container.appendChild(downloadAllBtn);
    }

    function createLivePlayer(container, videoData) {
        var previewContainer = document.createElement('div');
        previewContainer.className = UI.previewWrap + ' relative';
        var videoPlaceholder = document.createElement('div');
        videoPlaceholder.id = 'video-placeholder';
        videoPlaceholder.className = UI.placeholder;
        videoPlaceholder.innerHTML = '<i class="fa fa-film text-5xl text-slate-300" aria-hidden="true"></i>';
        var previewVideo = document.createElement('video');
        previewVideo.id = 'preview-video';
        previewVideo.className = 'w-full hidden bg-black';
        previewVideo.setAttribute('controls', '');
        previewVideo.setAttribute('playsinline', '');
        previewVideo.loop = true;
        var videoCover = document.createElement('img');
        videoCover.id = 'video-cover';
        videoCover.className = 'w-full hidden';
        videoCover.alt = 'video cover';

        updateVideoPreview(previewVideo, videoPlaceholder, videoCover, videoData);
        previewContainer.append(videoPlaceholder, previewVideo, videoCover);

        var badge = document.createElement('div');
        badge.className = 'absolute top-4 left-4 bg-primary text-white text-xs px-2 py-1 rounded-lg shadow z-10';
        badge.innerHTML = '<i class="fa fa-bolt mr-1" aria-hidden="true"></i>Live';
        previewContainer.appendChild(badge);
        container.appendChild(previewContainer);

        var downloadBtnContainer = document.createElement('div');
        downloadBtnContainer.className = 'flex flex-col gap-3 mb-4';

        var downloadVideoBtn = document.createElement('a');
        downloadVideoBtn.id = 'download-btn';
        downloadVideoBtn.href = getDirectUrl(videoData.url);
        downloadVideoBtn.className = UI.btnPrimary;
        downloadVideoBtn.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i><span>' + t('download.singleLive') + '</span>';
        downloadBtnContainer.appendChild(downloadVideoBtn);

        var coverUrl2 = getDirectUrl(videoData.cover || videoData.coverUrl);
        if (coverUrl2) {
            var downloadCoverBtn = document.createElement('button');
            downloadCoverBtn.type = 'button';
            downloadCoverBtn.className = UI.btnOutline;
            downloadCoverBtn.innerHTML = '<i class="fa fa-image" aria-hidden="true"></i><span>' + t('download.coverLive') + '</span>';
            downloadCoverBtn.addEventListener('click', function () { downloadFile(coverUrl2, downloadCoverBtn); });
            downloadBtnContainer.appendChild(downloadCoverBtn);
        }
        container.appendChild(downloadBtnContainer);

        var downloadAllBtn = document.createElement('button');
        downloadAllBtn.type = 'button';
        downloadAllBtn.className = UI.btnPrimaryFull;
        downloadAllBtn.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i><span>' + t('download.batchLiveZip') + '</span>';
        downloadAllBtn.addEventListener('click', withButtonGuard(function () {
            return ensureJSZip()
                .then(function () { return compressAndDownloadSingleLive(videoData); })
                .catch(function () { showError(t('toast.zipLoadError')); });
        }));
        container.appendChild(downloadAllBtn);
    }

    function createVideoCopyButtons(container) {
        var wrap = document.createElement('div');
        wrap.className = 'flex flex-wrap gap-3 mb-6';
        var copyCoverBtn = document.createElement('button');
        copyCoverBtn.type = 'button';
        copyCoverBtn.id = 'copy-cover-btn';
        copyCoverBtn.className = UI.btnOutline;
        copyCoverBtn.innerHTML = '<i class="fa fa-link" aria-hidden="true"></i><span>' + t('copy.cover') + '</span>';
        var copyUrlBtn = document.createElement('button');
        copyUrlBtn.type = 'button';
        copyUrlBtn.id = 'copy-url-btn';
        copyUrlBtn.className = UI.btnOutline;
        copyUrlBtn.innerHTML = '<i class="fa fa-link" aria-hidden="true"></i><span>' + t('copy.video') + '</span>';
        wrap.append(copyCoverBtn, copyUrlBtn);
        container.appendChild(wrap);
    }

    function createImageCopyButtons(container) {
        var wrap = document.createElement('div');
        wrap.className = 'flex flex-wrap gap-3 mb-6';
        var copyCoverBtn = document.createElement('button');
        copyCoverBtn.type = 'button';
        copyCoverBtn.id = 'copy-cover-btn';
        copyCoverBtn.className = UI.btnOutline;
        copyCoverBtn.innerHTML = '<i class="fa fa-link" aria-hidden="true"></i><span>' + t('copy.cover') + '</span>';
        wrap.appendChild(copyCoverBtn);
        container.appendChild(wrap);
    }

    function showResult(videoData) {
        hideAllContainers();
        var resultContainer = document.getElementById('result-container');
        if (!resultContainer) return;

        resultContainer.innerHTML = '';
        resultContainer.classList.remove('hidden');
        resultContainer.style.cssText = 'opacity:0;transform:translateY(16px);transition:opacity .45s ease,transform .45s ease';
        requestAnimationFrame(function () {
            resultContainer.style.opacity = '1';
            resultContainer.style.transform = 'translateY(0)';
        });

        var contentWrapper = document.createElement('div');
        contentWrapper.className = 'border-t border-slate-200/80 dark:border-slate-700/50 pt-6';
        resultContainer.appendChild(contentWrapper);

        var title = document.createElement('h3');
        title.className = 'text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4';
        title.textContent = t('result.title');
        contentWrapper.appendChild(title);

        var authorContainer = createAuthorContainer(videoData);
        if (authorContainer) contentWrapper.appendChild(authorContainer);

        var type = videoData.type || (videoData.images && videoData.images.length > 0 ? 'images' : 'video');
        if (['video', 'videos'].indexOf(type) !== -1) {
            createVideoPlayer(contentWrapper, videoData);
            createVideoCopyButtons(contentWrapper);
            createVideoBackupList(contentWrapper, videoData);
        } else if (['image', 'images', 'normal'].indexOf(type) !== -1) {
            createImageGallery(contentWrapper, videoData);
            createImageCopyButtons(contentWrapper);
        } else if (type === 'live') {
            createLiveGallery(contentWrapper, videoData);
        } else if (videoData.images && videoData.images.length > 0) {
            createImageGallery(contentWrapper, videoData);
            createImageCopyButtons(contentWrapper);
        } else {
            createVideoPlayer(contentWrapper, videoData);
            createVideoCopyButtons(contentWrapper);
        }

        contentWrapper.appendChild(createInfoContainer(videoData));
        var statsAndTags = createStatsAndTags(videoData);
        if (statsAndTags) contentWrapper.appendChild(statsAndTags);
        var musicContainer = createMusicContainer(videoData);
        if (musicContainer && musicContainer.innerHTML.trim()) contentWrapper.appendChild(musicContainer);
    }

    function setupFAQToggle(root) {
        root.querySelectorAll('.faq-btn').forEach(function (button) {
            button.addEventListener('click', function () {
                var content = this.nextElementSibling;
                var icon = this.querySelector('i');
                var open = content.classList.contains('hidden');
                root.querySelectorAll('.faq-btn').forEach(function (other) {
                    var c = other.nextElementSibling;
                    var ic = other.querySelector('i');
                    if (c) c.classList.add('hidden');
                    if (ic) ic.classList.remove('rotate-180');
                });
                if (open) {
                    content.classList.remove('hidden');
                    if (icon) icon.classList.add('rotate-180');
                }
            });
        });
    }

    // ============================================================
    // Renderers
    // ============================================================
    function renderNavLinks() {
        var desktop = document.getElementById('nav-desktop');
        var mobile = document.getElementById('nav-mobile');
        var html = NAV_LINKS.map(function (l) {
            return '<a href="' + escapeHtml(l.href) + '" class="text-slate-600 hover:text-primary transition-colors">' + t(l.labelKey) + '</a>';
        }).join('');
        if (desktop) desktop.innerHTML = html;
        if (mobile) {
            var mobileHtml = NAV_LINKS.map(function (l) {
                return '<a href="' + escapeHtml(l.href) + '" class="text-slate-800 dark:text-slate-200 font-medium py-3 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b border-slate-100/80 dark:border-slate-700/30 last:border-0">' + t(l.labelKey) + '</a>';
            }).join('');
            mobile.innerHTML = mobileHtml;
        }
    }

    function renderHeroFeatures() {
        var el = document.getElementById('hero-features');
        if (!el) return;
        el.innerHTML = HERO_FEATURES.map(function (f) {
            return '<div class="inline-flex items-center gap-2 rounded-full bg-white/85 dark:bg-slate-800/75 border border-slate-200/60 dark:border-slate-700/40 px-5 py-2.5 shadow-sm" role="listitem"><i class="fa ' + escapeHtml(f.icon) + ' ' + escapeHtml(f.iconClass) + '" aria-hidden="true"></i><span class="font-medium text-slate-700 dark:text-slate-300 text-sm">' + t(f.textKey) + '</span></div>';
        }).join('');
    }

    function renderPlatformTabs() {
        var wrap = document.getElementById('platform-tabs');
        if (!wrap) return;
        wrap.innerHTML = PLATFORM_TABS.map(function (tItem) {
            var label = tItem.labelKey ? t(tItem.labelKey) : (tItem.label || tItem.key);
            var style = tItem.iconColor ? ' style="color:' + escapeHtml(tItem.iconColor) + '"' : '';
            return '<button type="button" role="tab" class="platform-btn' + (tItem.key === currentPlatform ? ' active' : '') + '" data-platform="' + escapeHtml(tItem.key) + '"><i class="fa ' + escapeHtml(tItem.icon) + ' mr-1" aria-hidden="true"' + style + '></i>' + escapeHtml(label) + '</button>';
        }).join('');
    }

    function renderPlatformGrid() {
        var grid = document.getElementById('platform-grid');
        if (!grid) return;
        grid.innerHTML = SUPPORTED_PLATFORMS.map(function (p) {
            var iconBlock = p.more
                ? '<div class="w-16 h-16 rounded-2xl bg-gradient-to-br ' + p.gradient + ' flex items-center justify-center mx-auto mb-4 shadow-inner"><i class="fa fa-ellipsis-h text-white text-2xl" aria-hidden="true"></i></div>'
                : '<a href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener noreferrer" class="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"><div class="w-16 h-16 rounded-2xl bg-gradient-to-br ' + p.gradient + ' flex items-center justify-center mx-auto mb-4 shadow-md"><img src="' + escapeHtml(p.img) + '" alt="" class="w-8 h-8 object-contain rounded-full" width="32" height="32" loading="lazy"></div></a>';
            return '<article class="' + UI.platformCard + '">' + iconBlock + '<h4 class="font-bold text-slate-900 dark:text-slate-100 mb-1">' + escapeHtml(p.name) + '</h4><p class="text-sm text-slate-600 dark:text-slate-400 leading-snug">' + escapeHtml(p.desc) + '</p></article>';
        }).join('');
    }

    function renderTutorial() {
        var wrap = document.getElementById('tutorial-steps');
        if (!wrap) return;
        wrap.innerHTML = TUTORIAL_STEPS.map(function (s) {
            return '<div class="text-center surface-card rounded-2xl p-6 border border-white/50 reveal"><div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center mx-auto mb-5 text-primary shadow-sm"><span class="text-xl font-bold">' + escapeHtml(s.step) + '</span></div><h4 class="font-bold text-slate-900 dark:text-slate-100 mb-2">' + t(s.titleKey) + '</h4><p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">' + t(s.bodyKey) + '</p></div>';
        }).join('');
        initReveal();
    }

    function renderFAQ() {
        var wrap = document.getElementById('faq-list');
        if (!wrap) return;
        wrap.innerHTML = FAQ_ITEMS.map(function (item) {
            return '<div class="surface-card rounded-2xl overflow-hidden border border-white/50 dark:border-slate-700/50"><button type="button" class="faq-btn w-full text-left p-5 sm:p-6 flex justify-between items-center gap-4 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"><span>' + t(item.qKey) + '</span><i class="fa fa-chevron-down text-slate-400 shrink-0 transition-transform" aria-hidden="true"></i></button><div class="faq-content hidden px-5 sm:px-6 pb-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100/80 dark:border-slate-700/50 pt-4">' + t(item.aKey) + '</div></div>';
        }).join('');
        setupFAQToggle(wrap);
    }

    function renderFooterLinks() {
        var ul = document.getElementById('footer-links');
        if (!ul) return;
        ul.innerHTML = FOOTER_LINKS.map(function (l) {
            return '<li><a href="' + escapeHtml(l.href) + '" class="text-slate-400 hover:text-white transition-colors">' + t(l.labelKey) + '</a></li>';
        }).join('');
    }

    // ============================================================
    // Init — Mobile Menu
    // ============================================================
    function initMobileMenu() {
        var menuToggle = document.getElementById('menu-toggle');
        var mobileMenu = document.getElementById('mobile-menu');
        if (!menuToggle || !mobileMenu) return;
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
            menuToggle.setAttribute('aria-expanded', String(!mobileMenu.classList.contains('hidden')));
        });
        mobileMenu.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                mobileMenu.classList.add('hidden');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ============================================================
    // Init — Parse Form (event delegation, bind once)
    // ============================================================
    var currentPlatform = 'all';
    var isParsing = false;

    function doParse(triggerSource) {
        triggerSource = triggerSource || 'unknown';
        console.log('[DEBUG] doParse() called, source=' + triggerSource);
        console.log('[DEBUG]   isParsing=' + isParsing);

        if (isParsing) {
            console.warn('[DEBUG]   BLOCKED: isParsing already true, returning');
            return Promise.resolve();
        }
        isParsing = true;
        var parseBtn = document.getElementById('parse-btn');
        var parseLoader = document.getElementById('parse-loader');

        console.log('[DEBUG]   Setting parseBtn disabled=' + !!parseBtn);
        if (parseBtn) {
            console.log('[DEBUG]   parseBtn before:', { disabled: parseBtn.disabled, className: parseBtn.className.substring(0, 60), innerHTML: parseBtn.innerHTML.substring(0, 80) });
            parseBtn.disabled = true;
        }

        var promise = (async function () {
            try {
                console.log('[DEBUG]   Async function STARTED');
                if (parseBtn) {
                    parseBtn.classList.add('scale-[0.98]');
                    setTimeout(function () { parseBtn.classList.remove('scale-[0.98]'); }, 180);
                }

                var rawInput = (document.getElementById('video-url') && document.getElementById('video-url').value.trim()) || '';
                console.log('[DEBUG]   rawInput="' + rawInput.substring(0, 50) + '"');
                if (!rawInput) {
                    showError(t('error.inputEmpty'));
                    if (parseBtn) {
                        parseBtn.disabled = false;
                        parseBtn.classList.remove('is-loading');
                    }
                    isParsing = false;
                    return;
                }

                var extractUrlFromText = function (text) {
                    var m = text.match(/https?:\/\/[^\s]+/gi);
                    return m ? m[0] : null;
                };

                var url = extractUrlFromText(rawInput) || rawInput;
                console.log('[DEBUG]   extracted URL="' + url.substring(0, 80) + '"');
                if (!isValidUrl(url)) {
                    showError(t('error.invalidUrl'));
                    if (parseBtn) {
                        parseBtn.disabled = false;
                        parseBtn.classList.remove('is-loading');
                    }
                    isParsing = false;
                    return;
                }

                var urlInput = document.getElementById('video-url');
                if (urlInput) urlInput.value = url;

                hideAllContainers();
                var loadingContainer = document.getElementById('loading-container');
                if (loadingContainer) loadingContainer.classList.remove('hidden');
                if (parseLoader) parseLoader.classList.remove('hidden');

                var apiUrl = PLATFORM_API_MAP[currentPlatform] || PLATFORM_API_MAP.all;
                console.log('[DEBUG]   Fetching API: ' + apiUrl);
                console.log('[DEBUG]   currentPlatform=' + currentPlatform);
                var controller = new AbortController();
                var timeoutId = setTimeout(function () { controller.abort(); }, 15000);
                var response = await fetch(apiUrl + '?url=' + encodeURIComponent(url), { signal: controller.signal });
                clearTimeout(timeoutId);
                console.log('[DEBUG]   Fetch response status=' + response.status);

                if (!response.ok) throw new Error('HTTP ' + response.status);
                var data = await response.json();
                console.log('[DEBUG]   Response JSON code=' + data.code + ' success=' + data.success);

                if (data.code === 200) {
                    videosjson = data.data;
                    showResult(videosjson);
                    bindCopyButtonEvents();
                    console.log('[DEBUG]   Result displayed OK');
                } else {
                    showError(data.msg || t('error.parseFailed'));
                    console.log('[DEBUG]   Error response: ' + (data.msg || t('error.parseFailed')));
                }
            } catch (error) {
                console.error('[DEBUG] Parse error:', error);
                showError(error.name === 'AbortError' ? t('error.timeout') : t('error.network'));
            } finally {
                console.log('[DEBUG]   FINALLY: restoring state');
                if (parseLoader) parseLoader.classList.add('hidden');
                var loadingContainer2 = document.getElementById('loading-container');
                if (loadingContainer2) loadingContainer2.classList.add('hidden');
                isParsing = false;
                // 关键修复：必须在这里恢复按钮可用状态
                if (parseBtn) {
                    parseBtn.disabled = false;
                    console.log('[DEBUG]   parseBtn restored: disabled=false');
                }
                console.log('[DEBUG]   FINALLY complete, isParsing=' + isParsing);
            }
        })();

        return promise;
    }

    function bindParseForm() {
        var card = document.querySelector('.surface-card');
        if (!card || parseFormHandlersInstalled) return;
        parseFormHandlersInstalled = true;

        // Delegation: platform tabs
        var tabsEl = document.getElementById('platform-tabs');
        if (tabsEl) {
            tabsEl.addEventListener('click', function (e) {
                var btn = e.target.closest('.platform-btn');
                if (!btn) return;
                tabsEl.querySelectorAll('.platform-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                currentPlatform = btn.getAttribute('data-platform') || 'all';
            });
        }
        // 恢复上次选中的平台，如无则默认 "全部"
        var restoreBtn = currentPlatform !== 'all'
            ? document.querySelector('.platform-btn[data-platform="' + currentPlatform + '"]')
            : null;
        if (restoreBtn) {
            restoreBtn.classList.add('active');
        } else {
            var allBtn = document.querySelector('.platform-btn[data-platform="all"]');
            if (allBtn) allBtn.classList.add('active');
            currentPlatform = 'all';
        }

        // Direct: clear button
        var clearBtnDirect = document.getElementById('clear-btn');
        if (clearBtnDirect) {
            clearBtnDirect.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var input = document.getElementById('video-url');
                if (input) input.value = '';
                hideAllContainers();
                clearBtnDirect.classList.add('animate-spin');
                setTimeout(function () { clearBtnDirect.classList.remove('animate-spin'); }, 400);
            });
        }

        // Delegation: parse button (with debounce wrapper)
        var debouncedParse = withDebounce(doParse, 300);

        // 方案A: 直接在按钮上绑定（绕过可能的冒泡阻断）
        var parseBtnDirect = document.getElementById('parse-btn');
        if (parseBtnDirect) {
            parseBtnDirect.addEventListener('click', function (e) {
                console.log('[DIRECT-BTN] Parse button DIRECT click caught!');
                console.log('[DIRECT-BTN] disabled=' + this.disabled + ' isParsing=' + isParsing);
                e.stopPropagation();
                debouncedParse(this);
            });
            console.log('[BIND] Direct click listener attached to #parse-btn');
        } else {
            console.warn('[BIND] #parse-btn NOT FOUND!');
        }

        // 方案B: card 委托（原有方式，带详细错误捕获）
        card.addEventListener('click', function (e) {
            try {
                console.log('[DEBUG] Card click event, target=', e.target.id || e.target.tagName + '.' + (e.target.className || '').toString().substring(0, 30));
                var btn = e.target.closest('#parse-btn');
                if (btn) {
                    console.log('[DEBUG] Parse button clicked via delegation! disabled=' + btn.disabled);
                    debouncedParse(btn);
                }
            } catch (err) {
                console.error('[DEBUG] ERROR in card click handler:', err);
            }
        });

        // 全局点击调试: 捕获阶段记录所有点击，确认事件是否到达
        document.addEventListener('click', function (e) {
            var targetId = e.target.id ? '#' + e.target.id : '';
            var tag = e.target.tagName.toLowerCase();
            var cls = (e.target.className || '').toString().substring(0, 30);
            console.log('[GLOBAL-CLICK] ' + tag + targetId + '.' + cls + ' at (' + e.clientX + ',' + e.clientY + ')');
        }, true);

        // Keyboard shortcuts (bind once on document)
        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey && event.key === 'v') {
                setTimeout(function () {
                    var urlInput = document.getElementById('video-url');
                    if (urlInput && urlInput.value.trim()) {
                        console.log('[DEBUG] Ctrl+V paste detected, value=' + urlInput.value.trim().substring(0, 50));
                        // 粘贴自动解析: 直接调用 doParse, 不走 debounce
                        // 避免 withDebounce.locked 导致后续按钮点击被拦截
                        if (!isParsing) doParse('ctrl-v-paste');
                        else console.warn('[DEBUG]   Ctrl+V blocked: isParsing=' + isParsing);
                    }
                }, 120);
            }
            if (event.key === 'Escape') {
                hideAllContainers();
                var inp = document.getElementById('video-url');
                if (inp) inp.value = '';
            }
        });
    }

    // ============================================================
    // Init — Error Dismiss
    // ============================================================
    function initErrorDismiss() {
        document.addEventListener('click', function (e) {
            var target = e.target.closest('[data-dismiss-error]');
            if (target) target.classList.add('hidden');
        });
    }

    // ============================================================
    // Init — Navbar Scroll
    // ============================================================
    function initNavbarScroll() {
        var navbar = document.getElementById('navbar');
        if (!navbar) return;
        window.addEventListener('scroll', function () {
            var compact = window.scrollY > 40;
            navbar.classList.toggle('shadow-card', compact);
            navbar.classList.toggle('py-2', compact);
            navbar.classList.toggle('py-4', !compact);
        });
    }

    // ============================================================
    // Init — Theme
    // ============================================================
    function setupTheme() {
        var themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', toggleTheme);
        }
        var theme = localStorage.getItem('themeMode') || 'auto';
        if (theme === 'auto' || theme === null) {
            var mq = window.matchMedia('(prefers-color-scheme: dark)');
            mq.addEventListener('change', function (e) {
                if (localStorage.getItem('themeMode') === 'auto' || !localStorage.getItem('themeMode')) {
                    document.documentElement.classList.toggle('dark', e.matches);
                }
            });
        }
        applyTheme(getPreferredTheme());
    }

    // ============================================================
    // Init — Share
    // ============================================================
    function setupShare() {
        var shareBtn = document.getElementById('share-btn');
        if (!shareBtn) return;
        shareBtn.addEventListener('click', async function () {
            try {
                if (navigator.share) {
                    await navigator.share({ title: 'Video Parser', text: 'I used this tool to parse a video, you can try too', url: window.location.href });
                } else {
                    await navigator.clipboard.writeText(window.location.href);
                    showToast(t('toast.shareCopied'));
                }
            } catch (error) {
                showToast(t('toast.shareError'));
                console.error(error);
            }
        });
    }

    // ============================================================
    // Init — Progress Cancel
    // ============================================================
    function setupProgressCancel() {
        var cancelBtn = document.getElementById('progress-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                if (currentProgressController) {
                    currentProgressController.abort();
                    currentProgressController = null;
                    setProgressError(t('progress.cancelled'));
                    setTimeout(hideProgress, 1500);
                } else {
                    hideProgress();
                }
            });
        }
        var closeBtn = document.getElementById('progress-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () { hideProgress(); });
        }
    }

    // ============================================================
    // Init — Lang switcher
    // ============================================================
    function setupLangSwitcher() {
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.addEventListener('click', function () { setLang(btn.dataset.lang); });
        });
    }

    // ============================================================
    // Main Init
    // ============================================================
    function init() {
        var y = document.getElementById('footer-year');
        if (y) y.textContent = String(new Date().getFullYear());

        var savedLang = localStorage.getItem('preferredLang') || 'zh-CN';
        setLang(savedLang);

        setupTheme();
        setupLangSwitcher();
        setupShare();
        setupProgressCancel();

        renderNavLinks();
        renderHeroFeatures();
        renderPlatformTabs();
        renderPlatformGrid();
        renderTutorial();
        renderFAQ();
        renderFooterLinks();

        initMobileMenu();
        initErrorDismiss();
        initNavbarScroll();
        bindParseForm();
        checkSwiper();
        initReveal();

        setTimeout(initParticles, 300);

        // 关键调试：在 document 冒泡阶段也加日志，确认事件是否完成完整生命周期
        document.addEventListener('click', function (e) {
            var tag = (e.target.id ? '#' + e.target.id : '') || '';
            console.log('[BUBBLE-DOC] ' + e.target.tagName + tag + ' at (' + e.clientX + ',' + e.clientY + ')'
                + ' eventPhase=' + e.eventPhase);
            // 检查是否有元素调用了 stopPropagation
            console.log('[BUBBLE-DOC] cancelBubble=' + e.cancelBubble + ' defaultPrevented=' + e.defaultPrevented);
        });

        // 按钮状态定时监控器: 每 3 秒输出 parse-btn 当前状态
        setInterval(function () {
            var btn = document.getElementById('parse-btn');
            if (!btn) return;
            var style = getComputedStyle(btn);
            var rect = btn.getBoundingClientRect();
            // 用 elementFromPoint 检查按钮位置上实际是什么元素
            var elAtCenter = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
            var elName = elAtCenter ? (elAtCenter.id ? '#' + elAtCenter.id : elAtCenter.tagName) : 'null';
            console.log('[MONITOR] btn: disabled=' + btn.disabled + ' pe=' + style.pointerEvents
                + ' vis=' + style.visibility + ' disp=' + style.display
                + ' elemAtCenter=' + elName
                + ' isParsing=' + isParsing);
        }, 3000);
        console.log('[INIT] Page initialized OK, parse-btn exists:', !!document.getElementById('parse-btn'));
    }

    // 脚本位于 </body> 前，DOM 已就绪，直接初始化
    init();
})();
