<script setup lang="ts">
import { ref, computed } from 'vue'
import TLayout from './layout/TLayout.vue'

// Props
const props = defineProps<{
  theme: 'light' | 'dark'
  accentColor: string
  palettes: { name: string; value: string }[]
}>()

// Events
const emit = defineEmits<{
  (e: 'update:theme', value: 'light' | 'dark'): void
  (e: 'update:accent-color', value: string): void
  (e: 'logout'): void
}>()

// État du menu actif
const activeMenu = ref('accueil')

// Visibilité des zones
const headerVisible = ref(true)
const leftVisible = ref(true)
const rightVisible = ref(true)
const footerVisible = ref(true)

// Configuration des zones - fixed: false pour voir les splitters
const headerConfig = { 
  size: '64px', 
  minSize: '56px', 
  collapsedSize: '0px', 
  fixed: false // ← Permet le splitter
}
const leftConfig = { 
  size: '240px', 
  minSize: '180px', 
  collapsedSize: '40px',
  fixed: false
}
const rightConfig = { 
  size: '280px', 
  minSize: '200px', 
  collapsedSize: '40px',
  fixed: false
}
const footerConfig = { 
  size: '40px', 
  minSize: '32px', 
  collapsedSize: '0px', 
  fixed: false // ← Permet le splitter
}

// Variables CSS pour les couleurs dynamiques
function shift(hex: string, amount: number): string {
  const n = hex.replace('#', '')
  const full = n.length === 3 ? n.split('').map((c) => c + c).join('') : n
  const num = parseInt(full, 16)
  const clamp = (v: number) => Math.max(0, Math.min(255, v))
  const r = clamp((num >> 16) + amount)
  const g = clamp(((num >> 8) & 0xff) + amount)
  const b = clamp((num & 0xff) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

const accentVars = computed(() => ({
  '--accent': props.accentColor,
  '--accent-hover': shift(props.accentColor, -18),
  '--accent-soft': shift(props.accentColor, 140),
  '--accent-ring': `${props.accentColor}33`,
}))

// Informations rapides (côté droit)
const quickInfos = [
  { label: 'Utilisateur', value: 'Admin Demo' },
  { label: 'Rôle', value: 'Administrateur' },
  { label: 'Agence', value: 'Paris Centre' },
  { label: 'Session', value: 'Active' },
]

// Gestion sélection menu
function selectMenu(menuId: string) {
  activeMenu.value = menuId
}
</script>

<template>
  <div :style="accentVars" class="h-screen w-screen">
    <TLayout
      :header="headerConfig"
      :left="leftConfig"
      :right="rightConfig"
      :footer="footerConfig"
      splitter-size="5px"
      v-model:header-visible="headerVisible"
      v-model:left-visible="leftVisible"
      v-model:right-visible="rightVisible"
      v-model:footer-visible="footerVisible"
    >
      <!-- ==================== HEADER ==================== -->
      <template #header>
        <div class="flex h-full items-center justify-between px-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
          <!-- Gauche : Profil + Toggle -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                :style="{ backgroundColor: props.accentColor }"
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

            <div class="mx-2 h-8 w-px bg-slate-200 dark:bg-slate-700" />

            <!-- Toggle Dark/Light -->
            <button
              class="relative flex h-9 w-16 items-center rounded-full border border-slate-200 bg-slate-100 p-1 transition-colors dark:border-slate-700 dark:bg-slate-800"
              :title="props.theme === 'dark' ? 'Mode clair' : 'Mode sombre'"
              @click="emit('update:theme', props.theme === 'dark' ? 'light' : 'dark')"
            >
              <span
                class="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 dark:bg-slate-700"
                :class="props.theme === 'dark' ? 'translate-x-7' : 'translate-x-0'"
              >
                <svg
                  v-if="props.theme === 'light'"
                  class="h-4 w-4 text-amber-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
                </svg>
                <svg
                  v-else
                  class="h-4 w-4 text-indigo-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </span>
            </button>

            <!-- Sélecteur palette -->
            <div class="flex items-center gap-1.5">
              <button
                v-for="p in props.palettes"
                :key="p.value"
                class="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                :class="p.value === props.accentColor ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'"
                :style="{ backgroundColor: p.value }"
                :title="p.name"
                @click="emit('update:accent-color', p.value)"
              />
            </div>
          </div>

          <!-- Milieu : Raison sociale -->
          <div class="absolute left-1/2 hidden -translate-x-1/2 flex-col items-center md:flex">
            <h1 class="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
              ASSURANCE PLUS INTERNATIONAL
            </h1>
            <span class="text-xs text-slate-500 dark:text-slate-400">
              Gestion des contrats & sinistres
            </span>
          </div>

          <!-- Droite : Logo + Logout -->
          <div class="flex items-center gap-2">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white shadow-md"
              :style="{ backgroundColor: props.accentColor }"
            >
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <button
              class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              @click="emit('logout')"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span class="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </template>

      <!-- ==================== MENU GAUCHE ==================== -->
      <template #left>
        <nav class="flex h-full flex-col bg-neutral-50 dark:bg-neutral-900/50 border-r border-neutral-200 dark:border-neutral-800">
          <div class="px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Navigation
            </p>
          </div>
          <ul class="flex flex-1 flex-col gap-1 px-2">
            <li v-for="menu in ['accueil', 'acceptation', 'cession', 'sinistre', 'reglement', 'acteur', 'parametrage']" :key="menu">
              <button
                class="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all capitalize"
                :class="
                  activeMenu === menu
                    ? 'text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                "
                :style="activeMenu === menu ? { backgroundColor: props.accentColor } : {}"
                @click="selectMenu(menu)"
              >
                <span>{{ menu }}</span>
              </button>
            </li>
          </ul>
        </nav>
      </template>

      <!-- ==================== CONTENU PRINCIPAL ==================== -->
      <template #default>
        <div class="space-y-6 bg-white dark:bg-neutral-900 min-h-full p-4">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">
              {{ activeMenu }}
            </h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Module {{ activeMenu }} — En cours de développement
            </p>
          </div>
          
          <div class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
            <p class="text-slate-600 dark:text-slate-300">
              Contenu de la page <strong :style="{ color: props.accentColor }">{{ activeMenu }}</strong>
            </p>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Redimensionnez les zones en glissant les splitters (lignes horizontales et verticales colorées).
            </p>
          </div>
        </div>
      </template>

      <!-- ==================== INFOS DROITE ==================== -->
      <template #right>
        <div class="flex h-full flex-col p-3 bg-neutral-50 dark:bg-neutral-900/50 border-l border-neutral-200 dark:border-neutral-800">
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Informations
          </h3>
          <div class="space-y-2">
            <div
              v-for="info in quickInfos"
              :key="info.label"
              class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ info.label }}</p>
              <p class="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {{ info.value }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- ==================== FOOTER ==================== -->
      <template #footer>
        <div class="flex h-full items-center justify-between px-4 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <span>© 2026 Assurance Plus International — Tous droits réservés</span>
          <span class="hidden sm:inline">
            Connecté en tant que <strong class="text-slate-700 dark:text-slate-300">Admin Demo</strong>
          </span>
        </div>
      </template>
    </TLayout>
  </div>
</template>