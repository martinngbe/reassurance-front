import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

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

export const FORME_ECRAN_FACULTATIVE = 'ecranFacultative'
export const FORME_ECRAN_TRAITE = 'ecranTraite'
export const FORME_ECRAN_TABLEAU_DE_BORD = 'ecranTableauDeBord'
export const FORME_ECRAN_AUTRE = 'XXX'


//export type Module = 'google' | 'github' | 'facebook'
export const useEcransStore = defineStore('ecransStore', () => {
  // ==================== STATE ====================
  const currenteModule = ref<string>(MODULE_AUTRE)
  const currenteFormeEcran = ref<string>(FORME_ECRAN_AUTRE)
  
  // ==================== GETTERS ====================  
  // ==================== ACTIONS ====================
  const setModule = (b: string) => {
    currenteModule.value = b
  }
  
  const setFormeEcran = (b: string) => {
   currenteFormeEcran.value =b
  }
 


  return {
   currenteModule ,
   currenteFormeEcran ,
   setModule,
   setFormeEcran,
  }
})