<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonSize, ButtonType, ButtonVariant } from './common'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    type?: ButtonType
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  {
    variant: 'solid',
    size: 'md',
    type: 'button',
    loading: false,
    disabled: false,
    block: false,
  },
)

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
}
const variants: Record<ButtonVariant, string> = {
  solid:
    'bg-primary-500 text-primary-contrast shadow-sm hover:bg-primary-600 active:bg-primary-700 focus-visible:outline-primary-500',
  soft: 'bg-primary-500/10 text-primary-700 hover:bg-primary-500/20 active:bg-primary-500/30 dark:text-primary-300 focus-visible:outline-primary-500',
  outline:
    'border border-primary-500/60 text-primary-600 hover:bg-primary-500/10 active:bg-primary-500/20 dark:text-primary-300 focus-visible:outline-primary-500',
  ghost:
    'text-primary-600 hover:bg-primary-500/10 active:bg-primary-500/20 dark:text-primary-300 focus-visible:outline-primary-500',
  link: 'text-primary-600 underline-offset-4 hover:underline dark:text-primary-300 focus-visible:outline-primary-500',
}

const classes = computed<Array<string | false>>(() => [
  'inline-flex select-none items-center justify-center font-medium transition-colors duration-150',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
  props.variant === 'link' ? 'h-auto p-0' : sizes[props.size],
  variants[props.variant],
  props.block && 'w-full',
])
</script>

<template>
  <button :type="type" :disabled="disabled || loading" :class="classes">
    <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
    <slot />
  </button>
</template>
