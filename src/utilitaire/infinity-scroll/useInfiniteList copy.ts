// // /composables/useInfiniteList.ts
// import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'

// // Format standard attendu de l'API paginée
// export interface PaginatedResponse<T> {
//   success: boolean
//   data: T[]
//   pageInfo: {
//     page: number
//     limit: number
//     total: number
//     totalPages: number
//   }
// }

// export interface UseInfiniteListOptions<T> {
//   // Fonction de fetch paginée
//   queryFn: (params: { page: number; limit: number }) => Promise<PaginatedResponse<T>>
//   // Taille de page
//   limit?: number
//   // Réactivité : refetch automatique quand ces valeurs changent
//   watchKeys?: ComputedRef<any> | Ref<any>
//   // Clé unique pour identifier la liste (utile pour le cache)
//   key?: string
// }

// export function useInfiniteList<T>(options: UseInfiniteListOptions<T>) {
//   const limit = options.limit ?? 20

//   // ==================== ÉTAT ====================
//   const page = ref(1)
//   const items = ref<T[]>([]) as Ref<T[]>
//   const isLoading = ref(false)
//   const isFetching = ref(false)
//   const error = ref<Error | null>(null)
//   const pageInfo = ref<PaginatedResponse<T>['pageInfo'] | null>(null)

//   // ==================== COMPUTED ====================
//   const hasMore = computed(() => {
//     if (!pageInfo.value) return false
//     return page.value < pageInfo.value.totalPages
//   })

//   const loadingMore = computed(() => isFetching.value && page.value > 1)

//   const totalItems = computed(() => pageInfo.value?.total ?? items.value.length)
//   const totalPages = computed(() => pageInfo.value?.totalPages ?? 1)

//   // ==================== FETCH ====================
//   async function fetchPage(targetPage: number, append = false) {
//     isFetching.value = true
//     if (targetPage === 1) isLoading.value = true
//     error.value = null

//     try {
//       const response = await options.queryFn({
//         page: targetPage,
//         limit,
//       })

//       if (!response.success) {
//         throw new Error('La requête a échoué')
//       }

//       pageInfo.value = response.pageInfo
//       page.value = targetPage

//       if (append) {
//         items.value = [...items.value, ...response.data]
//       } else {
//         items.value = response.data
//       }
//     } catch (err) {
//       error.value = err instanceof Error ? err : new Error(String(err))
//       console.error('[useInfiniteList] Erreur:', err)
//     } finally {
//       isLoading.value = false
//       isFetching.value = false
//     }
//   }

//   // ==================== ACTIONS ====================
//   async function loadMore() {
//     if (!hasMore.value || isFetching.value) return
//     await fetchPage(page.value + 1, true)
//   }

//   async function refresh() {
//     await fetchPage(1, false)
//   }

//   function reset() {
//     items.value = []
//     pageInfo.value = null
//     page.value = 1
//   }

//   // ==================== AUTO-REFETCH ====================
//   // Recharge la page 1 quand les clés de watch changent (recherche, tri, filtres...)
//   if (options.watchKeys) {
//     watch(
//       options.watchKeys,
//       () => {
//         reset()
//         fetchPage(1, false)
//       },
//       { deep: true },
//     )
//   }

//   // Chargement initial
//   fetchPage(1, false)

//   return {
//     // Données
//     items,
//     pageInfo,
//     totalItems,
//     totalPages,

//     // États
//     isLoading,
//     isFetching,
//     loadingMore,
//     hasMore,
//     error,

//     // Actions
//     loadMore,
//     refresh,
//     reset,
//   }
// }