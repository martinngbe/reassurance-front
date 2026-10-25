import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { TempQuittance } from './temp-quittance'

export const useTempQuittanceStore = defineStore('tempQuittanceStore', () => {
  // ==================== STATE ====================
  const currentTempQuittance = ref<TempQuittance | null>(null)
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentTempQuittance.value !== null)
  const currentTempQuittanceId = computed(() => currentTempQuittance.value?.id ?? null)

  // ==================== ACTIONS ====================
  const selectTempQuittance = (tempQuittance: TempQuittance | null) => {
    currentTempQuittance.value = tempQuittance
  }

  const clearTempQuittanceSelection = () => {
    currentTempQuittance.value = null
  }

  // ⭐ Action utile : mettre à jour l'tempQuittance en cache
  // (par ex. après un updateTempQuittance réussi)
  const updateCurrentTempQuittance = (data: Partial<TempQuittance>) => {
    if (currentTempQuittance.value) {
      currentTempQuittance.value = { ...currentTempQuittance.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'tempQuittance supprimé est celui sélectionné
  const removeIfCurrentTempQuittance = (id: number) => {
    if (currentTempQuittance.value?.id === id) {
      currentTempQuittance.value = null
    }
  }

    const setCurrentTempQuittance = (police: TempQuittance) => {
    currentTempQuittance.value = police
  }

  return {
    currentTempQuittance,
    isSelected,
    currentTempQuittanceId,
    setCurrentTempQuittance,
    selectTempQuittance,
    clearTempQuittanceSelection,
    updateCurrentTempQuittance,
    removeIfCurrentTempQuittance,
  }
})