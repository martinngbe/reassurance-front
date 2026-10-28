import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAssureStore } from '../acteurs/assure/assure.store'
import { usePoliceStore } from '../polices/police/police.store'

export const MODULE_ACCUEIL = 'accueil'
export const MODULE_ACCEPTATION = 'acceptation'
export const MODULE_CESSION = 'cession'
export const MODULE_SINISTRE = 'sinistre'
export const MODULE_COMPTE = 'compte'
export const MODULE_REGLEMENT = 'reglement'
export const MODULE_COMPTABILITE = 'comptabilisation'
export const MODULE_CONSULTATION = 'consultation'
export const MODULE_PARAMETRAGE = 'parametrage'
export const MODULE_AUTRE = 'autre'

export const ECRAN_FACULTATIVE = 'ecranFacultative'
export const ECRAN_TRAITE = 'ecranTraite'
export const ECRAN_TABLEAU_DE_BORD = 'ecranTableauDeBord'
export const ECRAN_AUTRE = 'XXX'


export const useEcransStore = defineStore('ecransStore', () => {
  const assuresStore = useAssureStore()
  // ==================== STATE ====================
  const currentModule = ref<string>(MODULE_AUTRE)
  const currentEcran = ref<string>(ECRAN_AUTRE)
  
  // ==================== GETTERS ==================== 
  const setModule = (b: string) => {
    console.warn("__________ CHANGEMENT MODULE __________")
    currentModule.value = b
    clearEcranSelection()
  }
  
  const setFormeEcran = (b: string) => {
    console.warn("__________ CHANGEMENT ECRAN __________")
    console.log("ANCIEN : ",currentEcran.value.toUpperCase())
    console.log("NOUVEAU :",b.toUpperCase())
    currentEcran.value =b
    assuresStore.clearSelection()
    
  }
   const clearEcranSelection = () => {
    console.warn("__________ INITIALISATION ECRAN __________")
    assuresStore.clearSelection()
    currentEcran.value =ECRAN_TABLEAU_DE_BORD
  }


  return {
   currentModule ,
   currentEcran ,
   setModule,
   setFormeEcran,
  }
})