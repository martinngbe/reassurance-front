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

function isSelected(row: T, index: number): boolean {
  return selectedKeys.value.includes(getRowKey(row, index))
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

function resolveColWidth(col: TableColumn): number {
  if (columnWidths.value[col.key]) return columnWidths.value[col.key]
  if (col.width !== undefined && col.width !== null && col.width !== '') return toNumber(col.width)
  return 120
}

function getColWidth(col: TableColumn): string | undefined {
  if (columnWidths.value[col.key]) return `${columnWidths.value[col.key]}px`
  if (col.width) return typeof col.width === 'number' ? `${col.width}px` : col.width
  return undefined
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', checkHorizontalOverflow)
  scrollEl.value?.removeEventListener('scroll', syncFromTableScroll)
  horizontalScrollEl.value?.removeEventListener('scroll', syncFromHorizontalScroll)
})

// ==================== SCROLL HORIZONTAL ====================
const scrollEl = ref<HTMLElement | null>(null)
const horizontalScrollEl = ref<HTMLElement | null>(null)
const horizontalScrollContentEl = ref<HTMLElement | null>(null)
const hasHorizontalOverflow = ref(false)
let resizeObserver: ResizeObserver | null = null
let horizontalSyncing = false

function checkHorizontalOverflow() {
  const el = scrollEl.value
  if (!el) return

  hasHorizontalOverflow.value = el.scrollWidth > el.clientWidth + 1

  if (horizontalScrollContentEl.value) {
    horizontalScrollContentEl.value.style.width = `${el.scrollWidth}px`
  }
}

function syncFromTableScroll() {
  if (horizontalSyncing) return
  const table = scrollEl.value
  const horizontal = horizontalScrollEl.value
  if (!table || !horizontal) return

  horizontalSyncing = true
  horizontal.scrollLeft = table.scrollLeft
  requestAnimationFrame(() => {
    horizontalSyncing = false
  })
}

function syncFromHorizontalScroll() {
  if (horizontalSyncing) return
  const table = scrollEl.value
  const horizontal = horizontalScrollEl.value
  if (!table || !horizontal) return

  horizontalSyncing = true
  table.scrollLeft = horizontal.scrollLeft
  requestAnimationFrame(() => {
    horizontalSyncing = false
  })
}

onMounted(() => {
  checkHorizontalOverflow()
  requestAnimationFrame(checkHorizontalOverflow)

  if (typeof ResizeObserver !== 'undefined' && scrollEl.value) {
    resizeObserver = new ResizeObserver(() => {
      checkHorizontalOverflow()
    })
    resizeObserver.observe(scrollEl.value)
    if (scrollEl.value.parentElement) {
      resizeObserver.observe(scrollEl.value.parentElement)
    }
    if (horizontalScrollEl.value) {
      resizeObserver.observe(horizontalScrollEl.value)
    }
  }

  scrollEl.value?.addEventListener('scroll', syncFromTableScroll, { passive: true })
  horizontalScrollEl.value?.addEventListener('scroll', syncFromHorizontalScroll, { passive: true })

  window.addEventListener('resize', checkHorizontalOverflow)
})

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

// ==================== UTILITAIRES & DIMENSIONS ====================
const isSticky = computed(() => props.stickyHeader ?? true)

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined || value === null) return undefined
  // Accepte les classes Tailwind passées en height (ex: height="h-full")
  if (typeof value === 'string' && (value.startsWith('h-') || value.startsWith('w-'))) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

const wrapperStyle = computed(() => ({
  width: toCssSize(props.width) ?? '100%',
  height: toCssSize(props.height) ?? '100%',
}))

function alignClass(col: TableColumn): string {
  if (col.align === 'right') return 'text-right'
  if (col.align === 'center') return 'text-center'
  return 'text-left'
}

function getFixedLeft(colIndex: number): string {
  let left = props.selectable ? 40 : 0

  for (let i = 0; i < colIndex; i++) {
    const col = props.columns[i]
    // Seules les colonnes précédentes elles-mêmes figées doivent
    // participer au calcul du décalage horizontal.
    if (col?.fixed === 'left') {
      left += resolveColWidth(col)
    }
  }

  return `${left}px`
}

const hasCaption = computed(() => !!props.title || !!slots.caption || !!slots['caption-extra'])
const hasFixedColumns = computed(() => props.columns.some((c) => c.fixed))
const firstColumnKey = computed(() => props.columns[0]?.key ?? null)
const lastColumnKey = computed(() => props.columns[props.columns.length - 1]?.key ?? null)

function isFirstColumn(col: TableColumn): boolean {
  return col.key === firstColumnKey.value
}

function isLastColumn(col: TableColumn): boolean {
  return col.key === lastColumnKey.value
}

// Calcul de la largeur réelle cumulée pour le <table>
const tableWidth = computed(() => {
  let total = 0
  for (const col of props.columns) {
    total += resolveColWidth(col)
  }
  if (props.selectable) total += 40
  return `${total}px`
})
</script>

