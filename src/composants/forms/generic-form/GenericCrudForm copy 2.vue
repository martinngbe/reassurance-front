<script setup lang="ts">
import { computed } from 'vue'
import type { FieldConfig } from './types-form'
import TInput from '../TInput.vue'
import TLigneHorizontale from '@/composants/utilitaire/TLigneHorizontale.vue'
import TButton from '../TButton.vue'
import TToggle from '../TToggle.vue'
import TDatePicker from '../TDatePicker.vue'
import TTextarea from '../TTextarea.vue'
import TAsyncSelect from '../TAsyncSelect.vue'

const props = withDefaults(
  defineProps<{
    modelValue: Record<string, any>
    fields: FieldConfig[]
    mode?: 'create' | 'edit' | 'view'
    submitLabel?: string
    showDelete?: boolean
    loading?: boolean
    // 🆕 Nouvelles props pour le layout
    columns?: 1 | 2 | 3 | 4
    responsive?: boolean
    gap?: 'sm' | 'md' | 'lg'
  }>(),
  {
    mode: 'create',
    submitLabel: 'Enregistrer',
    showDelete: false,
    loading: false,
    columns: 1,
    responsive: true,
    gap: 'md',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'submit': [value: Record<string, any>]
  'cancel': []
  'delete': []
}>()

/* ---------- helpers ---------- */
const updateField = (key: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const onInput = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.type === 'number' ? Number(target.value) : target.value
  updateField(key, value)
}

const isDisabled = (field: FieldConfig) =>
  props.mode === 'view' || field.disabled || props.loading

const inputClasses = computed(() => [
  'w-full rounded-lg px-3 py-2 text-sm',
  'transition-colors duration-150',
  'focus:outline-none focus:ring-2 focus:ring-blue-500',
  'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
  'placeholder-gray-400',
  'bg-white dark:bg-neutral-900',
])

// 🆕 Classes pour la grille responsive
const gridClasses = computed(() => {
  const gapMap = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }
  
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }
  
  return [
    'grid',
    gapMap[props.gap],
    props.responsive ? colsMap[props.columns] : `grid-cols-${props.columns}`,
  ]
})

// 🆕 Classes pour colSpan
const getColSpanClasses = (field: FieldConfig) => {
  if (!field.colSpan || field.colSpan === 1) return []
  
  const spanMap = {
    2: 'md:col-span-2',
    3: 'md:col-span-2 lg:col-span-3',
    full: 'col-span-full',
  }
  
  return [spanMap[field.colSpan]]
}

// 🆕 Vérifier si un champ est une section
const isSection = (field: FieldConfig) => field.section !== undefined
</script>

