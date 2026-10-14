<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: ModalSize
    closable?: boolean
    closeOnOverlay?: boolean
    persistent?: boolean
  }>(),
  { title: '', size: 'md', closable: true, closeOnOverlay: true, persistent: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const sizes: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

function close(): void {
  if (!props.closable) return
  emit('update:modelValue', false)
}
function onOverlayClick(): void {
  if (props.persistent || !props.closeOnOverlay) return
  close()
}
function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && !props.persistent) close()
}

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return
    if (open) {
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  },
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="t-modal" appear>
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
          aria-hidden="true"
          @click="onOverlayClick"
        />
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="title || 'Boîte de dialogue'"
          class="t-modal-panel relative w-full rounded-2xl border border-primary-400 bg-white shadow-xl ring-1 ring-neutral-200 dark:border-primary-700 dark:bg-neutral-900 dark:ring-neutral-800"
          :class="sizes[size]"
        >
          <header
            class="flex items-center justify-between gap-4 rounded-t-2xl border-b border-primary-800 bg-primary-200 px-5 py-4 dark:border-primary-700 dark:bg-primary-950"
          >
            <slot name="header">
              <h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {{ title }}
              </h3>
            </slot>
            <button
              v-if="closable"
              type="button"
              aria-label="Fermer"
              class="rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              @click="close"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                />
              </svg>
            </button>
          </header>
          <div
            class="max-h-[70vh] overflow-y-auto px-5 py-4 text-sm text-neutral-600 dark:text-neutral-300"
          >
            <slot />
          </div>
          <footer
            v-if="$slots.footer"
            class="flex justify-end gap-3 border-t border-primary-800 px-5 py-4 dark:border-primary-700"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.t-modal-enter-active,
.t-modal-leave-active {
  transition: opacity 0.2s ease;
}
.t-modal-enter-from,
.t-modal-leave-to {
  opacity: 0;
}
.t-modal-panel {
  transition: transform 0.2s ease;
}
.t-modal-enter-from .t-modal-panel,
.t-modal-leave-to .t-modal-panel {
  transform: translateY(10px) scale(0.97);
}
</style>