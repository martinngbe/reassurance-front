// /referentiel/police/usePoliceByAssure.ts
import { computed, toValue, type Ref, type ComputedRef } from 'vue'
import type { Police } from './police'
import { policeApi } from './police.api'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

/**
 * Composable explicite pour récupérer les polices d'un assuré spécifique.
 * @param assureId - L'ID de l'assuré (réactif ou statique)
 * @param params - Paramètres de pagination et tri
 */
// usePoliceByAssure.ts
export function usePolicesByAssure(
  assureId:   number  | string ,
  params: ComputedRef<PaginationParams> // ← Retirer & { assureId: number }
) {
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
    assureId: toValue(assureId),
  }))

  const polices = useInfiniteList<Police>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      const response = await policeApi.getAll({
        ...toValue(params), // ← Spread des params de pagination SEULEMENT
        assureId: toValue(assureId), // ← Injection explicite
        page,
        limit,
      })
      return response as PaginatedResponse<Police>
    },
  })

  return {
    polices,
    refresh: polices.refresh,
  }
}