<script setup lang="ts">
import { computed } from 'vue'
import type { FormField, FieldConfig } from './types-form'
import { isSection } from './types-form'
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
    fields: FormField[]
    mode?: 'create' | 'edit' | 'view'
    submitLabel?: string
    showDelete?: boolean
    loading?: boolean
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

const gridClasses = computed(() => {
  const gapMap = { sm: 'gap-3', md: 'gap-4', lg: 'gap-6' }
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

const getColSpanClasses = (field: FieldConfig) => {
  if (!field.colSpan || field.colSpan === 1) return []
  const spanMap = {
    2: 'md:col-span-2',
    3: 'md:col-span-2 lg:col-span-3',
    full: 'col-span-full',
  }
  return [spanMap[field.colSpan]]
}

// ✅ Helper pour vérifier le type (évite les casts dans le template)
const isInputType = (field: FieldConfig, types: string[]) => 
  types.includes(field.type)
</script>

<template>
  <form @submit.prevent="emit('submit', modelValue)" class="space-y-5">
    <div :class="gridClasses">
      <template v-for="field in fields" :key="isSection(field) ? `section-${field.section}` : field.key">

        <!-- Section (titre de groupe) -->
        <div
          v-if="isSection(field)"
          class="col-span-full pt-1 pb-1"
        >
          <h3 class="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
            {{ field.section }}
          </h3>
          <div class="mt-1 h-px bg-primary-200 dark:bg-primary-700"></div>
        </div>

        <!-- ✅ Champ réel : on cast explicitement en FieldConfig -->
        <div
          v-else
          :class="[
            'flex flex-col gap-0.5',
            ...getColSpanClasses(field as FieldConfig)
          ]"
        >
          <!-- ✅ On utilise la variable castée pour éviter les erreurs -->
          <template v-if="(field as FieldConfig).type">
            <!-- Text / Email / Password / Number / Date -->
            <TInput
              v-if="isInputType(field as FieldConfig, ['text', 'email', 'password', 'number', 'date'])"
              :id="(field as FieldConfig).key"
              :type="(field as FieldConfig).type"
              :modelValue="modelValue[(field as FieldConfig).key]"
              :label="(field as FieldConfig).label"
              :placeholder="(field as FieldConfig).placeholder"
              :required="(field as FieldConfig).required"
              :disabled="isDisabled(field as FieldConfig)"
              @input="onInput((field as FieldConfig).key, $event)"
            />

            <!-- Textarea -->
            <TTextarea
              v-else-if="(field as FieldConfig).type === 'textarea'"
              :id="(field as FieldConfig).key"
              :label="(field as FieldConfig).label"
              :modelValue="modelValue[(field as FieldConfig).key]"
              :placeholder="(field as FieldConfig).placeholder"
              :required="(field as FieldConfig).required"
              :disabled="isDisabled(field as FieldConfig)"
              :class="[...inputClasses, 'resize-y']"
              @input="onInput((field as FieldConfig).key, $event)"
            />

            <!-- Select -->
            <select
              v-else-if="(field as FieldConfig).type === 'select'"
              :id="(field as FieldConfig).key"
              :value="modelValue[(field as FieldConfig).key]"
              :required="(field as FieldConfig).required"
              :disabled="isDisabled(field as FieldConfig)"
              :class="inputClasses"
              @change="onInput((field as FieldConfig).key, $event)"
            >
              <option value="" disabled>
                {{ (field as FieldConfig).placeholder || '— Choisir —' }}
              </option>
              <option
                v-for="opt in (field as FieldConfig).options"
                :key="String(opt.value)"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>

            <!-- Async Select -->
            <TAsyncSelect
              v-else-if="(field as FieldConfig).type === 'async-select'"
              :id="(field as FieldConfig).key"
              :model-value="modelValue[(field as FieldConfig).key]"
              :label="(field as FieldConfig).label"
              :placeholder="(field as FieldConfig).placeholder"
              :required="(field as FieldConfig).required"
              :disabled="isDisabled(field as FieldConfig)"
              :hint="(field as FieldConfig).helpText"
              :load-options="(field as FieldConfig).loadOptions"
              :track-by="(field as FieldConfig).asyncOptions?.trackBy || 'id'"
              :label-by="(field as FieldConfig).asyncOptions?.labelBy || 'libelle'"
              :auto-select-first="(field as FieldConfig).autoSelectFirst"
              @update:model-value="(v) => updateField((field as FieldConfig).key, v)"
            />

            <!-- Toggle -->
            <TToggle
              v-else-if="(field as FieldConfig).type === 'checkbox'"
              :id="(field as FieldConfig).key"
              :model-value="!!modelValue[(field as FieldConfig).key]"
              :label="(field as FieldConfig).placeholder || (field as FieldConfig).label"
              :disabled="isDisabled(field as FieldConfig)"
              variant="switch"
              size="md"
              color="primary"
              @update:model-value="(v) => updateField((field as FieldConfig).key, v)"
            />

            <!-- DatePicker -->
            <TDatePicker
              v-else-if="(field as FieldConfig).type === 'calendar'"
              :id="(field as FieldConfig).key"
              :model-value="modelValue[(field as FieldConfig).key]"
              :label="(field as FieldConfig).label"
              output-format="yyyy-MM-dd"
              :placeholder="(field as FieldConfig).placeholder"
              :required="(field as FieldConfig).required"
              :disabled="isDisabled(field as FieldConfig)"
              :hint="(field as FieldConfig).helpText"
              :selection-mode="(field as FieldConfig).calendarOptions?.selectionMode ?? 'single'"
              :locale="(field as FieldConfig).calendarOptions?.locale ?? 'fr-FR'"
              :first-day-of-week="(field as FieldConfig).calendarOptions?.firstDayOfWeek ?? 1"
              :min-date="(field as FieldConfig).calendarOptions?.minDate ?? null"
              :max-date="(field as FieldConfig).calendarOptions?.maxDate ?? null"
              :disabled-dates="(field as FieldConfig).calendarOptions?.disabledDates"
              :highlighted-dates="(field as FieldConfig).calendarOptions?.highlightedDates"
              :size="(field as FieldConfig).calendarOptions?.size ?? 'md'"
              :variant="(field as FieldConfig).calendarOptions?.variant ?? 'default'"
              :show-outside-days="(field as FieldConfig).calendarOptions?.showOutsideDays ?? true"
              :date-format="(field as FieldConfig).calendarOptions?.dateFormat"
              :clearable="(field as FieldConfig).calendarOptions?.clearable ?? true"
              @update:model-value="(v) => updateField((field as FieldConfig).key, v)"
            />

            <!-- Help text -->
            <p
              v-if="(field as FieldConfig).helpText && (field as FieldConfig).type !== 'calendar'"
              class="text-xs text-gray-400 mt-0.5"
            >
              {{ (field as FieldConfig).helpText }}
            </p>
          </template>
        </div>
      </template>
    </div>

    <!-- Actions -->
    <TLigneHorizontale />
    <div v-if="mode !== 'view'" class="flex items-center justify-end gap-3 pt-1">
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