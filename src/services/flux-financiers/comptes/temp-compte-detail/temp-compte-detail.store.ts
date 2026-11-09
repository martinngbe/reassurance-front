// tempCompte.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { TempCompteDetail } from './temp-compte-detail'

export const useTempCompteDetailStore = defineStore('tempCompteDetailStore', () => {
 
  
  // ==================== STATE ====================
  // 1. Sélection unique (pour la vue détail / row-click)
  const currentTempCompteDetail = ref<TempCompteDetail | null>(null)
  
  // 2. Sélection multiple (pour les checkboxes de la table)
  const selectedTempComptesDetails = ref<(string | number)[]>([])

  // ==================== GETTERS ====================
  const isSelected = computed(() => currentTempCompteDetail.value !== null)
  const currentTempCompteDetailId = computed(() => currentTempCompteDetail.value?.id ?? null)
  const hasSelectedTempComptes = computed(() => selectedTempComptesDetails.value.length > 0)
 
  // ==================== ACTIONS ====================
  
  // --- Actions pour la sélection unique ---
  const selectTempCompteDetail = (tempCompte: TempCompteDetail | null) => {
    console.warn("__________ CHANGEMENT TEMP COMPTE DETAIL __________")
    console.log("ANCIEN : ",currentTempCompteDetail.value?.id)
    console.log("NOUVEAU :",tempCompte? 'tempCompte.numero' : null)
    currentTempCompteDetail.value = tempCompte
    
  }
  const clearCurrentTempCompteDetail = () => {
    clearSelectionTempCompteDetail()
  }

  // --- Actions pour la sélection multiple (Table) ---
  const setSelectedTempComptesDetails = (ids: (string | number)[]) => {
    selectedTempComptesDetails.value = ids
  }
  
  const clearSelectionTempCompteDetail = () => {
    console.warn("__________ INITIALISTAION ASSURES __________")
    selectedTempComptesDetails.value = []
    currentTempCompteDetail.value = null
    //policeStore.clearSelectionTempCompteDetail()
  }
  
  const toggleTempCompteDetailSelection = (id: string | number) => {
    const index = selectedTempComptesDetails.value.indexOf(id)
    if (index === -1) {
      selectedTempComptesDetails.value.push(id)
    } else {
      selectedTempComptesDetails.value.splice(index, 1)
    }
  }
  // ⭐ Action utile : mettre à jour l'acteur en cache
  // (par ex. après un updateActeur réussi)
  const updateCurrentTempCompteDetail = (data: Partial<TempCompteDetail>) => {
    if (currentTempCompteDetail.value) {
      currentTempCompteDetail.value = { ...currentTempCompteDetail.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'acteur supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentTempCompteDetail.value?.id === id) {
      currentTempCompteDetail.value = null
    }
  }
  return {
    // State
    currentTempCompteDetail,
    selectedTempComptesDetails,
    // Getters
    isSelected,
    currentTempCompteDetailId,
    hasSelectedTempComptes,
    // Actions (Unique)
    selectTempCompteDetail,
    clearCurrentTempCompteDetail,
    // Actions (Multiple)
    setSelectedTempComptesDetails,
    clearSelectionTempCompteDetail,
    updateCurrentTempCompteDetail,
    removeIfCurrent,
    toggleTempCompteDetailSelection,
  }
})