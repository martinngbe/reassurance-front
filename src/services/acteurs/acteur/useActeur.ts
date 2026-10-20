// /referentiel/acteur/useActeur.ts
import { computed, ref, toRefs, toValue, type ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Acteur } from './acteur'
import { acteurApi } from './acteur.api'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

const KEY = 'acteurs';
export function useActeurs(params: ComputedRef<PaginationParams>) {
  const queryClient = useQueryClient()

  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
  }))
  //////////////////////////////
  const acteurs = useInfiniteList<Acteur>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      console.warn(" -- useActeur acteurs = useInfiniteList<Acteur> ")
      // const response = await acteurApi.getAll(params.value)
        // ✅ Utiliser page et limit du queryFn, pas ceux de params
        const response = await acteurApi.getAll({
          ...toValue(params),
          page,      // ← page dynamique (1, 2, 3...)
          limit,     // ← limit dynamique
        })
      // ✅ Retourner l'objet IResponse complet, pas response.data
      console.log(" -- useActeur response:",response)
      return response as PaginatedResponse<Acteur>
    },
  })

 // ==================== CREATE ====================
  const createActeur = useMutation({
    mutationFn: (data: Acteur) => acteurApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acteurs'] })
      acteurs.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updateActeur = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Acteur> }) =>
      acteurApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...acteurs.items.value]
      const index = acteurs.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        acteurs.items.value[index] = { ...acteurs.items.value[index], ...data } as Acteur
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        acteurs.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      acteurs.refresh()
    },
  })

  // ==================== DELETE ====================
  const deleteActeur = useMutation({
    mutationFn: (id: number) => acteurApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...acteurs.items.value]
      acteurs.items.value = acteurs.items.value.filter((d) => d.id !== id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        acteurs.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['acteurs'] })
    },
  })

  return {
    acteurs,
    createActeur,
    updateActeur,
    deleteActeur,
    refresh: acteurs.refresh,
  }
}