// compte.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Compte } from './compte'
import { useCompteDetailStore } from '../compte-detail/compte-detail.store'

export const useCompteStore = defineStore('compteStore', () => {
 
  const compteDetailStore = useCompteDetailStore()
  // ==================== STATE ====================
  // 1. Sélection unique (pour la vue détail / row-click)
  const currentCompte = ref<Compte | null>(null)
  
  // 2. Sélection multiple (pour les checkboxes de la table)
  const selectedComptes = ref<(string | number)[]>([])

  // ==================== GETTERS ====================
  const isSelected = computed(() => currentCompte.value !== null)
  const currentCompteId = computed(() => currentCompte.value?.id ?? null)
  const hasSelectedComptes = computed(() => selectedComptes.value.length > 0)
 
  // ==================== ACTIONS ====================
  
  // --- Actions pour la sélection unique ---
  const selectCompte = (compte: Compte | null) => {
    console.warn("__________ CHANGEMENT COMPTE __________")
    console.log("ANCIEN : ",currentCompte.value?.numero)
    console.log("NOUVEAU :",compte? 'compte.numero' : null)
    currentCompte.value = compte
    compteDetailStore.clearSelectionCompteDetail()
    
  }
  const clearCurrentCompte = () => {
    clearSelectionCompte()
  }

  // --- Actions pour la sélection multiple (Table) ---
  const setSelectedComptes = (ids: (string | number)[]) => {
    selectedComptes.value = ids
  }
  
  const clearSelectionCompte = () => {
    console.warn("__________ INITIALISTAION ASSURES __________")
    selectedComptes.value = []
    currentCompte.value = null
    compteDetailStore.clearSelectionCompteDetail()
  }
  
  const toggleCompteSelection = (id: string | number) => {
    const index = selectedComptes.value.indexOf(id)
    if (index === -1) {
      selectedComptes.value.push(id)
    } else {
      selectedComptes.value.splice(index, 1)
    }
  }
  // ⭐ Action utile : mettre à jour l'acteur en cache
  // (par ex. après un updateActeur réussi)
  const updateCurrentCompte = (data: Partial<Compte>) => {
    if (currentCompte.value) {
      currentCompte.value = { ...currentCompte.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'acteur supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentCompte.value?.id === id) {
      currentCompte.value = null
    }
  }

  // ✅ AJOUT : compteur pour déclencher un refresh cross-composants
  const refreshTrigger = ref(0)
  const triggerRefresh = () => {
    refreshTrigger.value++
  }



  return {
    // State
    currentCompte,
    selectedComptes,
    // Getters
    isSelected,
    currentCompteId,
    hasSelectedComptes,
    // Actions (Unique)
    selectCompte,
    clearCurrentCompte,
    // Actions (Multiple)
    setSelectedComptes,
    clearSelectionCompte,
    updateCurrentCompte,
    removeIfCurrent,
    toggleCompteSelection,
    refreshTrigger,
    triggerRefresh,
  }
})