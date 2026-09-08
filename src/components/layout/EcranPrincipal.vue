<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    headerHeight?: string
    footerHeight?: string
    leftWidth?: string
    rightWidth?: string
    splitterSize?: string
    minHeader?: string
    minFooter?: string
    minLeft?: string
    minRight?: string
    /** Largeur des zones quand elles sont masquées (≈ largeur de l'icône) */
    collapsedWidth?: string
    leftVisible?: boolean
    rightVisible?: boolean
  }>(),
  {
    headerHeight: '5%',
    footerHeight: '5%',
    leftWidth: '20%',
    rightWidth: '20%',
    splitterSize: '1px',
    minHeader: '40px',
    minFooter: '40px',
    minLeft: '160px',
    minRight: '160px',
    collapsedWidth: '40px',
    leftVisible: true,
    rightVisible: true,
  },
)

const emit = defineEmits<{
  (e: 'update:leftVisible', value: boolean): void
  (e: 'update:rightVisible', value: boolean): void
}>()

// ==================== ÉTAT DES TAILLES ====================
const currentHeader = ref(props.headerHeight)
const currentFooter = ref(props.footerHeight)
const currentLeft = ref(props.leftWidth)
const currentRight = ref(props.rightWidth)

// ==================== LOGIQUE SPLITTER ====================
type SplitterDir = 'top' | 'bottom' | 'left' | 'right'

const activeSplitter = ref<SplitterDir | null>(null)
const startPos = ref(0)
const startSize = ref(0)

function toPx(value: string): number {
  if (value.endsWith('%')) {
    const container =
      value.includes('header') || value.includes('footer') ? window.innerHeight : window.innerWidth
    return (parseFloat(value) / 100) * container
  }
  return parseFloat(value) || 0
}

function startDrag(e: MouseEvent, dir: SplitterDir) {
  e.preventDefault()
  activeSplitter.value = dir
  document.body.style.cursor = dir === 'left' || dir === 'right' ? 'col-resize' : 'row-resize'
  document.body.style.userSelect = 'none'

  if (dir === 'left' || dir === 'right') {
    startPos.value = e.clientX
    startSize.value = toPx(dir === 'left' ? currentLeft.value : currentRight.value)
  } else {
    startPos.value = e.clientY
    startSize.value = toPx(dir === 'top' ? currentHeader.value : currentFooter.value)
  }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!activeSplitter.value) return
  const dir = activeSplitter.value

  if (dir === 'left') {
    const delta = e.clientX - startPos.value
    const newPx = Math.max(toPx(props.minLeft), startSize.value + delta)
    const maxPx =
      window.innerWidth - toPx(props.minRight) - toPx(props.splitterSize) * 2 - toPx(props.minLeft)
    currentLeft.value = `${Math.min(newPx, maxPx)}px`
  } else if (dir === 'right') {
    const delta = startPos.value - e.clientX
    const newPx = Math.max(toPx(props.minRight), startSize.value + delta)
    currentRight.value = `${newPx}px`
  } else if (dir === 'top') {
    const delta = e.clientY - startPos.value
    const newPx = Math.max(toPx(props.minHeader), startSize.value + delta)
    currentHeader.value = `${newPx}px`
  } else if (dir === 'bottom') {
    const delta = startPos.value - e.clientY
    const newPx = Math.max(toPx(props.minFooter), startSize.value + delta)
    currentFooter.value = `${newPx}px`
  }
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

// ==================== TOGGLES ZONES LATÉRALES ====================
function toggleLeft() {
  emit('update:leftVisible', !props.leftVisible)
}
function toggleRight() {
  emit('update:rightVisible', !props.rightVisible)
}

// ==================== STYLE DYNAMIQUE ====================
const gridStyle = computed(() => {
  const splitter = props.splitterSize
  const collapsed = props.collapsedWidth

  // ✨ Si masquée → largeur réduite à collapsedWidth (au lieu de 0)
  const leftCol = props.leftVisible ? currentLeft.value : collapsed
  const rightCol = props.rightVisible ? currentRight.value : collapsed
  const leftSplitter = props.leftVisible ? splitter : '0px'
  const rightSplitter = props.rightVisible ? splitter : '0px'

  return {
    display: 'grid',
    gridTemplateRows: `${currentHeader.value} ${splitter} 1fr ${splitter} ${currentFooter.value}`,
    gridTemplateColumns: `${leftCol} ${leftSplitter} 1fr ${rightSplitter} ${rightCol}`,
    height: '100vh',
    width: '100vw',
    transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }
})
</script>

