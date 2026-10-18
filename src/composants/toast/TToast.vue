<script setup lang="ts">

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Toast, ToastType } from './useToast';

const props = withDefaults(
  defineProps<{
    toast: Toast
  }>(),
  {},
)

const emit = defineEmits<{
  close: [id: number]
}>()

const remaining = ref(100)
let timer: number | null = null
let startTime = 0
let pausedAt = 0

// ==================== STYLES PAR TYPE ====================
// Configuration par type (déclarée en dehors du composant pour être immutable)
const TYPE_CONFIG: Record<ToastType, { 
  icon: string; 
  color: string; 
  bg: string; 
  border: string; 
  progress: string 
}> = {
  success: {
    icon: 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-200 dark:bg-emerald-950',
    border: 'border-emerald-200 dark:border-emerald-800',
    progress: 'bg-emerald-500',
  },
  error: {
    icon: 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-800',
    progress: 'bg-red-500',
  },
  warning: {
    icon: 'M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-200 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    progress: 'bg-amber-500',
  },
  info: {
    icon: 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5ZM10 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
    color: 'text-primary-600 dark:text-primary-400',
    bg: 'bg-primary-200 dark:bg-primary-950',
    border: 'border-primary-200 dark:border-primary-800',
    progress: 'bg-primary-500',
  },
}

// ✅ Computed qui garantit TOUJOURS un retour valide (fallback sur 'info')
const config = computed(() => {
  const type = (props.toast.type ?? 'info') as ToastType
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.info
})


// ==================== AUTO-DISMISS ====================
const startTimer = () => {
  if (!props.toast.duration || props.toast.duration <= 0) return
  startTime = Date.now()
  timer = window.setInterval(() => {
    const elapsed = Date.now() - startTime - pausedAt
    const pct = 100 - (elapsed / props.toast.duration!) * 100
    if (pct <= 0) {
      emit('close', props.toast.id)
    } else {
      remaining.value = pct
    }
  }, 50)
}

const pauseTimer = () => {
  if (timer) {
    clearInterval(timer)
    pausedAt = Date.now() - startTime
  }
}

const resumeTimer = () => {
  if (timer) {
    startTime = Date.now() - pausedAt
    timer = window.setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = 100 - (elapsed / props.toast.duration!) * 100
      if (pct <= 0) {
        emit('close', props.toast.id)
      } else {
        remaining.value = pct
      }
    }, 50)
  }
}

onMounted(() => startTimer())
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const close = () => emit('close', props.toast.id)
</script>

<template>
   <div
    role="status"
    :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
    class="t-toast group relative flex w-full min-w-0 items-start gap-3 rounded-xl border p-4 shadow-lg ring-1 transition-all"
    :class="[
      config.bg,
      config.border,
      'ring-neutral-200/60 dark:ring-neutral-800/60',
    ]"
    @mouseenter="pauseTimer"
    @mouseleave="resumeTimer"
  >
    <!-- Icône -->
    <div
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      :class="config.bg"
    >
      <svg class="h-5 w-5" :class="config.color" viewBox="0 0 20 20" fill="currentColor">
        <path :d="config.icon" />
      </svg>
    </div>

    <!-- Contenu -->
    <div class="flex-1 min-w-0 pt-0.5">
      <h4
        v-if="toast.title"
        class="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
      >
        {{ toast.title }}
      </h4>
      <p
        class="text-sm text-neutral-600 dark:text-neutral-300"
        :class="toast.title ? 'mt-0.5' : ''"
      >
        {{ toast.message }}
      </p>

      <!-- Action optionnelle -->
      <button
        v-if="toast.action"
        type="button"
        class="mt-2 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        @click="toast.action?.onClick"
      >
        {{ toast.action.label }} →
      </button>
    </div>

    <!-- Bouton fermer -->
    <button
      v-if="toast.closable"
      type="button"
      aria-label="Fermer"
      class="shrink-0 rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      @click="close"
    >
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
        />
      </svg>
    </button>

    <!-- Barre de progression -->
    <div
      v-if="toast.duration && toast.duration > 0"
      class="absolute bottom-0 left-0 h-1 overflow-hidden rounded-b-xl"
      :class="config.border"
    >
      <div
        class="h-full transition-[width] duration-100 ease-linear"
        :class="config.progress"
        :style="{ width: `${remaining}%` }"
      />
    </div>
  </div>
</template>