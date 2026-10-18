<!-- <script setup lang="ts" generic="T extends TableRow"> -->
// TTable.vue - Ligne 1
<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, ref, useSlots, onBeforeUnmount, onMounted, watch, nextTick } from 'vue'
import type { TableColumn, SortState, SortDirection, Density, TableRow } from '../forms/common'
import AucuneDonnees from '../utilitaire/AucuneDonnees.vue'

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
    // ✨ NOUVEAU : colonne d'index (N°)
    showIndex?: boolean
    indexLabel?: string
    indexWidth?: number
    // ✨ NOUVEAU : Infinite Scroll
    infiniteScroll?: boolean
    hasMore?: boolean
    loadingMore?: boolean
    scrollThreshold?: number
    endMessage?: string
    showEndMessage?: boolean
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
    showIndex: false,
    indexLabel: 'N°',
    indexWidth: 60,
    // ✨ Infinite Scroll defaults
    infiniteScroll: false,
    hasMore: true,
    loadingMore: false,
    scrollThreshold: 200,
    endMessage: '— Fin des données —',
    showEndMessage: true,
  },
)

// ==================== EMITS   & MODELS ====================
const emit = defineEmits<{
  (e: 'sort', state: SortState): void
  (e: 'row-click', row: T, index: number): void
  (e: 'row-double-click', row: T, index: number): void
  // ✨ NOUVEAU : Infinite Scroll
  (e: 'load-more'): void
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
// ✨ Détecte une valeur exprimée en pourcentage (ex: '50%', '33.33%')
function isPercent(v: string | number | undefined): v is string {
  return typeof v === 'string' && v.trim().endsWith('%')
}

function resolveColWidth(col: TableColumn): number | string {
  if (columnWidths.value[col.key]) return columnWidths.value[col.key] ?? 120
  if (isPercent(col.width)) return col.width!
  const w = toNumber(col.width)
  return w > 0 ? w : 120 // ← 0 ou NaN → fallback
}
function getColWidth(col: TableColumn): string | undefined {
  if (columnWidths.value[col.key]) return `${columnWidths.value[col.key]}px`
  if (col.width !== undefined && col.width !== null && col.width !== '') {
    return typeof col.width === 'number' ? `${col.width}px` : col.width // '50%' passe intact
  }
  return undefined
}

// ✨ Offset horizontal cumulé des colonnes "spéciales" (index + sélection)
// Utilisé pour décaler les colonnes fixes `left` et la checkbox sticky.
const fixedBaseOffset = computed(() => {
  let left = 0
  if (props.showIndex) left += props.indexWidth
  if (props.selectable) left += 40
  return left
})

const tableMinWidth = computed(() => {
  let total = 0
  let hasExplicitWidth = false
  for (const col of props.columns) {
    const w = columnWidths.value[col.key] ?? (isPercent(col.width) ? 0 : toNumber(col.width))
    if (w > 0) {
      total += w
      hasExplicitWidth = true
    } else if (!isPercent(col.width)) {
      total += 120
    }
  }
  if (props.showIndex) total += props.indexWidth
  if (props.selectable) total += 40
  return hasExplicitWidth ? `${total}px` : undefined
})

// ==================== SCROLL HORIZONTAL ====================
const scrollEl = ref<HTMLElement | null>(null)
const hasHorizontalOverflow = ref(false)
let resizeObserver: ResizeObserver | null = null

function checkHorizontalOverflow() {
  const el = scrollEl.value
  if (!el) return
  hasHorizontalOverflow.value = el.scrollWidth > el.clientWidth + 1
}

// ==================== ✨ INFINITE SCROLL ====================
const sentinelEl = ref<HTMLElement | null>(null)
let intersectionObserver: IntersectionObserver | null = null

/**
 * Déclenche le chargement de plus de données.
 * Protégé contre les appels multiples pendant un chargement en cours.
 */
function triggerLoadMore() {
  // console.log(" -- --------------------------------- --")
  // console.warn(" -- TTable.triggerLoadMore -- ")
  // console.log(" -- --------------------------------- --")
  // console.log(" props:",props)
  //console.log(" -- --------------------------------- --")
  if (!props.infiniteScroll) return
  if (props.loadingMore) return
  if (!props.hasMore) return
  if (props.loading) return // éviter conflit avec le loader principal
  emit('load-more')
}

/**
 * Initialise l'IntersectionObserver sur le sentinel.
 * rootMargin négatif = déclenche avant d'atteindre le bas (anticipation).
 */
function setupInfiniteObserver() {
  // console.log(" -- --------------------------------- --")
  // console.warn(" -- TTable.setupInfiniteObserver -- ")
  // console.log(" -- --------------------------------- --")
  // console.log(" props:",props)
  // console.log(" sentinelEl.value:",sentinelEl.value)
  // console.log(" scrollEl.value:",scrollEl.value)
  // //console.log(" -- --------------------------------- --")
  teardownInfiniteObserver()
  if (!props.infiniteScroll || !sentinelEl.value || !scrollEl.value) return
  if (typeof IntersectionObserver === 'undefined') return

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          triggerLoadMore()
        }
      }
    },
    {
      root: scrollEl.value,
      rootMargin: `0px 0px ${props.scrollThreshold}px 0px`,
      threshold: 0,
    },
  )
  intersectionObserver.observe(sentinelEl.value)
}

