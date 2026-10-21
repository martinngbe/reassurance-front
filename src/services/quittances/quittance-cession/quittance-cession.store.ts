import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { QuittanceCession } from './quittance-cession'

export const useQuittanceCessionStore = defineStore('quittanceStore', () => {
  // ==================== STATE ====================
  const currentQuittanceCession = ref<QuittanceCession | null>(null)
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentQuittanceCession.value !== null)
  const currentQuittanceCessionId = computed(() => currentQuittanceCession.value?.id ?? null)

  // ==================== ACTIONS ====================
  const selectQuittanceCession = (quittance: QuittanceCession | null) => {
    currentQuittanceCession.value = quittance
  }

  const clearSelection = () => {
    currentQuittanceCession.value = null
  }

  // ⭐ Action utile : mettre à jour l'quittance en cache
  // (par ex. après un updateQuittanceCession réussi)
  const updateCurrentQuittanceCession = (data: Partial<QuittanceCession>) => {
    if (currentQuittanceCession.value) {
      currentQuittanceCession.value = { ...currentQuittanceCession.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'quittance supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentQuittanceCession.value?.id === id) {
      currentQuittanceCession.value = null
    }
  }

  return {
    currentQuittanceCession,
    isSelected,
    currentQuittanceCessionId,
    selectQuittanceCession,
    clearSelection,
    updateCurrentQuittanceCession,
    removeIfCurrent,
  }
})