import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { TempPolice } from './temp-police'
import { useTempQuittanceStore } from '../../quittances/temp-quittance/temp-quittance.store'
import type { TempQuittance } from '../../quittances/temp-quittance/temp-quittance'

export const useTempPoliceStore = defineStore('tempPoliceStore', () => {
  // ==================== STATE ====================
  const tempQuittanceStore = useTempQuittanceStore() // ⭐ 
  const currentTempPolice = ref<TempPolice | null>(null)
  const isAffaireNouvelleExecutee = ref<boolean>(false)
  // ==================== GETTERS ====================
  const isSelected = computed(() => currentTempPolice.value !== null)
  const currentTempPoliceId = computed(() => currentTempPolice.value?.id ?? null)

  // ==================== ACTIONS ====================
  const selectTempPolice = (tempPolice: TempPolice | null) => {
    currentTempPolice.value = tempPolice
    // la selection d'une nouvelle tempPolice réinialialise 
    // la tempQuittance rattachée
    console.log(" --------------------------------------------  ")
    console.warn(" ---selectTempPolice:", currentTempPolice.value)
    console.log(" --------------------------------------------  ")
    // Lors de la saisie temporairaire, la TempPolice vient avec 
    // toutes les TempQuittances rattachée . On prendra soin de veiller
    // qui'il n'en ait pas plus de un
    let listeTempQuittances : TempQuittance[]=[]
    if(tempPolice && tempPolice.quittances)
        listeTempQuittances= tempPolice.quittances

    if(listeTempQuittances.length===0)
      tempQuittanceStore.clearTempQuittanceSelection()
    else   tempQuittanceStore
      .selectTempQuittance(listeTempQuittances[0]?? null) 

  }

  const clearTempPoliceSelection = () => {
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
  const removeIfCurrentTempPolice = (id: number) => {
    if (currentTempPolice.value?.id === id) {
      currentTempPolice.value = null
    }
  }

  const setCurrentTempPolice = (police: TempPolice) => {

  console.log(" --------------------------------------------  ")
  console.warn(" ---setCurrentTempPolice:", police)
  console.log(" --------------------------------------------  ")
    if(currentTempPolice.value && 
      police.id === currentTempPolice.value.id ){
            // le ID de la police n'a pas changer
            // c'est sûrement un des propriétés qui a changer
            currentTempPolice.value = police
            return
      }
     // ICI tout est different. C'est totalement une nouvelle police
     currentTempPolice.value = police 
     // Don il faut réinitialiser le cuurentTempQuittance rattachée à currentTempPolice 
     tempQuittanceStore.clearTempQuittanceSelection() 
}
 const setTempPoliceIsAffaireNouvelleExecutee = (b: boolean) => {
  isAffaireNouvelleExecutee.value = b
  console.log(" --------------------------------------------  ")
  console.warn(" ----MAJ de   isAffaireNouvelleExecutee.value:", isAffaireNouvelleExecutee.value)
  console.log(" --------------------------------------------  ")
}

  return {
    currentTempPolice,
    isSelected,
    currentTempPoliceId,
    isAffaireNouvelleExecutee,
    setTempPoliceIsAffaireNouvelleExecutee,
    setCurrentTempPolice,
    selectTempPolice,
    clearTempPoliceSelection,
    updateCurrentTempPolice,
    removeIfCurrentTempPolice,
  }
})