function teardownInfiniteObserver() {
  // console.log(" -- --------------------------------- --")
  // console.warn(" -- TTable.teardownInfiniteObserver -- ")
  // console.log(" -- --------------------------------- --")
  // console.log(" intersectionObserver:",intersectionObserver)
  //console.log(" -- --------------------------------- --")
  if (intersectionObserver) {
    intersectionObserver.disconnect()
    intersectionObserver = null
  }
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
  }
  window.addEventListener('resize', checkHorizontalOverflow)

  // ✨ Active l'observer d'infinite scroll
  setupInfiniteObserver()
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', checkHorizontalOverflow)
  // ✨ Cleanup infinite scroll
  teardownInfiniteObserver()
})

// ✨ Réactive l'observer si les props clés changent
// watch(
//   () => [props.infiniteScroll, props.scrollThreshold, scrollEl.value],
//   () => {
//     nextTick(() => setupInfiniteObserver())
//   },
// )

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
const isSticky = computed(() => props.stickyHeader ?? true)

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined || value === null) return undefined
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

// ✨ Calcul de la position "left" pour les colonnes fixes
// Prend en compte l'offset cumulé (index + sélection)
function getFixedLeft(colIndex: number, isBody = false): string {
  let left = fixedBaseOffset.value
  for (let i = 0; i < colIndex; i++) {
    const col = props.columns[i]
    if (!col) continue
    const w = resolveColWidth(col)
    if (typeof w === 'number') left += w
    else return '0px' // cas dégénéré : on ne peut pas cumuler % + fixed
  }
  return `${left}px`
}

const hasCaption = computed(() => !!props.title || !!slots.caption || !!slots['caption-extra'])

const hasFixedColumns = computed(() => props.columns.some((c) => c.fixed))

// ✨ Calcul de la largeur totale du tableau
const tableWidth = computed(() => {
  let total = 0
  let hasPercent = false
  for (const col of props.columns) {
    const w = resolveColWidth(col)
    if (typeof w === 'string') {
      hasPercent = true
    } else {
      total += w
    }
  }
  if (props.showIndex) total += props.indexWidth
  if (props.selectable) total += 40
  if (hasPercent) return '100%'
  return `${total}px`
})

// ✨ Nombre total de colonnes (pour le colspan de la ligne vide)
const totalColspan = computed(
  () => props.columns.length + (props.selectable ? 1 : 0) + (props.showIndex ? 1 : 0),
)

// ✨ Indique s'il faut afficher le sentinel (zone d'observation)
const showInfiniteSentinel = computed(
  () => props.infiniteScroll && props.rows.length > 0 && props.hasMore,
)

// ✨ Indique s'il faut afficher le message de fin
const showInfiniteEnd = computed(
  () =>
    props.infiniteScroll &&
    props.showEndMessage &&
    !props.hasMore &&
    props.rows.length > 0 &&
    !props.loading,
)
// ✅ NOUVEAU : Réactive l'observer quand le sentinel apparaît/disparaît
watch(
  () => [props.infiniteScroll, props.scrollThreshold, scrollEl.value, showInfiniteSentinel.value],
  () => {
    nextTick(() => setupInfiniteObserver())
  },
)
</script>

