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
console.log("TLayoutModule props:",props)
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
            <slot name="header"></slot>       
      </template>

      <!-- ==================== ZONE GAUCHE ==================== -->
      <template #left>
        <slot name="left"></slot>          
      </template>

      <!-- ==================== ZONE CENTRALE ==================== -->
      <template #default>
        <slot name="default"></slot>
      </template>

      <!-- ==================== ZONE BASSE ==================== -->
      <template #footer>
        <slot name="footer"></slot>       
      </template>
    </TLayout>
  </div>
</template>