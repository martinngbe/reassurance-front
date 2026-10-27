<script setup lang="ts">
import { computed } from 'vue'
import  {isSection,type FormField,type FieldConfig } from '../generic-form/types-form';
import TBadge from '@/composants/display/TBadge.vue';
//import { isSection, type FieldConfig, type FormField } from './types-form'

const props = withDefaults(
  defineProps<{
    modelValue: Record<string, any>
    fields: FormField[]
    showHeader?: boolean
    title?: string
    subtitle?: string
    loading?: boolean
    columns?: 1 | 2 | 3 | 4
    responsive?: boolean
    gap?: 'sm' | 'md' | 'lg'
    avatar?: string
    status?: {
      label: string
      variant: 'success' | 'warning' | 'error' | 'info' | 'default'
    }
  }>(),
  {
    showHeader: true,
    loading: false,
    columns: 2,
    responsive: true,
    gap: 'md',
  },
)

defineEmits<{
  edit: []
  delete: []
  back: []
}>()

/* ---------- helpers grille ---------- */
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

/* ---------- ✅ tailles de caractères ---------- */
const SIZE_MAP = {
  xs: {
    label: 'text-[10px] leading-4',
    value: 'text-[11px] leading-4',
    hint: 'text-[10px]',
    box: 'px-2 py-1',
    icon: 'h-3.5 w-3.5',
    radius: 'rounded-md',
  },
  sm: {
    label: 'text-[11px] leading-4',
    value: 'text-xs leading-5',
    hint: 'text-[11px]',
    box: 'px-2 py-1.5',
    icon: 'h-4 w-4',
    radius: 'rounded-md',
  },
  md: {
    label: 'text-xs leading-5',
    value: 'text-sm leading-6',
    hint: 'text-xs',
    box: 'px-3 py-2',
    icon: 'h-5 w-5',
    radius: 'rounded-lg',
  },
  lg: {
    label: 'text-sm leading-5',
    value: 'text-base leading-7',
    hint: 'text-sm',
    box: 'px-4 py-3',
    icon: 'h-6 w-6',
    radius: 'rounded-lg',
  },
   // ✅ NOUVEAU : taille "mise en avant"
  xl: {
    label: 'text-xs font-semibold text-gray-400 dark:text-gray-500',
    value: 'text-lg font-bold leading-7 tracking-tight',
    hint: 'text-xs',
    box: 'px-4 py-3',
    icon: 'h-6 w-6',
    radius: 'rounded-lg',
  },
  // ✅ NOUVEAU : taille "hero" (très visible)
  '2xl': {
    label: 'text-xs font-semibold text-gray-400 dark:text-gray-500',
    value: 'text-2xl font-extrabold leading-8 tracking-tight',
    hint: 'text-xs',
    box: 'px-5 py-4',
    icon: 'h-7 w-7',
    radius: 'rounded-xl',
  },
} as const

type SizeKey = keyof typeof SIZE_MAP

const getSizeKey = (field: FieldConfig): SizeKey => {
  const size = field.size as string | undefined
  return size && size in SIZE_MAP ? (size as SizeKey) : 'md'
}

const sizeClasses = (field: FieldConfig) => SIZE_MAP[getSizeKey(field)]

/* ---------- formatage ---------- */
const formatValue = (field: FieldConfig, value: any): string => {
  if (value === null || value === undefined || value === '') return '—'

  switch (field.type) {
    case 'calendar': {
      // TDatePicker renvoie une chaîne 'yyyy-MM-dd' (output-format)
      const date =
        value instanceof Date
          ? value
          : typeof value === 'string' || typeof value === 'number'
            ? new Date(value)
            : null

      if (date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }
      return String(value)
    }

    case 'number': {
      const decimals = field.numberOptions?.decimals ?? 0
      const num = Number(value)
      if (isNaN(num)) return String(value)
      return num.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    }

    case 'checkbox':
      return value ? 'Oui' : 'Non'

    case 'select': {
      if (field.options && Array.isArray(field.options)) {
        const option = field.options.find((opt) => opt.value === value)
        if (option) return option.label
      }
      return String(value)
    }

    case 'async-select': {
      if (typeof value === 'object' && value !== null) {
        const labelBy = field.asyncOptions?.labelBy || 'libelle'
        return value[labelBy] ?? String(value)
      }
      return String(value)
    }

    default:
      return String(value)
  }
}

