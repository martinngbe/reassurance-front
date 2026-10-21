// /referentiel/quittance/useQuittance.ts
import { computed, ref, toRefs, toValue, type ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Quittance } from './quittance'
import { quittanceApi } from './quittance.api'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useQuittanceStore } from './quittance.store'

const KEY = 'quittances';
export function useQuittances(params: ComputedRef<PaginationParams>) {
  const queryClient = useQueryClient()
  const quittanceStore = useQuittanceStore() // ⭐ 
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
  }))
  //////////////////////////////
  const quittances = useInfiniteList<Quittance>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      //console.warn(" -- useQuittance quittances = useInfiniteList<Quittance> ")
      // const response = await quittanceApi.getAll(params.value)
        // ✅ Utiliser page et limit du queryFn, pas ceux de params
        const response = await quittanceApi.getAll({
          ...toValue(params),
          page,      // ← page dynamique (1, 2, 3...)
          limit,     // ← limit dynamique
        })
      // ✅ Retourner l'objet IResponse complet, pas response.data
      console.log(" -- useQuittance response:",response)
      return response as PaginatedResponse<Quittance>
    },
  })

 // ==================== CREATE ====================
  const createQuittance = useMutation({
    mutationFn: (data: Quittance) => quittanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quittances'] })
      quittances.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updateQuittance = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Quittance> }) =>
      quittanceApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...quittances.items.value]
      const index = quittances.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        quittances.items.value[index] = { ...quittances.items.value[index], ...data } as Quittance
      }
      // ⭐ Synchroniser le store si c'est l'quittance sélectionné
      if (quittanceStore.currentQuittanceId === id) {
        quittanceStore.updateCurrentQuittance(data)
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        quittances.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      quittances.refresh()
    },
  })

  // ==================== DELETE ====================
  const deleteQuittance = useMutation({
    mutationFn: (id: number) => quittanceApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...quittances.items.value]
      quittances.items.value = quittances.items.value.filter((d) => d.id !== id)
      // ⭐ Effacer la sélection si c'est l'quittance supprimé
      quittanceStore.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        quittances.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['quittances'] })
    },
  })

  return {
    quittances,
    createQuittance,
    updateQuittance,
    deleteQuittance,
    refresh: quittances.refresh,
  }
}