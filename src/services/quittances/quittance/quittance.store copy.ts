import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Quittance } from './quittance'

export const useQuittanceStore = defineStore('quittanceStore', () => {
  // ==================== STATE ====================
  const currentQuittance = ref<Quittance | null>(null)
  const selectedQuittances = ref<(string | number)[]>([])
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentQuittance.value !== null)
  const currentQuittanceId = computed(() => currentQuittance.value?.id ?? null)

  // ==================== ACTIONS ====================


  const clearSelection = () => {
    console.warn("__________ INITIALISATION QUITTANCE _____________")
    currentQuittance.value = null
    selectedQuittances.value = []
   
  }
  const setSelectedQuittances = (ids: (string | number)[]) => {
    selectedQuittances.value = ids
  }
  const selectQuittance = (quittance: Quittance | null) => {
    console.warn("__________ SELECTION QUITTANCE __________")
    console.log("ID AVANT:", currentQuittance.value?.id)
    console.log("ID APRES:", quittance?.id)
    currentQuittance.value = quittance
  }
  const toggleAssureSelection = (id: string | number) => {
    const index = selectedQuittances.value.indexOf(id)
    if (index === -1) {
      selectedQuittances.value.push(id)
    } else {
      selectedQuittances.value.splice(index, 1)
    }
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
    selectedQuittances,
    toggleAssureSelection,
    setSelectedQuittances,
    selectQuittance,
    clearSelection,
    updateCurrentQuittance,
    removeIfCurrent,
  }
})