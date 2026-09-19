<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import type { ZoneConfig } from '../forms/common'

// ==================== PROPS ====================
const props = withDefaults(
  defineProps<{
    header?: ZoneConfig | boolean
    left?: ZoneConfig | boolean
    right?: ZoneConfig | boolean
    footer?: ZoneConfig | boolean
    splitterSize?: string
    headerVisible?: boolean
    leftVisible?: boolean
    rightVisible?: boolean
    footerVisible?: boolean
    /** true  -> layout racine : fixed inset-0, 100vh/100vw
     *  false -> layout imbriqué : relative, 100%/100% du conteneur parent */
    useViewportSize?: boolean
    /** padding interne de la zone centrale (mettre 'p-0' pour imbriquer un sous-layout) */
    mainPadding?: string
    /** padding interne des zones header/left/right/footer */
    zonePadding?: string
    /** overflow de la zone centrale */
    mainOverflow?: 'auto' | 'hidden'
  }>(),
  {
    header: false,
    left: false,
    right: false,
    footer: false,
    splitterSize: '6px',
    headerVisible: undefined,
    leftVisible: undefined,
    rightVisible: undefined,
    footerVisible: undefined,
    useViewportSize: true,
    mainPadding: 'p-4',
    zonePadding: 'p-3',
    mainOverflow: 'auto',
  },
)

const emit = defineEmits<{
  (e: 'update:headerVisible', value: boolean): void
  (e: 'update:leftVisible', value: boolean): void
  (e: 'update:rightVisible', value: boolean): void
  (e: 'update:footerVisible', value: boolean): void
}>()

// ==================== REF RACINE (mesure du conteneur réel) ====================
const rootEl = ref<HTMLElement | null>(null)

// ==================== NORMALISATION ====================
const DEFAULTS = {
  header: { size: '5%', minSize: '40px', collapsedSize: '36px' },
  left:   { size: '20%', minSize: '160px', collapsedSize: '40px' },
  right:  { size: '20%', minSize: '160px', collapsedSize: '40px' },
  footer: { size: '5%', minSize: '40px', collapsedSize: '36px' },
} as const

interface ResolvedZone {
  enabled: boolean
  visible: boolean
  size: string
  minSize: string
  fixed: boolean
  collapsedSize: string
}

/** Visibilité interne : utilisée quand le parent ne fournit pas de v-model.
 *  Permet aux boutons de repli de fonctionner même en usage "non contrôlé". */
const localVisible = ref<Record<'header' | 'left' | 'right' | 'footer', boolean | undefined>>({
  header: undefined,
  left: undefined,
  right: undefined,
  footer: undefined,
})

function resolve(
  config: ZoneConfig | boolean | undefined,
  defaults: { size: string; minSize: string; collapsedSize: string },
  visibleOverride: boolean | undefined,
): ResolvedZone {
  if (config === undefined || config === false) {
    return { enabled: false, visible: false, fixed: false, ...defaults }
  }
  if (config === true) {
    return {
      enabled: true,
      visible: visibleOverride ?? true,
      fixed: false,
      ...defaults,
    }
  }
  return {
    enabled: true,
    visible: visibleOverride ?? config.visible ?? true,
    size: config.size ?? defaults.size,
    minSize: config.minSize ?? defaults.minSize,
    fixed: config.fixed ?? false,
    collapsedSize: config.collapsedSize ?? defaults.collapsedSize,
  }
}

const zones = computed(() => ({
  header: resolve(props.header, DEFAULTS.header, props.headerVisible ?? localVisible.value.header),
  left: resolve(props.left, DEFAULTS.left, props.leftVisible ?? localVisible.value.left),
  right: resolve(props.right, DEFAULTS.right, props.rightVisible ?? localVisible.value.right),
  footer: resolve(props.footer, DEFAULTS.footer, props.footerVisible ?? localVisible.value.footer),
}))

// ==================== SPLITTER DRAG ====================
type SplitterDir = 'top' | 'bottom' | 'left' | 'right'

const activeSplitter = ref<SplitterDir | null>(null)
const startPos = ref(0)
const startSizePx = ref(0)

const currentSizes = ref({
  header: '',
  left: '',
  right: '',
  footer: '',
})

