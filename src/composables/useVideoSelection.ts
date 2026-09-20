import { computed, ref, type ComputedRef, type Ref } from "vue";
import type { MediaCollection, MediaVideo } from "../types/media";
import type { useVideoStore } from "../stores/video";

interface UseVideoSelectionOptions {
  videoStore: ReturnType<typeof useVideoStore>;
}

export interface VideoSelection {
  /** 当前选中序号（0 起始，相对 visibleList） */
  selectedIndex: Ref<number>;
  /** 当前合集序号（0 起始；无合集时恒为 0） */
  sectionIndex: Ref<number>;
  /** 当前选中集；无则 = null */
  currentVideo: ComputedRef<MediaVideo | null>;
  /** 当前选中集 URL（未懒解析的分集为 ""） */
  currentVideoUrl: ComputedRef<string>;
  /** 全量列表（合集时为所有合集拍平） */
  list: ComputedRef<MediaVideo[]>;
  /** 当前展示列表（合集时为当前合集的分集，否则 = list） */
  visibleList: ComputedRef<MediaVideo[]>;
  /** 合集列表（无合集 = []） */
  collections: ComputedRef<MediaCollection[]>;
  /** 是否为合集解析 */
  hasCollections: ComputedRef<boolean>;
  /** 总集数（取自 totalVideos ?? list.length） */
  total: ComputedRef<number>;
  /** 多视频判定（length > 1） */
  isMulti: ComputedRef<boolean>;
  /** 多选集合（visibleList 内 index set，0 起始） */
  selectedSet: Ref<Set<number>>;
  /** 选中数量 */
  selectedCount: ComputedRef<number>;

  /** 单选某集（越界 clamp 到 [0, len-1]，列表为空不动作） */
  selectIndex(index: number): void;
  /** 切换合集（重置集选中与多选） */
  setSection(index: number): void;
  /** 切换下一/上一集 */
  selectNext(): void;
  selectPrev(): void;
  /** 多选切换（不改 selectedIndex） */
  toggleSelect(index: number): void;
  /** 全选 / 清空（合集时作用于当前合集） */
  selectAll(): void;
  clearSelection(): void;
  /** 获取当前应下载的集合（多选优先，否则单选） */
  getBatchVideos(): MediaVideo[];
  /** 解析新数据时同步：重置并定位入口命中的分集/合集 */
  syncResult(): void;
  /** 解析新数据时重置（清空多选、index=0） */
  reset(): void;
}

export function useVideoSelection(
  options: UseVideoSelectionOptions,
): VideoSelection {
  const { videoStore } = options;
  const selectedIndex = ref(0);
  const selectedSet = ref(new Set<number>());
  const sectionIndex = ref(0);

  const list = computed<MediaVideo[]>(() => videoStore.resultData?.videos ?? []);
  const collections = computed<MediaCollection[]>(
    () => videoStore.resultData?.collections ?? [],
  );
  const hasCollections = computed(() => collections.value.length > 0);
  const visibleList = computed<MediaVideo[]>(() => {
    if (!hasCollections.value) return list.value;
    const section =
      collections.value[
        Math.min(Math.max(sectionIndex.value, 0), collections.value.length - 1)
      ];
    return section ? section.episodes : list.value;
  });
  const total = computed<number>(
    () => videoStore.resultData?.totalVideos ?? list.value.length,
  );
  const isMulti = computed(() => list.value.length > 1);
  const currentVideo = computed<MediaVideo | null>(() => {
    const items = visibleList.value;
    if (items.length === 0) return null;
    const idx = Math.min(Math.max(selectedIndex.value, 0), items.length - 1);
    return items[idx] ?? null;
  });
  const currentVideoUrl = computed<string>(() => currentVideo.value?.url ?? "");
  const selectedCount = computed(() => selectedSet.value.size);

  const clampIndex = (index: number): number => {
    const length = visibleList.value.length;
    if (length === 0) return 0;
    return Math.min(Math.max(Math.floor(index), 0), length - 1);
  };

  function selectIndex(index: number): void {
    if (visibleList.value.length === 0) return;
    selectedIndex.value = clampIndex(index);
    selectedSet.value = new Set();
  }

  function setSection(index: number): void {
    const count = collections.value.length;
    sectionIndex.value =
      count === 0
        ? 0
        : Math.min(Math.max(Math.floor(index), 0), count - 1);
    selectedIndex.value = 0;
    selectedSet.value = new Set();
  }

  function selectNext(): void {
    selectIndex(selectedIndex.value + 1);
  }
  function selectPrev(): void {
    selectIndex(selectedIndex.value - 1);
  }

  function toggleSelect(index: number): void {
    if (visibleList.value.length === 0) return;
    const idx = clampIndex(index);
    const video = visibleList.value[idx];
    if (video?.error) return;
    const next = new Set(selectedSet.value);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    selectedSet.value = next;
  }

  function selectAll(): void {
    const items = visibleList.value;
    const next = new Set<number>();
    items.forEach((video, idx) => {
      if (!video?.error) next.add(idx);
    });
    selectedSet.value = next;
  }

  function clearSelection(): void {
    selectedSet.value = new Set();
  }

  function getBatchVideos(): MediaVideo[] {
    if (selectedSet.value.size > 0) {
      return visibleList.value.filter((_, idx) => selectedSet.value.has(idx));
    }
    const video = currentVideo.value;
    return video ? [video] : [];
  }

  /** 解析新数据后调用：定位入口命中的分集（含所在合集），否则归零 */
  function syncResult(): void {
    selectedIndex.value = 0;
    selectedSet.value = new Set();
    sectionIndex.value = 0;
    const cols = collections.value;
    if (cols.length === 0) return;
    const items = list.value;
    const currentIdx = items.findIndex((video) => video._current);
    if (currentIdx < 0) return;
    const current = items[currentIdx];
    const sec = Number(current._sectionIndex) || 0;
    sectionIndex.value = Math.min(Math.max(sec, 0), cols.length - 1);
    const visible = cols[sectionIndex.value]?.episodes ?? [];
    const pos = visible.findIndex((episode) => episode.index === current.index);
    selectedIndex.value = Math.max(0, pos);
  }

  function reset(): void {
    selectedIndex.value = 0;
    selectedSet.value = new Set();
    sectionIndex.value = 0;
  }

  return {
    selectedIndex,
    sectionIndex,
    currentVideo,
    currentVideoUrl,
    list,
    visibleList,
    collections,
    hasCollections,
    total,
    isMulti,
    selectedSet,
    selectedCount,
    selectIndex,
    setSection,
    selectNext,
    selectPrev,
    toggleSelect,
    selectAll,
    clearSelection,
    getBatchVideos,
    syncResult,
    reset,
  };
}
