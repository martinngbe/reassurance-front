<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Login from './composants/Login.vue'
import EcranPrincipal from './web/EcranPrincipal.vue'
import type {  LoginPayload } from './auth/types.ts'
import { authService } from './auth/auth.service.ts'
import TToastContainer from './composants/toast/TToastContainer.vue'
import { useNetworkStatus } from './composants/toast/useNetworkStatus.ts'
import { utilisateurApi } from './services/referentiel/utilisateur/utilisateur.api.ts'
import { useAuthStore } from './auth/auth.store.ts'

type Theme = 'light' | 'dark'

const authenticated = ref(false)
const theme = ref<Theme>('dark')
const accentColor = ref('#6C5CE7')

const palettes = [
  { name: 'Violet'  , value: '#6C5CE7' },
  { name: 'Bleu'    , value: '#0EA5E9' },
  { name: 'Émeraude', value: '#10B981' },
  { name: 'Rose'    , value: '#F43F5E' },
  { name: 'Ambre'   , value: '#F59E0B' },
]
// ✅ Exposer la variable d'environnement depuis le script
const isDev = import.meta.env.DEV
// ✅ Applique la classe "dark" sur <html> pour que tous les composants (même fixed) en héritent
watch(
  theme,
  (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  { immediate: true }
)
const  serverError =  ref("")

const authStore = useAuthStore()

authenticated.value = !!authService.getToken()
if(authenticated.value) 
authStore.refreshUserId() 

console.log(' ______authenticated.value:',authenticated.value)
async function handleLogin(payalod:LoginPayload) {
  
  const response = await  authService.login(payalod)
  if(!response.success){
    serverError.value=response.message
  }
  const token = authService.getToken()
  authenticated.value = !!token
  const responseUser =await  utilisateurApi.getById(response.utilisateurId)
  if(responseUser.success){
      authStore.setUserId(response.utilisateurId)
      //authStore.selectUserAuth(responseUser.data )
  }else {
    
  }
         

 // console.log(' ______ currentUserAuth:',currentUserAuth)
}

function handleLogout() {
  authenticated.value = false
  authService.logout()
}

useNetworkStatus()
</script>

<template>
 
  <div class="min-h-screen">
    <Login
      v-if="!authenticated"
      :theme="theme"
      :accent-color="accentColor"
      :server-error="serverError"
      @submit="handleLogin"
    />
    <EcranPrincipal
      v-else
      :theme="theme"
      :accent-color="accentColor"
      :palettes="palettes"
      @logout="handleLogout"
      @update:theme="theme = $event"
      @update:accent-color="accentColor = $event"
    />
  </div>
   <TToastContainer position="top-right" :max="5" />
  <!-- ✅ Utiliser la variable, pas import.meta directement -->
  <VueQueryDevtools v-if="isDev" />
</template>
