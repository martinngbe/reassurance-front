import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Acteur } from './acteur'

export const useActeurStore = defineStore('acteurStore', () => {
  // ==================== STATE ====================
  const currentActeur = ref<Acteur | null>(null)
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentActeur.value !== null)
  const currentActeurId = computed(() => currentActeur.value?.id ?? null)

  // ==================== ACTIONS ====================
  const selectActeur = (acteur: Acteur | null) => {
    currentActeur.value = acteur
  }

  const clearSelection = () => {
    currentActeur.value = null
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