<template>
  <div
    class="ttable flex flex-col overflow-hidden h-full w-full min-w-0 min-h-0
           rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-900"
    :style="{ ...wrapperStyle, ...themeVars, boxSizing: 'border-box' }"
  >
    <!-- ================= CAPTION (haut) ================= -->
    <div
      v-if="hasCaption && captionPosition === 'top'"
      class="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 shrink-0"
    >
      <div class="flex min-w-0 items-center gap-3">
        <h3
          v-if="title"
          class="truncate uppercase text-xl font-semibold text-neutral-800 dark:text-neutral-100"
        >
          {{ title }}
        </h3>
        <slot name="caption-extra" :selected-count="selectedKeys.length" :total="rows.length" />
      </div>
      <slot name="caption" :selected-count="selectedKeys.length" :total="rows.length" />
    </div>

    <!-- ================= ZONE SCROLL ================= -->
    <div
      ref="scrollEl"
      class="ttable__scroll custom-scrollbar relative flex-1 min-h-0 min-w-0 overflow-y-auto bg-white dark:bg-neutral-900 pb-6"
      :style="{ overflowX: hasHorizontalOverflow ? 'scroll' : 'hidden' }"
    >
      <table
        class="divide-y divide-neutral-200 dark:divide-neutral-800"
        :class="[densityClasses.text, hasFixedColumns && 'table-fixed']"
        :style="{ width: tableWidth }"
      >
        <!-- ✨ thead sticky + background OPAQUE -->
        <thead
          :class="[
            'bg-neutral-300 dark:bg-neutral-700',
            isSticky && 'sticky top-0 z-20 shadow-[0_1px_0_0_rgb(0_0_0/0.05)]',
          ]"
        >
          <tr>
            <!-- ✨ Colonne d'index (N°) -->
            <th
              v-if="showIndex"
              scope="col"
              class="select-none text-right text-neutral-500 dark:text-neutral-100 font-semibold uppercase tracking-wide bg-neutral-300 dark:bg-neutral-700"
              :class="[
                densityClasses.head,
                isSticky && 'sticky left-0 z-30',
                hasFixedColumns && 'shadow-[1px_0_0_0_rgb(0_0_0/0.05)]',
              ]"
              :style="{
                width: `${indexWidth}px`,
                minWidth: `${indexWidth}px`,
              }"
            >
              {{ indexLabel }}
            </th>
            <!-- Colonne sélection -->
            <th
              v-if="selectable"
              class="w-10 px-3 bg-neutral-300 dark:bg-neutral-700"
              :class="[
                densityClasses.head,
                isSticky && 'sticky z-30',
                hasFixedColumns && 'shadow-[1px_0_0_0_rgb(0_0_0/0.05)]',
              ]"
              :style="{
                left: showIndex ? `${indexWidth}px` : '0px',
              }"
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
              class="relative select-none text-neutral-500 dark:text-neutral-100"
              :class="[
                densityClasses.head,
                'font-semibold uppercase tracking-wide',
                alignClass(col),
                isSticky && 'bg-neutral-300 dark:bg-neutral-700',
                col.sortable && 'cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200',
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
              'cursor-default transition-colors',
              isSelected(row, rowIndex)
                ? 'bg-primary-500/20 dark:bg-primary-300/35'
                : striped && rowIndex % 2 === 1
                  ? 'bg-neutral-800/10 dark:bg-neutral-800/60'
                  : 'bg-white dark:bg-neutral-900',
              hoverable &&
                !isSelected(row, rowIndex) &&
                'hover:bg-primary-500/5 dark:hover:bg-primary-500/10',
            ]"
            @click="selectRow(row, rowIndex); emit('row-click', row, rowIndex)"
          >
            <!-- ✨ Cellule d'index -->
            <td
              v-if="showIndex"
              class="text-right text-neutral-500 dark:text-neutral-400 tabular-nums bg-inherit"
              :class="[
                densityClasses.cell,
                hasFixedColumns && 'sticky left-0 z-10',
              ]"
              :style="{
                width: `${indexWidth}px`,
                minWidth: `${indexWidth}px`,
              }"
            >
              {{ rowIndex + 1 }}
            </td>
            <!-- Checkbox de sélection -->
            <td
              v-if="selectable"
              class="w-10 px-3 bg-inherit"
              :class="[
                densityClasses.cell,
                hasFixedColumns && 'sticky z-10',
              ]"
              :style="{
                left: showIndex ? `${indexWidth}px` : hasFixedColumns ? '0px' : undefined,
              }"
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
                col.fixed === 'left' && 'sticky z-10 bg-inherit',
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

          <!-- ✨ ✨ ✨ INFINITE SCROLL : Ligne de chargement (loader) ✨ ✨ ✨ -->
          <tr v-if="infiniteScroll && loadingMore">
            <td :colspan="totalColspan" class="px-4 py-6">
              <slot name="infinite-loader" :loading="loadingMore">
                <div class="flex items-center justify-center gap-3 text-neutral-500">
                  <svg
                    class="h-5 w-5 animate-spin text-primary-600"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
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
                  <span class="text-sm">Chargement…</span>
                </div>
              </slot>
            </td>
          </tr>

          <!-- ✨ ✨ ✨ INFINITE SCROLL : Message de fin ✨ ✨ ✨ -->
          <tr v-if="showInfiniteEnd">
            <td :colspan="totalColspan" class="px-4 py-5 text-center">
              <slot name="infinite-end">
                <span class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  {{ endMessage }}
                </span>
              </slot>
            </td>
          </tr>

          <!-- ✨ ✨ ✨ INFINITE SCROLL : Sentinel (zone invisible observée) ✨ ✨ ✨ -->
          <tr v-if="showInfiniteSentinel">
            <td :colspan="totalColspan" class="p-0">
              <div ref="sentinelEl" class="h-px w-full" aria-hidden="true" />
            </td>
          </tr>

          <!-- Ligne vide (aucune donnée) -->
          <tr v-if="rows.length === 0 && !loading">
            <td
              :colspan="totalColspan"
              class="px-4 py-8 text-center text-neutral-400 dark:text-neutral-500"
            >
              <slot name="empty">
                <AucuneDonnees :message="emptyMessage" />
              </slot>
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

.ttable {
  display: flex;
  flex-direction: column;
  max-width: 100%;
  max-height: 100%;
  min-width: 0;
  min-height: 0;
}

.ttable__scroll {
  min-width: 0;
}

/* ==========================================
✨ SCROLLBAR DYNAMIQUE
========================================== */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--tw-primary-500)) transparent;
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