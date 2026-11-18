import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { QuittanceTranche } from './quittance-tranche'

export const useQuittanceTrancheStore = defineStore('quittanceTrancheStore', () => {
  // STATE
  const currentQuittanceTranche = ref<QuittanceTranche | null>(null)
  const selectedQuittanceTranches = ref<(string | number)[]>([])

  // GETTERS
  const isSelected = computed(() => currentQuittanceTranche.value !== null)
  const currentQuittanceTrancheId = computed(() => currentQuittanceTranche.value?.id ?? null)

  // ACTIONS
  const selectQuittanceTranche = (qp: QuittanceTranche | null) => {
    currentQuittanceTranche.value = qp
  }

  /** Passe explicitement en mode création */
  const startCreate = () => { currentQuittanceTranche.value = null }

  const clearSelection = () => {
    currentQuittanceTranche.value = null
    selectedQuittanceTranches.value = []
  }

  const setSelectedQuittanceTranches = (ids: (string | number)[]) => {
    selectedQuittanceTranches.value = ids
  }

  const toggleQuittanceTrancheSelection = (id: string | number) => {
    const i = selectedQuittanceTranches.value.indexOf(id)
    i === -1 ? selectedQuittanceTranches.value.push(id) : selectedQuittanceTranches.value.splice(i, 1)
  }

  const updateCurrentQuittanceTranche = (data: Partial<QuittanceTranche>) => {
    if (currentQuittanceTranche.value) {
      currentQuittanceTranche.value = { ...currentQuittanceTranche.value, ...data }
    }
  }

  const removeIfCurrent = (id: number) => {
    if (currentQuittanceTranche.value?.id === id) currentQuittanceTranche.value = null
    selectedQuittanceTranches.value = selectedQuittanceTranches.value.filter((i) => i !== id)
  }

  return {
    currentQuittanceTranche, selectedQuittanceTranches,
    isSelected, currentQuittanceTrancheId,
    selectQuittanceTranche, startCreate, clearSelection,
    setSelectedQuittanceTranches, toggleQuittanceTrancheSelection,
    updateCurrentQuittanceTranche, removeIfCurrent,
  }
})