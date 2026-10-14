<script setup lang="ts">
import { computed, ref, watch, useId } from 'vue'

// ==================== TYPES ====================
export type CalendarView = 'month' | 'year'
export type CalendarSize = 'sm' | 'md' | 'lg'
export type CalendarVariant = 'default' | 'compact' | 'outlined'
export type CalendarSelectionMode = 'single' | 'range'

export interface CalendarDateRange {
  start: Date | null
  end: Date | null
}

export interface DayCell {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isInRange: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isDisabled: boolean
  isWeekend: boolean
}

// ==================== PROPS ====================
const props = withDefaults(
  defineProps<{
    /** Date sélectionnée (single) ou plage (range) */
    modelValue?: Date | CalendarDateRange | null
    /** Mode de sélection */
    selectionMode?: CalendarSelectionMode
    /** Vue initiale */
    initialView?: CalendarView
    /** Taille du calendrier */
    size?: CalendarSize
    /** Variante visuelle */
    variant?: CalendarVariant
    /** Date minimale sélectionnable */
    minDate?: Date | null
    /** Date maximale sélectionnable */
    maxDate?: Date | null
    /** Jours désactivés (fonction ou tableau de dates) */
    disabledDates?: Date[] | ((date: Date) => boolean)
    /** Dates mises en évidence (badges) */
    highlightedDates?: Date[]
    /** Locale (ex: 'fr-FR', 'en-US') */
    locale?: string
    /** Premier jour de la semaine (0 = dimanche, 1 = lundi) */
    firstDayOfWeek?: 0 | 1
    /** Label accessible */
    ariaLabel?: string
    /** Désactivé */
    disabled?: boolean
    /** Lecture seule */
    readonly?: boolean
    /** Format d'affichage du mois */
    monthFormat?: 'long' | 'short' | 'numeric'
    /** Format d'affichage de l'année */
    yearFormat?: 'numeric' | '2-digit'
    /** Afficher les jours hors mois */
    showOutsideDays?: boolean
    /** ID personnalisé */
    id?: string
  }>(),
  {
    modelValue: null,
    selectionMode: 'single',
    initialView: 'month',
    size: 'md',
    variant: 'default',
    minDate: null,
    maxDate: null,
    locale: 'fr-FR',
    firstDayOfWeek: 1,
    ariaLabel: 'Calendrier',
    disabled: false,
    readonly: false,
    monthFormat: 'long',
    yearFormat: 'numeric',
    showOutsideDays: true,
  },
)

// ==================== EMITS ====================
const emit = defineEmits<{
  'update:modelValue': [value: Date | CalendarDateRange | null]
  'month-change': [month: number, year: number]
  'year-change': [year: number]
  'view-change': [view: CalendarView]
  'date-click': [date: Date]
  'date-hover': [date: Date | null]
}>()

// ==================== ÉTAT INTERNE ====================
const autoId = useId()
const calendarId = computed(() => props.id ?? autoId)

const today = new Date()
today.setHours(0, 0, 0, 0)

const currentMonth = ref(
  props.modelValue instanceof Date
    ? props.modelValue.getMonth()
    : today.getMonth(),
)
const currentYear = ref(
  props.modelValue instanceof Date
    ? props.modelValue.getFullYear()
    : today.getFullYear(),
)
const currentView = ref<CalendarView>(props.initialView)
const hoveredDate = ref<Date | null>(null)

// Pour le mode range : date de début temporaire pendant la sélection
const rangeStart = ref<Date | null>(null)

// ==================== HELPERS LOCALE ====================
const dateFormatter = computed(() =>
  new Intl.DateTimeFormat(props.locale, {
    month: props.monthFormat,
    year: props.yearFormat,
  }),
)

const dayFormatter = computed(() =>
  new Intl.DateTimeFormat(props.locale, { weekday: 'short' }),
)

const weekdayLabels = computed(() => {
  const base = new Date(2024, 0, 1) // Un lundi
  const labels: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + ((i + props.firstDayOfWeek) % 7))
    labels.push(dayFormatter.value.format(d).slice(0, 2))
  }
  return labels
})

