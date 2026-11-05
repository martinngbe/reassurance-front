<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  current: number
  max: number
  precision?: number
}>(), {
  precision: 0
})

const percentage = computed(() => {
  if (props.max <= 0) return 0
  return Math.min((props.current / props.max) * 100, 100)
})

const isOver = computed(() => props.current > props.max)
const isWarning = computed(() => percentage.value >= 80 && !isOver.value)

const barColor = computed(() => {
  if (isOver.value) return 'bg-red-500 dark:bg-red-400'
  if (isWarning.value) return 'bg-amber-500 dark:bg-amber-400'
  return 'bg-emerald-500 dark:bg-emerald-400'
})

const dotColor = computed(() => {
  if (isOver.value) return 'bg-red-500'
  if (isWarning.value) return 'bg-amber-500'
  return 'bg-emerald-500'
})

// ✅ Formatage des nombres avec séparateurs de milliers
const formattedCurrent = computed(() => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: props.precision,
    maximumFractionDigits: props.precision
  }).format(props.current)
})

const formattedMax = computed(() => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: props.precision,
    maximumFractionDigits: props.precision
  }).format(props.max)
})
</script>

<template>
  <div class="inline-flex items-center gap-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 px-2.5 py-1 text-xs">
    <!-- Point de statut -->
    <span class="relative flex h-1.5 w-1.5">
      <span v-if="isOver || isWarning" class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" :class="dotColor"></span>
      <span class="relative inline-flex h-1.5 w-1.5 rounded-full" :class="dotColor"></span>
    </span>

    <!-- Label + valeurs -->
    <div class="flex items-baseline gap-1">
      <span class="text-neutral-500 dark:text-neutral-400">{{ label }}</span>
      <span class="font-semibold text-neutral-700 dark:text-neutral-200">
        {{ formattedCurrent }}
      </span>
      <span class="text-neutral-400 dark:text-neutral-500">/ {{ formattedMax }}</span>
    </div>

    <!-- Mini barre de progression -->
    <div class="h-1 w-12 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="barColor"
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
  </div>
</template>