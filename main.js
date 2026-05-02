/**
 *@Author: JH-Ahua
 *@CreateTime: 2026/5/2 21:32
 *@email: admin@bugpk.com
 *@blog: www.jiuhunwl.cn
 *@Api: api.bugpk.com
 *@tip: 短视频解析前端
 */
(function () {
    'use strict';

    const NAV_LINKS = [
        { href: '/', label: '首页' },
        { href: '#course', label: '解析教程' },
        { href: '#Supported_Platforms', label: '支持平台' },
        { href: '#ours', label: '关于我们' },
    ];

    const FOOTER_LINKS = [
        ...NAV_LINKS,
        { href: '#questions', label: '常见问题' },
    ];

    const HERO_FEATURES = [
        { icon: 'fa-check-circle', iconClass: 'text-emerald-500', text: '无水印' },
        { icon: 'fa-bolt', iconClass: 'text-amber-500', text: '高速解析' },
        { icon: 'fa-gift', iconClass: 'text-primary', text: '完全免费' },
    ];

    const PLATFORM_TABS = [
        { key: 'all', label: '所有平台', icon: 'fa-globe' },
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
        {
            name: '抖音',
            url: 'https://www.douyin.com',
            desc: '解析抖音无水印视频',
            gradient: 'from-slate-900 to-slate-700',
            img: 'https://lf-douyin-pc-web.douyinstatic.com/obj/douyin-pc-web/2025_0313_logo.png',
        },
        {
            name: '快手',
            url: 'https://www.kuaishou.com',
            desc: '解析快手无水印视频',
            gradient: 'from-red-500 to-amber-400',
            img: 'https://p4-plat.wskwai.com/kos/nlav111422/ks-web/favicon.ico',
        },
        {
            name: 'B站',
            url: 'https://www.bilibili.com',
            desc: '解析B站视频',
            gradient: 'from-sky-500 to-violet-500',
            img: 'https://www.bilibili.com/favicon.ico',
        },
        {
            name: '小红书',
            url: 'https://www.xiaohongshu.com',
            desc: '解析小红书视频',
            gradient: 'from-rose-500 to-red-500',
            img: 'https://www.xiaohongshu.com/favicon.ico',
        },
        {
            name: '微博',
            url: 'https://weibo.com',
            desc: '解析微博短视频',
            gradient: 'from-orange-500 to-amber-400',
            img: 'https://isee.weishi.qq.com/favicon.ico',
        },
        {
            name: '微视',
            url: 'https://weishi.qq.com',
            desc: '解析微视短视频',
            gradient: 'from-blue-600 to-cyan-400',
            img: 'https://isee.weishi.qq.com/favicon.ico',
        },
        {
            name: '皮皮虾',
            url: 'https://www.pipix.com',
            desc: '解析皮皮虾视频',
            gradient: 'from-purple-600 to-pink-500',
            img: 'https://lf-toutiao-ug-dns.toutiaocdn.com/obj/toutiao-ug-tos/ppx/mp/static/media/favicon.9cfbabbf.ico',
        },
        {
            name: '皮皮搞笑',
            url: 'https://www.pipigx.com',
            desc: '解析搞笑短视频',
            gradient: 'from-green-600 to-lime-400',
            img: 'https://www.pipigx.com/favicon.ico',
        },
        {
            name: '西瓜视频',
            url: 'https://www.ixigua.com',
            desc: '解析西瓜短视频',
            gradient: 'from-emerald-600 to-teal-500',
            img: 'https://www.ixigua.com/favicon.ico',
        },
        {
            name: '好看视频',
            url: 'https://haokan.baidu.com',
            desc: '解析百度系短视频',
            gradient: 'from-blue-800 to-sky-400',
            img: 'https://haokan.baidu.com/favicon.ico',
        },
        {
            name: '最右',
            url: 'https://www.izuiyou.com',
            desc: '解析最右短视频',
            gradient: 'from-purple-800 to-fuchsia-500',
            img: 'https://www.izuiyou.com/favicon.ico',
        },
        {
            name: '火山小视频',
            url: 'https://www.huoshan.com',
            desc: '解析火山平台视频',
            gradient: 'from-orange-800 to-amber-500',
            img: 'https://sj-fd.zol-img.com.cn/t_s180x180/g2/M00/09/0A/ChMlWl5TM3qIEGKDAACLMVr64W0AANcDwHGiFgAAItJ628.png',
        },
        {
            name: '更多平台',
            url: '#',
            desc: '持续更新中…',
            gradient: 'from-slate-500 to-slate-400',
            more: true,
        },
    ];

    const TUTORIAL_STEPS = [
        {
            step: '1',
            title: '复制视频链接',
            body: '在抖音、快手等平台打开作品，通过分享复制链接。',
        },
        {
            step: '2',
            title: '粘贴并解析',
            body: '回到本页，将链接粘贴到输入框，可选对应平台接口。',
        },
        {
            step: '3',
            title: '下载保存',
            body: '点击「开始解析」，完成后下载无水印视频或图集。',
        },
    ];

    const FAQ_ITEMS = [
        {
            q: '为什么有些视频无法解析？',
            a: '部分平台会更新防护策略，可能导致暂时失败，我们会持续维护。受版权限制的内容也可能无法解析。',
        },
        {
            q: '下载的视频仍有水印怎么办？',
            a: '若仍有水印，可能是平台策略变化导致去水印逻辑需更新，欢迎反馈以便我们尽快处理。',
        },
        {
            q: '解析和下载是否收费？',
            a: '本站服务免费。请警惕声称「高级解析」的收费陷阱。',
        },
    ];

    const UI = {
        btnPrimary: 'btn-primary-gradient px-6 py-3 text-white font-semibold flex items-center justify-center gap-2 mb-4',
        btnPrimaryFull: 'btn-primary-gradient w-full py-3 text-white font-bold flex items-center justify-center gap-2',
        btnOutline: 'bg-white border border-primary text-primary hover:bg-indigo-50 transition-colors rounded-xl px-6 py-3 font-medium flex items-center justify-center flex-1 gap-2',
        previewWrap: 'rounded-2xl overflow-hidden mb-6 shadow-card border border-slate-100/80',
        placeholder: 'w-full min-h-[14rem] bg-slate-100 flex items-center justify-center',
        platformCard: 'surface-card rounded-2xl p-5 sm:p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card border border-white/50',
    };

    const JSZIP_CDN = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
    let jsZipPromise = null;

    function loadScriptOnce(src) {
        const key = encodeURIComponent(src);
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[data-src-once="${key}"]`);
            if (existing) {
                if (existing.dataset.loaded === '1') {
                    resolve();
                    return;
                }
                existing.addEventListener('load', () => resolve(), { once: true });
                existing.addEventListener('error', () => reject(new Error('脚本加载失败')), { once: true });
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.dataset.srcOnce = key;
            script.onload = () => {
                script.dataset.loaded = '1';
                resolve();
            };
            script.onerror = () => reject(new Error('脚本加载失败'));
            document.head.appendChild(script);
        });
    }

    function ensureJSZip() {
        if (typeof JSZip !== 'undefined') return Promise.resolve();
        if (!jsZipPromise) jsZipPromise = loadScriptOnce(JSZIP_CDN);
        return jsZipPromise;
    }

    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    function escapeHtml(unsafe) {
        if (typeof unsafe === 'object' && unsafe !== null) return '';
        return unsafe?.toString()
            ?.replace(/&/g, '&amp;')
            ?.replace(/</g, '&lt;')
            ?.replace(/>/g, '&gt;')
            ?.replace(/"/g, '&quot;')
            ?.replace(/'/g, '&#039;') || '';
    }

    function cleanUrl(url) {
        if (Array.isArray(url)) return cleanUrl(url[0]);
        if (typeof url === 'object' && url !== null) {
            return cleanUrl(url.url || url.src || url.href || (url.url_list ? url.url_list[0] : '') || '');
        }
        return url?.replace(/`/g, '') || '';
    }

    function downloadFile(url) {
        if (!url || typeof url !== 'string') return;
        const a = document.createElement('a');
        a.href = url;
        a.download = url.split('/').pop().split('?')[0] || 'download';
        a.target = '_blank';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            if (a.parentNode) a.parentNode.removeChild(a);
        }, 100);
    }

    function formatNumber(num) {
        if (num === undefined || num === null) return '0';
        if (typeof num === 'object') return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function getDirectUrl(url) {
        return cleanUrl(url);
    }

    function formatDate(timestamp) {
        if (!timestamp) return '';
        if (timestamp.toString().length <= 10) timestamp = timestamp * 1000;
        const date = new Date(timestamp);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${d} ${h}:${min}`;
    }

    function showToast(message) {
        let toast = document.getElementById('toast-message');
        if (toast?.parentNode) toast.parentNode.removeChild(toast);

        toast = document.createElement('div');
        toast.id = 'toast-message';
        toast.className = 'fixed top-20 right-4 z-[100] flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3 shadow-xl transition-all duration-300 translate-y-[-12px] opacity-0';
        toast.innerHTML = `<i class="fa fa-check-circle text-emerald-400" aria-hidden="true"></i><span>${escapeHtml(message)}</span>`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-[-12px]', 'opacity-0');
        });
        setTimeout(() => {
            toast.classList.add('translate-y-[-12px]', 'opacity-0');
            setTimeout(() => toast.parentNode?.removeChild(toast), 300);
        }, 3000);
    }

    function hideAllContainers() {
        ['result-container', 'loading-container', 'error-container', 'images-container'].forEach((id) => {
            document.getElementById(id)?.classList.add('hidden');
        });
    }

    function showError(message) {
        hideAllContainers();
        const errorContainer = document.getElementById('error-container');
        const errorMessage = document.getElementById('error-message');
        if (errorContainer && errorMessage) {
            errorMessage.textContent = message;
            errorContainer.classList.remove('hidden');
            errorContainer.style.cssText = 'opacity:0;transform:translateY(10px);transition:opacity .3s ease,transform .3s ease';
            requestAnimationFrame(() => {
                errorContainer.style.opacity = '1';
                errorContainer.style.transform = 'translateY(0)';
            });
        }
    }

    function createInfoCard(label, value) {
        const card = document.createElement('div');
        card.className = 'bg-slate-50/90 rounded-xl p-4 border border-slate-100';
        const labelEl = document.createElement('div');
        labelEl.className = 'text-xs font-medium text-slate-500 uppercase tracking-wide mb-1';
        labelEl.textContent = label;
        const valueEl = document.createElement('div');
        valueEl.className = 'font-medium text-slate-800';
        valueEl.textContent = escapeHtml(value);
        card.append(labelEl, valueEl);
        return card;
    }

    function updateVideoPreview(previewVideo, videoPlaceholder, videoCover, videoData) {
        previewVideo.src = '';
        videoCover.src = '';
        const coverUrl = cleanUrl(videoData.cover || videoData.coverUrl);

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
        const music = videoData.music || {};
        const musicContainer = document.createElement('div');
        const hasValidMusic = music && music.url && isValidUrl(music.url);

        if (!hasValidMusic) {
            musicContainer.className = 'bg-slate-50/90 rounded-2xl p-6 mb-6 mt-6 border border-slate-100';
            const row = document.createElement('div');
            row.className = 'flex items-center gap-4';
            const icon = document.createElement('div');
            icon.className = 'w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0';
            icon.innerHTML = '<i class="fa fa-music text-primary" aria-hidden="true"></i>';
            const text = document.createElement('div');
            const h = document.createElement('h4');
            h.className = 'font-semibold text-slate-800';
            h.textContent = '视频原声';
            text.appendChild(h);
            row.append(icon, text);
            musicContainer.appendChild(row);
            return musicContainer;
        }

        const musicTitle = escapeHtml(music.title || '未知音乐');
        const musicAuthor = escapeHtml(music.author || '未知作者');
        const musicAvatar = music.avatar ? cleanUrl(music.avatar) : '';
        const musicUrl = cleanUrl(music.url);

        musicContainer.className = 'bg-slate-50/90 rounded-2xl p-6 mb-6 mt-6 border border-slate-100';
        const flex = document.createElement('div');
        flex.className = 'flex items-start gap-4';

        if (musicAvatar) {
            const avatarImg = document.createElement('img');
            avatarImg.src = musicAvatar;
            avatarImg.className = 'w-20 h-20 rounded-xl object-cover shrink-0';
            avatarImg.alt = '';
            avatarImg.onerror = function () {
                this.onerror = null;
                this.src = 'https://via.placeholder.com/80x80?text=%E5%B0%81%E9%9D%A2';
            };
            flex.appendChild(avatarImg);
        }

        const info = document.createElement('div');
        info.className = 'flex-1 min-w-0';
        const meta = document.createElement('div');
        meta.className = 'mb-4';
        const titleHeading = document.createElement('h4');
        titleHeading.className = 'font-semibold text-slate-800';
        titleHeading.textContent = musicTitle;
        const authorPara = document.createElement('p');
        authorPara.className = 'text-sm text-slate-500';
        authorPara.textContent = musicAuthor;
        meta.append(titleHeading, authorPara);

        const controls = document.createElement('div');
        controls.className = 'flex flex-col sm:flex-row items-stretch sm:items-center gap-3';
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.className = 'flex-1 w-full min-w-0';
        const source = document.createElement('source');
        source.src = musicUrl;
        source.type = 'audio/mpeg';
        audio.appendChild(source);
        const dl = document.createElement('button');
        dl.type = 'button';
        dl.className = 'shrink-0 rounded-xl bg-primary text-white px-4 py-2 hover:opacity-90 transition-opacity';
        dl.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i>';
        dl.addEventListener('click', () => downloadFile(musicUrl));
        controls.append(audio, dl);
        info.append(meta, controls);
        flex.appendChild(info);
        musicContainer.appendChild(flex);
        return musicContainer;
    }

    function createAuthorContainer(videoData) {
        let authorNameStr = '';
        if (videoData.author) {
            if (typeof videoData.author === 'string') authorNameStr = videoData.author;
            else if (typeof videoData.author === 'object') {
                authorNameStr = videoData.author.name || videoData.author.nickname || videoData.author.user_name || '';
            }
        }
        let avatarUrl = '';
        if (videoData.avatar) avatarUrl = cleanUrl(videoData.avatar);
        else if (videoData.author && typeof videoData.author === 'object') {
            avatarUrl = cleanUrl(videoData.author.avatar || videoData.author.avatar_thumb || videoData.author.cover || '');
        }
        const diggCount = videoData?.extra?.statistics?.digg_count;
        let likeCountNum = '0';
        if (diggCount !== undefined && diggCount !== null && typeof diggCount !== 'object') {
            likeCountNum = formatNumber(diggCount);
        }
        const hasAuthor = !!authorNameStr;
        const hasAvatar = !!avatarUrl;
        const hasLike = likeCountNum !== '0' || diggCount === 0;
        if (!hasAuthor && !hasAvatar && !hasLike) return null;

        const wrap = document.createElement('div');
        wrap.className = 'flex items-center gap-4 mb-6';
        if (hasAvatar) {
            const img = document.createElement('img');
            img.src = avatarUrl;
            img.className = 'w-12 h-12 rounded-full object-cover ring-2 ring-white shadow';
            img.alt = '';
            img.onerror = function () {
                this.onerror = null;
                this.src = 'https://via.placeholder.com/48x48?text=%E5%A4%B4%E5%83%8F';
            };
            wrap.appendChild(img);
        }
        const info = document.createElement('div');
        if (hasAuthor) {
            const name = document.createElement('div');
            name.className = 'font-semibold text-slate-800';
            name.textContent = authorNameStr;
            info.appendChild(name);
        }
        if (hasLike) {
            const likes = document.createElement('div');
            likes.className = 'text-sm text-slate-500';
            likes.textContent = `点赞 ${likeCountNum}`;
            info.appendChild(likes);
        }
        if (info.children.length) wrap.appendChild(info);
        return wrap;
    }

    function createInfoContainer(videoData) {
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6';
        grid.appendChild(createInfoCard('作品标题', videoData.title || '未知标题'));
        const publishTs = videoData?.extra?.create_time || videoData.time;
        grid.appendChild(createInfoCard('发布时间', formatDate(publishTs) || '未知时间'));
        let typeText = '未知类型';
        const type = videoData.type || (videoData.images && videoData.images.length > 0 ? 'images' : 'video');
        if (['video', 'videos'].includes(type)) typeText = '视频';
        else if (['image', 'images', 'normal'].includes(type)) typeText = '图片集';
        else if (type === 'live') typeText = '实况解析';
        else typeText = videoData.images && videoData.images.length > 0 ? '图片集' : '视频';
        grid.appendChild(createInfoCard('作品类型', typeText));
        const qualityText = videoData.quality || '未知';
        grid.appendChild(createInfoCard('主画质', qualityText));
        return grid;
    }

    function createStatsAndTags(videoData) {
        const extra = videoData?.extra || {};
        const stats = extra.statistics || {};
        const hasStats =
            ['digg_count', 'comment_count', 'collect_count', 'share_count', 'admire_count', 'play_count'].some(
                (k) => Number(stats[k] || 0) > 0
            );
        const hashtags = Array.isArray(extra.hashtags) ? extra.hashtags : [];
        const tags = Array.isArray(extra.video_tags) ? extra.video_tags : [];
        if (!hasStats && !hashtags.length && !tags.length) return null;

        const wrap = document.createElement('div');
        wrap.className = 'space-y-4 mb-6';

        if (hasStats) {
            const statsWrap = document.createElement('div');
            statsWrap.className = 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3';
            const statMap = [
                ['点赞', 'digg_count'],
                ['评论', 'comment_count'],
                ['收藏', 'collect_count'],
                ['分享', 'share_count'],
                ['赞赏', 'admire_count'],
                ['播放', 'play_count'],
            ];
            statMap.forEach(([label, key]) => {
                statsWrap.appendChild(createInfoCard(label, formatNumber(stats[key] || 0)));
            });
            wrap.appendChild(statsWrap);
        }

        if (hashtags.length || tags.length) {
            const chips = document.createElement('div');
            chips.className = 'flex flex-wrap gap-2';
            hashtags.forEach((item) => {
                const chip = document.createElement('span');
                chip.className = 'inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-medium';
                chip.textContent = `#${item.name || ''}`;
                chips.appendChild(chip);
            });
            tags.forEach((item) => {
                const chip = document.createElement('span');
                chip.className = 'inline-flex items-center rounded-full bg-fuchsia-50 text-fuchsia-700 px-3 py-1 text-xs font-medium';
                chip.textContent = item.name || '';
                chips.appendChild(chip);
            });
            wrap.appendChild(chips);
        }

        return wrap;
    }

    function createVideoBackupList(container, videoData) {
        if (!Array.isArray(videoData.video_backup) || !videoData.video_backup.length) return;
        const section = document.createElement('div');
        section.className = 'rounded-2xl bg-slate-50/90 border border-slate-100 p-4 mb-6';
        const title = document.createElement('h4');
        title.className = 'font-semibold text-slate-800 mb-3';
        title.textContent = `备用画质 (${videoData.video_backup.length})`;
        section.appendChild(title);

        const list = document.createElement('div');
        list.className = 'space-y-2';
        videoData.video_backup.forEach((item, idx) => {
            const isObj = item && typeof item === 'object';
            const lineUrl = getDirectUrl(isObj ? item.url : item);
            if (!lineUrl) return;
            const quality = isObj ? (item.quality || item.label || `线路${idx + 1}`) : `线路${idx + 1}`;

            const row = document.createElement('div');
            row.className = 'flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2';
            const tag = document.createElement('span');
            tag.className = 'inline-flex items-center rounded-lg bg-indigo-50 text-indigo-700 px-2 py-1 text-xs font-semibold';
            tag.textContent = quality;

            const downloadBtn = document.createElement('a');
            downloadBtn.href = lineUrl;
            downloadBtn.target = '_blank';
            downloadBtn.rel = 'noopener noreferrer';
            downloadBtn.className = 'ml-auto rounded-lg bg-primary text-white px-3 py-1.5 text-xs hover:opacity-90';
            downloadBtn.innerHTML = '<i class="fa fa-download mr-1" aria-hidden="true"></i>下载';

            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className = 'rounded-lg border border-slate-300 text-slate-700 px-3 py-1.5 text-xs hover:bg-slate-100';
            copyBtn.innerHTML = '<i class="fa fa-link mr-1" aria-hidden="true"></i>复制';
            copyBtn.addEventListener('click', () => copyUrl(lineUrl, '备用视频链接'));

            row.append(tag, copyBtn, downloadBtn);
            list.appendChild(row);
        });
        section.appendChild(list);
        container.appendChild(section);
    }

    function createVideoPlayer(container, videoData) {
        const previewContainer = document.createElement('div');
        previewContainer.className = UI.previewWrap;

        const videoPlaceholder = document.createElement('div');
        videoPlaceholder.id = 'video-placeholder';
        videoPlaceholder.className = UI.placeholder;
        videoPlaceholder.innerHTML = '<i class="fa fa-film text-5xl text-slate-300" aria-hidden="true"></i>';

        const previewVideo = document.createElement('video');
        previewVideo.id = 'preview-video';
        previewVideo.className = 'w-full hidden bg-black';
        previewVideo.setAttribute('controls', '');
        previewVideo.setAttribute('playsinline', '');

        const videoCover = document.createElement('img');
        videoCover.id = 'video-cover';
        videoCover.className = 'w-full hidden';
        videoCover.alt = '视频封面';

        updateVideoPreview(previewVideo, videoPlaceholder, videoCover, videoData);
        previewContainer.append(videoPlaceholder, previewVideo, videoCover);
        container.appendChild(previewContainer);

        const hasBackup = Array.isArray(videoData.video_backup) && videoData.video_backup.length > 0;
        const allQualities = [];
        if (videoData.url) {
            allQualities.push({ label: videoData.quality || '原画', url: videoData.url, isMain: true });
        }
        if (hasBackup) {
            videoData.video_backup.forEach(item => {
                if (item.url) {
                    allQualities.push({ label: item.quality || item.label || '备用', url: item.url, isMain: false });
                }
            });
        }

        const downloadBtn = document.createElement('a');
        downloadBtn.id = 'download-btn';
        downloadBtn.href = cleanUrl(videoData.url);
        downloadBtn.className = UI.btnPrimary;
        downloadBtn.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i><span>下载无水印视频</span>';
        container.appendChild(downloadBtn);

        if (allQualities.length > 1) {
            const qualityWrap = document.createElement('div');
            qualityWrap.className = 'mt-3 flex flex-wrap gap-2 items-center';

            const label = document.createElement('span');
            label.className = 'text-sm text-slate-500 font-medium mr-1';
            label.textContent = '画质选择：';
            qualityWrap.appendChild(label);

            const activeQuality = { label: videoData.quality || '原画', url: videoData.url };

            allQualities.forEach((q, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                const isActive = q.isMain && idx === 0;
                btn.className = isActive
                    ? 'px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium'
                    : 'px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors';
                btn.textContent = q.label;
                btn.dataset.url = q.url;
                btn.dataset.quality = q.label;
                if (isActive) {
                    btn.dataset.active = 'true';
                }
                btn.addEventListener('click', () => {
                    qualityWrap.querySelectorAll('button').forEach(b => {
                        b.className = 'px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors';
                        delete b.dataset.active;
                    });
                    btn.className = 'px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium';
                    btn.dataset.active = 'true';
                    downloadBtn.href = cleanUrl(q.url);
                    downloadBtn.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i><span>下载 ' + q.label + '</span>';
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

    function initSwiper(swiperEl, options = {}) {
        if (typeof Swiper === 'undefined') {
            swiperEl.querySelectorAll('.swiper-slide').forEach((slide) => slide.classList.add('mb-4'));
            showToast('幻灯片组件加载失败，将以普通图片显示');
            return null;
        }
        try {
            return new Swiper(swiperEl, {
                loop: options.loop !== false,
                pagination: { el: swiperEl.querySelector('.swiper-pagination'), clickable: true },
                navigation: {
                    nextEl: swiperEl.querySelector('.swiper-button-next'),
                    prevEl: swiperEl.querySelector('.swiper-button-prev'),
                },
                ...options.swiperOptions,
            });
        } catch (e) {
            console.error(e);
            swiperEl.querySelectorAll('.swiper-slide').forEach((slide) => slide.classList.add('mb-4'));
            showToast('幻灯片组件加载失败，将以普通图片显示');
            return null;
        }
    }

    function createImageGallery(container, videoData) {
        const imagesContainer = document.createElement('div');
        imagesContainer.id = 'images-container';
        imagesContainer.className = 'swiper w-full mb-6 relative pb-8';

        const wrapper = document.createElement('div');
        wrapper.className = 'swiper-wrapper';

        videoData.images.forEach((img) => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide relative group';
            const imgElement = document.createElement('img');
            imgElement.src = cleanUrl(img);
            imgElement.className = 'w-full h-96 object-cover rounded-2xl';
            imgElement.loading = 'lazy';
            imgElement.alt = '';
            imgElement.onerror = function () {
                this.onerror = null;
                this.src = 'https://via.placeholder.com/800x600?text=%E5%9B%BE%E7%89%87%E5%8A%A0%E8%BD%BD%E5%A4%B1%E8%B4%A5';
            };
            const downloadBtn = document.createElement('button');
            downloadBtn.type = 'button';
            downloadBtn.className = 'absolute bottom-4 right-4 bg-white/90 hover:bg-white px-4 py-2 rounded-xl shadow-md transition-all opacity-0 group-hover:opacity-100 text-sm font-medium';
            downloadBtn.innerHTML = '<i class="fa fa-download mr-2" aria-hidden="true"></i>下载';
            downloadBtn.addEventListener('click', () => downloadFile(cleanUrl(img)));
            slide.append(imgElement, downloadBtn);
            wrapper.appendChild(slide);
        });

        const pagination = document.createElement('div');
        pagination.className = 'swiper-pagination gallery-pagination';
        const prevButton = document.createElement('div');
        prevButton.className = 'swiper-button-prev gallery-nav-button';
        const nextButton = document.createElement('div');
        nextButton.className = 'swiper-button-next gallery-nav-button';

        imagesContainer.append(wrapper, pagination, prevButton, nextButton);
        container.appendChild(imagesContainer);

        const downloadAllBtn = document.createElement('button');
        downloadAllBtn.type = 'button';
        downloadAllBtn.className = UI.btnPrimaryFull;
        downloadAllBtn.innerHTML = `<i class="fa fa-images" aria-hidden="true"></i><span>下载全部图片（${videoData.images.length} 张）</span>`;
        downloadAllBtn.addEventListener('click', () => {
            ensureJSZip()
                .then(() => compressAndDownloadImages(videoData.images))
                .catch(() => showError('压缩库加载失败，请重试'));
        });
        container.appendChild(downloadAllBtn);

        initSwiper(imagesContainer, { loop: true });
    }

    function compressAndDownloadImages(imageUrls) {
        const zip = new JSZip();
        const imageFolder = zip.folder('images');
        let loadedCount = 0;
        let errorCount = 0;
        showToast(`开始下载并压缩图片（${imageUrls.length} 张）`);

        imageUrls.forEach((imgUrl, index) => {
            const cleanedUrl = getDirectUrl(imgUrl);
            const fileName = `image_${index + 1}.jpg`;
            fetch(cleanedUrl)
                .then((response) => {
                    if (!response.ok) throw new Error(String(response.status));
                    return response.blob();
                })
                .then((blob) => {
                    imageFolder.file(fileName, blob);
                    loadedCount++;
                    tryFinish();
                })
                .catch((err) => {
                    console.error(`下载图片失败 (${index + 1}):`, err);
                    errorCount++;
                    tryFinish();
                });
        });

        function tryFinish() {
            if (loadedCount + errorCount !== imageUrls.length) return;
            if (loadedCount > 0) {
                zip.generateAsync({ type: 'blob' })
                    .then((content) => {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(content);
                        link.download = `images_${Date.now()}.zip`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showToast(`成功压缩并下载 ${loadedCount} 张图片`);
                    })
                    .catch((err) => {
                        showError('图片压缩失败: ' + err.message);
                        console.error(err);
                    });
            } else {
                showError('所有图片下载失败，请重试');
            }
        }
    }

    function copyUrl(url, type) {
        if (!url) {
            showError(`没有可复制的${type}`);
            return;
        }
        navigator.clipboard.writeText(url).then(() => {
            showToast(`${type}已复制到剪贴板`);
            const btn = document.activeElement;
            if (btn && btn.id && btn.id.startsWith('copy-')) {
                btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-500');
                btn.innerHTML = `<i class="fa fa-check mr-2" aria-hidden="true"></i><span>复制成功</span>`;
                setTimeout(() => {
                    btn.classList.remove('bg-emerald-500', 'text-white', 'border-emerald-500');
                    btn.innerHTML = `<i class="fa fa-link mr-2" aria-hidden="true"></i><span>复制${type}</span>`;
                }, 2000);
            }
        }).catch(() => showError(`无法复制${type}`));
    }

    let videosjson = '';

    function bindCopyButtonEvents() {
        document.getElementById('copy-cover-btn')?.addEventListener('click', () => {
            copyUrl(videosjson?.cover, '封面链接');
        });
        document.getElementById('copy-url-btn')?.addEventListener('click', () => {
            copyUrl(videosjson?.url, '视频链接');
        });
    }

    function checkSwiper() {
        if (typeof Swiper !== 'undefined') return;
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js';
        script.onload = () => {
            const imagesContainer = document.getElementById('images-container');
            if (imagesContainer && !imagesContainer.classList.contains('hidden')) initSwiper(imagesContainer);
        };
        script.onerror = () => console.error('Swiper 加载失败');
        document.head.appendChild(script);
    }

    function setupDarkMode() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (!darkModeToggle) return;
        const isDark =
            localStorage.getItem('darkMode') === 'true' ||
            (localStorage.getItem('darkMode') === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
        darkModeToggle.checked = isDark;
        darkModeToggle.addEventListener('change', () => {
            const on = darkModeToggle.checked;
            document.documentElement.classList.toggle('dark', on);
            localStorage.setItem('darkMode', on);
        });
    }

    function setupShare() {
        const shareBtn = document.getElementById('share-btn');
        if (!shareBtn) return;
        shareBtn.addEventListener('click', async () => {
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: '视频解析工具',
                        text: '我用这个工具解析了一个视频，你也可以试试',
                        url: window.location.href,
                    });
                } else {
                    await navigator.clipboard.writeText(window.location.href);
                    showToast('链接已复制到剪贴板');
                }
            } catch (error) {
                showError('分享失败');
                console.error(error);
            }
        });
    }

    function createLiveGallery(container, videoData) {
        const livePhotos = videoData.live_photo || [];
        if (!livePhotos.length && videoData.url) {
            createLivePlayer(container, videoData);
            createVideoCopyButtons(container);
            return;
        }

        const galleryContainer = document.createElement('div');
        galleryContainer.className = 'swiper w-full mb-6 relative pb-8';
        const wrapper = document.createElement('div');
        wrapper.className = 'swiper-wrapper';

        livePhotos.forEach((item, index) => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide relative group rounded-2xl overflow-hidden bg-black';
            const video = document.createElement('video');
            video.className = 'w-full h-96 object-contain bg-black';
            video.controls = true;
            video.loop = true;
            video.poster = cleanUrl(item.image);
            video.preload = index === 0 ? 'metadata' : 'none';
            const videoUrl = cleanUrl(item.video);
            video.src = getDirectUrl(videoUrl);

            const badge = document.createElement('div');
            badge.className = 'absolute top-4 left-4 bg-primary text-white text-xs px-2 py-1 rounded-lg shadow z-10 pointer-events-none';
            badge.innerHTML = `<i class="fa fa-bolt mr-1" aria-hidden="true"></i>实况 ${index + 1}/${livePhotos.length}`;

            const btnGroup = document.createElement('div');
            btnGroup.className = 'absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20';
            const b1 = document.createElement('button');
            b1.type = 'button';
            b1.className = 'bg-white/90 hover:bg-white text-slate-800 px-3 py-2 rounded-xl shadow text-sm font-medium';
            b1.innerHTML = '<i class="fa fa-video mr-1" aria-hidden="true"></i>视频';
            b1.addEventListener('click', (e) => {
                e.stopPropagation();
                downloadFile(videoUrl);
            });
            const b2 = document.createElement('button');
            b2.type = 'button';
            b2.className = 'bg-white/90 hover:bg-white text-slate-800 px-3 py-2 rounded-xl shadow text-sm font-medium';
            b2.innerHTML = '<i class="fa fa-image mr-1" aria-hidden="true"></i>封面';
            b2.addEventListener('click', (e) => {
                e.stopPropagation();
                downloadFile(cleanUrl(item.image));
            });
            btnGroup.append(b1, b2);
            slide.append(video, badge, btnGroup);
            wrapper.appendChild(slide);
        });

        const pagination = document.createElement('div');
        pagination.className = 'swiper-pagination gallery-pagination';
        const prevButton = document.createElement('div');
        prevButton.className = 'swiper-button-prev gallery-nav-button';
        const nextButton = document.createElement('div');
        nextButton.className = 'swiper-button-next gallery-nav-button';
        galleryContainer.append(wrapper, pagination, prevButton, nextButton);
        container.appendChild(galleryContainer);

        if (typeof Swiper !== 'undefined') {
            new Swiper(galleryContainer, {
                loop: livePhotos.length > 1,
                pagination: { el: pagination, clickable: true },
                navigation: { nextEl: nextButton, prevEl: prevButton },
                on: {
                    slideChange() {
                        galleryContainer.querySelectorAll('video').forEach((v) => v.pause());
                    },
                },
            });
        }

        const downloadAllBtn = document.createElement('button');
        downloadAllBtn.type = 'button';
        downloadAllBtn.className = UI.btnPrimaryFull;
        downloadAllBtn.innerHTML = `<i class="fa fa-download" aria-hidden="true"></i><span>批量下载（${livePhotos.length * 2} 个文件）</span>`;
        downloadAllBtn.addEventListener('click', () => {
            ensureJSZip()
                .then(() => compressAndDownloadLiveContent(livePhotos))
                .catch(() => showError('压缩库加载失败'));
        });
        container.appendChild(downloadAllBtn);
    }

    function compressAndDownloadLiveContent(livePhotos) {
        const zip = new JSZip();
        const folder = zip.folder('live_photos');
        let processed = 0;
        let successCount = 0;
        const total = livePhotos.length * 2;
        showToast(`开始处理 ${livePhotos.length} 组实况…`);

        livePhotos.forEach((item, index) => {
            const prefix = `live_${index + 1}`;
            fetch(getDirectUrl(item.image))
                .then((r) => {
                    if (!r.ok) throw new Error(String(r.status));
                    return r.blob();
                })
                .then((blob) => {
                    folder.file(`${prefix}_cover.jpg`, blob);
                    successCount++;
                })
                .catch((e) => console.error('封面下载失败', e))
                .finally(() => checkDone());

            fetch(getDirectUrl(item.video))
                .then((r) => {
                    if (!r.ok) throw new Error(String(r.status));
                    return r.blob();
                })
                .then((blob) => {
                    folder.file(`${prefix}_video.mp4`, blob);
                    successCount++;
                })
                .catch((e) => console.error('视频下载失败', e))
                .finally(() => checkDone());
        });

        function checkDone() {
            processed++;
            if (processed !== total) return;
            if (successCount > 0) {
                zip.generateAsync({ type: 'blob' })
                    .then((content) => {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(content);
                        link.download = `live_photos_${Date.now()}.zip`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showToast(`成功下载 ${successCount} 个文件`);
                    })
                    .catch((err) => {
                        showError('压缩文件生成失败');
                        console.error(err);
                    });
            } else {
                showError('所有文件下载失败，请重试');
            }
        }
    }

    function compressAndDownloadSingleLive(videoData) {
        const zip = new JSZip();
        const folder = zip.folder('live_photo');
        let processed = 0;
        let successCount = 0;
        const total = 2;
        const videoUrl = getDirectUrl(videoData.url);
        const coverUrl = getDirectUrl(videoData.cover || videoData.coverUrl);
        showToast('开始下载实况内容…');

        function checkDone() {
            processed++;
            if (processed !== total) return;
            if (successCount > 0) {
                zip.generateAsync({ type: 'blob' })
                    .then((content) => {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(content);
                        link.download = `live_photo_${Date.now()}.zip`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showToast(`成功下载 ${successCount} 个文件`);
                    })
                    .catch((err) => {
                        showError('压缩文件生成失败');
                        console.error(err);
                    });
            } else {
                showError('所有文件下载失败，请重试');
            }
        }

        if (coverUrl) {
            fetch(coverUrl)
                .then((r) => {
                    if (!r.ok) throw new Error(String(r.status));
                    return r.blob();
                })
                .then((blob) => {
                    folder.file('live_cover.jpg', blob);
                    successCount++;
                })
                .catch((e) => console.error('封面下载失败', e))
                .finally(checkDone);
        } else {
            checkDone();
        }

        if (videoUrl) {
            fetch(videoUrl)
                .then((r) => {
                    if (!r.ok) throw new Error(String(r.status));
                    return r.blob();
                })
                .then((blob) => {
                    folder.file('live_video.mp4', blob);
                    successCount++;
                })
                .catch((e) => console.error('视频下载失败', e))
                .finally(checkDone);
        } else {
            checkDone();
        }
    }

    function createLivePlayer(container, videoData) {
        const previewContainer = document.createElement('div');
        previewContainer.className = `${UI.previewWrap} relative`;

        const videoPlaceholder = document.createElement('div');
        videoPlaceholder.id = 'video-placeholder';
        videoPlaceholder.className = UI.placeholder;
        videoPlaceholder.innerHTML = '<i class="fa fa-film text-5xl text-slate-300" aria-hidden="true"></i>';

        const previewVideo = document.createElement('video');
        previewVideo.id = 'preview-video';
        previewVideo.className = 'w-full hidden bg-black';
        previewVideo.setAttribute('controls', '');
        previewVideo.setAttribute('playsinline', '');
        previewVideo.loop = true;

        const videoCover = document.createElement('img');
        videoCover.id = 'video-cover';
        videoCover.className = 'w-full hidden';
        videoCover.alt = '视频封面';

        updateVideoPreview(previewVideo, videoPlaceholder, videoCover, videoData);
        previewContainer.append(videoPlaceholder, previewVideo, videoCover);

        const badge = document.createElement('div');
        badge.className = 'absolute top-4 left-4 bg-primary text-white text-xs px-2 py-1 rounded-lg shadow z-10';
        badge.innerHTML = '<i class="fa fa-bolt mr-1" aria-hidden="true"></i>实况动图';
        previewContainer.appendChild(badge);
        container.appendChild(previewContainer);

        const downloadBtnContainer = document.createElement('div');
        downloadBtnContainer.className = 'flex flex-col gap-3 mb-4';

        const downloadVideoBtn = document.createElement('a');
        downloadVideoBtn.id = 'download-btn';
        downloadVideoBtn.href = getDirectUrl(videoData.url);
        downloadVideoBtn.className = UI.btnPrimary;
        downloadVideoBtn.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i><span>下载实况视频</span>';
        downloadBtnContainer.appendChild(downloadVideoBtn);

        const coverUrl = getDirectUrl(videoData.cover || videoData.coverUrl);
        if (coverUrl) {
            const downloadCoverBtn = document.createElement('button');
            downloadCoverBtn.type = 'button';
            downloadCoverBtn.className = UI.btnOutline;
            downloadCoverBtn.innerHTML = '<i class="fa fa-image" aria-hidden="true"></i><span>下载实况封面</span>';
            downloadCoverBtn.addEventListener('click', () => downloadFile(coverUrl));
            downloadBtnContainer.appendChild(downloadCoverBtn);
        }
        container.appendChild(downloadBtnContainer);

        const downloadAllBtn = document.createElement('button');
        downloadAllBtn.type = 'button';
        downloadAllBtn.className = UI.btnPrimaryFull;
        downloadAllBtn.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i><span>批量下载封面与视频</span>';
        downloadAllBtn.addEventListener('click', () => {
            ensureJSZip()
                .then(() => compressAndDownloadSingleLive(videoData))
                .catch(() => showError('压缩库加载失败'));
        });
        container.appendChild(downloadAllBtn);
    }

    function createVideoCopyButtons(container) {
        const wrap = document.createElement('div');
        wrap.className = 'flex flex-wrap gap-3 mb-6';
        const copyCoverBtn = document.createElement('button');
        copyCoverBtn.type = 'button';
        copyCoverBtn.id = 'copy-cover-btn';
        copyCoverBtn.className = UI.btnOutline;
        copyCoverBtn.innerHTML = '<i class="fa fa-link" aria-hidden="true"></i><span>复制封面链接</span>';
        const copyUrlBtn = document.createElement('button');
        copyUrlBtn.type = 'button';
        copyUrlBtn.id = 'copy-url-btn';
        copyUrlBtn.className = UI.btnOutline;
        copyUrlBtn.innerHTML = '<i class="fa fa-link" aria-hidden="true"></i><span>复制视频链接</span>';
        wrap.append(copyCoverBtn, copyUrlBtn);
        container.appendChild(wrap);
    }

    function createImageCopyButtons(container) {
        const wrap = document.createElement('div');
        wrap.className = 'flex flex-wrap gap-3 mb-6';
        const copyCoverBtn = document.createElement('button');
        copyCoverBtn.type = 'button';
        copyCoverBtn.id = 'copy-cover-btn';
        copyCoverBtn.className = UI.btnOutline;
        copyCoverBtn.innerHTML = '<i class="fa fa-link" aria-hidden="true"></i><span>复制封面链接</span>';
        wrap.appendChild(copyCoverBtn);
        container.appendChild(wrap);
    }

    function showResult(videoData) {
        hideAllContainers();
        const resultContainer = document.getElementById('result-container');
        if (!resultContainer) return;

        resultContainer.innerHTML = '';
        resultContainer.classList.remove('hidden');
        resultContainer.style.cssText = 'opacity:0;transform:translateY(16px);transition:opacity .45s ease,transform .45s ease';
        requestAnimationFrame(() => {
            resultContainer.style.opacity = '1';
            resultContainer.style.transform = 'translateY(0)';
        });

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'border-t border-slate-200/80 pt-6';
        resultContainer.appendChild(contentWrapper);

        const title = document.createElement('h3');
        title.className = 'text-lg font-semibold text-slate-800 mb-4';
        title.textContent = '解析结果';
        contentWrapper.appendChild(title);

        const authorContainer = createAuthorContainer(videoData);
        if (authorContainer) contentWrapper.appendChild(authorContainer);

        const type = videoData.type || (videoData.images && videoData.images.length > 0 ? 'images' : 'video');
        if (['video', 'videos'].includes(type)) {
            createVideoPlayer(contentWrapper, videoData);
            createVideoCopyButtons(contentWrapper);
            createVideoBackupList(contentWrapper, videoData);
        } else if (['image', 'images', 'normal'].includes(type)) {
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
        const statsAndTags = createStatsAndTags(videoData);
        if (statsAndTags) contentWrapper.appendChild(statsAndTags);
        const musicContainer = createMusicContainer(videoData);
        if (musicContainer?.innerHTML.trim()) contentWrapper.appendChild(musicContainer);
    }

    function setupFAQToggle(root = document) {
        root.querySelectorAll('.faq-btn').forEach((button) => {
            button.addEventListener('click', function () {
                const content = this.nextElementSibling;
                const icon = this.querySelector('i');
                const open = content.classList.contains('hidden');
                root.querySelectorAll('.faq-btn').forEach((other) => {
                    const c = other.nextElementSibling;
                    const ic = other.querySelector('i');
                    c.classList.add('hidden');
                    ic?.classList.remove('rotate-180');
                });
                if (open) {
                    content.classList.remove('hidden');
                    icon?.classList.add('rotate-180');
                }
            });
        });
    }

    function renderNavLinks() {
        const desktop = document.getElementById('nav-desktop');
        const mobile = document.getElementById('nav-mobile');
        if (desktop) {
            desktop.innerHTML = NAV_LINKS.map(
                (l) =>
                    `<a href="${escapeHtml(l.href)}" class="text-slate-600 hover:text-primary transition-colors">${escapeHtml(l.label)}</a>`
            ).join('');
        }
        if (mobile) {
            mobile.innerHTML = NAV_LINKS.map(
                (l) =>
                    `<a href="${escapeHtml(l.href)}" class="text-slate-800 font-medium py-3 px-2 rounded-lg hover:bg-slate-100 transition-colors border-b border-slate-100/80 last:border-0">${escapeHtml(l.label)}</a>`
            ).join('');
        }
    }

    function renderHeroFeatures() {
        const el = document.getElementById('hero-features');
        if (!el) return;
        el.innerHTML = HERO_FEATURES.map(
            (f) =>
                `<div class="inline-flex items-center gap-2 rounded-full bg-white/85 border border-slate-200/60 px-5 py-2.5 shadow-sm" role="listitem"><i class="fa ${escapeHtml(f.icon)} ${escapeHtml(f.iconClass)}" aria-hidden="true"></i><span class="font-medium text-slate-700 text-sm">${escapeHtml(f.text)}</span></div>`
        ).join('');
    }

    function renderPlatformTabs() {
        const wrap = document.getElementById('platform-tabs');
        if (!wrap) return;
        wrap.innerHTML = PLATFORM_TABS.map((t) => {
            const style = t.iconColor ? ` style="color:${escapeHtml(t.iconColor)}"` : '';
            return `<button type="button" role="tab" class="platform-btn" data-platform="${escapeHtml(t.key)}"><i class="fa ${escapeHtml(t.icon)} mr-1" aria-hidden="true"${style}></i>${escapeHtml(t.label)}</button>`;
        }).join('');
    }

    function renderPlatformGrid() {
        const grid = document.getElementById('platform-grid');
        if (!grid) return;
        grid.innerHTML = SUPPORTED_PLATFORMS.map((p) => {
            const iconBlock = p.more
                ? `<div class="w-16 h-16 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mx-auto mb-4 shadow-inner"><i class="fa fa-ellipsis-h text-white text-2xl" aria-hidden="true"></i></div>`
                : `<a href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer" class="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"><div class="w-16 h-16 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mx-auto mb-4 shadow-md"><img src="${escapeHtml(p.img)}" alt="" class="w-8 h-8 object-contain rounded-full" width="32" height="32" loading="lazy"></div></a>`;
            return `<article class="${UI.platformCard}">${iconBlock}<h4 class="font-bold text-slate-900 mb-1">${escapeHtml(p.name)}</h4><p class="text-sm text-slate-600 leading-snug">${escapeHtml(p.desc)}</p></article>`;
        }).join('');
    }

    function renderTutorial() {
        const wrap = document.getElementById('tutorial-steps');
        if (!wrap) return;
        wrap.innerHTML = TUTORIAL_STEPS.map(
            (s) =>
                `<div class="text-center surface-card rounded-2xl p-6 border border-white/50"><div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center mx-auto mb-5 text-primary shadow-sm"><span class="text-xl font-bold">${escapeHtml(s.step)}</span></div><h4 class="font-bold text-slate-900 mb-2">${escapeHtml(s.title)}</h4><p class="text-slate-600 text-sm leading-relaxed">${escapeHtml(s.body)}</p></div>`
        ).join('');
    }

    function renderFAQ() {
        const wrap = document.getElementById('faq-list');
        if (!wrap) return;
        wrap.innerHTML = FAQ_ITEMS.map(
            (item) =>
                `<div class="surface-card rounded-2xl overflow-hidden border border-white/50"><button type="button" class="faq-btn w-full text-left p-5 sm:p-6 flex justify-between items-center gap-4 text-slate-800 font-medium hover:bg-slate-50/50 transition-colors"><span>${escapeHtml(item.q)}</span><i class="fa fa-chevron-down text-slate-400 shrink-0 transition-transform" aria-hidden="true"></i></button><div class="faq-content hidden px-5 sm:px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-100/80 pt-4">${escapeHtml(item.a)}</div></div>`
        ).join('');
        setupFAQToggle(wrap);
    }

    function renderFooterLinks() {
        const ul = document.getElementById('footer-links');
        if (!ul) return;
        ul.innerHTML = FOOTER_LINKS.map(
            (l) =>
                `<li><a href="${escapeHtml(l.href)}" class="text-slate-400 hover:text-white transition-colors">${escapeHtml(l.label)}</a></li>`
        ).join('');
    }

    function initMobileMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        if (!menuToggle || !mobileMenu) return;
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            menuToggle.setAttribute('aria-expanded', String(!mobileMenu.classList.contains('hidden')));
        });
        mobileMenu.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function bindParseForm() {
        let currentPlatform = 'all';

        document.querySelectorAll('.platform-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.platform-btn').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                currentPlatform = btn.getAttribute('data-platform') || 'all';
            });
        });
        document.querySelector('.platform-btn[data-platform="all"]')?.classList.add('active');

        document.getElementById('clear-btn')?.addEventListener('click', () => {
            const input = document.getElementById('video-url');
            if (input) input.value = '';
            const clearBtn = document.getElementById('clear-btn');
            clearBtn?.classList.add('animate-spin');
            setTimeout(() => clearBtn?.classList.remove('animate-spin'), 400);
        });

        const parseBtn = document.getElementById('parse-btn');
        const parseLoader = document.getElementById('parse-loader');

        parseBtn?.addEventListener('click', async () => {
            parseBtn.classList.add('scale-[0.98]');
            setTimeout(() => parseBtn.classList.remove('scale-[0.98]'), 180);

            const extractUrlFromText = (text) => {
                const m = text.match(/https?:\/\/[^\s]+/gi);
                return m ? m[0] : null;
            };

            const rawInput = document.getElementById('video-url')?.value.trim() || '';
            if (!rawInput) {
                showError('请输入视频链接或包含链接的文本');
                return;
            }

            let url = extractUrlFromText(rawInput) || rawInput;
            if (!isValidUrl(url)) {
                showError('无法从输入中提取有效的 URL');
                return;
            }

            const urlInput = document.getElementById('video-url');
            if (urlInput) urlInput.value = url;

            hideAllContainers();
            document.getElementById('loading-container')?.classList.remove('hidden');
            parseLoader?.classList.remove('hidden');
            parseBtn?.setAttribute('disabled', 'true');

            try {
                const apiUrl = PLATFORM_API_MAP[currentPlatform] || PLATFORM_API_MAP.all;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);
                const response = await fetch(`${apiUrl}?url=${encodeURIComponent(url)}`, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();

                if (data.code === 200) {
                    videosjson = data.data;
                    showResult(videosjson);
                    bindCopyButtonEvents();
                } else {
                    showError(data.msg || '解析失败，请稍后再试');
                }
            } catch (error) {
                console.error('解析请求出错:', error);
                showError(error.name === 'AbortError' ? '请求超时，请重试' : '网络错误，请检查连接');
            } finally {
                parseLoader?.classList.add('hidden');
                parseBtn?.removeAttribute('disabled');
                document.getElementById('loading-container')?.classList.add('hidden');
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'v') {
                setTimeout(() => {
                    const urlInput = document.getElementById('video-url');
                    if (urlInput?.value.trim()) document.getElementById('parse-btn')?.click();
                }, 120);
            }
            if (event.key === 'Escape') {
                hideAllContainers();
                const inp = document.getElementById('video-url');
                if (inp) inp.value = '';
            }
        });
    }

    function initErrorDismiss() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-dismiss-error]');
            if (target) target.classList.add('hidden');
        });
    }

    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        window.addEventListener('scroll', () => {
            const compact = window.scrollY > 40;
            navbar.classList.toggle('shadow-card', compact);
            navbar.classList.toggle('py-2', compact);
            navbar.classList.toggle('py-4', !compact);
        });
    }

    function init() {
        const y = document.getElementById('footer-year');
        if (y) y.textContent = String(new Date().getFullYear());
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
        setupDarkMode();
        setupShare();
        checkSwiper();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
