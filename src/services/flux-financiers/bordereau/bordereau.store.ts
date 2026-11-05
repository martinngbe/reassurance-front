import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Bordereau } from './bordereau'

export const useBordereauStore = defineStore('bordereauStore', () => {
  // ==================== STATE ====================
  const currentBordereau = ref<Bordereau | null>(null)
  const selectedBordereaux = ref<(string | number)[]>([])
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentBordereau.value !== null)
  const currentBordereauId = computed(() => currentBordereau.value?.id ?? null)

  // ==================== ACTIONS ====================


  const clearSelection = () => {
    console.warn("__________ INITIALISATION QUITTANCE _____________")
    currentBordereau.value = null
    selectedBordereaux.value = []
   
  }
  const setSelectedBordereaux = (ids: (string | number)[]) => {
    selectedBordereaux.value = ids
  }
  const selectBordereau = (bordereau: Bordereau | null) => {
    console.warn("__________ SELECTION QUITTANCE __________")
    console.log("ID AVANT:", currentBordereau.value?.id)
    console.log("ID APRES:", bordereau?.id)
    currentBordereau.value = bordereau
  }
  const toggleAssureSelection = (id: string | number) => {
    const index = selectedBordereaux.value.indexOf(id)
    if (index === -1) {
      selectedBordereaux.value.push(id)
    } else {
      selectedBordereaux.value.splice(index, 1)
    }
  }
  // ⭐ Action utile : mettre à jour l'bordereau en cache
  // (par ex. après un updateBordereau réussi)
  const updateCurrentBordereau = (data: Partial<Bordereau>) => {
    if (currentBordereau.value) {
      currentBordereau.value = { ...currentBordereau.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'bordereau supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentBordereau.value?.id === id) {
      currentBordereau.value = null
    }
  }

  return {
    currentBordereau,
    isSelected,
    currentBordereauId,
    selectedBordereaux,
    toggleAssureSelection,
    setSelectedBordereaux,
    selectBordereau,
    clearSelection,
    updateCurrentBordereau,
    removeIfCurrent,
  }
})