<template>
  <form @submit.prevent="emit('submit', modelValue)" class="space-y-5">
    <!-- 🆕 Grille principale -->
    <div :class="gridClasses">
      <template v-for="field in fields" :key="field.key || field.section">
        
        <!-- 🆕 Titre de section -->
        <div
          v-if="isSection(field)"
          class="col-span-full pt-4 pb-2"
        >
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {{ field.section }}
          </h3>
          <div class="mt-1 h-px bg-gray-200 dark:bg-neutral-700"></div>
        </div>
        
        <!-- Champs normaux (pas une section) -->
        <div
          v-else
          :class="[
            'flex flex-col gap-1',
            ...getColSpanClasses(field)
          ]"
        >
          <!-- Text / Email / Password / Number / Date (input natif) -->
          <TInput
            v-if="['text', 'email', 'password', 'number', 'date'].includes(field.type)"
            :id="field.key"
            :type="field.type"
            :modelValue="modelValue[field.key]"
            :label="field.label"
            :placeholder="field.placeholder"
            :required="field.required"
            :disabled="isDisabled(field)"
            @input="onInput(field.key, $event)"
          />
          
          <!-- Textarea -->
          <TTextarea
            v-else-if="field.type === 'textarea'"
            :id="field.key"
            :label="field.label"
            :modelValue="modelValue[field.key]"
            :placeholder="field.placeholder"
            :required="field.required"
            :disabled="isDisabled(field)"
            :class="[...inputClasses, 'resize-y']"
            @input="onInput(field.key, $event)"
          />
          
          <!-- Select -->
          <select
            v-else-if="field.type === 'select'"
            :id="field.key"
            :value="modelValue[field.key]"
            :required="field.required"
            :disabled="isDisabled(field)"
            :class="inputClasses"
            @change="onInput(field.key, $event)"
          >
            <option value="" disabled>
              {{ field.placeholder || '— Choisir —' }}
            </option>
            <option
              v-for="opt in field.options"
              :key="String(opt.value)"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
          
          <!-- Async Select -->
          <TAsyncSelect
            v-else-if="field.type === 'async-select'"
            :id="field.key"
            :model-value="modelValue[field.key]"
            :label="field.label"
            :placeholder="field.placeholder"
            :required="field.required"
            :disabled="isDisabled(field)"
            :hint="field.helpText"
            :load-options="field.loadOptions"
            :track-by="field.asyncOptions?.trackBy || 'id'"
            :label-by="field.asyncOptions?.labelBy || 'libelle'"
            :auto-select-first="field.autoSelectFirst"
            @update:model-value="(v) => updateField(field.key, v)"
          />
          
          <!-- Toggle -->
          <TToggle
            v-else-if="field.type === 'checkbox'"
            :id="field.key"
            :model-value="!!modelValue[field.key]"
            :label="field.placeholder || field.label"
            :disabled="isDisabled(field)"
            variant="switch"
            size="md"
            color="primary"
            @update:model-value="(v) => updateField(field.key, v)"
          />
          
          <!-- DatePicker -->
          <TDatePicker
            v-else-if="field.type === 'calendar'"
            :id="field.key"
            :model-value="modelValue[field.key]"
            :label="field.label"
            output-format="yyyy-MM-dd"
            :placeholder="field.placeholder"
            :required="field.required"
            :disabled="isDisabled(field)"
            :hint="field.helpText"
            :selection-mode="field.calendarOptions?.selectionMode ?? 'single'"
            :locale="field.calendarOptions?.locale ?? 'fr-FR'"
            :first-day-of-week="field.calendarOptions?.firstDayOfWeek ?? 1"
            :min-date="field.calendarOptions?.minDate ?? null"
            :max-date="field.calendarOptions?.maxDate ?? null"
            :disabled-dates="field.calendarOptions?.disabledDates"
            :highlighted-dates="field.calendarOptions?.highlightedDates"
            :size="field.calendarOptions?.size ?? 'md'"
            :variant="field.calendarOptions?.variant ?? 'default'"
            :show-outside-days="field.calendarOptions?.showOutsideDays ?? true"
            :date-format="field.calendarOptions?.dateFormat"
            :clearable="field.calendarOptions?.clearable ?? true"
            @update:model-value="(v) => updateField(field.key, v)"
          />
          
          <!-- Help text -->
          <p
            v-if="field.helpText && field.type !== 'calendar'"
            class="text-xs text-gray-400 mt-0.5"
          >
            {{ field.helpText }}
          </p>
        </div>
      </template>
    </div>
    
    <!-- ====== Actions ====== -->
    <TLigneHorizontale />
    <div
      v-if="mode !== 'view'"
      class="flex items-center justify-end gap-3 pt-4"
    >
      <TButton
        type="button"
        variant="soft"
        :loading="loading"
        :disabled="loading"
        width="w-46"
        @click="emit('cancel')"
      >
        Annuler
      </TButton>
      <TButton
        type="submit"
        width="w-46"
        :loading="loading"
        :disabled="loading"
      >
        {{ submitLabel }}
      </TButton>
    </div>
  </form>
</template>