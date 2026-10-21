// /referentiel/police/usePolice.ts
import { computed, ref, toRefs, toValue, type ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Police } from './police'
import { policeApi } from './police.api'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { usePoliceStore } from './police.store'

const KEY = 'polices';
export function usePolices(params: ComputedRef<PaginationParams>) {
  const queryClient = useQueryClient()
  const policeStore = usePoliceStore() // ⭐ 
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
  }))
  //////////////////////////////
  const polices = useInfiniteList<Police>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      //console.warn(" -- usePolice polices = useInfiniteList<Police> ")
      // const response = await policeApi.getAll(params.value)
        // ✅ Utiliser page et limit du queryFn, pas ceux de params
        const response = await policeApi.getAll({
          ...toValue(params),
          page,      // ← page dynamique (1, 2, 3...)
          limit,     // ← limit dynamique
        })
      // ✅ Retourner l'objet IResponse complet, pas response.data
      console.log(" -- usePolice response:",response)
      return response as PaginatedResponse<Police>
    },
  })

 // ==================== CREATE ====================
  const createPolice = useMutation({
    mutationFn: (data: Police) => policeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polices'] })
      polices.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updatePolice = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Police> }) =>
      policeApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...polices.items.value]
      const index = polices.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        polices.items.value[index] = { ...polices.items.value[index], ...data } as Police
      }
      // ⭐ Synchroniser le store si c'est l'police sélectionné
      if (policeStore.currentPoliceId === id) {
        policeStore.updateCurrentPolice(data)
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        polices.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      polices.refresh()
    },
  })

  // ==================== DELETE ====================
  const deletePolice = useMutation({
    mutationFn: (id: number) => policeApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...polices.items.value]
      polices.items.value = polices.items.value.filter((d) => d.id !== id)
      // ⭐ Effacer la sélection si c'est l'police supprimé
      policeStore.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        polices.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['polices'] })
    },
  })

  return {
    polices,
    createPolice,
    updatePolice,
    deletePolice,
    refresh: polices.refresh,
  }
}