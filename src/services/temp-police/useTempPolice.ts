// /referentiel/police/useTempPolice.ts
import { computed, ref, toRefs, toValue, type ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { TempPolice } from './temp-police'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useTempPoliceStore } from './temp-police.store'
import { tempPoliceApi } from './temp-police.api'
import { useAssureStore } from '../acteurs/assure/assure.store'
import { useEcransStore } from '../ecrans/ecrans.store'

const KEY = 'temp-polices';
export function useTempPolices(params: ComputedRef<PaginationParams>) {
  const queryClient = useQueryClient()
  const tempPoliceStore = useTempPoliceStore() // ⭐ 
  const ecranStore = useEcransStore()
  const assureStore = useAssureStore()

  const isFAC = computed(()=> ecranStore.currenteFormeEcran)
  const currentAssure = computed(()=> assureStore.currentAssure)
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
  }))
  //////////////////////////////
  const tempPolices = useInfiniteList<TempPolice>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      //console.warn(" -- useTempPolice polices = useInfiniteList<TempPolice> ")
      // const response = await tempPoliceApi.getAll(params.value)
        // ✅ Utiliser page et limit du queryFn, pas ceux de params
        // On affiche les police d'un assuré sir nous sommes en FAC
        const response = await tempPoliceApi.getAll({
          ...toValue(params),
          ...(isFAC.value &&  currentAssure.value && { assureId: currentAssure.value?.id }),
          page,      // ← page dynamique (1, 2, 3...)
          limit,     // ← limit dynamique
        })
      // ✅ Retourner l'objet IResponse complet, pas response.data
      console.log(" -- useTempPolice response:",response)
      return response as PaginatedResponse<TempPolice>
    },
  })

 // ==================== CREATE ====================
  const createTempPolice = useMutation({
    mutationFn: async (data: TempPolice) => {
     const tPolice= await  tempPoliceApi.create(data)
     // dès la création d'une TempPolice, on la selctionne
     // ⭐ Synchroniser le store si c'est l'police sélectionné
      if (tempPoliceStore.currentTempPoliceId !== tPolice.id) {
        tempPoliceStore.selectTempPolice(tPolice)
      }
     return tPolice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polices'] })
      tempPolices.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updateTempPolice = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TempPolice> }) =>
      tempPoliceApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...tempPolices.items.value]
      const index = tempPolices.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        tempPolices.items.value[index] = { ...tempPolices.items.value[index], ...data } as TempPolice
      }
      // ⭐ Synchroniser le store si c'est l'police sélectionné
      if (tempPoliceStore.currentTempPoliceId === id) {
        tempPoliceStore.updateCurrentTempPolice(data)
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        tempPolices.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      tempPolices.refresh()
    },
  })

  // ==================== DELETE ====================
  const deleteTempPolice = useMutation({
    mutationFn: (id: number) => tempPoliceApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...tempPolices.items.value]
      tempPolices.items.value = tempPolices.items.value.filter((d) => d.id !== id)
      // ⭐ Effacer la sélection si c'est l'police supprimé
      tempPoliceStore.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        tempPolices.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['polices'] })
    },
  })

  return {
    tempPolices,
    createTempPolice,
    updateTempPolice,
    deleteTempPolice,
    refresh: tempPolices.refresh,
  }
}