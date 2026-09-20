<script setup lang="ts">
import { computed } from "vue";
import type { MediaCollection, MediaVideo } from "../types/media";

const props = defineProps<{
  videos: MediaVideo[];
  currentIndex: number;
  selectedSet?: Set<number>;
  total?: number;
  disabled?: boolean;
  /** 合集列表（有值时分集编号显示 EP 前缀；>1 个合集时展示切换 Tab） */
  collections?: MediaCollection[];
  /** 当前合集序号 */
  activeCollection?: number;
}>();

const emit = defineEmits<{
  (e: "select", index: number): void;
  (e: "toggle", index: number): void;
  (e: "select-all"): void;
  (e: "clear-selection"): void;
  (e: "select-collection", index: number): void;
}>();

const selected = computed(() => props.selectedSet ?? new Set<number>());
const selectedCount = computed(() => selected.value.size);
const allCount = computed(() => props.videos.filter((v) => !v.error).length);
const allSelected = computed(
  () => selectedCount.value > 0 && selectedCount.value === allCount.value,
);
const showTabs = computed(() => (props.collections?.length ?? 0) > 1);
const epPrefix = computed(() =>
  (props.collections?.length ?? 0) > 0 ? "EP" : "P",
);

const formatDuration = (seconds?: number | null): string => {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
};

const visibleDuration = (video: MediaVideo): string => {
  if (video.durationFormat) return video.durationFormat;
  return formatDuration(video.duration);
};

const handleKeydown = (e: KeyboardEvent, index: number): void => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    emit("select", index);
  }
};

const onCoverError = (e: Event): void => {
  const target = e.target as HTMLImageElement | null;
  if (target) target.style.display = "none";
};
</script>

<template>
  <div class="vlib">
    <!-- 合集切换 Tab（多合集时） -->
    <div v-if="showTabs" class="vlib-tabs ux-scrollbar-hide" role="tablist">
      <button
        v-for="col in collections"
        :key="col.index"
        role="tab"
        class="vlib-tab"
        :class="{ 'vlib-tab--on': col.index === activeCollection }"
        :aria-selected="col.index === activeCollection"
        :disabled="disabled"
        @click="emit('select-collection', col.index)"
      >
        <span class="vlib-tab-name">{{ col.title }}</span>
        <span class="vlib-tab-count">{{ col.episodes.length }}</span>
      </button>
    </div>

    <!-- 多选工具条 -->
    <div v-if="props.total !== undefined && props.total > 1" class="vlib-toolbar">
      <span class="vlib-toolbar-count">
        已选 <strong>{{ selectedCount }}</strong> / {{ allCount }}
      </span>
      <div class="vlib-toolbar-actions">
        <button
          class="ux-btn ux-btn-sm"
          :disabled="disabled"
          @click="allSelected ? emit('clear-selection') : emit('select-all')"
        >
          {{ allSelected ? '清空' : '全选' }}
        </button>
      </div>
    </div>

    <!-- 横向滚动卡片列表 -->
    <div class="vlib-scroll ux-scrollbar-hide" role="list">
      <div
        v-for="(v, idx) in videos"
        :key="idx"
        class="vlib-card"
        :class="{
          'vlib-card--current': idx === currentIndex && !v.error && !v._resolving,
          'vlib-card--error': !!v.error,
          'vlib-card--disabled': !!v.error,
          'vlib-card--resolving': !!v._resolving,
        }"
        role="listitem"
        :aria-selected="idx === currentIndex"
        :aria-disabled="!!v.error"
        tabindex="0"
        @click="!v.error && !disabled && emit('select', idx)"
        @keydown="handleKeydown($event, idx)"
      >
        <!-- checkbox -->
        <label
          class="vlib-check"
          @click.stop="!v.error && !disabled && emit('toggle', idx)"
        >
          <input
            type="checkbox"
            class="ux-checkbox"
            :disabled="!!v.error || disabled"
            :checked="selected.has(idx)"
            @change.stop="!v.error && !disabled && emit('toggle', idx)"
          />
        </label>

        <div class="vlib-card-cover">
          <img
            v-if="v.cover"
            :src="v.cover"
            class="vlib-card-img"
            :alt="v.title || `P${idx + 1}`"
            @error="onCoverError"
          />
          <div v-else class="vlib-card-cover-fb">
            <i class="fas fa-film"></i>
          </div>
          <span class="vlib-ep">{{ epPrefix }}{{ v._epNo || v.index || idx + 1 }}</span>
          <span v-if="v._resolving" class="vlib-ep-resolving" aria-label="解析中">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
          <span v-else-if="v.error" class="vlib-ep-error">⚠</span>
        </div>

        <div class="vlib-card-body">
          <div class="vlib-card-title ux-truncate-2">
            {{ v.title || `P${idx + 1}` }}
          </div>
          <div class="vlib-card-meta">
            <span class="vlib-duration">
              <i class="fas fa-clock"></i>
              {{ visibleDuration(v) }}
            </span>
            <span v-if="v.quality" class="vlib-quality">{{ v.quality }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vlib {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

/* 合集切换 Tab */
.vlib-tabs {
  display: flex;
  gap: 0.375rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: none;
}
.vlib-tabs::-webkit-scrollbar { display: none; }
.vlib-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex: 0 0 auto;
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms);
  white-space: nowrap;
}
.vlib-tab:hover {
  border-color: var(--color-primary-light);
  color: var(--color-primary);
}
.vlib-tab--on {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary, var(--color-primary)));
  border-color: transparent;
  color: #fff;
}
.vlib-tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.vlib-tab-count {
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
}
.vlib-tab--on .vlib-tab-count {
  background: rgba(255, 255, 255, 0.22);
}

