/**
*@Author: JH-Ahua
*@CreateTime: 2025/8/7 下午11:30
*@email: admin@bugpk.com
*@blog: www.jiuhunwl.cn
*@Api: api.bugpk.com
*@tip: 短视频解析
*/
// 工具函数：验证URL
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

// 安全转义HTML（用于文本内容）
function escapeHtml(unsafe) {
    return unsafe?.toString()
        ?.replace(/&/g, "&amp;")
        ?.replace(/</g, "&lt;")
        ?.replace(/>/g, "&gt;")
        ?.replace(/"/g, "&quot;")
        ?.replace(/'/g, "&#039;") || '';
}

// 清理URL中的反引号（不转义其他字符）
function cleanUrl(url) {
    return url?.replace(/`/g, '') || '';
}

// 下载单个图片
function downloadImage(url) {
    const cleanUrl = cleanUrl(url);
    downloadFile(cleanUrl);
}

// 通用下载函数
function downloadFile(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop().split('?')[0];
    a.target = '_blank'; // 防止跳转到新页面
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
    }, 100);
}

// 格式化数字（添加千位分隔符）
function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 格式化时间戳为日期字符串
function formatDate(timestamp) {
    if (!timestamp) return '';

    // 如果时间戳是秒级，转换为毫秒级
    if (timestamp.toString().length <= 10) {
        timestamp = timestamp * 1000;
    }

    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 显示提示消息
function showToast(message) {
    let toast = document.getElementById('toast-message');
    if (toast) document.body.removeChild(toast);

    toast = document.createElement('div');
    toast.id = 'toast-message';
    toast.className = 'fixed top-4 right-4 bg-dark text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-y-[-20px] opacity-0 flex items-center';
    toast.innerHTML = `<i class="fa fa-check-circle mr-2 text-green-400"></i><span>${message}</span>`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-[-20px]', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-[-20px]', 'opacity-0');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// 显示错误信息
function showError(message) {
    hideAllContainers();
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');

    if (errorContainer && errorMessage) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');

        // 错误显示动画
        errorContainer.style.cssText = 'opacity: 0; transform: translateY(10px); transition: opacity 0.3s ease, transform 0.3s ease';
        setTimeout(() => {
            errorContainer.style.opacity = '1';
            errorContainer.style.transform = 'translateY(0)';
        }, 10);
    }
}

// 隐藏所有容器
function hideAllContainers() {
    ['result-container', 'loading-container', 'error-container', 'images-container'].forEach(id => {
        document.getElementById(id)?.classList.add('hidden');
    });
}

// 创建信息卡片
function createInfoCard(label, value) {
    const card = document.createElement('div');
    card.className = 'bg-gray-50 rounded-lg p-4';

    const labelEl = document.createElement('div');
    labelEl.className = 'text-sm text-gray-500 mb-1';
    labelEl.textContent = label;

    const valueEl = document.createElement('div');
    valueEl.className = 'font-medium';
    valueEl.textContent = escapeHtml(value);

    card.append(labelEl, valueEl);
    return card;
}

// 更新视频预览
function updateVideoPreview(previewVideo, videoPlaceholder, videoCover, videoData) {
    // 重置资源
    previewVideo.src = '';
    videoCover.src = '';

    // 处理封面
    if (videoData.cover) {
        videoCover.src = cleanUrl(videoData.cover);
        videoCover.classList.remove('hidden');
        videoPlaceholder.classList.add('hidden');
    } else {
        videoCover.classList.add('hidden');
        videoPlaceholder.classList.remove('hidden');
    }

    // 处理视频
    if (videoData.url) {
        previewVideo.src = cleanUrl(videoData.url);
        previewVideo.classList.remove('hidden');
        videoPlaceholder.classList.add('hidden');

        if (videoData.coverUrl) {
            previewVideo.poster = cleanUrl(videoData.coverUrl);
        }
    } else {
        previewVideo.classList.add('hidden');

        if (videoData.coverUrl) {
            videoCover.src = cleanUrl(videoData.coverUrl);
            videoCover.classList.remove('hidden');
        } else {
            videoCover.classList.add('hidden');
        }
    }
}

// 创建音乐容器
function createMusicContainer(videoData) {
    const music = videoData.music || {};
    const musicContainer = document.createElement('div');

    // 检查音乐数据是否存在且包含有效的URL
    const hasValidMusic = music && music.url && isValidUrl(music.url);

    if (!hasValidMusic) {
        // 没有有效音乐链接，显示"视频原声"提示
        musicContainer.className = 'bg-gray-50 rounded-xl p-6 mb-6 mt-6';

        const flexContainer = document.createElement('div');
        flexContainer.className = 'flex items-center';

        const iconContainer = document.createElement('div');
        iconContainer.className = 'w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4';
        iconContainer.innerHTML = '<i class="fa fa-music text-primary"></i>';

        const textContainer = document.createElement('div');
        const titleHeading = document.createElement('h4');
        titleHeading.className = 'font-medium';
        titleHeading.textContent = '视频原声';

        textContainer.appendChild(titleHeading);
        flexContainer.appendChild(iconContainer);
        flexContainer.appendChild(textContainer);

        musicContainer.appendChild(flexContainer);
        return musicContainer;
    }

    // 有有效音乐链接，显示音乐播放模块
    const musicTitle = escapeHtml(music.title || '未知音乐');
    const musicAuthor = escapeHtml(music.author || '未知作者');
    const musicAvatar = music.avatar ? cleanUrl(music.avatar) : '';
    const musicUrl = cleanUrl(music.url);

    musicContainer.className = 'bg-gray-50 rounded-xl p-6 mb-6 mt-6';

    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex items-start';

    // 添加音乐封面（如果有）
    if (musicAvatar) {
        const avatarImg = document.createElement('img');
        avatarImg.src = musicAvatar;
        avatarImg.className = 'w-20 h-20 rounded-lg mr-4';
        avatarImg.onerror = "this.onerror=null;this.src='https://via.placeholder.com/80x80?text=封面'";
        flexContainer.appendChild(avatarImg);
    }

    // 创建音乐信息容器
    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex-1';

    // 添加音乐标题
    const titleHeading = document.createElement('h4');
    titleHeading.className = 'font-medium';
    titleHeading.textContent = musicTitle;

    // 添加音乐作者
    const authorPara = document.createElement('p');
    authorPara.className = 'text-sm text-gray-500';
    authorPara.textContent = musicAuthor;

    // 添加标题和作者到信息容器
    const metaContainer = document.createElement('div');
    metaContainer.className = 'mb-4';
    metaContainer.appendChild(titleHeading);
    metaContainer.appendChild(authorPara);

    // 创建音频控制和下载按钮的容器
    const controlContainer = document.createElement('div');
    controlContainer.className = 'flex items-center gap-4';

    // 创建音频元素
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.className = 'flex-1';

    const sourceElement = document.createElement('source');
    sourceElement.src = musicUrl;
    sourceElement.type = 'audio/mpeg';

    audioElement.appendChild(sourceElement);

    // 创建下载按钮
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark';
    downloadBtn.innerHTML = '<i class="fa fa-download"></i>';
    downloadBtn.onclick = () => downloadFile(musicUrl);

    // 添加音频和下载按钮到控制容器
    controlContainer.appendChild(audioElement);
    controlContainer.appendChild(downloadBtn);

    // 添加所有内容到音乐信息容器
    infoContainer.appendChild(metaContainer);
    infoContainer.appendChild(controlContainer);

    // 添加音乐信息容器到主容器
    flexContainer.appendChild(infoContainer);
    musicContainer.appendChild(flexContainer);

    return musicContainer;
}

// 创建作者信息容器（不存在作者信息时不显示）
function createAuthorContainer(videoData) {
    // 检查是否存在作者相关信息（根据实际接口字段调整判断条件）
    // 若avatar、author等核心字段均不存在，则返回null不显示该容器
    if (!videoData ||
        (videoData.avatar === undefined &&
            videoData.author === undefined &&
            videoData.like === undefined)) {
        return null;
    }

    const authorContainer = document.createElement('div');
    authorContainer.className = 'flex items-center mb-6';

    // 头像（仅在存在时显示）
    if (videoData.avatar) {
        const avatarImg = document.createElement('img');
        avatarImg.src = cleanUrl(videoData.avatar);
        avatarImg.className = 'w-12 h-12 rounded-full mr-4';
        avatarImg.onerror = function() {
            this.onerror = null;
            this.src = 'https://via.placeholder.com/48x48?text=头像';
        };
        authorContainer.appendChild(avatarImg);
    }

    const authorInfo = document.createElement('div');

    // 作者名称（仅在存在时显示）
    if (videoData.author) {
        const authorName = document.createElement('div');
        authorName.className = 'font-medium';
        authorName.textContent = videoData.author;
        authorInfo.appendChild(authorName);
    }

    // 点赞数（仅在存在且有效时显示）
    if (videoData.like !== undefined && videoData.like !== null && videoData.like > 0) {
        const likeCount = document.createElement('div');
        likeCount.className = 'text-sm text-gray-500';
        likeCount.textContent = `点赞 ${formatNumber(videoData.like)}`;
        authorInfo.appendChild(likeCount);
    }

    // 若作者信息容器为空，则不添加到父元素
    if (authorInfo.children.length === 0) {
        return null;
    }

    authorContainer.appendChild(authorInfo);
    return authorContainer;
}

// 创建信息容器
function createInfoContainer(videoData) {
    const infoContainer = document.createElement('div');
    infoContainer.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-6';

    // 视频标题
    infoContainer.appendChild(createInfoCard('作品标题', videoData.title || '未知标题'));

    // 发布时间
    infoContainer.appendChild(createInfoCard('发布时间', formatDate(videoData.time) || '未知时间'));

    // 作品类型
    const typeText = videoData.images && videoData.images.length > 0 ? '图片集' : '视频';
    infoContainer.appendChild(createInfoCard('作品类型', typeText));

    return infoContainer;
}

// 创建视频播放器
function createVideoPlayer(container, videoData) {
    // 创建视频预览容器
    const previewContainer = document.createElement('div');
    previewContainer.className = 'rounded-xl overflow-hidden mb-6 shadow-lg';

    // 创建视频占位符
    const videoPlaceholder = document.createElement('div');
    videoPlaceholder.id = 'video-placeholder';
    videoPlaceholder.className = 'w-full h-64 bg-gray-100 flex items-center justify-center';
    videoPlaceholder.innerHTML = '<i class="fa fa-film text-5xl text-gray-300"></i>';

    // 创建视频元素
    const previewVideo = document.createElement('video');
    previewVideo.id = 'preview-video';
    previewVideo.className = 'w-full hidden';
    previewVideo.setAttribute('controls', '');

    // 创建封面图片
    const videoCover = document.createElement('img');
    videoCover.id = 'video-cover';
    videoCover.className = 'w-full hidden';
    videoCover.setAttribute('alt', '视频封面');

    // 更新视频预览
    updateVideoPreview(previewVideo, videoPlaceholder, videoCover, videoData);

    // 添加到预览容器
    previewContainer.append(videoPlaceholder, previewVideo, videoCover);
    container.appendChild(previewContainer);

    // 创建下载按钮
    const downloadBtn = document.createElement('a');
    downloadBtn.id = 'download-btn';
    downloadBtn.href = cleanUrl(videoData.url);
    downloadBtn.className = 'button-neomorphism px-6 py-3 text-white font-medium flex items-center justify-center mb-4';
    downloadBtn.innerHTML = '<i class="fa fa-download mr-2"></i><span>下载无水印视频</span>';

    container.appendChild(downloadBtn);
}

// 创建图片画廊
function createImageGallery(container, videoData) {
    // 创建图片容器
    const imagesContainer = document.createElement('div');
    imagesContainer.id = 'images-container';
    // 添加底部内边距为分页器腾出空间
    imagesContainer.className = 'swiper-container w-full mb-6 relative pb-8';

    const wrapper = document.createElement('div');
    wrapper.className = 'swiper-wrapper';

    // 添加所有图片
    videoData.images.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide relative group';

        const imgElement = document.createElement('img');
        imgElement.src = cleanUrl(img);
        imgElement.className = 'w-full h-96 object-cover rounded-xl';
        imgElement.loading = 'lazy';
        imgElement.onerror = "this.onerror=null;this.src='https://via.placeholder.com/800x600?text=图片加载失败'";

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'absolute bottom-4 right-4 bg-white/80 hover:bg-white px-4 py-2 rounded-lg shadow-md transition-all opacity-0 group-hover:opacity-100';
        downloadBtn.innerHTML = '<i class="fa fa-download mr-2"></i>下载';
        downloadBtn.onclick = () => {
            const cleanedUr = cleanUrl(img);
            downloadFile(cleanedUr);
        };

        slide.appendChild(imgElement);
        slide.appendChild(downloadBtn);
        wrapper.appendChild(slide);
    });

    // 添加分页和导航
    const pagination = document.createElement('div');
    // 添加自定义类名并移除mt-2
    pagination.className = 'swiper-pagination gallery-pagination';

    const prevButton = document.createElement('div');
    prevButton.className = 'swiper-button-prev gallery-nav-button';

    const nextButton = document.createElement('div');
    nextButton.className = 'swiper-button-next gallery-nav-button';

    imagesContainer.appendChild(wrapper);
    imagesContainer.appendChild(pagination);
    imagesContainer.appendChild(prevButton);
    imagesContainer.appendChild(nextButton);

    container.appendChild(imagesContainer);

    // 添加下载全部按钮
    const downloadAllBtn = document.createElement('button');
    downloadAllBtn.className = 'button-neomorphism px-6 py-3 mb-6 w-full';
    downloadAllBtn.innerHTML = `<i class="fa fa-images mr-2"></i>下载全部图片（${videoData.images.length}张）`;
    downloadAllBtn.onclick = () => {
        // 检查是否需要加载JSZip库
        if (typeof JSZip === 'undefined') {
            showToast('正在加载压缩库，请稍候...');
            // 动态加载JSZip库
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
            script.onload = () => {
                compressAndDownloadImages(videoData.images);
            };
            script.onerror = () => {
                showError('压缩库加载失败，请重试');
            };
            document.head.appendChild(script);
        } else {
            compressAndDownloadImages(videoData.images);
        }
    };

    container.appendChild(downloadAllBtn);

    // 初始化Swiper
    initSwiper();
}

// 压缩并下载图片函数
function compressAndDownloadImages(imageUrls) {
    // 创建压缩对象
    const zip = new JSZip();
    const imageFolder = zip.folder('images');
    let loadedCount = 0;
    let errorCount = 0;
    
    showToast(`开始下载并压缩图片（${imageUrls.length}张）`);
    
    // 下载并添加每张图片到压缩包
    imageUrls.forEach((imgUrl, index) => {
        const cleanedUrl = cleanUrl(imgUrl);
        const fileName = `image_${index + 1}.jpg`;
        
        // 使用fetch API获取图片数据
        fetch(cleanedUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                // 将图片添加到压缩包
                imageFolder.file(fileName, blob);
                loadedCount++;
                
                // 所有图片都已添加到压缩包
                if (loadedCount + errorCount === imageUrls.length) {
                    if (loadedCount > 0) {
                        // 生成压缩包并下载
                        zip.generateAsync({type: 'blob'})
                            .then(content => {
                                // 创建下载链接
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(content);
                                link.download = 'images_' + new Date().getTime() + '.zip';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                
                                showToast(`成功压缩并下载${loadedCount}张图片`);
                                if (errorCount > 0) {
                                    console.warn(`${errorCount}张图片下载失败`);
                                }
                            })
                            .catch(err => {
                                showError('图片压缩失败: ' + err.message);
                                console.error('Zip generation error:', err);
                            });
                    } else {
                        showError('所有图片下载失败，请重试');
                    }
                }
            })
            .catch(err => {
                console.error(`下载图片失败 (${index + 1}):`, err);
                errorCount++;
                
                // 检查是否所有图片处理完成
                if (loadedCount + errorCount === imageUrls.length) {
                    if (loadedCount > 0) {
                        // 即使有部分失败，也尝试生成压缩包
                        zip.generateAsync({type: 'blob'})
                            .then(content => {
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(content);
                                link.download = 'images_' + new Date().getTime() + '.zip';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                
                                showToast(`成功压缩并下载${loadedCount}张图片，${errorCount}张失败`);
                            })
                            .catch(zipErr => {
                                showError('图片压缩失败: ' + zipErr.message);
                            });
                    } else {
                        showError('所有图片下载失败，请重试');
                    }
                }
            });
    });
}

// 初始化Swiper插件
function initSwiper() {
    try {
        if (typeof Swiper !== 'undefined') {
            new Swiper('.swiper-container', {
                loop: true,
                pagination: {el: '.swiper-pagination', clickable: true},
                navigation: {nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev'}
            });
        } else {
            console.error('Swiper库未加载');
            // 降级处理 - 为非Swiper环境添加基本样式
            document.querySelectorAll('.swiper-slide').forEach(slide => {
                slide.classList.add('mb-4');
            });
            showToast('幻灯片组件加载失败，将以普通图片显示');
        }
    } catch (error) {
        console.error('初始化Swiper失败:', error);
        // 降级处理
        document.querySelectorAll('.swiper-slide').forEach(slide => {
            slide.classList.add('mb-4');
        });
        showToast('幻灯片组件加载失败，将以普通图片显示');
    }
}

// 复制URL并显示提示
function copyUrl(url, type) {
    if (!url) {
        showError(`没有可复制的${type}`);
        return;
    }

    navigator.clipboard.writeText(url).then(() => {
        showToast(`${type}已复制到剪贴板`);

        // 获取按钮并添加成功状态
        const btn = document.activeElement;
        if (btn && btn.id.startsWith('copy-')) {
            btn.classList.add('bg-green-500', 'text-white');
            btn.innerHTML = `<i class="fa fa-check mr-2"></i><span>复制成功</span>`;

            setTimeout(() => {
                btn.classList.remove('bg-green-500', 'text-white');
                btn.innerHTML = `<i class="fa fa-link mr-2"></i><span>复制${type}</span>`;
            }, 2000);
        }
    }).catch(err => {
        showError(`无法复制${type}`);
    });
}

// 绑定复制按钮事件
function bindCopyButtonEvents() {
    // 复制链接按钮
    document.getElementById('copy-cover-btn')?.addEventListener('click', () => {
        copyUrl(videosjson?.cover, '封面链接');
    });

    document.getElementById('copy-url-btn')?.addEventListener('click', () => {
        copyUrl(videosjson?.url, '视频链接');
    });
}

// 检查并加载Swiper库
function checkSwiper() {
    if (typeof Swiper === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js';
        script.onload = () => {
            console.log('Swiper库加载成功');
            // 如果有图片集，重新初始化Swiper
            const imagesContainer = document.getElementById('images-container');
            if (imagesContainer && !imagesContainer.classList.contains('hidden')) {
                initSwiper();
            }
        };
        script.onerror = () => console.error('Swiper库加载失败');
        document.head.appendChild(script);
    }
}

// 为页面添加暗色模式支持
function setupDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) return;

    // 检查用户偏好
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || (localStorage.getItem('darkMode') === null && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // 应用初始模式
    document.documentElement.classList.toggle('dark', isDarkMode);
    darkModeToggle.checked = isDarkMode;

    // 监听切换事件
    darkModeToggle.addEventListener('change', () => {
        const darkMode = darkModeToggle.checked;
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('darkMode', darkMode);
    });
}

// 添加分享功能
function setupShare() {
    const shareBtn = document.getElementById('share-btn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: '视频解析工具', text: '我用这个工具解析了一个视频，你也可以试试', url: window.location.href
                });
            } else {
                // 回退方案：复制链接到剪贴板
                navigator.clipboard.writeText(window.location.href).then(() => {
                    showToast('链接已复制到剪贴板');
                }).catch(err => {
                    showError('无法复制链接');
                });
            }
        } catch (error) {
            showError('分享失败');
            console.error('分享错误:', error);
        }
    });
}

// 存储视频数据
let videosjson = '';

document.addEventListener('DOMContentLoaded', function () {
    setupFAQToggle();
    // 导航栏滚动效果
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('py-2', window.scrollY > 50);
        navbar.classList.toggle('py-4', window.scrollY <= 50);
        navbar.classList.toggle('shadow-lg', window.scrollY > 50);
    });

    // 平台与接口的映射关系
    const platformApiMap = {
        'all': 'https://api.bugpk.com/api/short_videos',
        'douyin': 'https://api.bugpk.com/api/douyin',
        'kuaishou': 'https://api.bugpk.com/api/ksjx',
        'bilibili': 'https://api.bugpk.com/api/bilibili',
        'xhs': 'https://api.bugpk.com/api/xhsjx',
        'toutiao':'https://api.bugpk.com/api/toutiao',
    };

    // 当前选中的平台
    let currentPlatform = 'all';

    // 平台选择按钮
    document.querySelectorAll('.platform-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.platform-btn').forEach(b => {
                b.classList.remove('active', 'bg-primary/10', 'text-primary');
                b.classList.add('bg-gray-100', 'text-gray-600');
            });
            btn.classList.add('active', 'bg-primary/10', 'text-primary');
            btn.classList.remove('bg-gray-100', 'text-gray-600');
            currentPlatform = btn.getAttribute('data-platform');
        });
    });

    // 初始激活"所有平台"按钮
    document.querySelector('.platform-btn[data-platform="all"]')?.click();

    // 清空输入框按钮
    document.getElementById('clear-btn')?.addEventListener('click', () => {
        const videoUrlInput = document.getElementById('video-url');
        videoUrlInput.value = '';
        videoUrlInput.parentElement.classList.remove('scale-[1.01]');
        document.getElementById('clear-btn').classList.add('animate-spin');
        setTimeout(() => document.getElementById('clear-btn').classList.remove('animate-spin'), 500);
    });

    // 解析按钮
    document.getElementById('parse-btn')?.addEventListener('click', async () => {
        const parseBtn = document.getElementById('parse-btn');
        parseBtn.classList.add('scale-95');
        setTimeout(() => parseBtn.classList.remove('scale-95'), 200);

        // 新增：URL提取函数
        const extractUrlFromText = (text) => {
            // 匹配HTTP/HTTPS链接的正则表达式
            const urlPattern = /https?:\/\/[^\s]+/gi;
            const matches = text.match(urlPattern);
            return matches ? matches[0] : null;
        };

        const rawInput = document.getElementById('video-url')?.value.trim() || '';

        if (!rawInput) {
            showError('请输入视频链接或包含链接的文本');
            return;
        }

        // 尝试从输入文本中提取URL
        let url = extractUrlFromText(rawInput);

        // 如果没有提取到URL，则使用原始输入
        if (!url) {
            url = rawInput;
        }

        if (!isValidUrl(url)) {
            showError('无法从输入中提取有效的URL');
            return;
        }

        // 可选：将提取到的URL更新到输入框
        document.getElementById('video-url').value = url;

        hideAllContainers();
        document.getElementById('loading-container')?.classList.remove('hidden');

        try {
            const apiUrl = platformApiMap[currentPlatform] || platformApiMap['all'];
            const controller = new AbortController();
            const signal = controller.signal;
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const encodedUrl = encodeURIComponent(url);
            const response = await fetch(`${apiUrl}?url=${encodedUrl}`, {signal});

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP错误! 状态码: ${response.status}`);
            }

            const data = await response.json();

            if (data.code === 200) {
                videosjson = data.data;
                showResult(videosjson);
                // 重新绑定复制按钮事件
                bindCopyButtonEvents();
            } else {
                showError(data.msg || '解析失败，请稍后再试');
            }
        } catch (error) {
            console.error('解析请求出错:', error);
            showError(error.name === 'AbortError' ? '请求超时，请重试' : '网络错误，请检查您的连接');
        }
    });

    // 处理键盘事件
    document.addEventListener('keydown', (event) => {
        // Ctrl+V 快捷解析
        if (event.ctrlKey && event.key === 'v') {
            setTimeout(() => {
                const urlInput = document.getElementById('video-url');
                if (urlInput && urlInput.value.trim()) {
                    const parseBtn = document.getElementById('parse-btn');
                    if (parseBtn) parseBtn.click();
                }
            }, 100);
        }

        // ESC 关闭结果
        if (event.key === 'Escape') {
            hideAllContainers();
            document.getElementById('video-url').value = '';
        }
    });

    // 初始化暗色模式
    setupDarkMode();

    // 初始化分享功能
    setupShare();

    // 页面加载时检查Swiper
    checkSwiper();
});

