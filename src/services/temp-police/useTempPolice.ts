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

const KEY = 'temp-tempPolices';
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
      //console.warn(" -- useTempPolice tempPolices = useInfiniteList<TempPolice> ")
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
     console.log("__________________________________")
     console.log("const createTempPolice = useMutation")
     console.log("__________________________________")
     console.log("tPolice:",tPolice)
     console.log("tempPoliceStore.currentTempPoliceId :",tempPoliceStore.currentTempPoliceId )
     console.log("__________________________________")
     // dès la création d'une TempPolice, on la selectionne
     // ⭐ Synchroniser le store si c'est l'police sélectionné
      if (tempPoliceStore.currentTempPoliceId !== tPolice.id) {
        console.log("Stockage  useTempPolice.ts tPolice:",tPolice)
        tempPoliceStore.selectTempPolice(tPolice)
      }
     return tPolice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tempPolices'] })
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
    onSuccess: async (_data, { id }) => {
      // ⭐ Si c'est la police courante, on la recharge complètement depuis le serveur
      if (tempPoliceStore.currentTempPoliceId === id) {
        await reloadCurrentTempPolice()
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
      tempPoliceStore.removeIfCurrentTempPolice(id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        tempPolices.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tempPolices'] })
    },
  })

   // ==================== RELOAD CURRENT ====================
  const reloadCurrentTempPolice = async () => {
    const currentId = tempPoliceStore.currentTempPoliceId
    if (!currentId) return
    // On recharge la 
    try {
      const tempPol = await tempPoliceApi.getById(currentId)
      tempPoliceStore.setCurrentTempPolice(tempPol)
    } catch (err) {
      console.error('Erreur lors du rechargement de la tempPolice', err)
    }
  }

  return {
    tempPolices,
    createTempPolice,
    updateTempPolice,
    deleteTempPolice,
    reloadCurrentTempPolice,
    refresh: tempPolices.refresh,
  }
}