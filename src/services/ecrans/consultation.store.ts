// stores/consultation.ts (ou src/stores/consultation.ts)
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAssureStore } from '../acteurs/assure/assure.store'
import { useActeurStore } from '../acteurs/acteur/acteur.store'

export type ConsultationTab = 'assures' | 'cedantes' | 'polices' | 'quittances'


export const useConsultationStore = defineStore('consultationStore', () => {
  const assuresStore = useAssureStore()
  const acteursStore = useActeurStore()
  const currentConsultationTab = ref<ConsultationTab>("quittances")
  // ==================== GETTERS ==================== 
  const setActiveTab = (b: ConsultationTab) => {
    console.warn("__________ CHANGEMENT TAB CONSULTATION __________")
    console.log("___ AVANT  currentConsultationTab.value:",currentConsultationTab.value)
    currentConsultationTab.value = b
    console.log("___ APRES  currentConsultationTab.value:",currentConsultationTab.value)
    assuresStore.clearSelection()
    acteursStore.clearSelection()
  }
  

   const clearSelection = () => {
    console.warn("__________ INITIALISATION TAB CONSULTATION __________")
    currentConsultationTab.value="quittances"
    assuresStore.clearSelection()
    acteursStore.clearSelection()  
  }


  return {
   currentConsultationTab ,   
   setActiveTab,
   clearSelection
  
  }
})