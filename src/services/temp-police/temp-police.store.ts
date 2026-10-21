import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { TempPolice } from './temp-police'

export const useTempPoliceStore = defineStore('tempPoliceStore', () => {
  // ==================== STATE ====================
  const currentTempPolice = ref<TempPolice | null>(null)
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentTempPolice.value !== null)
  const currentTempPoliceId = computed(() => currentTempPolice.value?.id ?? null)

  // ==================== ACTIONS ====================
  const selectTempPolice = (tempPolice: TempPolice | null) => {
    currentTempPolice.value = tempPolice
  }

  const clearSelection = () => {
    currentTempPolice.value = null
  }

  // ⭐ Action utile : mettre à jour l'tempPolice en cache
  // (par ex. après un updateTempPolice réussi)
  const updateCurrentTempPolice = (data: Partial<TempPolice>) => {
    if (currentTempPolice.value) {
      currentTempPolice.value = { ...currentTempPolice.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'tempPolice supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentTempPolice.value?.id === id) {
      currentTempPolice.value = null
    }
  }

  return {
    currentTempPolice,
    isSelected,
    currentTempPoliceId,
    selectTempPolice,
    clearSelection,
    updateCurrentTempPolice,
    removeIfCurrent,
  }
})