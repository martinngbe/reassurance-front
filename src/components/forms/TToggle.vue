<script setup lang="ts">
import { computed, useId } from 'vue'

type ToggleVariant = 'switch' | 'pill' | 'square'
type ToggleSize = 'sm' | 'md' | 'lg'
type ToggleColor = 'primary' | 'success' | 'danger' | 'warning' | 'neutral'
type LabelPosition = 'left' | 'right'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    variant?: ToggleVariant
    size?: ToggleSize
    color?: ToggleColor
    label?: string
    labelPosition?: LabelPosition
    disabled?: boolean
    name?: string
    id?: string
  }>(),
  {
    modelValue: false,
    variant: 'switch',
    size: 'md',
    color: 'primary',
    labelPosition: 'right',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const autoId = useId()
const inputId = computed(() => props.id ?? autoId)

const isChecked = computed(() => !!props.modelValue)

const toggle = () => {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    toggle()
  }
}

/* ---------- Tailwind maps ---------- */
const sizeClasses = computed(() => {
  const map = {
    switch: {
      sm: { track: 'h-5 w-9', thumb: 'h-4 w-4', translate: 'translate-x-4', label: 'text-xs' },
      md: { track: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5', label: 'text-sm' },
      lg: { track: 'h-7 w-14', thumb: 'h-6 w-6', translate: 'translate-x-7', label: 'text-base' },
    },
    pill: {
      sm: { track: 'h-5 w-10 rounded-full', thumb: 'h-4 w-4', translate: 'translate-x-5', label: 'text-xs' },
      md: { track: 'h-6 w-12 rounded-full', thumb: 'h-5 w-5', translate: 'translate-x-6', label: 'text-sm' },
      lg: { track: 'h-8 w-16 rounded-full', thumb: 'h-6 w-6', translate: 'translate-x-9', label: 'text-base' },
    },
    square: {
      sm: { track: 'h-5 w-9 rounded-sm', thumb: 'h-4 w-4 rounded-sm', translate: 'translate-x-4', label: 'text-xs' },
      md: { track: 'h-6 w-11 rounded', thumb: 'h-5 w-5 rounded', translate: 'translate-x-5', label: 'text-sm' },
      lg: { track: 'h-7 w-14 rounded-md', thumb: 'h-6 w-6 rounded-md', translate: 'translate-x-7', label: 'text-base' },
    },
  }
  return map[props.variant][props.size]
})

const colorClasses = computed(() => {
  const map = {
    primary: 'bg-primary-600 dark:bg-primary-500',
    success: 'bg-emerald-600 dark:bg-emerald-500',
    danger: 'bg-red-600 dark:bg-red-500',
    warning: 'bg-amber-500 dark:bg-amber-400',
    neutral: 'bg-neutral-600 dark:bg-neutral-500',
  }
  return map[props.color]
})

const trackClasses = computed(() => [
  sizeClasses.value.track,
  'relative inline-flex shrink-0 cursor-pointer items-center rounded-full',
  'border-2 border-transparent transition-colors duration-300 ease-in-out',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
  isChecked.value
    ? colorClasses.value
    : 'bg-neutral-300 dark:bg-neutral-700',
  props.disabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90',
])

const thumbClasses = computed(() => [
  'inline-flex items-center justify-center rounded-full bg-white shadow-md',
  'ring-0 transition-transform duration-300 ease-in-out',
  sizeClasses.value.thumb,
  isChecked.value ? sizeClasses.value.translate : 'translate-x-1',
  !props.disabled && 'group-hover:scale-95',
])
</script>

<template>
  <div class="inline-flex items-center" :class="{ 'opacity-60': disabled }">
    <!-- Label à gauche -->
    <label
      v-if="label && labelPosition === 'left'"
      :for="inputId"
      class="mr-3 select-none"
      :class="[sizeClasses.label, disabled ? 'cursor-not-allowed' : 'cursor-pointer', 'text-neutral-700 dark:text-neutral-200']"
    >
      <slot name="label">{{ label }}</slot>
    </label>

    <!-- Track -->
    <button
      :id="inputId"
      type="button"
      role="switch"
      :aria-checked="isChecked"
      :aria-label="label"
      :aria-disabled="disabled"
      :disabled="disabled"
      :name="name"
      :tabindex="disabled ? -1 : 0"
      class="group"
      :class="trackClasses"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span :class="thumbClasses">
        <!-- Icône ON -->
        <svg
          v-if="isChecked && variant === 'switch'"
          class="h-2.5 w-2.5 text-primary-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        <!-- Icône OFF -->
        <svg
          v-else-if="!isChecked && variant === 'switch'"
          class="h-2.5 w-2.5 text-neutral-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </button>

    <!-- Label à droite -->
    <label
      v-if="label && labelPosition === 'right'"
      :for="inputId"
      class="ml-3 select-none"
      :class="[sizeClasses.label, disabled ? 'cursor-not-allowed' : 'cursor-pointer', 'text-neutral-700 dark:text-neutral-200']"
    >
      <slot name="label">{{ label }}</slot>
    </label>
  </div>
</template>