<script setup lang="ts">
import { computed } from 'vue'
import type { FieldConfig } from './types-form'
import TInput from '../TInput.vue'
import TLigneHorizontale from '@/components/utilitaire/TLigneHorizontale.vue'
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
  }>(),
  {
    mode: 'create',
    submitLabel: 'Enregistrer',
    showDelete: false,
    loading: false,
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
  'bg-white dark:bg-neutral-900',  // Fond sans bordure
])

</script>

<template>
  <form @submit.prevent="emit('submit', modelValue)" class="space-y-5">
    <!-- ====== Champs dynamiques ====== -->
    <div
      v-for="field in fields"
      :key="field.key"
      class="flex flex-col gap-1"
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
        
        <!-- 🆕 Async Select (Scroll infini) -->
        <!--  Async Select (Scroll infini pour grandes listes) -->
      <!-- <TAsyncSelect
        v-else-if="field.type === 'async-select'"
        :id="field.key"
        :model-value="modelValue[field.key]"
        :label="field.label"
        :placeholder="field.placeholder"
        :required="field.required"
        :disabled="isDisabled(field)"
        :hint="field.helpText"
        :resolve="field.resolve"
        :track-by="field.asyncOptions?.trackBy || 'id'"
        :label-by="field.asyncOptions?.labelBy || 'libelle'"
        @update:model-value="(v) => updateField(field.key, v)"
      /> -->
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
  :label-by="field.asyncOptions?.labelBy || 'label'"
  @update:model-value="(v) => updateField(field.key, v)"
/>

      <!-- Toggle (checkbox moderne) -->
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

      <!-- 🆕 DatePicker (s'ouvre dans un TModal) -->
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

      <!-- Help text (sauf pour calendar qui a son propre hint) -->
      <p
        v-if="field.helpText && field.type !== 'calendar'"
        class="text-xs text-gray-400 mt-0.5"
      >
        {{ field.helpText }}
      </p>
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