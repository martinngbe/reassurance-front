<script setup lang="ts">
import { computed, ref } from 'vue'
import TLayout from '../layout/TLayout.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    accentColor?: string
    /** Permet à chaque module d'ajuster ses zones sans dupliquer le composant */
    topSize?: string
    bottomSize?: string
    leftSize?: string
    /** Zones à afficher ou non */
    showTop?: boolean
    showBottom?: boolean
    showLeft?: boolean
  }>(),
  {
    accentColor: '#4f46e5',
    topSize: '15%',
    bottomSize: '15%',
    leftSize: '20%',
    showTop: true,
    showBottom: true,
    showLeft: true,
  },
)

// Visibilité pilotée localement (les splitters/boutons de repli restent fonctionnels)
const topVisible = ref(true)
const bottomVisible = ref(true)
const leftVisible = ref(true)

// Tailles RELATIVES à la zone centrale d'EcranPrincipal (plus au viewport)
const headerConfig = computed(() =>
  props.showTop
    ? { size: props.topSize, minSize: '48px', collapsedSize: '28px', fixed: false }
    : false,
)

const footerConfig = computed(() =>
  props.showBottom
    ? { size: props.bottomSize, minSize: '48px', collapsedSize: '28px', fixed: false }
    : false,
)

const leftConfig = computed(() =>
  props.showLeft
    ? { size: props.leftSize, minSize: '96px', collapsedSize: '32px', fixed: false }
    : false,
)

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
}))
</script>

<template>
  <!-- h-full/w-full : ModuleLayout épouse exactement la zone centrale du parent -->
  <div :style="accentVars" class="h-full w-full">
    <TLayout
      :header="headerConfig"
      :footer="footerConfig"
      :left="leftConfig"
      :right="false"
      splitter-size="1px"
      :use-viewport-size="false"
      zone-padding="p-0"
      main-padding="p-0"
      main-overflow="hidden"
      v-model:header-visible="topVisible"
      v-model:footer-visible="bottomVisible"
      v-model:left-visible="leftVisible"
    >
      <!-- ==================== ZONE HAUTE ==================== -->
      <template #header>
        <div class="h-full flex items-center justify-between px-5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/30 dark:to-purple-500/30 border-b-2 border-indigo-400/50">
          <!--div class="min-w-0">
            <h2 class="truncate text-xl font-bold text-indigo-900 dark:text-indigo-100">
              <slot name="header-title">{{ title || 'Module' }}</slot>
            </h2>
            <p v-if="subtitle" class="truncate text-xs text-indigo-700/70 dark:text-indigo-300/70 mt-0.5">
              <slot name="header-subtitle">{{ subtitle }}</slot>
            </p>
          </div-->
          <slot name="header-actions" />
        </div>
      </template>

      <!-- ==================== ZONE GAUCHE ==================== -->
      <template #left>
        <div class="h-full overflow-auto p-3 bg-purple-100/40 dark:bg-purple-900/30 border-r-2 border-purple-400/50">
          <slot name="left">
            <!--div class="space-y-2">
              <h3 class="text-[10px] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-2">
                Navigation
              </h3>
              <div v-for="i in 5" :key="i"
                   class="rounded-lg border border-purple-300/50 dark:border-purple-700/50 bg-white/60 dark:bg-purple-800/40 p-2 hover:bg-purple-200/60 dark:hover:bg-purple-700/60 transition-colors cursor-pointer">
                <p class="text-xs font-medium text-purple-900 dark:text-purple-100">Option {{ i }}</p>
              </div>
            </div-->
          </slot>
        </div>
      </template>

      <!-- ==================== ZONE CENTRALE ==================== -->
      <template #default>
        <div class="h-full w-full overflow-auto p-4 bg-indigo-50/50 dark:bg-indigo-950/40">
          <!-- slot nommé "content" ET slot par défaut : le module dynamique peut utiliser l'un ou l'autre -->
          <slot name="content">
            <slot>
              <!--div class="rounded-xl border-2 border-dashed border-indigo-400/60 bg-white/70 dark:bg-indigo-900/40 p-4">
                <p class="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                  Zone centrale du module <strong>{{ title }}</strong>
                </p>
                <p class="mt-2 text-xs text-indigo-700/70 dark:text-indigo-300/70">
                  Redimensionnez les zones en glissant les splitters.
                </p>
              </div-->
            </slot>
          </slot>
        </div>
      </template>

      <!-- ==================== ZONE BASSE ==================== -->
      <template #footer>
        <div class="h-full overflow-auto p-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 dark:from-purple-500/30 dark:to-indigo-500/30 border-t-2 border-purple-400/50">
          <slot name="footer">
            <!--div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div v-for="i in 3" :key="i"
                   class="rounded-lg border border-purple-300/50 dark:border-purple-700/50 bg-white/60 dark:bg-purple-800/40 p-3">
                <p class="text-[10px] text-purple-700 dark:text-purple-300">Info {{ i }}</p>
                <p class="mt-1 text-xs font-semibold text-purple-900 dark:text-purple-100">Donnée {{ i }}</p>
              </div>
            </div-->
          </slot>
        </div>
      </template>
    </TLayout>
  </div>
</template>