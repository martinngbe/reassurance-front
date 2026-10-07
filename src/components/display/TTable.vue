<script setup lang="ts" generic="T extends TableRow">
import { computed, ref, useSlots, onBeforeUnmount, onMounted, watch, nextTick } from 'vue'
import type { TableColumn, SortState, SortDirection, Density, TableRow } from '../forms/common'

// =============== ===== PROPS ====================
const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    rows: T[]
    striped?: boolean
    hoverable?: boolean
    emptyMessage?: string
    width?: string | number
    height?: string | number
    title?: string
    stickyHeader?: boolean
    captionPosition?: 'top' | 'bottom'
    loading?: boolean
    density?: Density
    selectable?: boolean
    rowKey?: string | ((row: T) => string | number)
    theme?: {
      primary?: string
      primaryHover?: string
      surface?: string
      surfaceAlt?: string
      border?: string
      text?: string
      muted?: string
    }
  }>(),
  {
    striped: false,
    hoverable: true,
    emptyMessage: 'Aucune donnée',
    stickyHeader: undefined,
    captionPosition: 'top',
    loading: false,
    density: 'md',
    selectable: false,
    rowKey: 'id',
  },
)

// ==================== EMITS & MODELS ====================
const emit = defineEmits<{
  (e: 'sort', state: SortState): void
  (e: 'row-click', row: T, index: number): void
}>()

const selectedKeys = defineModel<(string | number)[]>('selectedKeys', { default: () => [] })
const slots = useSlots()

// ==================== THÈME DYNAMIQUE ====================
const themeVars = computed(() => {
  const t = props.theme ?? {}
  return {
    '--ttable-primary': t.primary ?? 'oklch(var(--color-primary, 0.65 0.18 250))',
    '--ttable-primary-hover': t.primaryHover ?? 'oklch(var(--color-primary, 0.50 0.18 250))',
    '--ttable-surface': t.surface ?? 'oklch(var(--color-surface, 0.99 0 0))',
    '--ttable-surface-alt': t.surfaceAlt ?? 'oklch(var(--color-surface-alt, 0.97 0 0))',
    '--ttable-border': t.border ?? 'oklch(var(--color-border, 0.90 0 0))',
    '--ttable-text': t.text ?? 'oklch(var(--color-text, 0.20 0 0))',
    '--ttable-muted': t.muted ?? 'oklch(var(--color-muted, 0.55 0 0))',
  } as Record<string, string>
})

// ==================== TRI ====================
const sortState = ref<SortState>({ key: null, direction: null })

function toggleSort(col: TableColumn) {
  if (!col.sortable) return
  let next: SortDirection
  if (sortState.value.key !== col.key) {
    next = 'asc'
  } else if (sortState.value.direction === 'asc') {
    next = 'desc'
  } else {
    next = null
  }
  sortState.value = { key: next ? col.key : null, direction: next }
  emit('sort', sortState.value)
}

function sortIconClass(col: TableColumn): string {
  if (!col.sortable || sortState.value.key !== col.key) return 'opacity-30'
  return 'opacity-100'
}

// ==================== SÉLECTION ====================
function getRowKey(row: T, index: number): string | number {
  if (typeof props.rowKey === 'function') return props.rowKey(row)
  return (row[props.rowKey as string] as string | number) ?? index
}

const allSelected = computed({
  get: () => props.rows.length > 0 && selectedKeys.value.length === props.rows.length,
  set: (val) => {
    selectedKeys.value = val ? props.rows.map((r, i) => getRowKey(r, i)) : []
  },
})

const someSelected = computed(
  () => selectedKeys.value.length > 0 && selectedKeys.value.length < props.rows.length,
)

function toggleRow(row: T, index: number) {
  const key = getRowKey(row, index)
  const idx = selectedKeys.value.indexOf(key)
  if (idx === -1) selectedKeys.value = [...selectedKeys.value, key]
  else selectedKeys.value = selectedKeys.value.filter((k) => k !== key)
}
// ✨ Sélection exclusive : une seule ligne à la fois (comportement "radio")
function selectRow(row: T, index: number) {
  const key = getRowKey(row, index)
  selectedKeys.value = [key]
}
function isSelected(row: T, index: number): boolean {
  const isOk = selectedKeys.value.includes(getRowKey(row, index))
  console.log("isSelected(row: T, index: number)  isOk:", row ,index ,isOk )
  return isOk
}

