// assure.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Assure } from './assure'
import { usePoliceStore } from '@/services/polices/police/police.store'

export const useAssureStore = defineStore('assureStore', () => {
  const policeStore = usePoliceStore()
  // ==================== STATE ====================
  // 1. Sélection unique (pour la vue détail / row-click)
  const currentAssure = ref<Assure | null>(null)
  
  // 2. Sélection multiple (pour les checkboxes de la table)
  const selectedAssures = ref<(string | number)[]>([])

  // ==================== GETTERS ====================
  const isSelected = computed(() => currentAssure.value !== null)
  const currentAssureId = computed(() => currentAssure.value?.id ?? null)
  const hasSelectedAssures = computed(() => selectedAssures.value.length > 0)
 
  // ==================== ACTIONS ====================
  
  // --- Actions pour la sélection unique ---
  const selectAssure = (assure: Assure | null) => {
    console.warn("__________ CHANGEMENT ASSURE __________")
    console.log("ANCIEN : ",currentAssure.value?.raisonSociale.toUpperCase())
    console.log("NOUVEAU :",assure? assure.raisonSociale.toUpperCase() : null)
    currentAssure.value = assure
    // la selection d'un assuré, reinialise la polices polices rattachées
    policeStore.clearSelection()
  }
  const clearCurrentAssure = () => {
    clearSelection()
  }

  // --- Actions pour la sélection multiple (Table) ---
  const setSelectedAssures = (ids: (string | number)[]) => {
    selectedAssures.value = ids
  }
  
  const clearSelection = () => {
    console.warn("__________ INITIALISTAION ASSURES __________")
    selectedAssures.value = []
    currentAssure.value = null
    policeStore.clearSelection()
  }
  
  const toggleAssureSelection = (id: string | number) => {
    const index = selectedAssures.value.indexOf(id)
    if (index === -1) {
      selectedAssures.value.push(id)
    } else {
      selectedAssures.value.splice(index, 1)
    }
  }
  // ⭐ Action utile : mettre à jour l'acteur en cache
  // (par ex. après un updateActeur réussi)
  const updateCurrentAssure = (data: Partial<Assure>) => {
    if (currentAssure.value) {
      currentAssure.value = { ...currentAssure.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'acteur supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentAssure.value?.id === id) {
      currentAssure.value = null
    }
  }
  return {
    // State
    currentAssure,
    selectedAssures,
    // Getters
    isSelected,
    currentAssureId,
    hasSelectedAssures,
    // Actions (Unique)
    selectAssure,
    clearCurrentAssure,
    // Actions (Multiple)
    setSelectedAssures,
    clearSelection,
    updateCurrentAssure,
    removeIfCurrent,
    toggleAssureSelection,
  }
})