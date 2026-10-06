<script setup lang="ts">
import { ref, watch } from 'vue'
import Login from './components/Login.vue'
import EcranPrincipal from './components/web/EcranPrincipal.vue'

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

function handleLogin() {
  authenticated.value = true
}

function handleLogout() {
  authenticated.value = false
}
</script>

<template>
 
  <div class="min-h-screen">
    <Login
      v-if="!authenticated"
      :theme="theme"
      :accent-color="accentColor"
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
  <!-- ✅ Utiliser la variable, pas import.meta directement -->
  <VueQueryDevtools v-if="isDev" />
</template>