// ==================== REDIMENSIONNEMENT ====================
const columnWidths = ref<Record<string, number>>({})
const resizingCol = ref<string | null>(null)
const resizeStartX = ref(0)
const resizeStartWidth = ref(0)

function startResize(e: MouseEvent, col: TableColumn) {
  if (!col.resizable) return
  e.preventDefault()
  const th = (e.target as HTMLElement).closest('th') as HTMLElement
  const startWidth = th.getBoundingClientRect().width
  resizingCol.value = col.key
  resizeStartX.value = e.clientX
  resizeStartWidth.value = startWidth
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

function onResize(e: MouseEvent) {
  if (!resizingCol.value) return
  const delta = e.clientX - resizeStartX.value
  const col = props.columns.find((c) => c.key === resizingCol.value)
  const min = col?.minWidth ? toNumber(col.minWidth) : 60
  columnWidths.value[resizingCol.value] = Math.max(min, resizeStartWidth.value + delta)
}

function stopResize() {
  resizingCol.value = null
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

function toNumber(v: string | number | undefined): number {
  if (typeof v === 'number') return v
  if (!v) return 0
  return parseFloat(v) || 0
}

// ✨ Résout la largeur effective d'une colonne : redimensionnement manuel > largeur
// explicite (col.width) > 120px par défaut. `toNumber` renvoie toujours un nombre
// (0 si absent), donc `toNumber(col.width) ?? 120` ne se déclenchait jamais — on
// teste explicitement la présence d'une largeur avant d'appliquer le fallback.
function resolveColWidth(col: TableColumn): number {
  if (columnWidths.value[col.key]) return columnWidths.value[col.key]?? 120

  if (col.width !== undefined && col.width !== null && col.width !== '') return toNumber(col.width)
  return 120
}

function getColWidth(col: TableColumn): string | undefined {
  if (columnWidths.value[col.key]) return `${columnWidths.value[col.key]}px`
  if (col.width) return typeof col.width === 'number' ? `${col.width}px` : col.width
  return undefined
}

// ✨ Calcul de la largeur totale minimale du tableau (pour forcer le scroll horizontal)
const tableMinWidth = computed(() => {
  let total = 0
  let hasExplicitWidth = false
  for (const col of props.columns) {
    const w = columnWidths.value[col.key] ?? toNumber(col.width)
    if (w > 0) {
      total += w
      hasExplicitWidth = true
    } else {
      total += 120 // largeur par défaut estimée
    }
  }
  if (props.selectable) total += 40 // largeur de la colonne checkbox
  return hasExplicitWidth ? `${total}px` : undefined
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', checkHorizontalOverflow)
})

// ==================== SCROLL HORIZONTAL (mesure explicite, pas de "auto" implicite) ====================
// ✨ On ne se fie plus à `overflow-x: auto` (dont le recalcul par le navigateur
// peut rester bloqué après un redimensionnement animé du parent, ex: TLayout).
// On mesure nous-mêmes scrollWidth vs clientWidth et on pilote l'overflow-x
// explicitement (scroll / hidden), ce qui force le navigateur à repeindre.
const scrollEl = ref<HTMLElement | null>(null)
const hasHorizontalOverflow = ref(false)
let resizeObserver: ResizeObserver | null = null

function checkHorizontalOverflow() {
  //console.log('scrollEl.value:',scrollEl.value)
  const el = scrollEl.value
  if (!el) return
  // +1px de marge pour éviter les faux positifs liés aux arrondis sub-pixel
  hasHorizontalOverflow.value = el.scrollWidth > el.clientWidth + 1
  // console.log('hasHorizontalOverflow.value:',hasHorizontalOverflow.value)
}

onMounted(() => {
  checkHorizontalOverflow()
  // ✨ Second passage après le premier paint : couvre les cas où la largeur
  // réelle du contenu (polices web, slots personnalisés, composants enfants
  // async) n'est pas encore stabilisée au moment exact du montage.
  requestAnimationFrame(checkHorizontalOverflow)

  if (typeof ResizeObserver !== 'undefined' && scrollEl.value) {
    resizeObserver = new ResizeObserver(() => {
      checkHorizontalOverflow()
    })
    // On observe le conteneur de scroll lui-même...
    resizeObserver.observe(scrollEl.value)
    // ...et son parent direct, pour capter aussi les redimensionnements
    // déclenchés par les zones (header/footer) du layout englobant.
    if (scrollEl.value.parentElement) {
      resizeObserver.observe(scrollEl.value.parentElement)
    }
  }
  // Filet de sécurité supplémentaire (couvre les environnements sans ResizeObserver
  // ou les redimensionnements de fenêtre qui ne déclenchent pas l'observer ci-dessus).
  window.addEventListener('resize', checkHorizontalOverflow)
})

// Recalcule quand les colonnes, leur largeur (redimensionnement manuel) ou les
// lignes changent, puisque cela modifie la largeur totale du tableau.
watch(
  [() => props.columns, columnWidths, () => props.rows.length],
  () => nextTick(checkHorizontalOverflow),
  { deep: true },
)

// ==================== DENSITÉ ====================
const densityClasses = computed(() => {
  const map: Record<Density, { cell: string; head: string; text: string }> = {
    sm: { cell: 'px-3 py-1.5 text-xs', head: 'px-3 py-2 text-[10px]', text: 'text-xs' },
    md: { cell: 'px-4 py-3 text-sm', head: 'px-4 py-3 text-xs', text: 'text-sm' },
    lg: { cell: 'px-5 py-4 text-base', head: 'px-5 py-4 text-sm', text: 'text-base' },
  }
  return map[props.density]
})

// ==================== UTILITAIRES ====================
// ✨ L'entête reste figée par défaut (même sans hauteur explicite passée par le parent) ;
// stickyHeader: false permet de désactiver explicitement ce comportement.
const isSticky = computed(() => props.stickyHeader ?? true)

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined || value === null) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

// ✨ Dimensions par défaut : le composant occupe tout son parent si non spécifié
const wrapperStyle = computed(() => ({
  width: toCssSize(props.width) ?? '100%',
  height: toCssSize(props.height) ?? '100%',
}))

function alignClass(col: TableColumn): string {
  if (col.align === 'right') return 'text-right'
  if (col.align === 'center') return 'text-center'
  return 'text-left'
}
// ✨ Calcul de la position "left" pour les colonnes fixes
function getFixedLeft(colIndex: number, isBody = false): string {
  let left = 0
  const offset = props.selectable ? 40 : 0 // largeur de la colonne checkbox
  
  // Pour les th (header), on commence après la checkbox si selectable
  // Pour les td (body), idem
  const startIndex = isBody ? 0 : 0
  
  for (let i = 0; i < colIndex; i++) {
    const col = props.columns[i]
    if (col) {
      left += resolveColWidth(col)
    }
  }
  
  return `${left + (props.selectable ? 40 : 0)}px`
}
const hasCaption = computed(() => !!props.title || !!slots.caption || !!slots['caption-extra'])

const hasFixedColumns = computed(() => props.columns.some((c) => c.fixed))

// ✨ Calcul de la largeur totale du tableau
const tableWidth = computed(() => {
  let total = 0
  for (const col of props.columns) {
    total += resolveColWidth(col)
  }
  if (props.selectable) total += 40 // largeur de la colonne checkbox
  console.log('TTable tableWidth:',total)
  return `${total}px`
})

</script>

<template>
  <!-- ✨ MODIFICATION 1 : overflow-hidden + dimensions contraintes pour figer le composant -->
  <!-- min-w-0/min-h-0 : empêche le composant de repousser son parent flex/grid
       (comportement par défaut sinon : min-width/min-height: auto = taille du contenu) -->
  <div
    class="ttable flex flex-col overflow-hidden h-full w-full min-w-0 min-h-0
    rounded-xl ring-1 
    ring-neutral-200  
    dark:ring-neutral-800 bg-white 
    dark:bg-neutral-900"
    :style="{ ...wrapperStyle, ...themeVars, boxSizing: 'border-box' }"
  >
    <!-- ================= CAPTION (haut) ================= -->
    <!-- ✨ Le caption est EN DEHORS de la zone scroll → il reste figé -->
    <div
      v-if="hasCaption && captionPosition === 'top'"
      class="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 shrink-0"
    >
      <div class="flex min-w-0 items-center gap-3">
        <h3
          v-if="title"
          class="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100"
        >
          {{ title }}
        </h3>
        <slot name="caption-extra" :selected-count="selectedKeys.length" :total="rows.length" />
      </div>
      <slot name="caption" :selected-count="selectedKeys.length" :total="rows.length" />
    </div>

    <!-- ================= ZONE SCROLL ================= -->
    <!-- ✨ MODIFICATION 2 : flex-1 + min-h-0 + overflow-auto gère les scrolls H et V -->
    <div
      ref="scrollEl"
      class="ttable__scroll custom-scrollbar relative 
      flex-1 min-h-0 min-w-0 overflow-y-auto
      bg-white dark:bg-neutral-900 pb-6 "
      
      :style="{ overflowX: hasHorizontalOverflow ? 'scroll' : 'hidden' }"
      >
      <table
        class="divide-y divide-neutral-200 dark:divide-neutral-800 "
        :class="[densityClasses.text, hasFixedColumns && 'table-fixed']"
        :style="{ width: tableWidth }"
      >
        <!-- ✨ MODIFICATION 3 : thead sticky + background OPAQUE (sinon le contenu transparaît) -->
        <thead
          :class="[
            'bg-neutral-300 dark:bg-neutral-700',
            isSticky && 'sticky top-0 z-20 shadow-[0_1px_0_0_rgb(0_0_0/0.05)]',
          ]"
        >
          <tr>
            <!-- Colonne sélection -->
            <th
              v-if="selectable"
              class="w-10 px-3 bg-neutral-300 dark:bg-neutral-700"
              :class="[densityClasses.head, isSticky && 'sticky left-0 z-30']"
            >
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected"
                class="h-4 w-4 rounded border-neutral-300 accent-primary-600"
                @change="allSelected = ($event.target as HTMLInputElement).checked"
              />
            </th>
            <!-- Colonnes -->
            <th
              v-for="(col, colIndex) in columns"
              :key="col.key"
              scope="col"
              class="relative select-none text-neutral-500 dark:text-neutral-400"
              :class="[
                densityClasses.head,
                'font-semibold uppercase tracking-wide',
                alignClass(col),
                // ✨ Background opaque obligatoire pour le sticky vertical
                isSticky && 'bg-neutral-300 dark:bg-neutral-700',
                col.sortable && 'cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200',
                // ✨ Support des colonnes fixes horizontalement
                col.fixed === 'left' && 'sticky z-20 bg-neutral-50 dark:bg-neutral-800',
              ]"
              :style="{
                width: getColWidth(col),
                left: col.fixed === 'left' ? getFixedLeft(colIndex) : undefined,
              }"
              @click="toggleSort(col)"
            >
              <div
                class="flex items-center gap-1"
                :class="
                  alignClass(col) === 'text-right'
                    ? 'justify-end'
                    : alignClass(col) === 'text-center'
                      ? 'justify-center'
                      : 'justify-start'
                "
              >
                <slot :name="`head-${col.key}`" :column="col" :sort="sortState">
                  {{ col.label }}
                </slot>
                <span
                  v-if="col.sortable"
                  class="inline-flex flex-col text-[8px] leading-none"
                  :class="sortIconClass(col)"
                >
                  <span
                    :class="
                      sortState.key === col.key && sortState.direction === 'asc'
                        ? 'text-primary-600'
                        : ''
                    "
                    >▲</span
                  >
                  <span
                    :class="
                      sortState.key === col.key && sortState.direction === 'desc'
                        ? 'text-primary-600'
                        : ''
                    "
                    >▼</span
                  >
                </span>
              </div>
              <!-- Handle de redimensionnement -->
              <span
                v-if="col.resizable"
                class="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-primary-500/40"
                @mousedown.stop="startResize($event, col)"
              />
            </th>
          </tr>
        </thead>
        <tbody
          class="divide-y divide-neutral-100 bg-white dark:divide-neutral-800 dark:bg-neutral-900"
        >
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            :class="[
              hoverable && !isSelected(row, rowIndex) &&'transition-colors hover:bg-primary-500/5 dark:hover:bg-primary-500/10',
              striped && rowIndex % 2 === 1 && 'bg-neutral-800/10 dark:bg-neutral-800/60',
              isSelected(row, rowIndex) && 'bg-primary-500/20 dark:bg-primary-500/50',
              'cursor-default',
            ]"
            @click="selectRow(row, rowIndex); emit('row-click', row, rowIndex)"
          >
            <!-- Checkbox de sélection -->
            <td
              v-if="selectable"
              class="w-10 px-3 bg-white dark:bg-neutral-900"
              :class="[densityClasses.cell, hasFixedColumns && 'sticky left-0 z-10']"
              
            >
              <input
                type="checkbox"
                :checked="isSelected(row, rowIndex)"
                class="h-4 w-4 rounded border-neutral-300 accent-primary-600"
                @click.stop
                @change="toggleRow(row, rowIndex)"
              />
            </td>
            <td
              v-for="(col, colIndex) in columns"
              :key="col.key"
              class="text-neutral-700 dark:text-neutral-200"
              :class="[
                densityClasses.cell,
                alignClass(col),
                // ✨ Background opaque pour les colonnes fixes (sinon le contenu défile derrière)
                 col.fixed === 'left' && 'sticky z-10 bg-white dark:bg-neutral-900',
              ]"
              :style="{
                left: col.fixed === 'left' ? getFixedLeft(colIndex, true) : undefined,
              }"
            >
              <slot
                :name="`cell-${col.key}`"
                :row="row"
                :column="col"
                :value="row[col.key]"
                :index="rowIndex"
              >
                <slot name="cell" :row="row" :column="col" :value="row[col.key]" :index="rowIndex">
                  {{ row[col.key] }}
                </slot>
              </slot>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td
              :colspan="columns.length + (selectable ? 1 : 0)"
              class="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500"
            >
              <slot name="empty">{{ emptyMessage }}</slot>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- ================= LOADER OVERLAY ================= -->
      <Transition name="fade">
        <div
          v-if="loading"
          class="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-neutral-900/70"
        >
          <slot name="loading">
            <div class="flex flex-col items-center gap-2">
              <svg class="h-8 w-8 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-opacity="0.25"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                />
              </svg>
              <span class="text-sm text-neutral-500">Chargement…</span>
            </div>
          </slot>
        </div>
      </Transition>
    </div>

    <!-- ================= CAPTION (bas) ================= -->
    <div
      v-if="hasCaption && captionPosition === 'bottom'"
      class="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 shrink-0"
    >
      <div class="flex min-w-0 items-center gap-3">
        <h3
          v-if="title"
          class="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100"
        >
          {{ title }}
        </h3>
        <slot name="caption-extra" :selected-count="selectedKeys.length" :total="rows.length" />
      </div>
      <slot name="caption" :selected-count="selectedKeys.length" :total="rows.length" />
    </div>
  </div>
</template>



<style scoped>
/* --- Transitions du loader --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ✨ IMPORTANT : le composant TTable doit respecter les dimensions de son parent */
.ttable {
  display: flex;
  flex-direction: column;
  /* Évite que le composant ne dépasse de son parent */
  max-width: 100%;
  max-height: 100%;
  /* Empêche le composant de forcer l'agrandissement d'un parent flex/grid
     (le contenu large du tableau doit scroller à l'intérieur, jamais pousser le parent) */
  min-width: 0;
  min-height: 0;
}

/* ✨ overflow-x piloté explicitement en JS (scroll/hidden) plutôt que "auto" :
   garantit un repaint fiable de la scrollbar custom même quand la taille du
   conteneur change via une transition CSS d'un ancêtre (ex: TLayout). */
.ttable__scroll {
  min-width: 0;
}

/* ==========================================
✨ SCROLLBAR DYNAMIQUE
========================================== */

/* Firefox */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--tw-primary-500)) transparent;
}

/* Chrome, Safari, Edge, Opera */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--tw-primary-500));
  border-radius: 4px;
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

@supports not (color: rgb(var(--tw-primary-500))) {
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #6366f1;
  }
}
</style>