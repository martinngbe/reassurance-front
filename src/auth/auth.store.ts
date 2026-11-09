import type { Utilisateur } from '@/services/referentiel/utilisateur/utilisateur'
import { utilisateurApi } from '@/services/referentiel/utilisateur/utilisateur.api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'


export const useAuthStore = defineStore('authStore', () => {
  // ==================== STATE ====================
  const currentUserAuth = ref<Utilisateur | null>(null)
  // ==================== GETTERS ====================
  // const isSelected = computed(() => currentUtilisateur.value !== null)
  const currentUserAuthId = computed(() => currentUserAuth.value?.id ?? null)

  // ==================== ACTIONS ====================
  const selectUserAuth = (utilisateur: Utilisateur | null) => {
    currentUserAuth.value = utilisateur
    console.log(' ______ auth.store.selectUserAuth  currentUserAuth.value:',currentUserAuth.value)
  }
  const userFromDB = async (id:number)=>{
      console.log(' _______ userFromDB ___ id:',id)
      const responseUser =await  utilisateurApi.getById(id)
      console.log(' ______ responseUser:',responseUser)
      if(responseUser.success){
        currentUserAuth.value =responseUser.data

      console.log(' _______ userFromDB currentUserAuth.value:',currentUserAuth.value)  
     
  }
  }
  const setUserId = async(id: number | null) => {
   // currentUserAuthId.value = id
   if(!id){
    clearSelection()
    return
   }
    await userFromDB(id)
    console.log(' ______ auth.store.selectUserAuth  currentUserAuth.value:',currentUserAuth.value)
  }

  const clearSelection = () => {
    currentUserAuth.value = null
  }


  return {
    currentUserAuth,
    currentUserAuthId,
    setUserId,
    selectUserAuth,
    clearSelection,
  }
})