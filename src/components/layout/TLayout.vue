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
  },
)

const emit = defineEmits<{
  (e: 'update:headerVisible', value: boolean): void
  (e: 'update:leftVisible', value: boolean): void
  (e: 'update:rightVisible', value: boolean): void
  (e: 'update:footerVisible', value: boolean): void
}>()

// ==================== NORMALISATION ====================
const DEFAULTS = {
  header: { size: '5%', minSize: '40px', collapsedSize: '36px' },
  left: { size: '20%', minSize: '160px', collapsedSize: '40px' },
  right: { size: '20%', minSize: '160px', collapsedSize: '40px' },
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
  header: resolve(props.header, DEFAULTS.header, props.headerVisible),
  left: resolve(props.left, DEFAULTS.left, props.leftVisible),
  right: resolve(props.right, DEFAULTS.right, props.rightVisible),
  footer: resolve(props.footer, DEFAULTS.footer, props.footerVisible),
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

function toPx(value: string, axis: 'x' | 'y'): number {
  if (value.endsWith('%')) {
    const container = axis === 'y' ? window.innerHeight : window.innerWidth
    return (parseFloat(value) / 100) * container
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

  let delta: number
  if (dir === 'left' || dir === 'top') {
    delta = (axis === 'x' ? e.clientX : e.clientY) - startPos.value
  } else {
    delta = startPos.value - (axis === 'x' ? e.clientX : e.clientY)
  }

  const newPx = Math.max(minPx, startSizePx.value + delta)
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
    gridTemplateRows: `${rowSize(z.header, 'header')} ${splitterH(z.header)} 1fr ${splitterH(z.footer)} ${rowSize(z.footer, 'footer')}`,
    gridTemplateColumns: `${colSize(z.left, 'left')} ${splitterV(z.left)} 1fr ${splitterV(z.right)} ${colSize(z.right, 'right')}`,
    height: '100vh',
    width: '100vw',
    transition:
      'grid-template-columns 0.3s cubic-bezier(0.4,0,0.2,1), grid-template-rows 0.3s cubic-bezier(0.4,0,0.2,1)',
  }
})
</script>

