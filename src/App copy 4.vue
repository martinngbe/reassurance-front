<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import TLayout from '@/components/layout/TLayout.vue'
//import AppHeader from './AppHeader.vue'
// import AppMenu from './AppMenu.vue'
import AppMenu from '@/components/web/AppMenu.vue'
import AppHeader from '@/components/web/AppHeader.vue'

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

// Configuration des zones - PROPORTIONS CORRIGÉES
// Option 1: Header 10%, Centre 50%, Footer 40%
const headerConfig = { size: '10%', minSize: '60px', collapsedSize: '0px', fixed: false }
const leftConfig = { size: '240px', minSize: '180px', collapsedSize: '40px', fixed: false }
const rightConfig = { size: '280px', minSize: '200px', collapsedSize: '40px', fixed: false }
const footerConfig = { size: '40%', minSize: '120px', collapsedSize: '0px', fixed: false }

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

function handleLogout() { emit('logout') }
function updateTeme(value: 'light' | 'dark') { emit('update:theme', value) }
function updateAccentColor(value: string) { emit('update:accent-color', value) }

const accentVars = computed(() => ({
  '--accent': props.accentColor,
  '--accent-hover': shift(props.accentColor, -18),
  '--accent-soft': shift(props.accentColor, 140),
  '--accent-ring': `${props.accentColor}33`,
}))

// Composants par rubrique (chargement dynamique)
const moduleComponents: Record<string, any> = {
  accueil: defineAsyncComponent(() => import('@/components/web/accueil/AppAcueil.vue')),
  acceptation: defineAsyncComponent(() => import('@/components/web/acceptation/Acceptation.vue')),
  cession: defineAsyncComponent(() => import('@/components/web/cession/Cession.vue')),
  sinistre: defineAsyncComponent(() => import('@/components/web/sinistre/Sinistre.vue')),
  reglement: defineAsyncComponent(() => import('@/components/web/reglement/Reglement.vue')),
  acteur: defineAsyncComponent(() => import('@/components/web/acteur/Acteur.vue')),
  parametrage: defineAsyncComponent(() => import('@/components/web/parametrage/Parametrage.vue')),
}

const currentModule = computed(() => moduleComponents[activeMenu.value] || moduleComponents.accueil)

// Informations rapides
const quickInfos = [
  { label: 'Utilisateur', value: 'Admin Demo' },
  { label: 'Rôle', value: 'Administrateur' },
  { label: 'Agence', value: 'Paris Centre' },
  { label: 'Session', value: 'Active' },
]

// Gestion sélection menu
function selectMenu(menuId: string) {
  console.log("EcranPrincipal selectMenu(" + menuId + ")")
  activeMenu.value = menuId
}
</script>

<template>
  <div :style="accentVars" class="h-screen w-screen overflow-hidden">
    <TLayout
      :header="headerConfig"
      :left="leftConfig"
      :right="rightConfig"
      :footer="footerConfig"
      splitter-size="2px"
      v-model:header-visible="headerVisible"
      v-model:left-visible="leftVisible"
      v-model:right-visible="rightVisible"
      v-model:footer-visible="footerVisible"
    >
      <!-- HEADER -->
      <template #header>
        <AppHeader
          :theme="props.theme"
          :palettes="props.palettes"
          :accent-color="props.accentColor"
          @logout="handleLogout"
          @update:theme="updateTeme"
          @update:accent-color="updateAccentColor"
        />
      </template>

      <!-- MENU GAUCHE -->
      <template #left>
        <nav class="flex h-full flex-col bg-neutral-50 dark:bg-neutral-900/50 border-r border-neutral-200 dark:border-neutral-800">
          <AppMenu
            :active-menu="activeMenu"
            :accent-color="props.accentColor"
            @select="selectMenu"
          />
        </nav>
      </template>

      <!-- CONTENU PRINCIPAL (module dynamique) -->
      <template #default>
        <div class="h-full w-full overflow-auto">
          <!--component :is="currentModule" :accent-color="props.accentColor" /-->
        </div>
      </template>

      <!-- INFOS DROITE -->
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

      <!-- FOOTER -->
      <template #footer>
        <div class="h-full flex flex-col">
          <div class="flex-1 p-4 overflow-auto">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Informations complémentaires
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div v-for="i in 3" :key="i" class="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                <p class="text-xs text-slate-500 dark:text-slate-400">Info {{ i }}</p>
                <p class="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Donnée {{ i }}</p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between px-4 py-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
            <span>© 2026 Assurance Plus International — Tous droits réservés</span>
            <span class="hidden sm:inline">
              Connecté en tant que <strong class="text-slate-700 dark:text-slate-300">Admin Demo</strong>
            </span>
          </div>
        </div>
      </template>
    </TLayout>
  </div>
</template>