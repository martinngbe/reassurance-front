import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Utilisateur } from './utilisateur'

export const useUtilisateurStore = defineStore('utilisateurStore', () => {
  // ==================== STATE ====================
  const currentUtilisateur = ref<Utilisateur | null>(null)
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentUtilisateur.value !== null)
  const currentUtilisateurId = computed(() => currentUtilisateur.value?.id ?? null)

  // ==================== ACTIONS ====================
  const selectUtilisateur = (utilisateur: Utilisateur | null) => {
    currentUtilisateur.value = utilisateur
  }

  const clearSelection = () => {
    currentUtilisateur.value = null
  }

  // ⭐ Action utile : mettre à jour l'utilisateur en cache
  // (par ex. après un updateUtilisateur réussi)
  const updateCurrentUtilisateur = (data: Partial<Utilisateur>) => {
    if (currentUtilisateur.value) {
      currentUtilisateur.value = { ...currentUtilisateur.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'utilisateur supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentUtilisateur.value?.id === id) {
      currentUtilisateur.value = null
    }
  }

  return {
    currentUtilisateur,
    isSelected,
    currentUtilisateurId,
    selectUtilisateur,
    clearSelection,
    updateCurrentUtilisateur,
    removeIfCurrent,
  }
})