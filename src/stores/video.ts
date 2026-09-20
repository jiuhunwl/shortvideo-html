import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import type {
  DownloadInput,
  DownloadTask,
  ParsedMedia,
  Particle,
  ToastMessage,
  ToastType,
} from "../types/media";

export const useVideoStore = defineStore("video", () => {
  const resultData = shallowRef<ParsedMedia | null>(null),
    toasts = ref<ToastMessage[]>([]),
    showProgress = shallowRef(false),
    progressText = shallowRef(""),
    progressStatus = shallowRef(""),
    progressPercent = shallowRef(0),
    downloads = ref<DownloadTask[]>([]),
    activeDownloads = shallowRef(new Map<number, DownloadTask>());
  let swiperInstance: { destroy: () => void } | null = null;
  const setResult = (data: ParsedMedia) => {
    resultData.value = data;
  };
  const clearResult = () => {
    resultData.value = null;
  };
  const addToast = (
    message: string,
    type: ToastType = "success",
    duration = 3000,
  ) => {
    if (!message) return null;
    const id = `${Date.now()}-${Math.random()}`,
      safeDuration =
        Number.isFinite(duration) && duration > 0 ? duration : 3000;
    toasts.value = toasts.value.filter(
      (item) => !(item.message === message && item.type === type),
    );
    toasts.value.push({ id, message, type });
    window.setTimeout(() => {
      toasts.value = toasts.value.filter((item) => item.id !== id);
    }, safeDuration);
    return id;
  };
  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((item) => item.id !== id);
  };
  const setProgress = ({
    text,
    status,
    percent = 0,
  }: {
    text: string;
    status: string;
    percent?: number;
  }) => {
    showProgress.value = true;
    progressText.value = text;
    progressStatus.value = status;
    progressPercent.value = percent;
  };
  const hideProgress = () => {
    showProgress.value = false;
    progressText.value = "";
    progressStatus.value = "";
    progressPercent.value = 0;
  };
  const addDownload = (input: DownloadInput) => {
    const id = Date.now() + Math.random();
    downloads.value.push({
      id,
      status: "preparing",
      percent: 0,
      loaded: 0,
      total: 0,
      speed: 0,
      error: null,
      statusText: "准备中...",
      show: true,
      abortController: null,
      ...input,
    } as DownloadTask);
    return id;
  };
  const updateDownload = (id: number, updates: Partial<DownloadTask>) => {
    const index = downloads.value.findIndex((item) => item.id === id);
    if (index !== -1)
      downloads.value[index] = { ...downloads.value[index], ...updates };
  };
  const removeDownload = (id: number) => {
    const index = downloads.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      downloads.value[index].abortController?.abort();
      downloads.value.splice(index, 1);
    }
  };
  const cancelDownload = (id: number) => {
    const download = downloads.value.find((item) => item.id === id);
    if (download) {
      download.abortController?.abort();
      updateDownload(id, { status: "cancelled", statusText: "已取消" });
    }
  };
  const clearCompletedDownloads = () => {
    downloads.value = downloads.value.filter(
      (item) => !["completed", "cancelled", "failed"].includes(item.status),
    );
  };
  /** 懒解析后回填某集字段；videos 与 collections[].episodes 同步更新（shallowRef 需整体重赋值） */
  const patchVideo = (
    target: { index: number; _cid?: string; _bvid?: string },
    patch: Partial<import("../types/media").MediaVideo>,
  ) => {
    const data = resultData.value;
    if (!data) return;
    const matches = (video: import("../types/media").MediaVideo) =>
      video.index === target.index &&
      (video._cid ?? null) === (target._cid ?? null) &&
      (video._bvid ?? "") === (target._bvid ?? "");
    const nextVideos = data.videos?.map((video) =>
      matches(video) ? ({ ...video, ...patch } as import("../types/media").MediaVideo) : video,
    );
    const nextCollections = data.collections?.map((collection) => ({
      ...collection,
      episodes: collection.episodes.map((video) =>
        matches(video)
          ? ({ ...video, ...patch } as import("../types/media").MediaVideo)
          : video,
      ),
    }));
    resultData.value = {
      ...data,
      ...(nextVideos ? { videos: nextVideos } : {}),
      ...(nextCollections ? { collections: nextCollections } : {}),
    };
  };
  const initSwiper = () => {
    swiperInstance?.destroy();
    swiperInstance = null;
    if (window.Swiper && document.querySelector(".swiper"))
      swiperInstance = new window.Swiper(".swiper", {
        pagination: { el: ".swiper-pagination", clickable: true },
        loop: true,
        autoplay: { delay: 3000, disableOnInteraction: false },
      });
  };
  const initParticles = () => {
    const canvas = document.getElementById("particle-canvas");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let particles: Particle[] = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1,
    });
    resize();
    particles = Array.from({ length: 50 }, createParticle);
    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
        context.fill();
      });
      requestAnimationFrame(draw);
    };
    window.addEventListener("resize", resize, { passive: true });
    draw();
  };
  return {
    resultData,
    toasts,
    showProgress,
    progressText,
    progressStatus,
    progressPercent,
    downloads,
    activeDownloads,
    setResult,
    clearResult,
    addToast,
    removeToast,
    setProgress,
    hideProgress,
    addDownload,
    updateDownload,
    removeDownload,
    cancelDownload,
    clearCompletedDownloads,
    patchVideo,
    initSwiper,
    initParticles,
  };
});
