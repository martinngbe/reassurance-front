// /referentiel/police/usePolice.ts
import { computed, ref, toRefs, toValue, type ComputedRef, type Ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Police } from './police'
import { policeApi } from './police.api'
import type { PaginationParams } from '@/type/pagination'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { usePoliceStore } from './police.store'

const KEY = 'polices';
export function usePolices(
  assureId: Ref<number> | number | null,
  isCession:  Ref<boolean> | boolean  | null,
  params: ComputedRef<PaginationParams>
) {
  const queryClient = useQueryClient()
  const policeStore = usePoliceStore() // ⭐ 

  // Le rechargement se fera automatique si l'un des variables bouge
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,

    assureId: toValue(assureId),
    isCession: toValue(isCession),
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
          ...(assureId  != null && { assureId: toValue(assureId) }), // les polices d'un assuré
          ...(isCession  != null && { isCession: toValue(isCession) }), // les police CESSION | ACCEPTATION
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<Police> }) =>  {
        const policeUpdated = await policeApi.update(id, data)
        console.log(" -->>>>>>- updatePolice = useMutation policeUpdated:",policeUpdated)
        return policeApi.update(id, data)
    }
      ,
    onMutate: async ({ id, data }) => {
        console.log(" -->>>>>>- updatePolice = useMutation.onMutate data:",data)
      
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
       console.error(" -->>>>>>- updatePolice = useMutation.onError _err:",_err)
      
      if (context?.previousItems) {
        polices.items.value = context.previousItems
      }
    },
    onSuccess: async (_data, { id }) => {
     console.warn(" -->>>>>>- updatePolice = useMutation.onSuccess _data:",_data)
     console.warn(" policeStore.currentPoliceId:",policeStore.currentPoliceId)
     console.warn(" id:",id) 
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
    onSuccess:()=> {
      console.warn(" QUI A ORDONNE LA SUPPRESSION DE LA POLICE ?????")
    }
  })


  // ==================== RELOAD CURRENT ====================
  const reloadCurrentPolice = async () => {
     console.warn(" -->>>>>> usePolice.reloadCurrentPolice")
      
    const currentId = policeStore.currentPoliceId
    if (!currentId) return
    console.warn(" -->>>>>> usePolice.reloadCurrentPolice currentId:",currentId)
    try {
      const police = await policeApi.getById(currentId)
      console.warn(" -->>>>>> usePolice.reloadCurrentPolice police:",police)
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
    reloadCurrentPolice,
    refresh: polices.refresh,
  }
}