.vlib-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
}
.vlib-toolbar-count {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
.vlib-toolbar-count strong {
  color: var(--color-primary);
}
.vlib-toolbar-actions {
  display: flex;
  gap: 0.375rem;
}

.vlib-scroll {
  display: flex;
  gap: 0.625rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
}

.vlib-card {
  position: relative;
  flex: 0 0 auto;
  width: 14rem; /* w-56 */
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  cursor: pointer;
  outline: none;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
}
.vlib-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-light);
}
.vlib-card:focus-visible {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
}
.vlib-card--current {
  border-color: transparent;
  box-shadow: var(--shadow-glow-primary);
  /* ux-gradient-border 语义：渐变描边 */
  background:
    linear-gradient(var(--color-bg-primary), var(--color-bg-primary)) padding-box,
    linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent)) border-box;
  border: 2px solid transparent;
}
.dark .vlib-card--current {
  background:
    linear-gradient(var(--color-bg-dark), var(--color-bg-dark)) padding-box,
    linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent)) border-box;
}
.vlib-card--error {
  opacity: 0.55;
  filter: grayscale(0.6);
}
.vlib-card--disabled {
  cursor: not-allowed;
}

.vlib-card-cover {
  position: relative;
  aspect-ratio: 16/9;
  background: var(--color-bg-tertiary);
}
.vlib-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.vlib-card-cover-fb {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 1.5rem;
}
.vlib-ep,
.vlib-ep-error {
  position: absolute;
  top: 0.375rem;
  right: 0.375rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.375rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  border-radius: 0.375rem;
  font-size: 0.625rem;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  color: #fff;
}
.vlib-ep-error {
  left: 0.375rem;
  right: auto;
  background: var(--color-error);
}
.vlib-ep-resolving {
  left: 0.375rem;
  right: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.375rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  border-radius: 0.375rem;
  font-size: 0.625rem;
  color: #fff;
  background: var(--color-primary, #6366f1);
}
.vlib-card--resolving {
  border-color: var(--color-primary, #6366f1);
}
.vlib-check {
  position: absolute;
  top: 0.375rem;
  left: 0.375rem;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.375rem;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
}

.vlib-card-body {
  padding: 0.625rem 0.75rem 0.75rem;
}
.vlib-card-title {
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.35;
  color: var(--color-text-primary);
}
.vlib-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.375rem;
  margin-top: 0.375rem;
}
.vlib-duration {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: var(--color-text-muted);
}
.vlib-quality {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.1);
  border-radius: 999px;
  padding: 0.1rem 0.45rem;
}

/* dark mode tokens */
.dark .vlib-card {
  background: var(--color-bg-dark-secondary);
  border-color: var(--color-border-dark);
}
.dark .vlib-tab {
  background: var(--color-bg-dark-secondary);
  border-color: var(--color-border-dark);
}
.dark .vlib-tab-count {
  background: rgba(255, 255, 255, 0.1);
}
.dark .vlib-toolbar {
  background: var(--color-bg-dark-secondary);
  border-color: var(--color-border-dark);
}
.dark .vlib-card-title {
  color: var(--color-text-dark-primary);
}
.dark .vlib-duration,
.dark .vlib-card-cover-fb {
  color: var(--color-text-dark-muted);
}
</style>