<template>
  <div class="ecran-principal" :style="gridStyle">
    <!-- ============ HEADER ============ -->
    <header
      class="ecran-header flex items-center border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900"
      style="grid-row: 1; grid-column: 1 / -1"
    >
      <slot name="header" />
    </header>

    <!-- ============ SPLITTER HAUT ============ -->
    <div
      class="splitter splitter-h"
      :class="{ 'splitter--active': activeSplitter === 'top' }"
      style="grid-row: 2; grid-column: 1 / -1"
      @mousedown="startDrag($event, 'top')"
    />

    <!-- ============ LEFT (zone + toggle intégré) ============ -->
    <aside
      class="ecran-left relative overflow-hidden border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50"
      :class="leftVisible ? 'p-3' : 'p-0'"
      style="grid-row: 3; grid-column: 1"
    >
      <!-- Bouton toggle en HAUT de la zone -->
      <button
        type="button"
        :title="leftVisible ? 'Masquer le menu' : 'Afficher le menu'"
        class="toggle-tab toggle-tab-left"
        :class="{ 'toggle-tab--collapsed': !leftVisible }"
        @click="toggleLeft"
      >
        <svg
          class="toggle-tab__icon h-4 w-4 transition-transform duration-300"
          :class="{ 'rotate-180': !leftVisible }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <!-- Contenu (masqué avec opacity quand collapsed) -->
      <div
        class="custom-scrollbar h-full overflow-auto transition-opacity duration-200"
        :class="leftVisible ? 'opacity-100' : 'pointer-events-none opacity-0'"
      >
        <slot name="left" />
      </div>
    </aside>

    <!-- ============ SPLITTER GAUCHE ============ -->
    <div
      v-if="leftVisible"
      class="splitter splitter-v"
      :class="{ 'splitter--active': activeSplitter === 'left' }"
      style="grid-row: 3; grid-column: 2"
      @mousedown="startDrag($event, 'left')"
    />

    <!-- ============ MAIN ============ -->
    <!-- ============ MAIN ============ -->
    <main
      class="ecran-main custom-scrollbar overflow-auto bg-white p-4 dark:bg-neutral-900"
      style="grid-row: 3; grid-column: 3"
    >
      <slot />
    </main>

    <!-- ============ SPLITTER DROIT ============ -->
    <div
      v-if="rightVisible"
      class="splitter splitter-v"
      :class="{ 'splitter--active': activeSplitter === 'right' }"
      style="grid-row: 3; grid-column: 4"
      @mousedown="startDrag($event, 'right')"
    />

    <!-- ============ RIGHT (zone + toggle intégré) ============ -->
    <aside
      class="ecran-right relative overflow-hidden border-l border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50"
      :class="rightVisible ? 'p-3' : 'p-0'"
      style="grid-row: 3; grid-column: 5"
    >
      <!-- Bouton toggle en HAUT de la zone -->
      <button
        type="button"
        :title="rightVisible ? 'Masquer la pub' : 'Afficher la pub'"
        class="toggle-tab toggle-tab-right"
        :class="{ 'toggle-tab--collapsed': !rightVisible }"
        @click="toggleRight"
      >
        <svg
          class="toggle-tab__icon h-4 w-4 transition-transform duration-300"
          :class="{ 'rotate-180': !rightVisible }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <!-- Contenu -->
      <div
        class="custom-scrollbar h-full overflow-auto transition-opacity duration-200"
        :class="rightVisible ? 'opacity-100' : 'pointer-events-none opacity-0'"
      >
        <slot name="right" />
      </div>
    </aside>

    <!-- ============ SPLITTER BAS ============ -->
    <div
      class="splitter splitter-h"
      :class="{ 'splitter--active': activeSplitter === 'bottom' }"
      style="grid-row: 4; grid-column: 1 / -1"
      @mousedown="startDrag($event, 'bottom')"
    />

    <!-- ============ FOOTER ============ -->
    <footer
      class="ecran-footer flex items-center border-t border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900"
      style="grid-row: 5; grid-column: 1 / -1"
    >
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.ecran-principal {
  position: fixed;
  inset: 0;
  overflow: hidden;
}

/* ============ SPLITTERS ============ */
.splitter {
  position: relative;
  background-color: rgb(var(--tw-primary-200, 199 210 254) / 0.5);
  transition: background-color 0.15s ease;
  z-index: 10;
}

.splitter:hover,
.splitter--active {
  background-color: rgb(var(--tw-primary-500));
}

.splitter-v {
  cursor: col-resize;
}

.splitter-h {
  cursor: row-resize;
}

.splitter::after {
  content: '';
  position: absolute;
  background-color: rgb(var(--tw-primary-600) / 0.6);
  border-radius: 2px;
  transition: opacity 0.15s ease;
  opacity: 0;
}

.splitter:hover::after,
.splitter--active::after {
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

/* ============ ZONES ============ */
.ecran-header,
.ecran-footer {
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
}

.ecran-main {
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.03);
}

/* ==========================================
   ✨ TOGGLE TAB (bouton intégré en haut)
   ========================================== */
.toggle-tab {
  position: absolute;
  top: 8px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background-color: rgb(var(--tw-primary-500));
  color: rgb(var(--tw-primary-contrast, 255 255 255));
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.15);
  transition: all 0.25s ease;
  cursor: pointer;
}

.toggle-tab:hover {
  background-color: rgb(var(--tw-primary-600));
  transform: scale(1.1);
}

.toggle-tab:active {
  transform: scale(0.95);
}

/* Position : à droite pour le panneau gauche, à gauche pour le panneau droit */
.toggle-tab-left {
  right: 8px;
}

.toggle-tab-right {
  left: 8px;
}

/* État collapsed : le bouton devient un "tab" vertical collé au bord */
.toggle-tab--collapsed {
  width: 28px;
  height: 48px;
  border-radius: 0 8px 8px 0;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 2px 0 8px rgb(0 0 0 / 0.1);
}

.toggle-tab-right.toggle-tab--collapsed {
  border-radius: 8px 0 0 8px;
  box-shadow: -2px 0 8px rgb(0 0 0 / 0.1);
}

.toggle-tab--collapsed:hover {
  transform: translateY(-50%) scale(1.05);
}

/* ==========================================
   ✨ SCROLLBAR DYNAMIQUE
   ========================================== */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--tw-primary-500)) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 5px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--tw-primary-500));
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: content-box;
  transition: background-color 0.2s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--tw-primary-700));
}

.custom-scrollbar::-webkit-scrollbar-corner {
  background: transparent;
}
</style>
