<script setup lang="ts">
import { computed } from 'vue'
import TLigneHorizontale from '@/composants/utilitaire/TLigneHorizontale.vue'
import { isSection, type FieldConfig, type FormField } from '../generic-form/types-form.ts';

const props = withDefaults(
  defineProps<{
    modelValue: Record<string, any>
    fields: FormField[]
    showHeader?:boolean
    title?: string
    subtitle?: string
    loading?: boolean
    columns?: 1 | 2 | 3 | 4
    responsive?: boolean
    gap?: 'sm' | 'md' | 'lg'
    avatar?: string
    status?: { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }
  }>(),
  {
    title: undefined, //'Détails
    showHeader:true,    
    loading: false,
    columns: 2,
    responsive: true,
    gap: 'md',
  },
)

const emit = defineEmits<{
  edit: []
  delete: []
  back: []
}>()

/* ---------- helpers ---------- */
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

const formatValue = (field: FieldConfig, value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  switch (field.type) {
    case 'calendar':
      if (value instanceof Date) {
        return value.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }
      return String(value)

    case 'number':
      const decimals = field.numberOptions?.decimals ?? 0
      const num = Number(value)
      if (isNaN(num)) return String(value)
      return num.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })

    case 'checkbox':
      return value ? 'Oui' : 'Non'

    case 'select':
      if (field.options && Array.isArray(field.options)) {
        const option = field.options.find((opt) => opt.value === value)
        return option ? option.label : String(value)
      }
      return String(value)

    case 'async-select':
      if (typeof value === 'object' && value !== null) {
        const labelBy = field.asyncOptions?.labelBy || 'libelle'
        return value[labelBy] || JSON.stringify(value)
      }
      return String(value)

    default:
      return String(value)
  }
}

const getDisplayValue = (field: FieldConfig): any => {
  const value = props.modelValue[field.key]
  return formatValue(field, value)
}
</script>

<template>
  <div class="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800">
    <!-- Header -->
    <div v-if="props.showHeader" class="px-6 py-5 border-b border-gray-200 dark:border-neutral-800">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-4 flex-1 min-w-0">
        
          <!-- Titre et sous-titre -->
          <div class="flex-1 min-w-0" v-if="props.title">
            <div class="flex items-center gap-3 flex-wrap">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white truncate">
                {{ title }}
              </h2>
              <!--TBadge
                v-if="status"
                :variant="status.variant"
                size="md"
              >
                {{ status.label }}
              </TBadge-->
            </div>
            <p v-if="subtitle" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ subtitle }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-6 py-5">
      <div :class="gridClasses">
        <template v-for="field in fields" :key="isSection(field) ? `section-${field.section}` : field.key">
          <!-- Section (titre de groupe) -->
          <div
            v-if="isSection(field)"
            class="col-span-full pt-2 pb-1"
          >
            <h3 class="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
              {{ field.section }}
            </h3>
            <div class="mt-1 h-px bg-primary-200 dark:bg-primary-700"></div>
          </div>

          <!-- Champ réel -->
          <div
            v-else
            :class="[
              'flex flex-col gap-1',
              ...getColSpanClasses(field as FieldConfig)
            ]"
          >
            <template v-if="(field as FieldConfig).type">
              <!-- Label -->
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {{ (field as FieldConfig).label }}
                <span v-if="(field as FieldConfig).required" class="text-red-500 ml-0.5">*</span>
              </label>

              <!-- Valeur -->
              <div class="text-sm text-gray-900 dark:text-white font-medium">
                <!-- Checkbox avec icône -->
                <div v-if="(field as FieldConfig).type === 'checkbox'" class="flex items-center gap-2">
                  <svg
                    v-if="modelValue[(field as FieldConfig).key]"
                    class="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg
                    v-else
                    class="w-5 h-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span :class="modelValue[(field as FieldConfig).key] ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
                    {{ getDisplayValue(field as FieldConfig) }}
                  </span>
                </div>

                <!-- Textarea avec fond -->
                <div
                  v-else-if="(field as FieldConfig).type === 'textarea'"
                  class="bg-gray-50 dark:bg-neutral-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-neutral-700"
                >
                  <p class="whitespace-pre-wrap">{{ getDisplayValue(field as FieldConfig) }}</p>
                </div>

                <!-- Autres types -->
                <p v-else class="break-words">
                  {{ getDisplayValue(field as FieldConfig) }}
                </p>
              </div>

              <!-- Help text -->
              <p
                v-if="(field as FieldConfig).helpText"
                class="text-xs text-gray-400 dark:text-gray-500"
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