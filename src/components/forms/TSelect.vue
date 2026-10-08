<script setup lang="ts">
import { computed } from 'vue'
import TFieldWrapper from './TFieldWrapper.vue'
import { nextUid } from '../../utilitaire/uid.ts'
import { normalizeOptions, type OptionsInput } from './common'
import { controlBase } from './fieldStyles'

// TInput
const controlClass = computed<string[]>(() => [...controlBase(props.error !== ''), 'h-10', 'px-3'])

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    options?: OptionsInput<string | number>
    placeholder?: string
    id?: string
    label?: string
    hint?: string
    error?: string
    required?: boolean
    disabled?: boolean
  }>(),
  {
    modelValue: null,
    options: () => [],
    placeholder: 'Sélectionner…',
    id: undefined,
    label: '',
    hint: '',
    error: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()

const fieldId: string = props.id ?? nextUid('t-select')
const normalized = computed(() => normalizeOptions(props.options))
/*
const controlClass = computed<string[]>(() => [
  'h-10 w-full appearance-none rounded-lg border bg-white pl-3 pr-9 text-sm text-neutral-900 shadow-sm outline-none transition',
  'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400',
  props.error
    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/25'
    : 'border-neutral-300 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25',
])
*/
function onChange(event: Event): void {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <TFieldWrapper
    :label="label"
    :hint="hint"
    :error="error"
    :required="required"
    :html-for="fieldId"
  >
    <div class="relative">
      <select
        :id="fieldId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="controlClass"
        @change="onChange"
      >
        <option v-if="placeholder" value="" disabled hidden>{{ placeholder }}</option>
        <option
          v-for="o in normalized"
          :key="String(o.value)"
          :value="o.value"
          :disabled="o.disabled"
        >
          {{ o.label }}
        </option>
      </select>
      <svg
        class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  </TFieldWrapper>
</template>