// ==================== NORMALISATION DU MODEL ====================
const selectedDate = computed<Date | null>(() => {
  if (props.selectionMode === 'single') {
    return props.modelValue instanceof Date ? props.modelValue : null
  }
  return null
})

const selectedRange = computed<CalendarDateRange>(() => {
  if (props.selectionMode === 'range' && props.modelValue && 'start' in props.modelValue) {
    return props.modelValue
  }
  return { start: null, end: null }
})

// ==================== GÉNÉRATION DES JOURS ====================
const daysInMonth = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days: DayCell[] = []

  // Jours du mois précédent (pour remplir la grille)
  const startWeekday = (firstDay.getDay() - props.firstDayOfWeek + 7) % 7
  for (let i = startWeekday - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push(buildDayCell(date, false))
  }

  // Jours du mois courant
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    days.push(buildDayCell(date, true))
  }

  // Jours du mois suivant (pour compléter la grille à 6 semaines)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i)
    days.push(buildDayCell(date, false))
  }

  return days
})

const buildDayCell = (date: Date, isCurrentMonth: boolean): DayCell => {
  const isSelected = isDateSelected(date)
  const isInRange = isDateInRange(date)
  const isDisabled = isDateDisabled(date)
  const weekday = date.getDay()

  return {
    date,
    day: date.getDate(),
    isCurrentMonth,
    isToday: isSameDay(date, today),
    isSelected,
    isInRange,
    isRangeStart: isRangeStart(date),
    isRangeEnd: isRangeEnd(date),
    isDisabled,
    isWeekend: weekday === 0 || weekday === 6,
  }
}

// ==================== COMPARAISON DE DATES ====================
const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const isBefore = (a: Date, b: Date): boolean => a.getTime() < b.getTime()
const isAfter = (a: Date, b: Date): boolean => a.getTime() > b.getTime()
const isBetween = (date: Date, start: Date, end: Date): boolean =>
  date.getTime() >= start.getTime() && date.getTime() <= end.getTime()

// ==================== ÉTATS DE SÉLECTION ====================

const isDateSelected = (date: Date): boolean => {
  if (props.selectionMode === 'single') {
    return selectedDate.value ? isSameDay(date, selectedDate.value) : false
  }
  const range = selectedRange.value
  return Boolean(
    (range.start && isSameDay(date, range.start)) ||
    (range.end && isSameDay(date, range.end))
  )
}
const isDateInRange = (date: Date): boolean => {
  if (props.selectionMode !== 'range') return false
  const range = selectedRange.value

  // Plage complète
  if (range.start && range.end) {
    return isBetween(date, range.start, range.end)
  }
  // Plage en cours de sélection (avec hover)
  if (range.start && hoveredDate.value) {
    const start = isBefore(range.start, hoveredDate.value) ? range.start : hoveredDate.value
    const end = isBefore(range.start, hoveredDate.value) ? hoveredDate.value : range.start
    return isBetween(date, start, end)
  }
  return false
}

const isRangeStart = (date: Date): boolean => {
  const range = selectedRange.value
  if (range.start && range.end) {
    return isBefore(range.start, range.end)
      ? isSameDay(date, range.start)
      : isSameDay(date, range.end)
  }
  return false
}

const isRangeEnd = (date: Date): boolean => {
  const range = selectedRange.value
  if (range.start && range.end) {
    return isBefore(range.start, range.end)
      ? isSameDay(date, range.end)
      : isSameDay(date, range.start)
  }
  return false
}

// ==================== DATES DÉSACTIVÉES ====================
const isDateDisabled = (date: Date): boolean => {
  if (props.minDate && isBefore(date, props.minDate)) return true
  if (props.maxDate && isAfter(date, props.maxDate)) return true

  if (typeof props.disabledDates === 'function') {
    return props.disabledDates(date)
  }
  if (Array.isArray(props.disabledDates)) {
    return props.disabledDates.some((d) => isSameDay(d, date))
  }
  return false
}

const isDateHighlighted = (date: Date): boolean => {
  if (!props.highlightedDates) return false
  return props.highlightedDates.some((d) => isSameDay(d, date))
}