/** Taille du conteneur de référence : le viewport en mode racine,
 *  la boîte réellement occupée par le layout en mode imbriqué. */
function containerSize(axis: 'x' | 'y'): number {
  if (!props.useViewportSize && rootEl.value) {
    return axis === 'y' ? rootEl.value.clientHeight : rootEl.value.clientWidth
  }
  return axis === 'y' ? window.innerHeight : window.innerWidth
}

function toPx(value: string, axis: 'x' | 'y'): number {
  if (value.endsWith('%')) {
    return (parseFloat(value) / 100) * containerSize(axis)
  }
  return parseFloat(value) || 0
}

function startDrag(e: MouseEvent, dir: SplitterDir) {
  e.preventDefault()
  activeSplitter.value = dir
  document.body.style.cursor = dir === 'left' || dir === 'right' ? 'col-resize' : 'row-resize'
  document.body.style.userSelect = 'none'

  const axis = dir === 'left' || dir === 'right' ? 'x' : 'y'
  const zoneKey = dir === 'top' ? 'header' : dir === 'bottom' ? 'footer' : dir
  const z = zones.value[zoneKey]

  startPos.value = axis === 'x' ? e.clientX : e.clientY
  startSizePx.value = currentSizes.value[zoneKey]
    ? toPx(currentSizes.value[zoneKey], axis)
    : toPx(z.size, axis)

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!activeSplitter.value) return
  const dir = activeSplitter.value
  const axis = dir === 'left' || dir === 'right' ? 'x' : 'y'
  const zoneKey = dir === 'top' ? 'header' : dir === 'bottom' ? 'footer' : dir
  const z = zones.value[zoneKey]

  const minPx = toPx(z.minSize, axis)
  // borne haute : on ne laisse jamais la zone manger tout le conteneur
  const maxPx = Math.max(minPx, containerSize(axis) - 80)

  let delta: number
  if (dir === 'left' || dir === 'top') {
    delta = (axis === 'x' ? e.clientX : e.clientY) - startPos.value
  } else {
    delta = startPos.value - (axis === 'x' ? e.clientX : e.clientY)
  }

  const newPx = Math.min(maxPx, Math.max(minPx, startSizePx.value + delta))
  currentSizes.value[zoneKey] = `${newPx}px`
}

function stopDrag() {
  activeSplitter.value = null
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})

// ==================== TOGGLES ====================
function toggle(dir: SplitterDir) {
  const zoneKey = dir === 'top' ? 'header' : dir === 'bottom' ? 'footer' : dir
  const z = zones.value[zoneKey]
  const eventMap = {
    header: 'update:headerVisible',
    left: 'update:leftVisible',
    right: 'update:rightVisible',
    footer: 'update:footerVisible',
  } as const
  localVisible.value[zoneKey] = !z.visible
  emit(eventMap[zoneKey], !z.visible)
}

// ==================== GRID DYNAMIQUE ====================
const gridStyle = computed(() => {
  const s = props.splitterSize
  const z = zones.value

  function rowSize(zone: ResolvedZone, key: 'header' | 'footer'): string {
    if (!zone.enabled) return '0px'
    if (!zone.visible) return zone.collapsedSize
    return currentSizes.value[key] || zone.size
  }

  function colSize(zone: ResolvedZone, key: 'left' | 'right'): string {
    if (!zone.enabled) return '0px'
    if (!zone.visible) return zone.collapsedSize
    return currentSizes.value[key] || zone.size
  }

  function splitterH(zone: ResolvedZone): string {
    return zone.enabled && zone.visible && !zone.fixed ? s : '0px'
  }

  function splitterV(zone: ResolvedZone): string {
    return zone.enabled && zone.visible && !zone.fixed ? s : '0px'
  }

  return {
    display: 'grid',
    gridTemplateRows: `${rowSize(z.header, 'header')} ${splitterH(z.header)} minmax(0, 1fr) ${splitterH(z.footer)} ${rowSize(z.footer, 'footer')}`,
    gridTemplateColumns: `${colSize(z.left, 'left')} ${splitterV(z.left)} minmax(0, 1fr) ${splitterV(z.right)} ${colSize(z.right, 'right')}`,
    height: props.useViewportSize ? '100vh' : '100%',
    width: props.useViewportSize ? '100vw' : '100%',
    transition: 'grid-template-columns 0.3s cubic-bezier(0.4,0,0.2,1), grid-template-rows 0.3s cubic-bezier(0.4,0,0.2,1)',
  }
})

