<script setup lang="ts">
import { computed } from 'vue'
import type { OptionValue } from './common'

const props = withDefaults(
  defineProps<{
    modelValue?: OptionValue | null
    value: OptionValue
    name?: string
    label?: string
    description?: string
    disabled?: boolean
  }>(),
  {
    modelValue: null,
    name: undefined,
    label: '',
    description: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: OptionValue): void
}>()

const checked = computed<boolean>(() => props.modelValue === props.value)
</script>

<template>
  <label
    class="group inline-flex cursor-pointer items-start gap-3"
    :class="disabled && 'cursor-not-allowed opacity-60'"
  >
    <span class="relative inline-flex h-5 w-5 shrink-0">
      <input
        type="radio"
        class="peer sr-only"
        :name="name"
        :value="value"
        :checked="checked"
        :disabled="disabled"
        @change="emit('update:modelValue', value)"
      />
      <span
        class="absolute inset-0 rounded-full border-2 border-neutral-300 bg-white shadow-sm transition-colors duration-150 group-hover:border-primary-400 peer-checked:border-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40 peer-focus-visible:ring-offset-1"
      />
      <span
        class="pointer-events-none absolute inset-0 m-auto h-2.5 w-2.5 scale-0 rounded-full bg-primary-500 transition-transform duration-150 peer-checked:scale-100"
      />
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
