import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

//export type Module = 'google' | 'github' | 'facebook'
export const useEcransStore = defineStore('ecranStore', () => {
  // ==================== STATE ====================
  //const currentScreen = ref<Acteur | null>(null)
  const isModuleAcceptation = ref(false)
  const isModuleCession = ref(false)
  const isFacultative = ref(false)
  const isTraite= ref(false)
  // ==================== GETTERS ====================
  
  // ==================== ACTIONS ====================
  const setModuleAcceptation = (b: boolean) => {
    isModuleAcceptation.value = b
    isModuleCession.value = !b
  }
   const setModuleCession = (b: boolean) => {
    isModuleCession.value = b
    isModuleAcceptation.value = !b
  }
  const setFacultative = (b: boolean) => {
   isFacultative.value =b
  }
  const setTraite = (b: boolean) => {
   isTraite.value =b
  }
  


  return {
   isModuleAcceptation ,
   isModuleCession ,
   isFacultative,
   isTraite,

   setModuleAcceptation,
   setModuleCession,
   setFacultative,
   setTraite
  }
})