// 显示解析结果
function showResult(videoData) {
    hideAllContainers();
    const resultContainer = document.getElementById('result-container');

    if (!resultContainer) return;

    resultContainer.innerHTML = '';
    resultContainer.classList.remove('hidden');

    // 显示容器动画
    resultContainer.style.cssText = 'opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease';
    setTimeout(() => {
        resultContainer.style.opacity = '1';
        resultContainer.style.transform = 'translateY(0)';
    }, 10);

    // 创建作者信息（图片和视频模式都需要）
    const authorContainer = createAuthorContainer(videoData);
    if (authorContainer) {
        resultContainer.appendChild(authorContainer);
    }

    // 创建视频/图片内容
    if (videoData.images && videoData.images.length > 0) {
        // 图片集处理
        createImageGallery(resultContainer, videoData);

        // 复制按钮容器（仅图片模式）
        const copyBtnContainer = document.createElement('div');
        copyBtnContainer.className = 'flex flex-wrap gap-4 mb-6';

        // 复制封面链接按钮
        const copyCoverBtn = document.createElement('button');
        copyCoverBtn.id = 'copy-cover-btn';
        copyCoverBtn.className = 'bg-white border border-primary text-primary hover:bg-primary/5 transition-colors rounded-lg px-6 py-3 font-medium flex items-center justify-center flex-1';
        copyCoverBtn.innerHTML = '<i class="fa fa-link mr-2"></i><span>复制封面链接</span>';

        copyBtnContainer.appendChild(copyCoverBtn);
        resultContainer.appendChild(copyBtnContainer);
    } else {
        // 视频处理
        createVideoPlayer(resultContainer, videoData);

        // 复制按钮容器（仅视频模式）
        const copyBtnContainer = document.createElement('div');
        copyBtnContainer.className = 'flex flex-wrap gap-4 mb-6';

        // 复制封面链接按钮
        const copyCoverBtn = document.createElement('button');
        copyCoverBtn.id = 'copy-cover-btn';
        copyCoverBtn.className = 'bg-white border border-primary text-primary hover:bg-primary/5 transition-colors rounded-lg px-6 py-3 font-medium flex items-center justify-center flex-1';
        copyCoverBtn.innerHTML = '<i class="fa fa-link mr-2"></i><span>复制封面链接</span>';

        // 复制视频链接按钮
        const copyUrlBtn = document.createElement('button');
        copyUrlBtn.id = 'copy-url-btn';
        copyUrlBtn.className = 'bg-white border border-primary text-primary hover:bg-primary/5 transition-colors rounded-lg px-6 py-3 font-medium flex items-center justify-center flex-1';
        copyUrlBtn.innerHTML = '<i class="fa fa-link mr-2"></i><span>复制视频链接</span>';

        copyBtnContainer.append(copyCoverBtn, copyUrlBtn);
        resultContainer.appendChild(copyBtnContainer);
    }

    // 创建视频信息（图片和视频模式都需要）
    const infoContainer = createInfoContainer(videoData);
    if (infoContainer) {
        resultContainer.appendChild(infoContainer);
    }

    // 添加音乐容器（图片和视频模式都需要）
    const musicContainer = createMusicContainer(videoData);
    if (musicContainer && musicContainer.innerHTML.trim()) {
        resultContainer.appendChild(musicContainer);
    }
}

// 新增常见问题切换功能
function setupFAQToggle() {
    document.querySelectorAll('.faq-btn').forEach(button => {
        button.addEventListener('click', function () {
            const content = this.nextElementSibling;
            const icon = this.querySelector('i');

            // 切换内容显示
            content.classList.toggle('hidden');
            content.classList.toggle('block');

            // 旋转图标动画
            icon.classList.toggle('rotate-180');

            // 关闭其他展开的问题
            document.querySelectorAll('.faq-btn').forEach(otherBtn => {
                if (otherBtn !== button) {
                    otherBtn.nextElementSibling.classList.add('hidden');
                    otherBtn.querySelector('i').classList.remove('rotate-180');
                }
            });
        });
    });
}
