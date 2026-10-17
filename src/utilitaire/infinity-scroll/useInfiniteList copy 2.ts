// /composables/useInfiniteList.ts
import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { PAGE_SIZE } from '../utilitaire'

// Format standard attendu de l'API paginée
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pageInfo: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UseInfiniteListOptions<T> {
  // Fonction de fetch paginée
  queryFn: (params: { page: number; limit: number }) => Promise<PaginatedResponse<T>>
  // Taille de page
  limit?: number
  // Réactivité : refetch automatique quand ces valeurs changent
  watchKeys?: ComputedRef<any> | Ref<any>
  // Clé unique pour identifier la liste (utile pour le cache)
  key?: string
}

export function useInfiniteList<T>(options: UseInfiniteListOptions<T>) {
  let limit = options.limit ?? PAGE_SIZE
  // ==================== ÉTAT ====================
  let page = 1 
  let isLoading : boolean = false
  let isFetching : boolean = false
  let error :Error | null = null
  let paginatedResponse :  PaginatedResponse<T> ={
        success: false,
        data: [],
        pageInfo: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0
        } 
      };
  let pageInfo = paginatedResponse.pageInfo;
  let items = paginatedResponse.data;
  // ==================== COMPUTED ====================
  const hasMore = computed(() => {
    if (!pageInfo) return false
    return page < pageInfo.totalPages
  }).value

  const loadingMore = computed(() => isFetching && page > 1).value
  const totalItems = computed(() => pageInfo.total ?? items.length).value
  const totalPages = computed(() => pageInfo.totalPages ?? 1).value

  // ==================== FETCH ====================
  async function fetchPage(targetPage: number, append = false) {
    isFetching = true
    if (targetPage === 1) isLoading = true
    error = null
    console.warn(" -- useInfiniteList.fetchPage  targetPage:",targetPage)
    console.log(" -- useInfiniteList.fetchPage  isLoading:",isLoading)
    try {
      const response = await options.queryFn({
        page: targetPage,
        limit,
      })
      console.log(" -- useInfiniteList.fetchPage  response:",response)
      if (!response.success) {
        throw new Error('La requête a échoué')
      }

      pageInfo = response.pageInfo
      page = targetPage

      if (append) {
        items = [...items, ...response.data]
      } else {
        items = response.data
      }
      console.log(" -- useInfiniteList.fetchPage  items:",items)
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      console.error('[useInfiniteList] Erreur:', err)
    } finally {
      isLoading = false
      isFetching = false
    }
  }

  // ==================== ACTIONS ====================
  async function loadMore() {
    if (!hasMore || isFetching) return
    await fetchPage(page + 1, true)
  }

  async function refresh() {
    await fetchPage(1, false)
  }

  function reset() {
    items = []
    pageInfo =  {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0
      }
    page = 1
  }

  // ==================== AUTO-REFETCH ====================
  // Recharge la page 1 quand les clés de watch changent (recherche, tri, filtres...)
  if (options.watchKeys) {
    watch(
      options.watchKeys,
      () => {
        reset()
        fetchPage(1, false)
      },
      { deep: true },
    )
  }

  // Chargement initial
  fetchPage(1, false)

  return {
    // Données
    items,
    pageInfo,
    totalItems,
    totalPages,

    // États
    isLoading,
    isFetching,
    loadingMore,
    hasMore,
    error,

    // Actions
    loadMore,
    refresh,
    reset,
  }
}