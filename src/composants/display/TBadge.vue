<script setup lang="ts">
import { computed } from 'vue'

type BadgeVariant = 'solid' | 'soft' | 'outline'
type BadgeColor = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
type BadgeSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariant
    color?: BadgeColor
    size?: BadgeSize
    dot?: boolean
  }>(),
  { variant: 'soft', color: 'primary', size: 'md', dot: false },
)

const sizes: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm',
  xl: 'px-2.5 py-1 text-lg',
   "2xl": 'px-2.5 py-1 text-xl',
}

const palettes: Record<BadgeColor, Record<BadgeVariant, string>> = {
  primary: {
    solid: 'bg-primary-500 text-primary-contrast',
    soft: 'bg-primary-500/10 text-primary-700 dark:text-primary-300',
    outline: 'border border-primary-500/60 text-primary-600 dark:text-primary-300',
  },
  neutral: {
    solid: 'bg-neutral-600 text-white dark:bg-neutral-200 dark:text-neutral-900',
    soft: 'bg-neutral-500/10 text-neutral-700 dark:text-neutral-300',
    outline: 'border border-neutral-400 text-neutral-600 dark:text-neutral-300',
  },
  success: {
    solid: 'bg-green-600 text-white',
    soft: 'bg-green-500/10 text-green-700 dark:text-green-300',
    outline: 'border border-green-500/60 text-green-700 dark:text-green-300',
  },
  warning: {
    solid: 'bg-amber-500 text-white',
    soft: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    outline: 'border border-amber-500/60 text-amber-700 dark:text-amber-300',
  },
  danger: {
    solid: 'bg-red-600 text-white',
    soft: 'bg-red-500/10 text-red-700 dark:text-red-300',
    outline: 'border border-red-500/60 text-red-700 dark:text-red-300',
  },
  info: {
    solid: 'bg-sky-600 text-white',
    soft: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    outline: 'border border-sky-500/60 text-sky-700 dark:text-sky-300',
  },
}

const dotColor: Record<BadgeColor, string> = {
  primary: 'bg-primary-500',
  neutral: 'bg-neutral-400',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
}

const classes = computed(() => [
  'inline-flex items-center gap-1.5 rounded-full font-medium',
  sizes[props.size],
  palettes[props.color][props.variant],
])
</script>

<template>
  <span :class="classes">
    <span v-if="dot" class="h-1.5 w-1.5 rounded-full" :class="dotColor[color]" />
    <slot />
  </span>
</template>
