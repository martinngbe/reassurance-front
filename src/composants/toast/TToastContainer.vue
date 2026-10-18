<script setup lang="ts">
import { computed } from 'vue'
import TToast from './TToast.vue'
import { useToast, type ToastPosition } from './useToast.ts';
//import { useToast, type ToastPosition } from '@/composables/useToast'

const props= withDefaults(
  defineProps<{
    position?: ToastPosition
    max?: number
  }>(),
  {
    position: 'top-right',
    max: 5,
  },
)

const { toasts, remove } = useToast()

// ==================== POSITIONNEMENT ====================
const positionClasses: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
}

// Limite le nombre de toasts affichés
const visibleToasts = computed(() => {
  const sorted = [...toasts.value].reverse()
  return sorted.slice(0, props.max)
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed z-[9999] flex w-full max-w-sm flex-col gap-3 pointer-events-none"
      :class="positionClasses[position]"
    >
      <TransitionGroup
        name="t-toast"
        tag="div"
        class="flex flex-col gap-3 pointer-events-auto"
      >
        <TToast
          v-for="toast in visibleToasts"
          :key="toast.id"
          :toast="toast"
          @close="remove"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/* --- Animations d'entrée/sortie --- */
.t-toast-enter-active {
  transition: all 0.3s cubic-bezier(0.21, 1.02, 0.73, 1);
}
.t-toast-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}

/* Entrée depuis la droite (par défaut) */
.t-toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
.t-toast-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}

/* Sortie vers la droite */
.t-toast-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.t-toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

/* Réorganisation des toasts restants */
.t-toast-move {
  transition: transform 0.3s ease;
}
</style>