// ==================== NAVIGATION ====================
const headerLabel = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value, 1)
  return dateFormatter.value.format(date)
})

const yearsList = computed(() => {
  const years: number[] = []
  const start = currentYear.value - 6
  for (let i = 0; i < 12; i++) {
    years.push(start + i)
  }
  return years
})

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
  emit('month-change', currentMonth.value, currentYear.value)
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
  emit('month-change', currentMonth.value, currentYear.value)
}

const prevYear = () => {
  currentYear.value--
  emit('year-change', currentYear.value)
}

const nextYear = () => {
  currentYear.value++
  emit('year-change', currentYear.value)
}

const goToToday = () => {
  currentMonth.value = today.getMonth()
  currentYear.value = today.getFullYear()
  emit('month-change', currentMonth.value, currentYear.value)
}

const selectMonth = (month: number) => {
  currentMonth.value = month
  currentView.value = 'month'
  emit('month-change', currentMonth.value, currentYear.value)
  emit('view-change', 'month')
}

const selectYear = (year: number) => {
  currentYear.value = year
  currentView.value = 'year'
  emit('year-change', currentYear.value)
  emit('view-change', 'year')
}

const toggleView = () => {
  currentView.value = currentView.value === 'month' ? 'year' : 'month'
  emit('view-change', currentView.value)
}

// ==================== SÉLECTION ====================
const selectDate = (day: DayCell) => {
  if (day.isDisabled || props.disabled || props.readonly) return

  emit('date-click', day.date)

  if (!day.isCurrentMonth) {
    // Naviguer vers le mois du jour cliqué
    currentMonth.value = day.date.getMonth()
    currentYear.value = day.date.getFullYear()
  }

  if (props.selectionMode === 'single') {
    emit('update:modelValue', day.date)
    return
  }

  // Mode range
  if (!rangeStart.value || selectedRange.value.end) {
    // Début d'une nouvelle plage
    rangeStart.value = day.date
    emit('update:modelValue', { start: day.date, end: null })
  } else {
    // Fin de la plage
    const start = isBefore(rangeStart.value, day.date) ? rangeStart.value : day.date
    const end = isBefore(rangeStart.value, day.date) ? day.date : rangeStart.value
    emit('update:modelValue', { start, end })
    rangeStart.value = null
  }
}

const onDayHover = (day: DayCell) => {
  if (props.selectionMode === 'range' && rangeStart.value && !selectedRange.value.end) {
    hoveredDate.value = day.date
    emit('date-hover', day.date)
  }
}

const onCalendarLeave = () => {
  hoveredDate.value = null
  emit('date-hover', null)
}

// ==================== CLASSES COMPUTED ====================
const sizeClasses = computed(() => ({
  sm: { cell: 'h-8 w-8 text-xs', header: 'text-sm', nav: 'h-7 w-7' },
  md: { cell: 'h-10 w-10 text-sm', header: 'text-base', nav: 'h-8 w-8' },
  lg: { cell: 'h-12 w-12 text-base', header: 'text-lg', nav: 'h-9 w-9' },
}[props.size]))

const variantClasses = computed(() => ({
  default: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm',
  compact: 'bg-white dark:bg-neutral-900',
  outlined: 'bg-transparent border-2 border-primary-500 dark:border-primary-400',
}[props.variant]))

const dayCellClasses = (day: DayCell) => {
  const base = [
    'relative inline-flex items-center justify-center rounded-lg',
    'transition-all duration-150 ease-out',
    'font-medium select-none',
    sizeClasses.value.cell,
  ]

  if (day.isDisabled) {
    base.push('text-neutral-300 dark:text-neutral-700 cursor-not-allowed line-through')
  } else if (day.isSelected) {
    base.push(
      'bg-primary-600 text-white shadow-md',
      'hover:bg-primary-700',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
    )
  } else if (day.isInRange) {
    base.push('bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300')
  } else if (day.isToday) {
    base.push(
      'ring-2 ring-primary-500 text-primary-600 dark:text-primary-400 font-bold',
      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
    )
  } else if (!day.isCurrentMonth && !props.showOutsideDays) {
    base.push('invisible')
  } else if (!day.isCurrentMonth) {
    base.push('text-neutral-400 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800')
  } else if (day.isWeekend) {
    base.push('text-rose-500 dark:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800')
  } else {
    base.push(
      'text-neutral-700 dark:text-neutral-200',
      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
    )
  }

  if (!day.isDisabled && !props.disabled && !props.readonly) {
    base.push('cursor-pointer')
  }

  return base
}

