<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import TCalendar from './TCalendar.vue'
import TModal from '@/components/display/TModal.vue'
import TButton from './TButton.vue'
import type { CalendarDateRange, CalendarSelectionMode, CalendarSize, CalendarVariant } from './TCalendar.vue'

// ==================== TYPES ====================
export type DatePickerOutputFormat = 'iso' | 'date'

// ==================== PROPS ====================
const props = withDefaults(
  defineProps<{
    modelValue?: Date | CalendarDateRange | string | null
    selectionMode?: CalendarSelectionMode
    size?: CalendarSize
    variant?: CalendarVariant
    locale?: string
    firstDayOfWeek?: 0 | 1
    minDate?: Date | string | null
    maxDate?: Date | string | null
    disabledDates?: Date[] | ((date: Date) => boolean)
    highlightedDates?: Date[]
    placeholder?: string
    label?: string
    hint?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    clearable?: boolean
    outputFormat?: DatePickerOutputFormat
    dateFormat?: Intl.DateTimeFormatOptions
    id?: string
    showOutsideDays?: boolean
  }>(),
  {
    modelValue: null,
    selectionMode: 'single',
    size: 'md',
    variant: 'default',
    locale: 'fr-FR',
    firstDayOfWeek: 1,
    minDate: null,
    maxDate: null,
    placeholder: 'Sélectionner une date',
    clearable: true,
    outputFormat: 'iso',
    showOutsideDays: true,
    dateFormat: () => ({ day: '2-digit', month: 'long', year: 'numeric' }),
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Date | CalendarDateRange | string | null]
  'open': []
  'close': []
}>()

// ==================== ÉTAT ====================
const autoId = useId()
const inputId = computed(() => props.id ?? autoId)
const isModalOpen = ref(false)

// ==================== CONVERSIONS ====================
const toDate = (value: any): Date | null => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'string') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

const toRange = (value: any): CalendarDateRange | null => {
  if (!value || typeof value !== 'object' || !('start' in value)) return null
  return {
    start: toDate(value.start),
    end: toDate(value.end),
  }
}

// Valeur normalisée passée au TCalendar (toujours Date ou Range de Dates)
const calendarValue = computed<Date | CalendarDateRange | null>(() => {
  if (props.selectionMode === 'range') {
    return toRange(props.modelValue)
  }
  return toDate(props.modelValue)
})

// ==================== FORMATAGE AFFICHAGE ====================
const displayFormatter = computed(() => {
  const opts = typeof props.dateFormat === 'function' ? props.dateFormat() : props.dateFormat
  return new Intl.DateTimeFormat(props.locale, opts)
})

const displayValue = computed(() => {
  if (props.selectionMode === 'single') {
    const d = toDate(props.modelValue)
    return d ? displayFormatter.value.format(d) : ''
  }
  const range = toRange(props.modelValue)
  if (!range?.start) return ''
  if (!range.end) return `À partir du ${displayFormatter.value.format(range.start)}`
  return `${displayFormatter.value.format(range.start)} → ${displayFormatter.value.format(range.end)}`
})

// ==================== OUVERTURE / FERMETURE ====================
const openModal = () => {
  if (props.disabled || props.readonly) return
  isModalOpen.value = true
  emit('open')
}

const closeModal = () => {
  isModalOpen.value = false
  emit('close')
}

// ==================== SÉLECTION ====================
const onCalendarUpdate = (value: Date | CalendarDateRange | null) => {
  let output: any = value

  if (value instanceof Date) {
    output = props.outputFormat === 'iso' ? value.toISOString() : value
  } else if (value && 'start' in value) {
    output = {
      start: value.start ? (props.outputFormat === 'iso' ? value.start.toISOString() : value.start) : null,
      end: value.end ? (props.outputFormat === 'iso' ? value.end.toISOString() : value.end) : null,
    }
  }

  emit('update:modelValue', output)

  // Fermeture automatique en mode single après sélection
  if (props.selectionMode === 'single' && value) {
    closeModal()
  }
}

const confirmRange = () => {
  // En mode range, on ferme manuellement via le bouton "Valider"
  closeModal()
}

const clear = (e: Event) => {
  e.stopPropagation()
  emit('update:modelValue', null)
}

const goToToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const output = props.outputFormat === 'iso' ? today.toISOString() : today
  emit('update:modelValue', output)
  closeModal()
}

// ==================== TITRE MODAL ====================
const modalTitle = computed(() => {
  if (props.selectionMode === 'range') return 'Sélectionner une période'
  return 'Sélectionner une date'
})

const isRangeComplete = computed(() => {
  const range = toRange(props.modelValue)
  return !!range?.start && !!range.end
})
</script>

<template>
  <div class="flex flex-col gap-1">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Input cliquable -->
    <button
      :id="inputId"
      type="button"
      :disabled="disabled"
      :readonly="readonly"
      class="group flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      :class="[
        disabled
          ? 'cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600'
          : 'cursor-pointer border-neutral-300 hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-500',
      ]"
      @click="openModal"
    >
      <!-- Icône calendrier -->
      <svg
        class="h-5 w-5 shrink-0 text-neutral-400 group-hover:text-primary-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
          clip-rule="evenodd"
        />
      </svg>

      <!-- Valeur affichée -->
      <span
        class="flex-1 truncate text-neutral-800 dark:text-neutral-100"
        :class="!displayValue && 'text-neutral-400'"
      >
        {{ displayValue || placeholder }}
      </span>

      <!-- Bouton effacer -->
      <span
        v-if="clearable && displayValue && !disabled"
        class="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        @click="clear"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </button>

    <!-- Hint -->
    <p v-if="hint" class="text-xs text-neutral-400">
      {{ hint }}
    </p>

    <!-- ============ MODAL ============ -->
    <TModal v-model="isModalOpen" :title="modalTitle" size="md">
      <div class="flex flex-col items-center gap-4">
        <TCalendar
          :model-value="calendarValue"
          :selection-mode="selectionMode"
          :size="size"
          :variant="variant"
          :locale="locale"
          :first-day-of-week="firstDayOfWeek"
          :min-date="toDate(minDate)"
          :max-date="toDate(maxDate)"
          :disabled-dates="disabledDates"
          :highlighted-dates="highlightedDates"
          :show-outside-days="showOutsideDays"
          @update:model-value="onCalendarUpdate"
        />

        <!-- Footer d'actions -->
        <div class="flex w-full items-center justify-between gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <TButton
            type="button"
            variant="soft"
            size="sm"
            @click="goToToday"
          >
            Aujourd'hui
          </TButton>

          <div class="flex gap-2">
            <TButton
              v-if="clearable && displayValue"
              type="button"
              variant="soft"
              size="sm"
              @click="clear($event as any); closeModal()"
            >
              Effacer
            </TButton>

            <TButton
              v-if="selectionMode === 'range'"
              type="button"
              variant="primary"
              size="sm"
              :disabled="!isRangeComplete"
              @click="confirmRange"
            >
              Valider
            </TButton>

            <TButton
              type="button"
              variant="soft"
              size="sm"
              @click="closeModal"
            >
              Fermer
            </TButton>
          </div>
        </div>
      </div>
    </TModal>
  </div>
</template>