<template>
  <!-- Conteneur principal fige le composant dans le parent (min-w-0 min-h-0) -->
  <div
    class="ttable flex flex-col overflow-hidden h-full w-full min-w-0 min-h-0 rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-900"
    :style="{ ...wrapperStyle, ...themeVars, boxSizing: 'border-box' }"
  >
    <!-- CAPTION EN TÊTE (hors défilement vertical) -->
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

    <!-- ZONE DE DÉFILEMENT (Vertical & Horizontal) -->
    <div
      ref="scrollEl"
      class="ttable__scroll custom-scrollbar relative flex-1 min-h-0 min-w-0 overflow-auto bg-white dark:bg-neutral-900"
    >
      <table
        class="divide-y divide-neutral-200 dark:divide-neutral-800"
        :class="[densityClasses.text, hasFixedColumns && 'table-fixed']"
        :style="{ width: tableWidth, minWidth: '100%' }"
      >
        <!-- TH EN TÊTE (Sticky lors du scroll vertical) -->
        <thead
          :class="[
            'bg-neutral-50 dark:bg-neutral-800',
            isSticky && 'shadow-[0_1px_0_0_rgb(0_0_0/0.05)]',
          ]"
        >
          <tr>
            <th
              v-if="selectable"
              class="w-10 px-3 bg-neutral-50 dark:bg-neutral-800"
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
            <th
              v-for="(col, colIndex) in columns"
              :key="col.key"
              scope="col"
              class="relative select-none text-neutral-500 dark:text-neutral-400"
              :class="[
                densityClasses.head,
                'font-semibold uppercase tracking-wide',
                alignClass(col),
                isSticky && 'sticky top-0 z-20 bg-neutral-50 dark:bg-neutral-800',
                col.sortable && 'cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200',
                (col.fixed === 'left' || isFirstColumn(col)) &&
                  (isSticky
                    ? 'sticky top-0 z-30 bg-neutral-50 dark:bg-neutral-800'
                    : 'sticky z-20 bg-neutral-50 dark:bg-neutral-800'),
              ]"
              :style="{
                width: getColWidth(col),
                left: col.fixed === 'left' || isFirstColumn(col) ? getFixedLeft(colIndex) : undefined,
                right: isLastColumn(col) ? '0px' : undefined,
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
              <span
                v-if="col.resizable"
                class="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-primary-500/40"
                @mousedown.stop="startResize($event, col)"
              />
            </th>
          </tr>
        </thead>

        <!-- CORPS DU TABLEAU -->
        <tbody
          class="divide-y divide-neutral-100 bg-white dark:divide-neutral-800 dark:bg-neutral-900"
        >
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            :class="[
              hoverable && 'transition-colors hover:bg-primary-500/5 dark:hover:bg-primary-500/10',
              striped && rowIndex % 2 === 1 && 'bg-neutral-50/60 dark:bg-neutral-800/30',
              isSelected(row, rowIndex) && 'bg-primary-500/10 dark:bg-primary-500/15',
              'cursor-default',
            ]"
            @click="emit('row-click', row, rowIndex)"
          >
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
                (col.fixed === 'left' || isFirstColumn(col)) &&
                  'sticky left-0 z-10 bg-white dark:bg-neutral-900',
                isLastColumn(col) &&
                  'sticky right-0 z-10 bg-white dark:bg-neutral-900',
              ]"
              :style="{
                width: getColWidth(col),
                left: col.fixed === 'left' || isFirstColumn(col) ? getFixedLeft(colIndex) : undefined,
                right: isLastColumn(col) ? '0px' : undefined,
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

      <!-- OVERLAY DE CHARGEMENT -->
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

    <!-- BARRE DE DÉFILEMENT HORIZONTAL DÉDIÉE
         Elle reste toujours visible en bas du composant. -->
    <div
      ref="horizontalScrollEl"
      class="ttable__horizontal-scroll shrink-0 min-w-0 overflow-x-auto overflow-y-hidden border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      :class="!hasHorizontalOverflow && 'ttable__horizontal-scroll--empty'"
      aria-label="Défilement horizontal du tableau"
    >
      <div
        ref="horizontalScrollContentEl"
        class="h-px min-w-full"
        aria-hidden="true"
      />
    </div>

    <!-- CAPTION EN BAS (hors défilement vertical) -->
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.ttable {
  display: flex;
  flex-direction: column;
  max-width: 100%;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  min-width: 0;
  min-height: 0;
}

.ttable__scroll {
  min-width: 0;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  scrollbar-width: none;
}

.ttable__scroll::-webkit-scrollbar {
  width: 8px;
  height: 0;
}

.ttable__scroll::-webkit-scrollbar-horizontal {
  height: 0;
}

.ttable__horizontal-scroll {
  width: 100%;
  min-height: 10px;
  height: 10px;
  scrollbar-width: thin;
}

.ttable__horizontal-scroll--empty {
  scrollbar-color: transparent transparent;
}

.ttable__horizontal-scroll::-webkit-scrollbar {
  height: 8px;
}

.ttable__horizontal-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.ttable__horizontal-scroll::-webkit-scrollbar-thumb {
  background-color: rgb(var(--tw-primary-500, 99 102 241));
  border-radius: 4px;
}

.ttable__horizontal-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--tw-primary-700, 67 56 202));
}

.ttable__scroll > table {
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.ttable__scroll th,
.ttable__scroll td {
  box-sizing: border-box;
}

.ttable__scroll th.sticky:first-child,
.ttable__scroll td.sticky:first-child {
  box-shadow: 2px 0 4px rgb(0 0 0 / 0.06);
}

.ttable__scroll th.sticky:last-child,
.ttable__scroll td.sticky:last-child {
  box-shadow: -2px 0 4px rgb(0 0 0 / 0.06);
}

/* Scrollbar personnalisée */
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