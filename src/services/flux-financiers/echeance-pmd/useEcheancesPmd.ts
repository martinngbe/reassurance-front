// /referentiel/echeancePmd/useEcheancePmd.ts
import { computed, ref, toRefs, toValue, type ComputedRef, type Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { EcheancePmd, CreateEcheancePmdDto } from './echeance-pmd'
import { echeancePmdApi } from './echeance-pmd.api'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useEcheancePmdStore } from './echeance-pmd.store'

const KEY = 'echeancesPmd'

// ⭐ Interface pour les options
export interface UseEcheancesPmdOptions {
  quittanceId?: Ref<number> | number | null
  params?: ComputedRef<PaginationParams>
}
const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  limit: PAGE_SIZE,
  search: '',
  sortKey: '',
  sortDirection: undefined
}
export function useEcheancesPmd(options: UseEcheancesPmdOptions = {}) {
  // ⭐ Déstructuration avec valeurs par défaut
  const {
    quittanceId = null,
    params = computed(() => DEFAULT_PAGINATION)
  } = options

  const queryClient = useQueryClient()
  const echeancePmdStore = useEcheancePmdStore()

  //////////////////////////////////////////////////
  // RECHARGEMENT AUTOMATIQUE EN CAS DE CHANGEMENT //
  //////////////////////////////////////////////////
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
    quittanceId: toValue(quittanceId),
   
  }))

  const echeancesPmd = useInfiniteList<EcheancePmd>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      const quittanceIdVal = toValue(quittanceId)     
      const response = await echeancePmdApi.getAll({
        ...toValue(params),
        ...(quittanceIdVal != null && { quittanceId: quittanceIdVal }),        
        page,
        limit,
      })
      return response as PaginatedResponse<EcheancePmd>
    },
  })

  // ==================== CREATE ====================
  const createEcheancePmd = useMutation({
    mutationFn: (data: CreateEcheancePmdDto) => echeancePmdApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      echeancesPmd.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updateEcheancePmd = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EcheancePmd> }) =>
      echeancePmdApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...echeancesPmd.items.value]
      const index = echeancesPmd.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        echeancesPmd.items.value[index] = { ...echeancesPmd.items.value[index], ...data } as EcheancePmd
      }
      if (echeancePmdStore.currentEcheancePmdId === id) {
        echeancePmdStore.updateCurrentEcheancePmd(data)
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        echeancesPmd.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      echeancesPmd.refresh()
    },
  })

  // ==================== DELETE ====================
  const deleteEcheancePmd = useMutation({
    mutationFn: (id: number) => echeancePmdApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...echeancesPmd.items.value]
      echeancesPmd.items.value = echeancesPmd.items.value.filter((d) => d.id !== id)
      echeancePmdStore.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        echeancesPmd.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
    },
  })

  return {
    echeancesPmd,
    createEcheancePmd,
    updateEcheancePmd,
    deleteEcheancePmd,
    refresh: echeancesPmd.refresh,
  }
}