// /referentiel/police/usePoliceByAssure.ts
import { computed, toValue, type Ref, type ComputedRef } from 'vue'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import type { Quittance } from './quittance'
import { quittanceApi } from './quittance.api'

/**
 * Composable explicite pour récupérer les polices d'un assuré spécifique.
 * @param policeId - L'ID de l'assuré (réactif ou statique)
 * @param params - Paramètres de pagination et tri
 */
// usePoliceByAssure.ts
export function useQuittancesByPolice(
  policeId: Ref<number> | number,
  params: ComputedRef<PaginationParams> // ← Retirer & { policeId: number }
) {
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
    policeId: toValue(policeId),
  }))

  const quittances = useInfiniteList<Quittance>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      const response = await quittanceApi.getAll({
        ...toValue(params), // ← Spread des params de pagination SEULEMENT
        policeId: toValue(policeId), // ← Injection explicite
        page,
        limit,
      })
      return response as PaginatedResponse<Quittance>
    },
  })

  return {
    quittances,
    refresh: quittances.refresh,
  }
}