<template>
  <div class="tlayout fixed inset-0 overflow-hidden" :style="gridStyle">
    <!-- ================= HEADER ================= -->
    <header
      v-if="zones.header.enabled"
      class="tlayout__zone relative overflow-hidden bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm"
      :class="{ 'tlayout__zone--collapsed': !zones.header.visible }"
      style="grid-row: 1; grid-column: 1 / -1"
    >
      <button
        class="tlayout__toggle absolute z-20 flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-primary-contrast shadow-md transition-all duration-200 cursor-pointer border-0 hover:bg-primary-600 hover:scale-110 active:scale-90 bottom-1.5 right-3"
        :class="{
          '!bottom-0 !right-1/2 !translate-x-1/2 w-12 h-6 rounded-b-lg shadow-[0_2px_8px_rgb(0_0_0/0.1)] hover:!scale-105': !zones.header.visible
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
        class="h-full overflow-auto p-3 transition-opacity duration-200 custom-scrollbar"
        :class="zones.header.visible ? 'opacity-100' : 'opacity-0 pointer-events-none p-0'"
      >
        <slot name="header" />
      </div>
    </header>

    <!-- SPLITTER HAUT -->
    <div
      v-if="zones.header.enabled && zones.header.visible && !zones.header.fixed"
      class="splitter splitter-h relative z-10 bg-primary-200/50 transition-colors duration-150 cursor-row-resize hover:bg-primary-500"
      :class="{ '!bg-primary-500': activeSplitter === 'top' }"
      style="grid-row: 2; grid-column: 1 / -1"
      @mousedown="startDrag($event, 'top')"
    />

    <!-- ================= LEFT ================= -->
    <aside
      v-if="zones.left.enabled"
      class="tlayout__zone relative overflow-hidden bg-neutral-50 dark:bg-neutral-900/50 border-r border-neutral-200 dark:border-neutral-800"
      :class="{ 'tlayout__zone--collapsed': !zones.left.visible }"
      style="grid-row: 3; grid-column: 1"
    >
      <button
        class="tlayout__toggle absolute z-20 flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-primary-contrast shadow-md transition-all duration-200 cursor-pointer border-0 hover:bg-primary-600 hover:scale-110 active:scale-90 top-2 right-2"
        :class="{
          '!top-1/2 !-translate-y-1/2 !right-0 w-7 h-12 rounded-r-lg rounded-l-none shadow-[2px_0_8px_rgb(0_0_0/0.1)] hover:!scale-105': !zones.left.visible
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
        class="h-full overflow-auto p-3 transition-opacity duration-200 custom-scrollbar"
        :class="zones.left.visible ? 'opacity-100' : 'opacity-0 pointer-events-none p-0'"
      >
        <slot name="left" />
      </div>
    </aside>

    <!-- SPLITTER GAUCHE -->
    <div
      v-if="zones.left.enabled && zones.left.visible && !zones.left.fixed"
      class="splitter splitter-v relative z-10 bg-primary-200/50 transition-colors duration-150 cursor-col-resize hover:bg-primary-500"
      :class="{ '!bg-primary-500': activeSplitter === 'left' }"
      style="grid-row: 3; grid-column: 2"
      @mousedown="startDrag($event, 'left')"
    />

    <!-- ================= MAIN ================= -->
    <main
      class="overflow-auto bg-white dark:bg-neutral-900 p-4 custom-scrollbar"
      style="grid-row: 3; grid-column: 3"
    >
      <slot />
    </main>

    <!-- SPLITTER DROIT -->
    <div
      v-if="zones.right.enabled && zones.right.visible && !zones.right.fixed"
      class="splitter splitter-v relative z-10 bg-primary-200/50 transition-colors duration-150 cursor-col-resize hover:bg-primary-500"
      :class="{ '!bg-primary-500': activeSplitter === 'right' }"
      style="grid-row: 3; grid-column: 4"
      @mousedown="startDrag($event, 'right')"
    />

    <!-- ================= RIGHT ================= -->
    <aside
      v-if="zones.right.enabled"
      class="tlayout__zone relative overflow-hidden bg-neutral-50 dark:bg-neutral-900/50 border-l border-neutral-200 dark:border-neutral-800"
      :class="{ 'tlayout__zone--collapsed': !zones.right.visible }"
      style="grid-row: 3; grid-column: 5"
    >
      <button
        class="tlayout__toggle absolute z-20 flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-primary-contrast shadow-md transition-all duration-200 cursor-pointer border-0 hover:bg-primary-600 hover:scale-110 active:scale-90 top-2 left-2"
        :class="{
          '!top-1/2 !-translate-y-1/2 !left-0 w-7 h-12 rounded-l-lg rounded-r-none shadow-[-2px_0_8px_rgb(0_0_0/0.1)] hover:!scale-105': !zones.right.visible
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
        class="h-full overflow-auto p-3 transition-opacity duration-200 custom-scrollbar"
        :class="zones.right.visible ? 'opacity-100' : 'opacity-0 pointer-events-none p-0'"
      >
        <slot name="right" />
      </div>
    </aside>

    <!-- SPLITTER BAS -->
    <div
      v-if="zones.footer.enabled && zones.footer.visible && !zones.footer.fixed"
      class="splitter splitter-h relative z-10 bg-primary-200/50 transition-colors duration-150 cursor-row-resize hover:bg-primary-500"
      :class="{ '!bg-primary-500': activeSplitter === 'bottom' }"
      style="grid-row: 4; grid-column: 1 / -1"
      @mousedown="startDrag($event, 'bottom')"
    />

    <!-- ================= FOOTER ================= -->
    <footer
      v-if="zones.footer.enabled"
      class="tlayout__zone relative overflow-hidden bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm"
      :class="{ 'tlayout__zone--collapsed': !zones.footer.visible }"
      style="grid-row: 5; grid-column: 1 / -1"
    >
      <button
        class="tlayout__toggle absolute z-20 flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-primary-contrast shadow-md transition-all duration-200 cursor-pointer border-0 hover:bg-primary-600 hover:scale-110 active:scale-90 top-1.5 right-3"
        :class="{
          '!top-0 !right-1/2 !translate-x-1/2 w-12 h-6 rounded-t-lg shadow-[0_-2px_8px_rgb(0_0_0/0.1)] hover:!scale-105': !zones.footer.visible
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
        class="h-full overflow-auto p-3 transition-opacity duration-200 custom-scrollbar"
        :class="zones.footer.visible ? 'opacity-100' : 'opacity-0 pointer-events-none p-0'"
      >
        <slot name="footer" />
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ============ SPLITTERS (pseudo-éléments non gérés par Tailwind) ============ */
.splitter::after {
  content: '';
  position: absolute;
  background-color: rgb(var(--tw-primary-600, 79 70 229) / 0.6);
  border-radius: 2px;
  transition: opacity 0.15s ease;
  opacity: 0;
}

.splitter:hover::after,
.splitter.splitter--active::after {
  opacity: 1;
}

.splitter-v::after {
  top: 50%;
  left: 50%;
  width: 2px;
  height: 24px;
  transform: translate(-50%, -50%);
}

.splitter-h::after {
  top: 50%;
  left: 50%;
  height: 2px;
  width: 24px;
  transform: translate(-50%, -50%);
}

/* ============ SCROLLBAR (non géré par Tailwind) ============ */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--tw-primary-500, 99 102 241)) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--tw-primary-500, 99 102 241));
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
  transition: background-color 0.2s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--tw-primary-700, 67 56 202));
}

.custom-scrollbar::-webkit-scrollbar-corner {
  background: transparent;
}
</style>