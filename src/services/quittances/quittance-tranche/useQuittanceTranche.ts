import { computed, toValue, type ComputedRef, type Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useQuittanceTrancheStore } from './quittance-tranche.store'
import { quittanceTrancheApi } from './quittance-tranche.api'
import type {
  QuittanceTranche, CreateQuittanceTrancheDto,
  UpdateQuittanceTrancheDto, 
} from './quittance-tranche'
import type { PaginationParams } from '@/type/pagination'

const KEY = 'quittanceTranches'

export function useQuittanceTranches(
  quittanceId: Ref<number> | number | null,
  params: ComputedRef<PaginationParams>) {
  const queryClient = useQueryClient()
  const store = useQuittanceTrancheStore()

  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
    quittanceId: quittanceId, // ⭐ on relance la liste si on change de quittance
  }))

  const quittanceTranches = useInfiniteList<QuittanceTranche>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      const response = await quittanceTrancheApi.getAll({ 
        ...toValue(params),
        ...(quittanceId  != null && { quittanceId: toValue(quittanceId) }),
         page, limit })
      return response as PaginatedResponse<QuittanceTranche>
    },
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [KEY] })
    quittanceTranches.refresh()
  }

  // ==================== CREATE ====================
  const createQuittanceTranche = useMutation({
    mutationFn: (data: CreateQuittanceTrancheDto) => quittanceTrancheApi.create(data),
    onSuccess: (created) => {
      if (created) store.selectQuittanceTranche(created) // ⭐ sélection auto
      invalidate()
    },
  })

  // ==================== UPDATE ====================
  const updateQuittanceTranche = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateQuittanceTrancheDto }) =>
      quittanceTrancheApi.update(id, data),

    onMutate: async ({ id, data }) => {
      const previousItems = [...quittanceTranches.items.value]
      const index = previousItems.findIndex((d) => d.id === id)
      if (index !== -1) {
        quittanceTranches.items.value[index] = { ...previousItems[index], ...data } as QuittanceTranche
      }
      // ❌ PAS de mise à jour du store ici : cela réinitialisait le formulaire en cours de saisie
      return { previousItems }
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.previousItems) quittanceTranches.items.value = ctx.previousItems
    },

    onSuccess: (fresh) => {
      if (fresh) store.selectQuittanceTranche(fresh) // ⭐ données fraîches du serveur
    },

    onSettled: invalidate,
  })

  // ==================== DELETE ====================
  const deleteQuittanceTranche = useMutation({
    mutationFn: (id: number) => quittanceTrancheApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...quittanceTranches.items.value]
      quittanceTranches.items.value = previousItems.filter((d) => d.id !== id)
      store.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previousItems) quittanceTranches.items.value = ctx.previousItems
    },
    onSettled: invalidate,
  })

  return { quittanceTranches, createQuittanceTranche, updateQuittanceTranche, deleteQuittanceTranche, refresh: quittanceTranches.refresh }
}