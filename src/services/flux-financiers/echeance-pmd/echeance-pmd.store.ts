import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { EcheancePmd } from './echeance-pmd'

export const useEcheancePmdStore = defineStore('bordereauStore', () => {
  // ==================== STATE ====================
  const currentEcheancePmd = ref<EcheancePmd | null>(null)
  const selectedEcheancesPmd = ref<(string | number)[]>([])
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentEcheancePmd.value !== null)
  const currentEcheancePmdId = computed(() => currentEcheancePmd.value?.id ?? null)

  // ==================== ACTIONS ====================


  const clearSelection = () => {
    console.warn("__________ INITIALISATION QUITTANCE _____________")
    currentEcheancePmd.value = null
    selectedEcheancesPmd.value = []
   
  }
  const setSelectedEcheancesPmd = (ids: (string | number)[]) => {
    selectedEcheancesPmd.value = ids
  }
  const selectEcheancePmd = (bordereau: EcheancePmd | null) => {
    console.warn("__________ SELECTION QUITTANCE __________")
    console.log("ID AVANT:", currentEcheancePmd.value?.id)
    console.log("ID APRES:", bordereau?.id)
    currentEcheancePmd.value = bordereau
  }
  const toggleAssureSelection = (id: string | number) => {
    const index = selectedEcheancesPmd.value.indexOf(id)
    if (index === -1) {
      selectedEcheancesPmd.value.push(id)
    } else {
      selectedEcheancesPmd.value.splice(index, 1)
    }
  }
  // ⭐ Action utile : mettre à jour l'bordereau en cache
  // (par ex. après un updateEcheancePmd réussi)
  const updateCurrentEcheancePmd = (data: Partial<EcheancePmd>) => {
    if (currentEcheancePmd.value) {
      currentEcheancePmd.value = { ...currentEcheancePmd.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'bordereau supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentEcheancePmd.value?.id === id) {
      currentEcheancePmd.value = null
    }
  }

  return {
    currentEcheancePmd,
    isSelected,
    currentEcheancePmdId,
    selectedEcheancesPmd,
    toggleAssureSelection,
    setSelectedEcheancesPmd,
    selectEcheancePmd,
    clearSelection,
    updateCurrentEcheancePmd,
    removeIfCurrent,
  }
})