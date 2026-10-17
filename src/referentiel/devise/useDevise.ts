// /referentiel/devise/useDevise.ts
import { computed, ref, toRefs, toValue, type ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Devise } from './devise'
import { deviseApi } from './devise.api'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

const KEY = 'devises';
export function useDevises(params: ComputedRef<PaginationParams>) {
  const queryClient = useQueryClient()

  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortOrder: params.value.sortOrder,
  }))
  //////////////////////////////
  const devises = useInfiniteList<Devise>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      console.warn(" -- useDevise devises = useInfiniteList<Devise> ")
      // const response = await deviseApi.getAll(params.value)
        // ✅ Utiliser page et limit du queryFn, pas ceux de params
        const response = await deviseApi.getAll({
          ...toValue(params),
          page,      // ← page dynamique (1, 2, 3...)
          limit,     // ← limit dynamique
        })
      // ✅ Retourner l'objet IResponse complet, pas response.data
      console.log(" -- useDevise response:",response)
      return response as PaginatedResponse<Devise>
    },
  })

 // ==================== CREATE ====================
  const createDevise = useMutation({
    mutationFn: (data: Devise) => deviseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devises'] })
      devises.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updateDevise = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Devise> }) =>
      deviseApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...devises.items.value]
      const index = devises.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        devises.items.value[index] = { ...devises.items.value[index], ...data } as Devise
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        devises.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      devises.refresh()
    },
  })

  // ==================== DELETE ====================
  const deleteDevise = useMutation({
    mutationFn: (id: number) => deviseApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...devises.items.value]
      devises.items.value = devises.items.value.filter((d) => d.id !== id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        devises.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['devises'] })
    },
  })

  return {
    devises,
    createDevise,
    updateDevise,
    deleteDevise,
    refresh: devises.refresh,
  }
}