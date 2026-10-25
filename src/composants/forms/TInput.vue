<script setup lang="ts">
import { computed } from 'vue'
import TFieldWrapper from './TFieldWrapper.vue'
import { nextUid } from '../../utilitaire/uid'
import { controlBase } from './fieldStyles'

export type InputSize = 'sm' | 'md' | 'lg' | 'xl'

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-8 px-2 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
  xl: 'h-14 px-5 text-lg',
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    type?: string
    id?: string
    label?: string
    placeholder?: string
    hint?: string
    error?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    size?: InputSize
    maxlength?: number
  }>(),
  { modelValue: '', type: 'text', size: 'md', id: undefined },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const fieldId = props.id ?? nextUid('t-input')

const controlClass = computed<string[]>(() => [
  ...controlBase(props.error !== ''),
  sizeClasses[props.size],
])

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <TFieldWrapper :label="label" :hint="hint" :error="error" :required="required" :html-for="fieldId">
    <div class="relative">
      <span v-if="$slots.prefix" class="absolute inset-y-0 left-3 flex items-center text-neutral-400">
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
        :maxlength="maxlength"
        :class="[controlClass, $slots.prefix && 'pl-9', $slots.suffix && 'pr-9']"
        @input="onInput"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      />

      <span v-if="$slots.suffix" class="absolute inset-y-0 right-3 flex items-center text-neutral-400">
        <slot name="suffix" />
      </span>
    </div>
  </TFieldWrapper>
</template>