<script setup lang="ts">
import { ref } from 'vue'

type AlertVariant = 'primary' | 'info' | 'success' | 'warning' | 'danger'

const props = withDefaults(
  defineProps<{
    variant?: AlertVariant
    title?: string
    closable?: boolean
  }>(),
  { variant: 'primary', title: '', closable: false },
)

const emit = defineEmits<{ (e: 'close'): void }>()
const visible = ref(true)

const styles: Record<AlertVariant, { wrap: string; icon: string }> = {
  primary: {
    wrap: 'border-primary-500/30 bg-primary-500/10 text-primary-800 dark:text-primary-200',
    icon: 'text-primary-500',
  },
  info: {
    wrap: 'border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-200',
    icon: 'text-sky-500',
  },
  success: {
    wrap: 'border-green-500/30 bg-green-500/10 text-green-800 dark:text-green-200',
    icon: 'text-green-500',
  },
  warning: {
    wrap: 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200',
    icon: 'text-amber-500',
  },
  danger: {
    wrap: 'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200',
    icon: 'text-red-500',
  },
}

function close(): void {
  visible.value = false
  emit('close')
}
</script>

<template>
  <div
    v-if="visible"
    role="alert"
    class="flex items-start gap-3 rounded-xl border px-4 py-3"
    :class="styles[variant].wrap"
  >
    <span class="mt-0.5" :class="styles[variant].icon">
      <slot name="icon">
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9Z"
            clip-rule="evenodd"
          />
        </svg>
      </slot>
    </span>
    <div class="flex-1">
      <p v-if="title" class="text-sm font-semibold">{{ props.title }}</p>
      <div class="text-sm"><slot /></div>
    </div>
    <button
      v-if="closable"
      type="button"
      aria-label="Fermer"
      class="opacity-60 transition hover:opacity-100"
      @click="close"
    >
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
        />
      </svg>
    </button>
  </div>
</template>
