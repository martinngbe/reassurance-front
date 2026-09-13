<script setup lang="ts">
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
</script>

<template>
  <div class="flex h-full items-center justify-between px-4">
    <!-- GAUCHE : Profil + Toggle -->
    <div class="flex items-center gap-3">
      <!-- Avatar utilisateur -->
      <div class="flex items-center gap-2">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
          :style="{ backgroundColor: accentColor }"
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

      <!-- Toggle Dark / Light -->
      <button
        class="relative flex h-9 w-16 items-center rounded-full border border-slate-200 bg-slate-100 p-1 transition-colors dark:border-slate-700 dark:bg-slate-800"
        :title="theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'"
        @click="emit('update:theme', theme === 'dark' ? 'light' : 'dark')"
      >
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 dark:bg-slate-700"
          :class="theme === 'dark' ? 'translate-x-7' : 'translate-x-0'"
        >
          <!-- Soleil -->
          <svg
            v-if="theme === 'light'"
            class="h-4 w-4 text-amber-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          <!-- Lune -->
          <svg
            v-else
            class="h-4 w-4 text-indigo-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      </button>

      <!-- Sélecteur de palette -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="p in palettes"
          :key="p.value"
          class="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
          :class="p.value === accentColor ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'"
          :style="{ backgroundColor: p.value }"
          :title="p.name"
          @click="emit('update:accent-color', p.value)"
        />
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