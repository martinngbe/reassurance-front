// /composables/useInfiniteScrollState.ts
import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

export interface UseInfiniteScrollOptions {
  // Seuil en pixels avant le bas pour déclencher le chargement
  threshold?: number
  // Fonction appelée quand on atteint le bas
  onLoadMore: () => void | Promise<void>
  // Indique s'il reste des données à charger
  hasMore: Ref<boolean>
  // État de chargement (pour éviter les appels multiples)
  isLoading: Ref<boolean>
}

export function useInfiniteScrollState(options: UseInfiniteScrollOptions) {
  const { threshold = 200, onLoadMore, hasMore, isLoading } = options

  const scrollEl = ref<HTMLElement | null>(null)
  const sentinelEl = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  // ==================== DÉTECTION DU SCROLL ====================
  function triggerLoadMore() {
    if (!hasMore.value) return
    if (isLoading.value) return
    onLoadMore()
  }

  function setupObserver() {
    teardownObserver()
    if (!sentinelEl.value || !scrollEl.value) return
    if (typeof IntersectionObserver === 'undefined') return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            triggerLoadMore()
          }
        }
      },
      {
        root: scrollEl.value,
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0,
      },
    )

    observer.observe(sentinelEl.value)
  }

  function teardownObserver() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onMounted(() => {
    setupObserver()
  })

  onBeforeUnmount(() => {
    teardownObserver()
  })

  // ==================== API PUBLIQUE ====================
  return {
    scrollEl,
    sentinelEl,
    setupObserver,
    teardownObserver,
  }
}