const getDisplayValue = (field: FieldConfig): string =>
  formatValue(field, props.modelValue[field.key])
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800"
  >
    <!-- Header -->
    <div
      v-if="showHeader && (title || subtitle)"
      class="px-6 py-5 border-b border-gray-200 dark:border-neutral-800"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-4 flex-1 min-w-0">
          <div v-if="avatar" class="flex-shrink-0">
            <img
              :src="avatar"
              :alt="title"
              class="w-16 h-16 rounded-full object-cover border-2 border-primary-100 dark:border-primary-900"
            />
          </div>

          <div class="flex-1 min-w-0">
            <h2
              v-if="title"
              class="text-xl font-semibold text-gray-900 dark:text-white break-words"
            >
              {{ title }}
            </h2>
            <p
              v-if="subtitle"
              class="mt-1 text-sm text-gray-500 dark:text-gray-400"
            >
              {{ subtitle }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div
      class="px-6 py-5"
      :aria-busy="loading"
    >
      <div :class="gridClasses">
        <template
          v-for="field in fields"
          :key="isSection(field) ? `section-${field.section}` : field.key"
        >
          <!-- Section -->
          <div
            v-if="isSection(field)"
            class="col-span-full pt-2 pb-1"
          >
            <h3
              class="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide"
            >
              {{ field.section }}
            </h3>
            <div class="mt-1 h-px bg-primary-200 dark:bg-primary-700"></div>
          </div>

          <!-- Champ -->
          <div
            v-else
            :class="[
              'flex flex-col gap-1 min-w-0',
              ...getColSpanClasses(field as FieldConfig),
            ]"
          >
            <template v-if="(field as FieldConfig).type">
              <component
                :is="(field as FieldConfig).type === 'textarea' ? 'div' : 'label'"
                :for="(field as FieldConfig).type === 'textarea' ? undefined : (field as FieldConfig).key"
                :class="[
                  'font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide',
                  sizeClasses(field as FieldConfig).label,
                ]"
              >
                {{ (field as FieldConfig).label }}
                <span
                  v-if="(field as FieldConfig).required"
                  class="text-red-500 ml-0.5"
                >*</span>
              </component>

              <!-- Valeur -->
              <div
                :class="[
                  'font-medium text-gray-900 dark:text-white',
                  sizeClasses(field as FieldConfig).value,
                ]"
              >
                <!-- Checkbox -->
                <div
                  v-if="(field as FieldConfig).type === 'checkbox'"
                  class="flex items-center gap-2"
                >
                 <TBadge v-if="modelValue[(field as FieldConfig).key]" 
                  size="2xl" color="success" dot>Oui</TBadge>
                 <TBadge v-else color="danger" size="2xl" dot>Non</TBadge>
     
                </div>

                <!-- Textarea / bloc long -->
                <div
                  v-else-if="(field as FieldConfig).type === 'textarea'"
                  :class="[
                    'bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700',
                    sizeClasses(field as FieldConfig).box,
                    sizeClasses(field as FieldConfig).radius,
                  ]"
                >
                  <p class="whitespace-pre-wrap break-words">
                    {{ getDisplayValue(field as FieldConfig) }}
                  </p>
                </div>

                <!-- Autres types -->
                <p v-else class="break-words">
                  {{ getDisplayValue(field as FieldConfig) }}
                </p>
              </div>

              <!-- Help text -->
              <p
                v-if="(field as FieldConfig).helpText"
                :class="[
                  'text-gray-400 dark:text-gray-500',
                  sizeClasses(field as FieldConfig).hint,
                ]"
              >
                {{ (field as FieldConfig).helpText }}
              </p>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>