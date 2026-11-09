// compte.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CompteDetail } from './compte-detail'

export const useCompteDetailStore = defineStore('compteDetailStore', () => {
 
  
  // ==================== STATE ====================
  // 1. Sélection unique (pour la vue détail / row-click)
  const currentCompteDetail = ref<CompteDetail | null>(null)
  
  // 2. Sélection multiple (pour les checkboxes de la table)
  const selectedComptesDetails = ref<(string | number)[]>([])

  // ==================== GETTERS ====================
  const isSelected = computed(() => currentCompteDetail.value !== null)
  const currentCompteDetailId = computed(() => currentCompteDetail.value?.id ?? null)
  const hasSelectedComptes = computed(() => selectedComptesDetails.value.length > 0)
 
  // ==================== ACTIONS ====================
  
  // --- Actions pour la sélection unique ---
  const selectCompteDetail = (compte: CompteDetail | null) => {
    console.warn("__________ CHANGEMENT TEMP COMPTE DETAIL __________")
    console.log("ANCIEN : ",currentCompteDetail.value?.id)
    console.log("NOUVEAU :",compte? 'compte.numero' : null)
    currentCompteDetail.value = compte
    
  }
  const clearCurrentCompteDetail = () => {
    clearSelectionCompteDetail()
  }

  // --- Actions pour la sélection multiple (Table) ---
  const setSelectedComptesDetails = (ids: (string | number)[]) => {
    selectedComptesDetails.value = ids
  }
  
  const clearSelectionCompteDetail = () => {
    console.warn("__________ INITIALISTAION ASSURES __________")
    selectedComptesDetails.value = []
    currentCompteDetail.value = null
    //policeStore.clearSelectionCompteDetail()
  }
  
  const toggleCompteDetailSelection = (id: string | number) => {
    const index = selectedComptesDetails.value.indexOf(id)
    if (index === -1) {
      selectedComptesDetails.value.push(id)
    } else {
      selectedComptesDetails.value.splice(index, 1)
    }
  }
  // ⭐ Action utile : mettre à jour l'acteur en cache
  // (par ex. après un updateActeur réussi)
  const updateCurrentCompteDetail = (data: Partial<CompteDetail>) => {
    if (currentCompteDetail.value) {
      currentCompteDetail.value = { ...currentCompteDetail.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'acteur supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentCompteDetail.value?.id === id) {
      currentCompteDetail.value = null
    }
  }
  return {
    // State
    currentCompteDetail,
    selectedComptesDetails,
    // Getters
    isSelected,
    currentCompteDetailId,
    hasSelectedComptes,
    // Actions (Unique)
    selectCompteDetail,
    clearCurrentCompteDetail,
    // Actions (Multiple)
    setSelectedComptesDetails,
    clearSelectionCompteDetail,
    updateCurrentCompteDetail,
    removeIfCurrent,
    toggleCompteDetailSelection,
  }
})