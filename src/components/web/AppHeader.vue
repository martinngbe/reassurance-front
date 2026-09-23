<script setup lang="ts">
import { useTheme } from '@/theme/useTheme.ts';
import TToolTip from '../display/TToolTip.vue';
import ThemePicker from '../theme/ThemePicker.vue';
import ToggleTheme from '../theme/ToggleTheme.vue';
import { computed } from 'vue';
    const { theme, toggleMode } = useTheme()

      defineProps<{
        theme: 'light' | 'dark'
        accentColor: string
        palettes: { name: string; value: string }[]
      }>()

      const emit = defineEmits<{
        (e: 'update:theme', value: 'light' | 'dark'): void
        (e: 'update:accent-color', value: string): void
        (e: 'logout'): void
      }>()
  
    /** mode réellement appliqué ('system' déjà résolu) */
    const isDark = computed<boolean>(() => theme.resolvedMode === 'dark')
</script>

<template>
  <div class="flex h-full items-center justify-between px-4 ">
    <!-- GAUCHE : Profil + Toggle -->
    <div class="flex items-center gap-3">
      <!-- Avatar utilisateur -->
      <div class="flex items-center gap-2">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
          :class="isDark ? 'bg-primary-600' : 'bg-neutral-300'"
        >
          AD
        </div>
        <div class="hidden flex-col leading-tight sm:flex">
          <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Admin Demo
          </span>
          <span class="text-xs text-slate-500 dark:text-slate-400">admin@entreprise.com</span>
        </div>
      </div>

      <!-- Séparateur -->
      <div class="mx-2 h-8 w-px bg-slate-200 dark:bg-slate-700" />


      <!-- Sélecteur de palette -->
      <div class="flex items-center gap-1.5">
        
          <TToolTip content="Choisir la couleur primaire" position="bottom">
            <ThemePicker />
          </TToolTip>
      </div>
    </div>

    <!-- MILIEU : Raison sociale -->
    <div class="absolute left-1/2 hidden -translate-x-1/2 flex-col items-center md:flex">
      <h1 class="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
        ASSURANCE PLUS INTERNATIONAL
      </h1>
      <span class="text-xs text-slate-500 dark:text-slate-400">
        Gestion des contrats & sinistres
      </span>
    </div>

    <!-- DROITE : Logo entreprise -->
    <div class="flex items-center gap-2">
       <TToolTip content="Changer le thème" position="bottom">
            <ToggleTheme />
        </TToolTip>
      <div
        class="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white shadow-md"
        :style="{ backgroundColor: accentColor }"
      >
       
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <button
        class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        @click="emit('logout')"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span class="hidden sm:inline">Déconnexion</span>
      </button>
    </div>
  </div>
</template>