import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Quittance } from './quittance'

export const useQuittanceStore = defineStore('quittanceStore', () => {
  // ==================== STATE ====================
  const currentQuittance = ref<Quittance | null>(null)
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentQuittance.value !== null)
  const currentQuittanceId = computed(() => currentQuittance.value?.id ?? null)

  // ==================== ACTIONS ====================
  const selectQuittance = (quittance: Quittance | null) => {
    currentQuittance.value = quittance
  }

  const clearSelection = () => {
    console.warn("___________ INITIALISATION QUITTANCE _____________")
    currentQuittance.value = null
   
  }

  // ⭐ Action utile : mettre à jour l'quittance en cache
  // (par ex. après un updateQuittance réussi)
  const updateCurrentQuittance = (data: Partial<Quittance>) => {
    if (currentQuittance.value) {
      currentQuittance.value = { ...currentQuittance.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'quittance supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentQuittance.value?.id === id) {
      currentQuittance.value = null
    }
  }

  return {
    currentQuittance,
    isSelected,
    currentQuittanceId,
    selectQuittance,
    clearSelection,
    updateCurrentQuittance,
    removeIfCurrent,
  }
})