// /referentiel/tempQuittance/useTempQuittance.ts
import { computed, ref, toRefs, toValue, type ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { TempQuittance } from './temp-quittance'
import { tempQuittanceApi } from './temp-quittance.api'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useTempQuittanceStore } from './temp-quittance.store'

const KEY = 'tempQuittances';
export function useTempQuittances(params: ComputedRef<PaginationParams>) {
  const queryClient = useQueryClient()
  const tempQuittanceStore = useTempQuittanceStore() // ⭐ 
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
  }))
  //////////////////////////////
  const tempQuittances = useInfiniteList<TempQuittance>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      //console.warn(" -- useTempQuittance tempQuittances = useInfiniteList<TempQuittance> ")
      // const response = await tempQuittanceApi.getAll(params.value)
        // ✅ Utiliser page et limit du queryFn, pas ceux de params
        const response = await tempQuittanceApi.getAll({
          ...toValue(params),
          page,      // ← page dynamique (1, 2, 3...)
          limit,     // ← limit dynamique
        })
      // ✅ Retourner l'objet IResponse complet, pas response.data
      console.log(" -- useTempQuittance response:",response)
      return response as PaginatedResponse<TempQuittance>
    },
  })

 // ==================== CREATE ====================
  const createTempQuittance = useMutation({
    mutationFn:async  (data: TempQuittance) => {
     const tQuittance= await tempQuittanceApi.create(data)
      // ⭐ Synchroniser le store si c'est l'tempQuittance sélectionné
      if (tempQuittanceStore.currentTempQuittanceId !== tQuittance.id) {
        tempQuittanceStore.selectTempQuittance(tQuittance)
      }
     return tQuittance
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tempQuittances'] })
      tempQuittances.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updateTempQuittance = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TempQuittance> }) =>
      tempQuittanceApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...tempQuittances.items.value]
      const index = tempQuittances.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        tempQuittances.items.value[index] = { ...tempQuittances.items.value[index], ...data } as TempQuittance
      }
      // ⭐ Synchroniser le store si c'est l'tempQuittance sélectionné
      if (tempQuittanceStore.currentTempQuittanceId === id) {
        tempQuittanceStore.updateCurrentTempQuittance(data)
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        tempQuittances.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      tempQuittances.refresh()
    },
  })

  // ==================== DELETE ====================
  const deleteTempQuittance = useMutation({
    mutationFn: (id: number) => tempQuittanceApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...tempQuittances.items.value]
      tempQuittances.items.value = tempQuittances.items.value.filter((d) => d.id !== id)
      // ⭐ Effacer la sélection si c'est l'tempQuittance supprimé
      tempQuittanceStore.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        tempQuittances.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tempQuittances'] })
    },
  })

  return {
    tempQuittances,
    createTempQuittance,
    updateTempQuittance,
    deleteTempQuittance,
    refresh: tempQuittances.refresh,
  }
}