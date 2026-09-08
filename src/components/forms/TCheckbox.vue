<script setup lang="ts">
import { computed } from 'vue'
import type { CheckboxModel, OptionValue } from './common'

const props = withDefaults(
  defineProps<{
    modelValue?: CheckboxModel
    value?: OptionValue
    label?: string
    description?: string
    disabled?: boolean
  }>(),
  {
    modelValue: false,
    value: undefined,
    label: '',
    description: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: CheckboxModel): void
}>()

const checked = computed<boolean>(() =>
  Array.isArray(props.modelValue)
    ? props.modelValue.includes(props.value as OptionValue)
    : Boolean(props.modelValue),
)

function onChange(event: Event): void {
  const target = event.target as HTMLInputElement
  if (Array.isArray(props.modelValue)) {
    const next: OptionValue[] = [...props.modelValue]
    const index = next.indexOf(props.value as OptionValue)
    if (target.checked && index === -1) next.push(props.value as OptionValue)
    if (!target.checked && index !== -1) next.splice(index, 1)
    emit('update:modelValue', next)
  } else {
    emit('update:modelValue', target.checked)
  }
}
</script>

<template>
  <label
    class="group inline-flex cursor-pointer items-start gap-3"
    :class="disabled && 'cursor-not-allowed opacity-60'"
  >
    <span class="relative inline-flex h-5 w-5 shrink-0">
      <input
        type="checkbox"
        class="peer sr-only"
        :checked="checked"
        :value="value"
        :disabled="disabled"
        @change="onChange"
      />
      <span
        class="absolute inset-0 rounded-md border border-neutral-300 bg-white shadow-sm transition-colors duration-150 group-hover:border-primary-400 peer-checked:border-primary-500 peer-checked:bg-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40 peer-focus-visible:ring-offset-1"
      />
      <svg
        class="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-primary-contrast opacity-0 transition-opacity peer-checked:opacity-100"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          d="M2 6.5 4.5 9 10 3"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span v-if="label || $slots.default" class="select-none">
      <span class="text-sm font-medium text-neutral-700 dark:text-neutral-200"
        ><slot>{{ label }}</slot></span
      >
      <span v-if="description" class="mt-0.5 block text-xs text-neutral-400">{{
        description
      }}</span>
    </span>
  </label>
</template>
