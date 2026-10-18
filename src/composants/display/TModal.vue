<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: ModalSize
    closable?: boolean
    closeOnOverlay?: boolean
    persistent?: boolean
    /** Largeur personnalisée (ex: '500px', '80%', '60vw'). Prioritaire sur `size`. */
    width?: string
    /** Hauteur personnalisée du panneau (ex: '600px', '90vh'). */
    height?: string
    /** Hauteur max du corps scrollable (ex: '70vh', '500px'). */
    bodyMaxHeight?: string
    /** Permet de définir une hauteur minimale */
    minHeight?: string
  }>(),
  {
    title: '',
    size: 'md',
    closable: true,
    closeOnOverlay: true,
    persistent: false,
    bodyMaxHeight: '70vh',
  },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

// Tailwind classes pour les tailles prédéfinies
const sizes: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

// Style dynamique pour les dimensions custom
const panelStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) style.width = props.width
  if (props.height) style.height = props.height
  if (props.minHeight) style.minHeight = props.minHeight
  return style
})

const bodyStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.bodyMaxHeight) style.maxHeight = props.bodyMaxHeight
  return style
})

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
          :class="!width ? sizes[size] : ''"
          :style="panelStyle"
        >
          <!-- Header fixe -->
          <header
            class="flex shrink-0 items-center justify-between gap-4 rounded-t-2xl border-b border-primary-800 bg-primary-200 px-5 py-4 dark:border-primary-700 dark:bg-primary-950"
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

          <!-- Corps scrollable -->
          <div
            class="t-modal-body custom-scrollbar flex-1 overflow-y-auto px-5 py-4 text-sm text-neutral-600 dark:text-neutral-300"
            :style="bodyStyle"
          >
            <slot />
          </div>

          <!-- Footer fixe -->
          <footer
            v-if="$slots.footer"
            class="flex shrink-0 justify-end gap-3 border-t border-primary-800 px-5 py-4 dark:border-primary-700"
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

/* Scrollbar custom (identique au TTable) */
.t-modal-body {
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--tw-primary-500)) transparent;
}
.t-modal-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.t-modal-body::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}
.t-modal-body::-webkit-scrollbar-thumb {
  background-color: rgb(var(--tw-primary-500));
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
  transition: background-color 0.2s ease;
}
.t-modal-body::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--tw-primary-700));
}
.t-modal-body::-webkit-scrollbar-corner {
  background: transparent;
}
@supports not (color: rgb(var(--tw-primary-500))) {
  .t-modal-body::-webkit-scrollbar-thumb {
    background-color: #6366f1;
  }
  .t-modal-body::-webkit-scrollbar-thumb:hover {
    background-color: #4f46e5;
  }
}
</style>