const rootClass = computed(() =>
  props.useViewportSize ? 'fixed inset-0 overflow-hidden' : 'relative h-full w-full overflow-hidden',
)
</script>

<template>
  <div ref="rootEl" :class="rootClass" :style="gridStyle">
    <!-- ================= HEADER ================= -->
    <header
      v-if="zones.header.enabled"
      class="relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm"
      :class="{ 'opacity-50': !zones.header.visible }"
      style="grid-row: 1; grid-column: 1 / -1"
    >
      <button
        class="absolute z-20 flex items-center justify-center w-6 h-6 rounded-full bg-neutral-500 text-white shadow-md transition-all duration-200 cursor-pointer border-0 hover:bg-neutral-600 hover:scale-110 active:scale-90 bottom-1.5 right-3"
        :class="{
          '!bottom-0 !right-1/2 !translate-x-1/2 w-12 h-6 rounded-b-lg shadow-lg hover:!scale-105': !zones.header.visible
        }"
        :title="zones.header.visible ? 'Masquer' : 'Afficher'"
        @click="toggle('top')"
      >
        <svg
          class="h-3.5 w-3.5 transition-transform duration-300"
          :class="{ 'rotate-180': !zones.header.visible }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
      <div
        class="h-full overflow-auto transition-opacity duration-200"
        :class="[zonePadding, zones.header.visible ? 'opacity-100' : 'opacity-0 pointer-events-none !p-0']"
      >
        <slot name="header" />
      </div>
    </header>

    <!-- SPLITTER HAUT -->
    <div
      v-if="zones.header.enabled && zones.header.visible && !zones.header.fixed"
      class="relative z-10 bg-primary-200/50 transition-colors duration-150 cursor-row-resize hover:bg-primary-500 group"
      :class="{ '!bg-primary-500': activeSplitter === 'top' }"
      style="grid-row: 2; grid-column: 1 / -1"
      @mousedown="startDrag($event, 'top')"
    >
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-primary-600/60 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>

    <!-- ================= LEFT ================= -->
    <aside
      v-if="zones.left.enabled"
      class="relative overflow-hidden bg-neutral-50 dark:bg-neutral-900/50 border-r border-neutral-200 dark:border-neutral-800"
      :class="{ 'opacity-50': !zones.left.visible }"
      style="grid-row: 3; grid-column: 1"
    >
      <button
        class="absolute z-20 flex items-center justify-center w-6 h-6 rounded-full bg-neutral-500 text-white shadow-md transition-all duration-200 cursor-pointer border-0 hover:bg-neutral-600 hover:scale-110 active:scale-90 top-2 right-2"
        :class="{
          '!top-1/2 !-translate-y-1/2 !right-0 w-7 h-12 rounded-r-lg rounded-l-none shadow-lg hover:!scale-105': !zones.left.visible
        }"
        :title="zones.left.visible ? 'Masquer' : 'Afficher'"
        @click="toggle('left')"
      >
        <svg
          class="h-3.5 w-3.5 transition-transform duration-300"
          :class="{ 'rotate-180': !zones.left.visible }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div
        class="h-full overflow-auto transition-opacity duration-200"
        :class="[zonePadding, zones.left.visible ? 'opacity-100' : 'opacity-0 pointer-events-none !p-0']"
      >
        <slot name="left" />
      </div>
    </aside>

    <!-- SPLITTER GAUCHE -->
    <div
      v-if="zones.left.enabled && zones.left.visible && !zones.left.fixed"
      class="relative z-10  bg-neutral-50 transition-colors duration-150 cursor-col-resize hover:bg-primary-500 group"
      :class="{ '!bg-primary-500': activeSplitter === 'left' }"
      style="grid-row: 3; grid-column: 2"
      @mousedown="startDrag($event, 'left')"
    >
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-600/60 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>

    <!-- ================= MAIN ================= -->
    <main
      class="relative min-h-0 min-w-0  bg-neutral-50 dark:bg-neutral-900"
      :class="[mainPadding, mainOverflow === 'auto' ? 'overflow-auto' : 'overflow-hidden']"
      style="grid-row: 3; grid-column: 3"
    >
      <slot />
    </main>

    <!-- SPLITTER DROIT -->
    <div
      v-if="zones.right.enabled && zones.right.visible && !zones.right.fixed"
      class="relative z-10 bg-primary-200/50 transition-colors duration-150 cursor-col-resize hover:bg-primary-500 group"
      :class="{ '!bg-primary-500': activeSplitter === 'right' }"
      style="grid-row: 3; grid-column: 4"
      @mousedown="startDrag($event, 'right')"
    >
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-600/60 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>

    <!-- ================= RIGHT ================= -->
    <aside
      v-if="zones.right.enabled"
      class="relative overflow-hidden bg-neutral-50 dark:bg-neutral-900/50 border-l border-neutral-200 dark:border-neutral-800"
      :class="{ 'opacity-50': !zones.right.visible }"
      style="grid-row: 3; grid-column: 5"
    >
      <button
        class="absolute z-20 flex items-center justify-center w-6 h-6 rounded-full bg-neutral-500 text-white shadow-md transition-all duration-200 cursor-pointer border-0 hover:bg-neutral-600 hover:scale-110 active:scale-90 top-2 left-2"
        :class="{
          '!top-1/2 !-translate-y-1/2 !left-0 w-7 h-12 rounded-l-lg rounded-r-none shadow-lg hover:!scale-105': !zones.right.visible
        }"
        :title="zones.right.visible ? 'Masquer' : 'Afficher'"
        @click="toggle('right')"
      >
        <svg
          class="h-3.5 w-3.5 transition-transform duration-300"
          :class="{ 'rotate-180': !zones.right.visible }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <div
        class="h-full overflow-auto transition-opacity duration-200"
        :class="[zonePadding, zones.right.visible ? 'opacity-100' : 'opacity-0 pointer-events-none !p-0']"
      >
        <slot name="right" />
      </div>
    </aside>

    <!-- SPLITTER BAS -->
    <div
      v-if="zones.footer.enabled && zones.footer.visible && !zones.footer.fixed"
      class="relative z-10  bg-primary-200/50 transition-colors duration-150 cursor-row-resize hover:bg-primary-500 group"
      :class="{ '!bg-primary-500': activeSplitter === 'bottom' }"
      style="grid-row: 4; grid-column: 1 / -1"
      @mousedown="startDrag($event, 'bottom')"
    >
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-primary-600/60 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>

    <!-- ================= FOOTER ================= -->
    <footer
      v-if="zones.footer.enabled"
      class="relative overflow-hidden  bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shadow-sm"
      :class="{ 'opacity-50': !zones.footer.visible }"
      style="grid-row: 5; grid-column: 1 / -1"
    >
      <button
        class="absolute z-20 flex items-center justify-center w-6 h-6 rounded-full bg-neutral-500 text-white shadow-md transition-all duration-200 cursor-pointer border-0 hover:bg-neutral-600 hover:scale-110 active:scale-90 top-1.5 right-3"
        :class="{
          '!top-0 !right-1/2 !translate-x-1/2 w-12 h-6 rounded-t-lg shadow-lg hover:!scale-105': !zones.footer.visible
        }"
        :title="zones.footer.visible ? 'Masquer' : 'Afficher'"
        @click="toggle('bottom')"
      >
        <svg
          class="h-3.5 w-3.5 transition-transform duration-300"
          :class="{ 'rotate-180': !zones.footer.visible }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        class="h-full overflow-auto transition-opacity duration-200"
        :class="[zonePadding, zones.footer.visible ? 'opacity-100' : 'opacity-0 pointer-events-none !p-0']"
      >
        <slot name="footer" />
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Scrollbar personnalisée (Tailwind ne gère pas nativement les scrollbars) */
.overflow-auto {
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--tw-primary-500, 99 102 241)) transparent;
}

.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background-color: rgb(var(--tw-primary-500, 99 102 241));
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--tw-primary-700, 67 56 202));
}
</style>