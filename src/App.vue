<script setup lang="ts">
import { ref, watch } from 'vue'
import Login from './components/Login.vue'
import EcranPrincipal from './components/EcranPrincipal.vue'

type Theme = 'light' | 'dark'

const authenticated = ref(false)
const theme = ref<Theme>('dark')
const accentColor = ref('#6C5CE7')

// Palette prédéfinie (pour le sélecteur dans le header)
const palettes = [
  { name: 'Violet', value: '#6C5CE7' },
  { name: 'Bleu', value: '#0EA5E9' },
  { name: 'Émeraude', value: '#10B981' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Ambre', value: '#F59E0B' },
]

function handleLogin() {
  authenticated.value = true
}

function handleLogout() {
  authenticated.value = false
}
</script>

<template>
  <div :class="{ dark: theme === 'dark' }" class="min-h-screen">
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
</template>