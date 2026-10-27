import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Mouvement } from './mouvement'

export const useMouvementStore = defineStore('mouvementStore', () => {
  // ==================== STATE ====================
  const currentMouvement = ref<Mouvement | null>(null)
  // ==================== GETTERS ====================
  const isSelectedMouvement = computed(() => currentMouvement.value !== null)
  const currentMouvementId = computed(() => currentMouvement.value?.id ?? null)

  // ==================== ACTIONS ====================
  const selectMouvement = (mouvement: Mouvement | null) => {
    currentMouvement.value = mouvement
  }

  const clearMouvementSelection = () => {
    currentMouvement.value = null
  }

  // ⭐ Action utile : mettre à jour l'mouvement en cache
  // (par ex. après un updateMouvement réussi)
  const updateCurrentMouvement = (data: Partial<Mouvement>) => {
    if (currentMouvement.value) {
      currentMouvement.value = { ...currentMouvement.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'mouvement supprimé est celui sélectionné
  const removeIfCurrentMouvement = (id: number) => {
    if (currentMouvement.value?.id === id) {
      currentMouvement.value = null
    }
  }

  return {
    currentMouvement,
    isSelectedMouvement,
    currentMouvementId,
    selectMouvement,
    clearMouvementSelection,
    updateCurrentMouvement,
    removeIfCurrentMouvement,
  }
})