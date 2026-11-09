// /referentiel/bordereau/useBordereau.ts
import { computed, ref, toRefs, toValue, type ComputedRef, type Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Bordereau, CreateBordereauDto } from './bordereau'
import { bordereauApi } from './bordereau.api'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useBordereauStore } from './bordereau.store'

const KEY = 'bordereaux'

// ⭐ Interface pour les options
export interface UseBordereausOptions {
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
export function useBordereaux(options: UseBordereausOptions = {}) {
  // ⭐ Déstructuration avec valeurs par défaut
  const {
    quittanceId = null,
    params = computed(() => DEFAULT_PAGINATION)
  } = options

  const queryClient = useQueryClient()
  const bordereauStore = useBordereauStore()

  //////////////////////////////////////////////////
  // RECHARGEMENT AUTOMATIQUE EN CAS DE CHANGEMENT //
  //////////////////////////////////////////////////
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
    quittanceId: toValue(quittanceId),
   
  }))

  const bordereaux = useInfiniteList<Bordereau>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      const quittanceIdVal = toValue(quittanceId)     
      const response = await bordereauApi.getAll({
        ...toValue(params),
        ...(quittanceIdVal != null && { quittanceId: quittanceIdVal }),        
        page,
        limit,
      })
  
      return response as PaginatedResponse<Bordereau>
    },
  })

  // ==================== CREATE ====================
  const createBordereau = useMutation({
    mutationFn: (data: CreateBordereauDto) => bordereauApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      bordereaux.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updateBordereau = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Bordereau> }) =>
      bordereauApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...bordereaux.items.value]
      const index = bordereaux.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        bordereaux.items.value[index] = { ...bordereaux.items.value[index], ...data } as Bordereau
      }
      if (bordereauStore.currentBordereauId === id) {
        bordereauStore.updateCurrentBordereau(data)
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        bordereaux.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      bordereaux.refresh()
    },
  })

  // ==================== DELETE ====================
  const deleteBordereau = useMutation({
    mutationFn: (id: number) => bordereauApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...bordereaux.items.value]
      bordereaux.items.value = bordereaux.items.value.filter((d) => d.id !== id)
      bordereauStore.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        bordereaux.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
    },
  })

  return {
    bordereaux,
    createBordereau,
    updateBordereau,
    deleteBordereau,
    refresh: bordereaux.refresh,
  }
}