// ==================== WATCHERS ====================
watch(
  () => props.modelValue,
  (val) => {
    if (val instanceof Date) {
      currentMonth.value = val.getMonth()
      currentYear.value = val.getFullYear()
    }
  },
)
</script>

<template>
  <div
    :id="calendarId"
    :aria-label="ariaLabel"
    :class="[
      'inline-flex flex-col rounded-2xl p-4 transition-colors',
      variantClasses,
      disabled && 'opacity-50 pointer-events-none',
    ]"
    @mouseleave="onCalendarLeave"
  >
    <!-- ============ HEADER ============ -->
    <div class="flex items-center justify-between mb-4">
      <button
        type="button"
        :aria-label="currentView === 'month' ? 'Mois précédent' : 'Année précédente'"
        :class="[
          'inline-flex items-center justify-center rounded-lg',
          'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500',
          sizeClasses.nav,
        ]"
        @click="currentView === 'month' ? prevMonth() : prevYear()"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>

      <button
        type="button"
        class="flex items-center gap-1 rounded-lg px-3 py-1 font-semibold text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        :class="sizeClasses.header"
        @click="toggleView"
      >
        <span class="capitalize">{{ headerLabel }}</span>
        <svg class="h-3 w-3 opacity-50" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <button
        type="button"
        :aria-label="currentView === 'month' ? 'Mois suivant' : 'Année suivante'"
        :class="[
          'inline-flex items-center justify-center rounded-lg',
          'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500',
          sizeClasses.nav,
        ]"
        @click="currentView === 'month' ? nextMonth() : nextYear()"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- ============ VUE MOIS ============ -->
    <template v-if="currentView === 'month'">
      <!-- En-têtes des jours -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="(label, idx) in weekdayLabels"
          :key="idx"
          class="flex items-center justify-center text-xs font-semibold uppercase text-neutral-400 dark:text-neutral-500"
          :class="sizeClasses.cell"
        >
          {{ label }}
        </div>
      </div>

      <!-- Grille des jours -->
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="(day, idx) in daysInMonth"
          :key="idx"
          type="button"
          :tabindex="day.isDisabled ? -1 : 0"
          :aria-label="day.date.toDateString()"
          :aria-selected="day.isSelected"
          :aria-current="day.isToday ? 'date' : undefined"
          :disabled="day.isDisabled"
          :class="dayCellClasses(day)"
          @click="selectDate(day)"
          @mouseenter="onDayHover(day)"
        >
          {{ day.day }}
          <!-- Point pour les dates mises en évidence -->
          <span
            v-if="isDateHighlighted(day.date) && !day.isSelected"
            class="absolute bottom-1 h-1 w-1 rounded-full bg-primary-500"
          />
        </button>
      </div>

      <!-- Footer : bouton "Aujourd'hui" -->
      <div class="mt-4 flex justify-center border-t border-neutral-100 dark:border-neutral-800 pt-3">
        <button
          type="button"
          class="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
          @click="goToToday"
        >
          Aujourd'hui
        </button>
      </div>
    </template>

    <!-- ============ VUE ANNÉE ============ -->
    <template v-else>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="(month, idx) in 12"
          :key="idx"
          type="button"
          :class="[
            'rounded-lg py-3 text-sm font-medium transition-colors',
            idx === currentMonth
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800',
          ]"
          @click="selectMonth(idx - 1)"
        >
          {{ new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(currentYear, idx - 1, 1)) }}
        </button>
      </div>
    </template>

    <!-- ============ SLOTS ============ -->
    <slot name="footer" />
  </div>
</template>