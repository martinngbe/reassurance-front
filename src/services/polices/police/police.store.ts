import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Police } from './police'
import { useQuittanceStore } from '../../quittances/quittance/quittance.store'

export const usePoliceStore = defineStore('policeStore', () => {

  const quittanceStore = useQuittanceStore()
  // ==================== STATE ====================
  const currentPolice = ref<Police | null>(null)
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentPolice.value !== null)
  const currentPoliceId = computed(() => currentPolice.value?.id ?? null)
  // 2. Sélection multiple (pour les checkboxes de la table)
  const selectedPolices = ref<(string | number)[]>([])
  const hasSelectedPolices = computed(() => selectedPolices.value.length > 0)
 
  // ==================== ACTIONS ====================
    // --- Actions pour la sélection multiple (Table) ---
  const setSelectedPolices = (ids: (string | number)[]) => {
    selectedPolices.value = ids
  }
  const selectPolice = (police: Police | null) => {
    console.warn("__________ SELECTION POLICE __________")
    console.log("ID AVANT:", currentPolice.value?.id)
    console.log("ID APRES:", police?.id)
    currentPolice.value = police
    // la selection d'une police, réinitialise les quittances rattachées
    quittanceStore.clearSelection()
  }
  const toggleAssureSelection = (id: string | number) => {
    const index = selectedPolices.value.indexOf(id)
    if (index === -1) {
      selectedPolices.value.push(id)
    } else {
      selectedPolices.value.splice(index, 1)
    }
  }
  const clearSelection = () => {
    console.warn("__________ INITIALISTAION POLICE __________")
    currentPolice.value = null
    selectedPolices.value = []
   
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
    selectPolice(police)
  }


  
  return {
    currentPolice,
    isSelected,
    currentPoliceId,
    selectedPolices,
    hasSelectedPolices,
    setCurrentPolice,
    selectPolice,
    setSelectedPolices,
    clearSelection,
    updateCurrentPolice,
    removeIfCurrent,
  }
})