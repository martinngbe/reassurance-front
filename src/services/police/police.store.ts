import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Police } from './police'
import { useQuittanceStore } from '../quittances/quittance/quittance.store'

export const usePoliceStore = defineStore('policeStore', () => {

   const quittanceStore = useQuittanceStore()
  // ==================== STATE ====================
  const currentPolice = ref<Police | null>(null)
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentPolice.value !== null)
  const currentPoliceId = computed(() => currentPolice.value?.id ?? null)

  // ==================== ACTIONS ====================
  const selectPolice = (police: Police | null) => {
    currentPolice.value = police
    console.log("------ usePoliceStore.selectPolice à changé, on réinitialise la quittance ...")
    // la selection d'une police, réinitialise les quittances rattachées
    quittanceStore.clearSelection()
  }

  const clearSelection = () => {
    currentPolice.value = null
    console.log("------ usePoliceStore.clearSelection on réinitialise la police ...")
    quittanceStore.clearSelection()
    
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