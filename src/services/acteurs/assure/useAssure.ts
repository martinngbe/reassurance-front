// /referentiel/assure/useAssure.ts
import { computed, ref, toRefs, toValue, type ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Assure } from './assure'
import { assureApi } from './assure.api'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useAssureStore } from './assure.store'

const KEY = 'assures';
export function useAssures(params: ComputedRef<PaginationParams>) {
  const queryClient = useQueryClient()
  const assureStore = useAssureStore()
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
  }))
  //////////////////////////////
  const assures = useInfiniteList<Assure>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
     // console.warn(" -- useAssure assures = useInfiniteList<Assure> ")
      // const response = await assureApi.getAll(params.value)
        // ✅ Utiliser page et limit du queryFn, pas ceux de params
        const response = await assureApi.getAll({
          ...toValue(params),
          page,      // ← page dynamique (1, 2, 3...)
          limit,     // ← limit dynamique
        })
      // ✅ Retourner l'objet IResponse complet, pas response.data
      //console.log(" -- useAssure response:",response)
      return response as PaginatedResponse<Assure>
    },
  })

 // ==================== CREATE ====================
  const createAssure = useMutation({
    mutationFn: (data: Assure) => assureApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assures'] })
      assures.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updateAssure = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Assure> }) =>
      assureApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...assures.items.value]
      const index = assures.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        assures.items.value[index] = { ...assures.items.value[index], ...data } as Assure
      }
      // ⭐ Synchroniser le store si c'est l'assure sélectionné
      if (assureStore.currentAssureId === id) {
        assureStore.updateCurrentAssure(data)
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        assures.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      assures.refresh()
    },
  })

  // ==================== DELETE ====================
  const deleteAssure = useMutation({
    mutationFn: (id: number) => assureApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...assures.items.value]
      assures.items.value = assures.items.value.filter((d) => d.id !== id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        assures.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['assures'] })
    },
  })

  return {
    assures,
    createAssure,
    updateAssure,
    deleteAssure,
    refresh: assures.refresh,
  }
}