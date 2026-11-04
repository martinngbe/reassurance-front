import { computed, toValue, type ComputedRef, type Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useQuittancePlacementStore } from './quittance-placement.store'
import { quittancePlacementApi } from './quittance-placement.api'
import type {
  QuittancePlacement, CreateQuittancePlacementDto,
  UpdateQuittancePlacementDto, 
} from './quittance-placement'
import type { PaginationParams } from '@/type/pagination'

const KEY = 'quittancePlacements'

export function useQuittancePlacements(
  quittanceId: Ref<number> | number | null,
  params: ComputedRef<PaginationParams>) {
  const queryClient = useQueryClient()
  const store = useQuittancePlacementStore()

  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
    quittanceId: quittanceId, // ⭐ on relance la liste si on change de quittance
  }))

  const quittancePlacements = useInfiniteList<QuittancePlacement>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      const response = await quittancePlacementApi.getAll({ 
        ...toValue(params),
        ...(quittanceId  != null && { quittanceId: toValue(quittanceId) }),
         page, limit })
      return response as PaginatedResponse<QuittancePlacement>
    },
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [KEY] })
    quittancePlacements.refresh()
  }

  // ==================== CREATE ====================
  const createQuittancePlacement = useMutation({
    mutationFn: (data: CreateQuittancePlacementDto) => quittancePlacementApi.create(data),
    onSuccess: (created) => {
      if (created) store.selectQuittancePlacement(created) // ⭐ sélection auto
      invalidate()
    },
  })

  // ==================== UPDATE ====================
  const updateQuittancePlacement = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateQuittancePlacementDto }) =>
      quittancePlacementApi.update(id, data),

    onMutate: async ({ id, data }) => {
      const previousItems = [...quittancePlacements.items.value]
      const index = previousItems.findIndex((d) => d.id === id)
      if (index !== -1) {
        quittancePlacements.items.value[index] = { ...previousItems[index], ...data } as QuittancePlacement
      }
      // ❌ PAS de mise à jour du store ici : cela réinitialisait le formulaire en cours de saisie
      return { previousItems }
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.previousItems) quittancePlacements.items.value = ctx.previousItems
    },

    onSuccess: (fresh) => {
      if (fresh) store.selectQuittancePlacement(fresh) // ⭐ données fraîches du serveur
    },

    onSettled: invalidate,
  })

  // ==================== DELETE ====================
  const deleteQuittancePlacement = useMutation({
    mutationFn: (id: number) => quittancePlacementApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...quittancePlacements.items.value]
      quittancePlacements.items.value = previousItems.filter((d) => d.id !== id)
      store.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previousItems) quittancePlacements.items.value = ctx.previousItems
    },
    onSettled: invalidate,
  })

  return { quittancePlacements, createQuittancePlacement, updateQuittancePlacement, deleteQuittancePlacement, refresh: quittancePlacements.refresh }
}