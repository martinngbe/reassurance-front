// /referentiel/acteur/useActeur.ts
import { computed, ref, toRefs, toValue, type ComputedRef } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Acteur } from './acteur'
import { acteurApi } from './acteur.api'
import { useInfiniteList, type PaginatedResponse } from '@/utilitaire/infinity-scroll/useInfiniteList'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useActeurStore } from './acteur.store'
import type { ActeurParams } from './acteur'; // ⭐ Importer le nouveau type

const KEY = 'acteurs';
export function useActeurs(params: ComputedRef<ActeurParams>) {
  const queryClient = useQueryClient()
  const acteurStore = useActeurStore() // ⭐ 
  const watchKeys = computed(() => ({
    search: params.value.search,
    sortKey: params.value.sortKey,
    sortDirection: params.value.sortDirection,
    roles: params.value.roles, // ⭐ Surveiller le rôle
    //typesFiltre: params.value.typesFiltre?.join(','), // ⭐ Surveiller la chaîne jointe
  }))
  //////////////////////////////
  const acteurs = useInfiniteList<Acteur>({
    limit: params.value.limit ?? PAGE_SIZE,
    watchKeys,
    queryFn: async ({ page, limit }) => {
       
        console.warn(' __ useActeur.ts ')
        // ✅ Si le tableau est vide ou undefined, role sera undefined (non envoyé)
         params.value.roles = params.value.typesFiltre?.length 
            ? params.value.typesFiltre.join(',') 
            : undefined; 
        console.log(' _____ params.value.role:',params.value.roles)  
         console.log(' _____ params.value:',params.value) 
         delete params.value.typesFiltre    
        const response = await acteurApi.getAll({
          ...toValue(params),
        //  role, // ⭐ Ajouter les filtres booléens
          page,      // ← page dynamique (1, 2, 3...)
          limit,     // ← limit dynamique
        })
      // ✅ Retourner l'objet IResponse complet, pas response.data
      console.log(" -- useActeur response:",response)
      return response as PaginatedResponse<Acteur>
    },
  })

 // ==================== CREATE ====================
  const createActeur = useMutation({
    mutationFn: (data: Acteur) => acteurApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acteurs'] })
      acteurs.refresh()
    },
  })

  // ==================== UPDATE ====================
  const updateActeur = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Acteur> }) =>
      acteurApi.update(id, data),
    onMutate: async ({ id, data }) => {
      const previousItems = [...acteurs.items.value]
      const index = acteurs.items.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        acteurs.items.value[index] = { ...acteurs.items.value[index], ...data } as Acteur
      }
      // ⭐ Synchroniser le store si c'est l'acteur sélectionné
      if (acteurStore.currentActeurId === id) {
        acteurStore.updateCurrentActeur(data)
      }
      return { previousItems, index }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        acteurs.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      acteurs.refresh()
    },
  })

  // ==================== DELETE ====================
  const deleteActeur = useMutation({
    mutationFn: (id: number) => acteurApi.delete(id),
    onMutate: async (id) => {
      const previousItems = [...acteurs.items.value]
      acteurs.items.value = acteurs.items.value.filter((d) => d.id !== id)
      // ⭐ Effacer la sélection si c'est l'acteur supprimé
      acteurStore.removeIfCurrent(id)
      return { previousItems }
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        acteurs.items.value = context.previousItems
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['acteurs'] })
    },
  })

  return {
    acteurs,
    createActeur,
    updateActeur,
    deleteActeur,
    refresh: acteurs.refresh,
  }
}