// assure.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Assure } from './assure'

export const useAssureStore = defineStore('assureStore', () => {
  // ==================== STATE ====================
  // 1. Sélection unique (pour la vue détail / row-click)
  const currentAssure = ref<Assure | null>(null)
  
  // 2. Sélection multiple (pour les checkboxes de la table)
  const selectedAssures = ref<(string | number)[]>([])

  // ==================== GETTERS ====================
  const isSelected = computed(() => currentAssure.value !== null)
  const currentAssureId = computed(() => currentAssure.value?.id ?? null)
  const hasSelectedAssures = computed(() => selectedAssures.value.length > 0)
  
  // Getter utile : récupérer les objets complets si besoin (nécessite la liste des assurés)
  // const selectedAssuresData = computed(() => ...)

  // ==================== ACTIONS ====================
  
  // --- Actions pour la sélection unique ---
  const selectAssure = (assure: Assure | null) => {
    currentAssure.value = assure
  }
  const clearCurrentAssure = () => {
    currentAssure.value = null
  }

  // --- Actions pour la sélection multiple (Table) ---
  const setSelectedAssures = (ids: (string | number)[]) => {
    selectedAssures.value = ids
  }
  
  const clearSelectedAssures = () => {
    selectedAssures.value = []
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
    clearSelectedAssures,
    updateCurrentAssure,
    removeIfCurrent,
    toggleAssureSelection,
  }
})