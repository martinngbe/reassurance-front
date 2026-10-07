<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import TLayout from '@/components/layout/TLayout.vue'
import AppHeader from '@/components/web/AppHeader.vue'
import AppMenu from '@/components/web/AppMenu.vue'
import TLayoutModule from '../layout/TLayoutModule.vue';

const props = defineProps<{
  theme: 'light' | 'dark'
  accentColor: string
  palettes: { name: string; value: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:theme', value: 'light' | 'dark'): void
  (e: 'update:accent-color', value: string): void
  (e: 'logout'): void
}>()

const activeMenu = ref('accueil')
const headerVisible = ref(true)
const leftVisible = ref(true)
const rightVisible = ref(true)
const footerVisible = ref(true)

// Configuration EcranPrincipal (zones principales de l'écran)
const headerConfig = { size: '64px', minSize: '56px', collapsedSize: '36px', fixed: false }
const leftConfig = { size: '270px', minSize: '180px', collapsedSize: '40px', fixed: false }
const rightConfig = { size: '280px', minSize: '200px', collapsedSize: '40px', fixed: false }
const footerConfig = { size: '40px', minSize: '32px', collapsedSize: '0px', fixed: false }

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
function updateTheme(value: 'light' | 'dark') { emit('update:theme', value) }
function updateAccentColor(value: string) { emit('update:accent-color', value) }

const accentVars = computed(() => ({
  '--accent': props.accentColor,
  '--accent-hover': shift(props.accentColor, -18),
  '--accent-soft': shift(props.accentColor, 140),
  '--accent-ring': `${props.accentColor}33`,
}))

// Chargement dynamique des modules
const moduleComponents: Record<string, any> = {
  accueil: defineAsyncComponent(() => import('./accueil/AppAcueil.vue')),
  acceptation: defineAsyncComponent(() => import('./acceptation/Acceptation.vue')),
  cession: defineAsyncComponent(() => import('./cession/Cession.vue')),
  sinistre: defineAsyncComponent(() => import('./sinistre/Sinistre.vue')),
  reglement: defineAsyncComponent(() => import('./reglement/Reglement.vue')),
  acteur: defineAsyncComponent(() => import('@/components/web/assure/Assures.vue')),
  compte: defineAsyncComponent(() => import('./compte/Compte.vue')),
  comptabilisation: defineAsyncComponent(() => import('./comptabilisation/Comptabilisation.vue')),
  consultation: defineAsyncComponent(() => import('./consultation/Consultation.vue')),
  parametrage: defineAsyncComponent(() => import('./parametrage/Parametrage.vue')),
}

const currentModule = computed(() => moduleComponents[activeMenu.value] || moduleComponents.accueil)

const quickInfos = [
  { label: 'Utilisateur', value: 'Admin Demo' },
  { label: 'Rôle', value: 'Administrateur' },
  { label: 'Agence', value: 'Paris Centre' },
  { label: 'Session', value: 'Active' },
]

function selectMenu(menuId: string) {
  activeMenu.value = menuId
}
</script>

<template>
    <div :style="accentVars" class="h-screen w-screen  ">
      
          <!--TLayout
            :header="headerConfig"
            :left="leftConfig"
            :right="rightConfig"
            :footer="footerConfig"
            splitter-size="2px"
            main-padding="p-0"
            main-overflow="hidden"
            v-model:header-visible="headerVisible"
            v-model:left-visible="leftVisible"
            v-model:right-visible="rightVisible"
            v-model:footer-visible="footerVisible"
    -->
       <TLayoutModule
          topSize= '75px'
          leftSize= '250px'
          bottomSize= '50px'
          :top-fixe=true
        >
            <template #header>
                  <AppHeader  class="border-b-1 border-primary-200 "
                    :theme="props.theme"
                    :palettes="props.palettes"
                    :accent-color="props.accentColor"
                    @logout="handleLogout"
                    @update:theme="updateTheme"
                    @update:accent-color="updateAccentColor"
                  />
            </template>

            <template #left>
                <AppMenu
                      :active-menu="activeMenu"
                      :accent-color="props.accentColor"
                      @select="selectMenu"
                    />
            </template>

            <!-- CONTENU PRINCIPAL : ModuleLayout remplit exactement la zone centrale -->
            <template #default>        
              <keep-alive>
                  <component :is="currentModule" :accent-color="props.accentColor" />
              </keep-alive>
            </template>

            <template #right>
              <div class="flex h-full flex-col p-3 bg-neutral-50 dark:bg-neutral-900/50  dark:border-neutral-800">
                <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Informations
                </h3>
                <div class="space-y-2">
                  <div v-for="info in quickInfos" :key="info.label"
                      class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ info.label }}</p>
                    <p class="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">{{ info.value }}</p>
                  </div>
                </div>
              </div>
            </template>

            <template #footer>
              <div class="flex h-full items-center justify-between px-4 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
                <span>© 2026 A Free K Soft — Tous droits réservés</span>
                <span class="hidden sm:inline">
                  Connecté en tant que <strong class="text-slate-700 dark:text-slate-300">Admin Demo</strong>
                </span>
              </div>
            </template>
    </TLayoutModule>        
          <!--/TLayout-->
    </div>
</template>