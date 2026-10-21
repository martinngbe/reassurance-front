// /referentiel/quittanceCession/useQuittanceCession.ts
import { computed, ref, toRefs, toValue, type ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useQuittanceCessionStore } from './quittance-cession.store'
import type { QuittanceCession } from './quittance-cession'
import { quittanceCessionApi } from './quittance-cession.api'

const KEY = 'quittanceCessions';
export function useQuittanceCessions(params: ComputedRef<PaginationParams>) {
  const queryClient = useQueryClient()
  const quittanceCessionStore = useQuittanceCessionStore() // ⭐ 
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
  }))
  //////////////////////////////
  const quittanceCessions = useInfiniteList<QuittanceCession>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      console.warn(" -- useQuittanceCession quittanceCessions = useInfiniteList<QuittanceCession> ")
      // const response = await quittanceCessionApi.getAll(params.value)
        // ✅ Utiliser page et limit du queryFn, pas ceux de params
        const response = await quittanceCessionApi.getAll({
          ...toValue(params),
          page,      // ← page dynamique (1, 2, 3...)
          limit,     // ← limit dynamique
        })
      // ✅ Retourner l'objet IResponse complet, pas response.data
      console.log(" -- useQuittanceCession response:",response)
      return response as PaginatedResponse<QuittanceCession>
    },
  })

 // ==================== CREATE ====================
  const createQuittanceCession = useMutation({
    mutationFn: (data: QuittanceCession) => quittanceCessionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quittanceCessions'] })
      quittanceCessions.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updateQuittanceCession = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<QuittanceCession> }) =>
      quittanceCessionApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...quittanceCessions.items.value]
      const index = quittanceCessions.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        quittanceCessions.items.value[index] = { ...quittanceCessions.items.value[index], ...data } as QuittanceCession
      }
      // ⭐ Synchroniser le store si c'est l'quittanceCession sélectionné
      if (quittanceCessionStore.currentQuittanceCessionId === id) {
        quittanceCessionStore.updateCurrentQuittanceCession(data)
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        quittanceCessions.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      quittanceCessions.refresh()
    },
  })

  // ==================== DELETE ====================
  const deleteQuittanceCession = useMutation({
    mutationFn: (id: number) => quittanceCessionApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...quittanceCessions.items.value]
      quittanceCessions.items.value = quittanceCessions.items.value.filter((d) => d.id !== id)
      // ⭐ Effacer la sélection si c'est l'quittanceCession supprimé
      quittanceCessionStore.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        quittanceCessions.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['quittanceCessions'] })
    },
  })

  return {
    quittanceCessions,
    createQuittanceCession,
    updateQuittanceCession,
    deleteQuittanceCession,
    refresh: quittanceCessions.refresh,
  }
}