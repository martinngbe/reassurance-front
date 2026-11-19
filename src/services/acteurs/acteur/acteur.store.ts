import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Acteur } from './acteur'
import { useAssureStore } from '../assure/assure.store'

export const useActeurStore = defineStore('acteurStore', () => {
  const assureStore = useAssureStore()
  // ==================== STATE ====================
  const currentActeur = ref<Acteur | null>(null)
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentActeur.value !== null)
  const currentActeurId = computed(() => currentActeur.value?.id ?? null)

  // ==================== ACTIONS ====================
  const selectActeur = (acteur: Acteur | null) => {
    console.warn(' ________ useActeurStore.selectActeur ')
    // le changement d'acteur pousse à la réinitialisation du store des assurés
    assureStore.clearSelection()
    console.log(' ___ AVANT currentActeur.value:',currentActeur.value)
    currentActeur.value = acteur
    console.log(' ___ APRES currentActeur.value:',currentActeur.value)
  }

  const clearSelection = () => {
    console.warn(' ________ useActeurStore.clearSelection ')
    currentActeur.value = null
    assureStore.clearSelection()
  }

  // ⭐ Action utile : mettre à jour l'acteur en cache
  // (par ex. après un updateActeur réussi)
  const updateCurrentActeur = (data: Partial<Acteur>) => {
    if (currentActeur.value) {
      currentActeur.value = { ...currentActeur.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'acteur supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentActeur.value?.id === id) {
      currentActeur.value = null
    }
  }

  return {
    currentActeur,
    isSelected,
    currentActeurId,
    selectActeur,
    clearSelection,
    updateCurrentActeur,
    removeIfCurrent,
  }
})