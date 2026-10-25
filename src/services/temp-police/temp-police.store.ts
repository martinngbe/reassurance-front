import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { TempPolice } from './temp-police'
import { useTempQuittanceStore } from '../quittances/temp-quittance/temp-quittance.store'
import ThemeModeToggle from '@/composants/theme/ThemeModeToggle.vue'
import type { TempQuittance } from '../quittances/temp-quittance/temp-quittance'

export const useTempPoliceStore = defineStore('tempPoliceStore', () => {
  // ==================== STATE ====================
  const tempQuittanceStore = useTempQuittanceStore() // ⭐ 
  const currentTempPolice = ref<TempPolice | null>(null)
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentTempPolice.value !== null)
  const currentTempPoliceId = computed(() => currentTempPolice.value?.id ?? null)

  // ==================== ACTIONS ====================
  const selectTempPolice = (tempPolice: TempPolice | null) => {
    currentTempPolice.value = tempPolice
    // la selection d'une nouvelle tempPolice réinialialise 
    // la tempQuittance rattachée
    
    // Lors de la saisie temporairaire, la TempPolice vient avec 
    // toutes les TempQuittances rattachée . On prendra soin de veiller
    // qui'il n'en ait pas plus de un
    let listeTempQuittances : TempQuittance[]=[]
    if(tempPolice && tempPolice.quittances)
        listeTempQuittances= tempPolice.quittances

    if(listeTempQuittances.length===0)
      tempQuittanceStore.clearSelection()
    else   tempQuittanceStore
      .selectTempQuittance(listeTempQuittances[0]?? null) 

  }

  const clearSelection = () => {
    currentTempPolice.value = null
  }

  // ⭐ Action utile : mettre à jour le tempPolice en cache
  // (par ex. après un updateTempPolice réussi)
  const updateCurrentTempPolice = (data: Partial<TempPolice>) => {
    if (currentTempPolice.value) {
      currentTempPolice.value = { ...currentTempPolice.value, ...data }
    }
  }

  // ⭐ Action utile : effacer si l'tempPolice supprimé est celui sélectionné
  const removeIfCurrent = (id: number) => {
    if (currentTempPolice.value?.id === id) {
      currentTempPolice.value = null
    }
  }

  return {
    currentTempPolice,
    isSelected,
    currentTempPoliceId,
    selectTempPolice,
    clearSelection,
    updateCurrentTempPolice,
    removeIfCurrent,
  }
})