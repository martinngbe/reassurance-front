// tempCompte.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { TempCompte } from './temp-compte'
import { useTempCompteDetailStore } from '../temp-compte-detail/temp-compte-detail.store'

export const useTempCompteStore = defineStore('tempCompteStore', () => {
 
  const tempCompteDetailStore = useTempCompteDetailStore()
  // ==================== STATE ====================
  // 1. Sélection unique (pour la vue détail / row-click)
  const currentTempCompte = ref<TempCompte | null>(null)
  
  // 2. Sélection multiple (pour les checkboxes de la table)
  const selectedTempComptes = ref<(string | number)[]>([])

  // ==================== GETTERS ====================
  const isSelected = computed(() => currentTempCompte.value !== null)
  const currentTempCompteId = computed(() => currentTempCompte.value?.id ?? null)
  const hasSelectedTempComptes = computed(() => selectedTempComptes.value.length > 0)
 
  // ==================== ACTIONS ====================
  
  // --- Actions pour la sélection unique ---
  const selectTempCompte = (tempCompte: TempCompte | null) => {
    console.warn("__________ CHANGEMENT COMPTE __________")
    console.log("ANCIEN : ",currentTempCompte.value?.numero)
    console.log("NOUVEAU :",tempCompte? 'tempCompte.numero' : null)
    currentTempCompte.value = tempCompte
    tempCompteDetailStore.clearSelectionTempCompteDetail()
    
  }
  const clearCurrentTempCompte = () => {
    clearSelectionTempCompte()
  }

  // --- Actions pour la sélection multiple (Table) ---
  const setSelectedTempComptes = (ids: (string | number)[]) => {
    selectedTempComptes.value = ids
  }
  
  const clearSelectionTempCompte = () => {
    console.warn("__________ INITIALISTAION ASSURES __________")
    selectedTempComptes.value = []
    currentTempCompte.value = null
    tempCompteDetailStore.clearSelectionTempCompteDetail()
  }
  
  const toggleTempCompteSelection = (id: string | number) => {
    const index = selectedTempComptes.value.indexOf(id)
    if (index === -1) {
      selectedTempComptes.value.push(id)
    } else {
      selectedTempComptes.value.splice(index, 1)
    }
  }
  // ⭐ Action utile : mettre à jour l'acteur en cache
  // (par ex. après un updateActeur réussi)
  const updateCurrentTempCompte = (data: Partial<TempCompte>) => {
    if (currentTempCompte.value) {
      currentTempCompte.value = { ...currentTempCompte.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'acteur supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentTempCompte.value?.id === id) {
      currentTempCompte.value = null
    }
  }

  // ✅ AJOUT : compteur pour déclencher un refresh cross-composants
  const refreshTrigger = ref(0)
  const triggerRefresh = () => {
    refreshTrigger.value++
  }



  return {
    // State
    currentTempCompte,
    selectedTempComptes,
    // Getters
    isSelected,
    currentTempCompteId,
    hasSelectedTempComptes,
    // Actions (Unique)
    selectTempCompte,
    clearCurrentTempCompte,
    // Actions (Multiple)
    setSelectedTempComptes,
    clearSelectionTempCompte,
    updateCurrentTempCompte,
    removeIfCurrent,
    toggleTempCompteSelection,
    refreshTrigger,
    triggerRefresh,
  }
})