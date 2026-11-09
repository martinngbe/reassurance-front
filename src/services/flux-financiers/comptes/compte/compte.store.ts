// compte.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Compte } from './compte'

export const useCompteStore = defineStore('compteStore', () => {
 
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
    console.log("ANCIEN : ",currentCompte.value?.numero.toUpperCase())
    console.log("NOUVEAU :",compte? compte.numero.toUpperCase() : null)
    currentCompte.value = compte
    
  }
  const clearCurrentCompte = () => {
    clearSelection()
  }

  // --- Actions pour la sélection multiple (Table) ---
  const setSelectedComptes = (ids: (string | number)[]) => {
    selectedComptes.value = ids
  }
  
  const clearSelection = () => {
    console.warn("__________ INITIALISTAION ASSURES __________")
    selectedComptes.value = []
    currentCompte.value = null
    //policeStore.clearSelection()
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
    clearSelection,
    updateCurrentCompte,
    removeIfCurrent,
    toggleCompteSelection,
  }
})