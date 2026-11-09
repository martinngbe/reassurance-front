// /referentiel/tempCompte/useTempCompte.ts
import { computed, ref, toRefs, toValue, type ComputedRef, type Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useTempCompteStore } from './temp-compte.store'
import type { TempCompte, CreateTempCompteDto } from './temp-compte'
import { tempCompteApi } from './temp-compte.api'

const KEY = 'tempComptes'

// ⭐ Interface pour les options
export interface UseTempComptesOptions {
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
export function useTempComptes(options: UseTempComptesOptions = {}) {
  // ⭐ Déstructuration avec valeurs par défaut
  const {
    quittanceId = null,
    params = computed(() => DEFAULT_PAGINATION)
  } = options

  const queryClient = useQueryClient()
  const tempCompteStore = useTempCompteStore()

  //////////////////////////////////////////////////
  // RECHARGEMENT AUTOMATIQUE EN CAS DE CHANGEMENT //
  //////////////////////////////////////////////////
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
    quittanceId: toValue(quittanceId),
   
  }))

  const tempComptes = useInfiniteList<TempCompte>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      const quittanceIdVal = toValue(quittanceId)     
      const response = await tempCompteApi.getAll({
        ...toValue(params),
        ...(quittanceIdVal != null && { quittanceId: quittanceIdVal }),        
        page,
        limit,
      })
  
      return response as PaginatedResponse<TempCompte>
    },
  })

  // ==================== CREATE ====================
  const createTempCompte = useMutation({
    mutationFn: (data: CreateTempCompteDto) => tempCompteApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      tempComptes.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updateTempCompte = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TempCompte> }) =>
      tempCompteApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...tempComptes.items.value]
      const index = tempComptes.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        tempComptes.items.value[index] = { ...tempComptes.items.value[index], ...data } as TempCompte
      }
      if (tempCompteStore.currentTempCompteId === id) {
        tempCompteStore.updateCurrentTempCompte(data)
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        tempComptes.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      tempComptes.refresh()
    },
  })

  // ==================== DELETE ====================
  const deleteTempCompte = useMutation({
    mutationFn: (id: number) => tempCompteApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...tempComptes.items.value]
      tempComptes.items.value = tempComptes.items.value.filter((d) => d.id !== id)
      tempCompteStore.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        tempComptes.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
    },
  })

  // ==================== TRANSFERT TEMP -> DÉFINITIF ====================
  const transfererCompte = useMutation({
    mutationFn:async  (tempCompteId: number) => tempCompteApi.transfererDepuisTemp(tempCompteId),
    onSuccess: (compte) => {
      console.log(" --------------- transfererCompte  compte:", compte) 
      // La nouvelle police devient la police courante
      queryClient.invalidateQueries({ queryKey: [KEY] })
      // Si tu as un cache pour les polices temporaires, invalide-le aussi :
      queryClient.invalidateQueries({ queryKey: ['temp-comptes'] })
      tempComptes.refresh()
    },
  })


  return {
    tempComptes,
    createTempCompte,
    updateTempCompte,
    deleteTempCompte,
    refresh: tempComptes.refresh,
    transfererCompte,
  }
}