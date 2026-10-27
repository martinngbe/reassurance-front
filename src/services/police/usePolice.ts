// /referentiel/police/usePolice.ts
import { computed, ref, toRefs, toValue, type ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Police } from './police'
import { policeApi } from './police.api'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { usePoliceStore } from './police.store'
import { useEcransStore } from '../ecrans/ecrans.store'
import { useAssureStore } from '../acteurs/assure/assure.store'

const KEY = 'polices';
export function usePolices(params: ComputedRef<PaginationParams>) {
  const queryClient = useQueryClient()
  const policeStore = usePoliceStore() // ⭐ 
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
  const polices = useInfiniteList<Police>(
    {
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
      //console.warn(" -- usePolice polices = useInfiniteList<Police> ")
      // const response = await policeApi.getAll(params.value)
        // ✅ Utiliser page et limit du queryFn, pas ceux de params
        // On Ajoute assureId si nous omme en FAC
        const response = await policeApi.getAll({
          ...toValue(params),
          ...(isFAC.value &&  currentAssure.value && { assureId: currentAssure.value?.id }),
          page,      // ← page dynamique (1, 2, 3...)
          limit,     // ← limit dynamique
        })
      // ✅ Retourner l'objet IResponse complet, pas response.data
      //console.log(" -- usePolice response:",response)
      return response as PaginatedResponse<Police>
    },
  })

 // ==================== CREATE ====================
  const createPolice = useMutation({
    mutationFn: (data: Police) => policeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polices'] })
      polices.refresh()
    },
  })




 // ==================== UPDATE ====================
  const updatePolice = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Police> }) =>
      policeApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...polices.items.value]
      const index = polices.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        polices.items.value[index] = { ...polices.items.value[index], ...data } as Police
      }
      if (policeStore.currentPoliceId === id) {
        policeStore.updateCurrentPolice(data)
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        polices.items.value = context.previousItems
      }
    },
    onSuccess: async (_data, { id }) => {
      // ⭐ Si c'est la police courante, on la recharge complètement depuis le serveur
      if (policeStore.currentPoliceId === id) {
        await reloadCurrentPolice()
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      polices.refresh()
    },
  })
  
  // ==================== DELETE ====================
  const deletePolice = useMutation({
    mutationFn: (id: number) => policeApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...polices.items.value]
      polices.items.value = polices.items.value.filter((d) => d.id !== id)
      // ⭐ Effacer la sélection si c'est l'police supprimé
      policeStore.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        polices.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['polices'] })
    },
  })

  // ==================== TRANSFERT TEMP -> DÉFINITIF ====================
const transfererPolice = useMutation({
  mutationFn: (tempPoliceId: number) => policeApi.transfererDepuisTemp(tempPoliceId),
  onSuccess: (police) => {
    // La nouvelle police devient la police courante
   //policeStore.setCurrentPolice(police)
    queryClient.invalidateQueries({ queryKey: [KEY] })
    // Si tu as un cache pour les polices temporaires, invalide-le aussi :
    queryClient.invalidateQueries({ queryKey: ['temp-polices'] })
    polices.refresh()
  },
})

  // ==================== RELOAD CURRENT ====================
  const reloadCurrentPolice = async () => {
    const currentId = policeStore.currentPoliceId
    if (!currentId) return
    try {
      const police = await policeApi.getById(currentId)
      policeStore.setCurrentPolice(police)
    } catch (err) {
      console.error('Erreur lors du rechargement de la police', err)
    }
  }

  return {
    polices,
    createPolice,
    updatePolice,
    deletePolice,
    transfererPolice,
    reloadCurrentPolice,
    refresh: polices.refresh,
  }
}