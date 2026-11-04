import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { QuittancePlacement } from './quittance-placement'

export const useQuittancePlacementStore = defineStore('quittancePlacementStore', () => {
  // STATE
  const currentQuittancePlacement = ref<QuittancePlacement | null>(null)
  const selectedQuittancePlacements = ref<(string | number)[]>([])

  // GETTERS
  const isSelected = computed(() => currentQuittancePlacement.value !== null)
  const currentQuittancePlacementId = computed(() => currentQuittancePlacement.value?.id ?? null)

  // ACTIONS
  const selectQuittancePlacement = (qp: QuittancePlacement | null) => {
    currentQuittancePlacement.value = qp
  }

  /** Passe explicitement en mode création */
  const startCreate = () => { currentQuittancePlacement.value = null }

  const clearSelection = () => {
    currentQuittancePlacement.value = null
    selectedQuittancePlacements.value = []
  }

  const setSelectedQuittancePlacements = (ids: (string | number)[]) => {
    selectedQuittancePlacements.value = ids
  }

  const toggleQuittancePlacementSelection = (id: string | number) => {
    const i = selectedQuittancePlacements.value.indexOf(id)
    i === -1 ? selectedQuittancePlacements.value.push(id) : selectedQuittancePlacements.value.splice(i, 1)
  }

  const updateCurrentQuittancePlacement = (data: Partial<QuittancePlacement>) => {
    if (currentQuittancePlacement.value) {
      currentQuittancePlacement.value = { ...currentQuittancePlacement.value, ...data }
    }
  }

  const removeIfCurrent = (id: number) => {
    if (currentQuittancePlacement.value?.id === id) currentQuittancePlacement.value = null
    selectedQuittancePlacements.value = selectedQuittancePlacements.value.filter((i) => i !== id)
  }

  return {
    currentQuittancePlacement, selectedQuittancePlacements,
    isSelected, currentQuittancePlacementId,
    selectQuittancePlacement, startCreate, clearSelection,
    setSelectedQuittancePlacements, toggleQuittancePlacementSelection,
    updateCurrentQuittancePlacement, removeIfCurrent,
  }
})