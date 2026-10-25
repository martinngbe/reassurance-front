<script setup lang="ts">
import { computed } from 'vue'
import TFieldWrapper from './TFieldWrapper.vue'
import { nextUid } from '../../utilitaire/uid.ts'
import { controlBase } from './fieldStyles'

// TInput
const controlClass = computed<string[]>(() => [...controlBase(props.error !== ''), 'h-10', 'px-3'])
type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | (string & {})

const props = withDefaults(
  defineProps<{
    modelValue?: string
    type?: InputType
    id?: string
    label?: string
    placeholder?: string
    hint?: string
    error?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
  }>(),
  {
    modelValue: '',
    type: 'text',
    id: undefined,
    label: '',
    placeholder: '',
    hint: '',
    error: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const fieldId: string = props.id ?? nextUid('t-input')

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
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
      <span
        v-if="$slots.prefix"
        class="absolute inset-y-0 left-3 flex items-center text-neutral-400"
      >
        <slot name="prefix" />
      </span>
      <input
        :id="fieldId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="[controlClass, $slots.prefix && 'pl-9', $slots.suffix && 'pr-9']"
        @input="onInput"
      />
      <span
        v-if="$slots.suffix"
        class="absolute inset-y-0 right-3 flex items-center text-neutral-400"
      >
        <slot name="suffix" />
      </span>
    </div>
  </TFieldWrapper>
</template>
