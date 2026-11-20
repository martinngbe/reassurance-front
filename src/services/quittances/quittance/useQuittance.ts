// /referentiel/quittance/useQuittance.ts
import { computed, ref, toRefs, toValue, type ComputedRef, type Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Quittance } from './quittance'
import { quittanceApi } from './quittance.api'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useQuittanceStore } from './quittance.store'

const KEY = 'quittances'

// ⭐ Interface corrigée : Ref<number | null> au lieu de Ref<number>
export interface UseQuittancesOptions {
  policeId?: Ref<number | null> | number | null
  cedanteId?: Ref<number | null> | number | null
  courtierId?: Ref<number | null> | number | null
  campagneId?: Ref<number | null> | number | null       // ✅ NOUVEAU
  sousBrancheId?: Ref<number | null> | number | null    // ✅ NOUVEAU
  natureOffreId?: Ref<number | null> | number | null
  isCession?: Ref<boolean | null> | boolean | null
  isFac?: Ref<boolean | null> | boolean | null
  isProportionnelle?: Ref<boolean | null> | boolean | null
  params?: ComputedRef<PaginationParams>
}

const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  limit: PAGE_SIZE,
  search: '',
  sortKey: '',
  sortDirection: undefined
}

export function useQuittances(options: UseQuittancesOptions = {}) {
  const {
    policeId = null,
    cedanteId = null,
    courtierId = null,
    campagneId = null,          // ✅ NOUVEAU
    sousBrancheId = null,       // ✅ NOUVEAU
    natureOffreId = null,
    isCession = null,
    isFac = null,
    isProportionnelle = null,
    params = computed(() => DEFAULT_PAGINATION)
  } = options

  const queryClient = useQueryClient()
  const quittanceStore = useQuittanceStore()

  //////////////////////////////////////////////////
  // RECHARGEMENT AUTOMATIQUE EN CAS DE CHANGEMENT //
  //////////////////////////////////////////////////
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
    policeId: toValue(policeId),
    cedanteId: toValue(cedanteId),
    courtierId: toValue(courtierId),
    campagneId: toValue(campagneId),       // ✅
    sousBrancheId: toValue(sousBrancheId), // ✅
    natureOffreId: toValue(natureOffreId),
    isCession: toValue(isCession),
    isFac: toValue(isFac),
    isProportionnelle: toValue(isProportionnelle)
  }))

  const quittances = useInfiniteList<Quittance>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit, signal }) => {
      const policeIdVal = toValue(policeId)
      const cedanteIdVal = toValue(cedanteId)
      const courtierIdVal = toValue(courtierId)
      const campagneIdVal = toValue(campagneId)       // ✅
      const sousBrancheIdVal = toValue(sousBrancheId) // ✅
      const natureOffreIdVal = toValue(natureOffreId)
      const isCessionVal = toValue(isCession)
      const isFacVal = toValue(isFac)
      const isProportionnelleVal = toValue(isProportionnelle)
      const paramsVal = toValue(params)

      const response = await quittanceApi.getAll({
        page,
        limit,
        ...(paramsVal.search && { search: paramsVal.search }),
        ...(paramsVal.sortKey && { sortKey: paramsVal.sortKey }),
        ...(paramsVal.sortDirection && { sortDirection: paramsVal.sortDirection }),
        ...(policeIdVal != null && { policeId: policeIdVal }),
        ...(cedanteIdVal != null && { cedanteId: cedanteIdVal }),
        ...(courtierIdVal != null && { courtierId: courtierIdVal }),
        ...(campagneIdVal != null && { campagneId: campagneIdVal }),       // ✅
        ...(sousBrancheIdVal != null && { sousBrancheId: sousBrancheIdVal }), // ✅
        ...(natureOffreIdVal != null && { natureOffreId: natureOffreIdVal }),
        ...(isCessionVal != null && { isCession: isCessionVal }),
        ...(isFacVal != null && { isFac: isFacVal }),
        ...(isProportionnelleVal != null && { isProportionnelle: isProportionnelleVal }),
      },
      signal // ✅ Passer le signal à l'API
    )
      return response as PaginatedResponse<Quittance>
    },
  })

  // ==================== CREATE ====================
  const createQuittance = useMutation({
    mutationFn: (data: Quittance) => quittanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
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
      quittanceStore.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        quittances.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
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