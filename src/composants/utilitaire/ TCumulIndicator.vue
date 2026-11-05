<!-- @/composants/display/TCumulIndicator.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import IconeValider from '@/composants/icone/IconeValider.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import { formatNumber } from '@/utilitaire/number'

const props = withDefaults(defineProps<{
  label: string
  current: number
  max: number
  precision?: number
  unit?: string
  showPercentage?: boolean
  showStatus?: boolean
  thresholds?: {
    warning?: number
    danger?: number
  }
}>(), {
  precision: 2,
  unit: '',
  showPercentage: true,
  showStatus: true,
  thresholds: () => ({ warning: 80, danger: 100 })
})

// ✅ Computed pour garantir que les seuils sont toujours définis
const warningThreshold = computed(() => props.thresholds?.warning ?? 80)
const dangerThreshold = computed(() => props.thresholds?.danger ?? 100)

// ==================== CALCULS ====================
const percentage = computed(() => {
  if (props.max <= 0) return 0
  return Math.min((props.current / props.max) * 100, 100)
})

const isOverLimit = computed(() => props.current > props.max)
// ✅ Utiliser les computed au lieu des props directement
const isWarning = computed(() => percentage.value >= warningThreshold.value && !isOverLimit.value)

// ==================== STYLES DYNAMIQUES ====================
const gradientColor = computed(() => {
  if (isOverLimit.value) return 'from-red-500 to-red-600'
  if (isWarning.value) return 'from-orange-500 to-orange-600'
  if (percentage.value >= 60) return 'from-yellow-500 to-yellow-600'
  return 'from-emerald-500 to-emerald-600'
})

const bgColor = computed(() => {
  if (isOverLimit.value) return 'bg-red-100 dark:bg-red-900/20'
  if (isWarning.value) return 'bg-orange-100 dark:bg-orange-900/20'
  if (percentage.value >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20'
  return 'bg-emerald-100 dark:bg-emerald-900/20'
})

const dotColor = computed(() => {
  if (isOverLimit.value) return 'bg-red-500'
  if (isWarning.value) return 'bg-orange-500'
  return 'bg-emerald-500'
})

const textColor = computed(() => {
  if (isOverLimit.value) return 'text-red-600 dark:text-red-400'
  return 'text-gray-700 dark:text-gray-300'
})

const statusText = computed(() => {
  if (isOverLimit.value) return 'Limite dépassée'
  if (isWarning.value) return 'Approche de la limite'
  return 'Capacité disponible'
})

// ==================== FORMATAGE ====================
function formatValue(value: number): string {
  return formatNumber(value.toFixed(props.precision))
}
</script>

<template>
  <div class="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 shadow-sm hover:shadow-md transition-shadow">
    <!-- En-tête -->
    <div class="flex items-start justify-between mb-3">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-2 h-2 rounded-full" :class="dotColor"></div>
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ label }}</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ formatValue(current) }}
          </span>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            / {{ formatValue(max) }}{{ unit }}
          </span>
        </div>
      </div>
      
      <!-- Pourcentage -->
      <div v-if="showPercentage" class="text-right">
        <div class="text-3xl font-bold" :class="textColor">
          {{ percentage.toFixed(0) }}%
        </div>
      </div>
    </div>
    
    <!-- Barre de progression -->
    <div class="relative h-2 rounded-full overflow-hidden" :class="bgColor">
      <div 
        class="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
        :class="`bg-gradient-to-r ${gradientColor}`"
        :style="{ width: `${percentage}%` }"
      >
        <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
      </div>
    </div>
    
    <!-- Statut -->
    <div v-if="showStatus" class="mt-2 flex items-center gap-1.5">
      <IconeValider v-if="!isOverLimit && !isWarning" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      <IconeNonValider v-else-if="isOverLimit" class="w-4 h-4 text-red-600 dark:text-red-400" />
      <span class="text-xs font-medium" :class="textColor">
        {{ statusText }}
      </span>
    </div>
    
    <!-- Slot pour contenu additionnel -->
    <slot name="extra" />
  </div>
</template>