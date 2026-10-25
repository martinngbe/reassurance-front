import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Police } from './police'

export const usePoliceStore = defineStore('policeStore', () => {
  // ==================== STATE ====================
  const currentPolice = ref<Police | null>(null)
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentPolice.value !== null)
  const currentPoliceId = computed(() => currentPolice.value?.id ?? null)

  // ==================== ACTIONS ====================
  const selectPolice = (police: Police | null) => {
    currentPolice.value = police
  }

  const clearSelection = () => {
    currentPolice.value = null
  }

  // ⭐ Action utile : mettre à jour l'police en cache
  // (par ex. après un updatePolice réussi)
  const updateCurrentPolice = (data: Partial<Police>) => {
    if (currentPolice.value) {
      currentPolice.value = { ...currentPolice.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'police supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentPolice.value?.id === id) {
      currentPolice.value = null
    }
  }
  const setCurrentPolice = (police: Police) => {
    currentPolice.value = police
  }


  
  return {
    currentPolice,
    isSelected,
    currentPoliceId,
    setCurrentPolice,
    selectPolice,
    clearSelection,
    updateCurrentPolice,
    removeIfCurrent,
  }
})