// cessionLegale.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { usePoliceStore } from '@/services/polices/police/police.store'
import type { CessionLegale } from './cession-legale'

export const useCessionLegaleStore = defineStore('cessionLegaleStore', () => {
  // ==================== STATE ====================
  // 1. Sélection unique (pour la vue détail / row-click)
  const currentCessionLegale = ref<CessionLegale | null>(null)
  
  // 2. Sélection multiple (pour les checkboxes de la table)
  const selectedCessionLegales = ref<(string | number)[]>([])

  // ==================== GETTERS ====================
  const isSelected = computed(() => currentCessionLegale.value !== null)
  const currentCessionLegaleId = computed(() => currentCessionLegale.value?.id ?? null)
  const hasSelectedCessionLegales = computed(() => selectedCessionLegales.value.length > 0)
 
  // ==================== ACTIONS ====================
  
  // --- Actions pour la sélection unique ---
  const selectCessionLegale = (cessionLegale: CessionLegale | null) => {
    console.warn("__________ CHANGEMENT CESSION LEGALE __________")
    console.log("ANCIEN : ",currentCessionLegale.value?.id)
    console.log("NOUVEAU :",cessionLegale? cessionLegale.id : null)
    currentCessionLegale.value = cessionLegale
  }
  const clearCurrentCessionLegale = () => {
    clearSelection()
  }

  // --- Actions pour la sélection multiple (Table) ---
  const setSelectedCessionLegales = (ids: (string | number)[]) => {
    selectedCessionLegales.value = ids
  }
  
  const clearSelection = () => {
    console.warn("__________ INITIALISTAION CESSION LEGALE __________")
    selectedCessionLegales.value = []
    currentCessionLegale.value = null
  }
  
  const toggleCessionLegaleSelection = (id: string | number) => {
    const index = selectedCessionLegales.value.indexOf(id)
    if (index === -1) {
      selectedCessionLegales.value.push(id)
    } else {
      selectedCessionLegales.value.splice(index, 1)
    }
  }
  // ⭐ Action utile : mettre à jour l'acteur en cache
  // (par ex. après un updateActeur réussi)
  const updateCurrentCessionLegale = (data: Partial<CessionLegale>) => {
    if (currentCessionLegale.value) {
      currentCessionLegale.value = { ...currentCessionLegale.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'acteur supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentCessionLegale.value?.id === id) {
      currentCessionLegale.value = null
    }
  }
  return {
    // State
    currentCessionLegale,
    selectedCessionLegales,
    // Getters
    isSelected,
    currentCessionLegaleId,
    hasSelectedCessionLegales,
    // Actions (Unique)
    selectCessionLegale,
    clearCurrentCessionLegale,
    // Actions (Multiple)
    setSelectedCessionLegales,
    clearSelection,
    updateCurrentCessionLegale,
    removeIfCurrent,
    toggleCessionLegaleSelection,
  }
})