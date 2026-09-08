<script setup lang="ts">
import { computed } from 'vue'
import TFieldWrapper from './TFieldWrapper.vue'
import { nextUid } from '../../utils/uid'
import { controlBase } from './fieldStyles'

// TInput
const controlClass = computed<string[]>(() => [...controlBase(props.error !== ''), 'h-10', 'px-3'])

const props = withDefaults(
  defineProps<{
    modelValue?: string
    id?: string
    label?: string
    placeholder?: string
    hint?: string
    error?: string
    rows?: number | string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
  }>(),
  {
    modelValue: '',
    id: undefined,
    label: '',
    placeholder: '',
    hint: '',
    error: '',
    rows: 4,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const fieldId: string = props.id ?? nextUid('t-textarea')
/*
const controlClass = computed<string[]>(() => [
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition',
  'placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400',
  props.error
    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/25'
    : 'border-neutral-300 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25',
])
*/
function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
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
    <textarea
      :id="fieldId"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :class="controlClass"
      @input="onInput"
    />
  </TFieldWrapper>
</template>
