// /referentiel/compte/useCompte.ts
import { computed, ref, toRefs, toValue, type ComputedRef, type Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useCompteStore } from './compte.store'
import type { Compte, CreateCompteDto } from './compte'
import { compteApi } from './compte.api'

const KEY = 'comptes'

// ⭐ Interface pour les options
export interface UseComptesOptions {
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
export function useComptes(options: UseComptesOptions = {}) {
  // ⭐ Déstructuration avec valeurs par défaut
  const {
    quittanceId = null,
    params = computed(() => DEFAULT_PAGINATION)
  } = options

  const queryClient = useQueryClient()
  const compteStore = useCompteStore()

  //////////////////////////////////////////////////
  // RECHARGEMENT AUTOMATIQUE EN CAS DE CHANGEMENT //
  //////////////////////////////////////////////////
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
    quittanceId: toValue(quittanceId),
   
  }))

  const comptes = useInfiniteList<Compte>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      const quittanceIdVal = toValue(quittanceId)     
      const response = await compteApi.getAll({
        ...toValue(params),
        ...(quittanceIdVal != null && { quittanceId: quittanceIdVal }),        
        page,
        limit,
      })
  
      return response as PaginatedResponse<Compte>
    },
  })

  // ==================== CREATE ====================
  const createCompte = useMutation({
    mutationFn: (data: CreateCompteDto) => compteApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      comptes.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updateCompte = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Compte> }) =>
      compteApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...comptes.items.value]
      const index = comptes.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        comptes.items.value[index] = { ...comptes.items.value[index], ...data } as Compte
      }
      if (compteStore.currentCompteId === id) {
        compteStore.updateCurrentCompte(data)
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        comptes.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      comptes.refresh()
    },
  })

  // ==================== DELETE ====================
  const deleteCompte = useMutation({
    mutationFn: (id: number) => compteApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...comptes.items.value]
      comptes.items.value = comptes.items.value.filter((d) => d.id !== id)
      compteStore.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        comptes.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
    },
  })

  // ==================== TRANSFERT TEMP -> DÉFINITIF ====================
  // const transfererCompte = useMutation({
  //   mutationFn:async  (compteId: number) => compteApi.transfererDepuisTemp(compteId),
  //   onSuccess: (compte) => {
  //     console.log(" --------------- transfererCompte  compte:", compte) 
  //     // La nouvelle police devient la police courante
  //     queryClient.invalidateQueries({ queryKey: [KEY] })
  //     // Si tu as un cache pour les polices temporaires, invalide-le aussi :
  //     queryClient.invalidateQueries({ queryKey: ['comptes'] })
  //     comptes.refresh()
  //   },
  // })


  return {
    comptes,
    createCompte,
    updateCompte,
    deleteCompte,
    refresh: comptes.refresh,
   // transfererCompte,
  }
}