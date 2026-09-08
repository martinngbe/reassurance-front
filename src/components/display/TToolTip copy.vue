<script setup lang="ts">
import { computed, ref, onBeforeUnmount, watch, nextTick } from 'vue'

type Position = 'top' | 'bottom' | 'left' | 'right'
type Theme = 'dark' | 'light' | 'primary' | 'soft'
type Trigger = 'hover' | 'click' | 'focus' | 'manual'

const props = withDefaults(
  defineProps<{
    content?: string
    position?: Position
    theme?: Theme
    delay?: number
    hideDelay?: number
    arrow?: boolean
    trigger?: Trigger
    visible?: boolean
    disabled?: boolean
    offset?: number
    maxWidth?: string
  }>(),
  {
    position: 'top',
    theme: 'dark',
    delay: 150,
    hideDelay: 100,
    arrow: true,
    trigger: 'hover',
    visible: undefined,
    disabled: false,
    offset: 8,
    maxWidth: '280px',
  },
)

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

// ==================== ÉTAT ====================
const isVisible = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({})
const actualPosition = ref<Position>(props.position)
const isMeasured = ref(false) // ✨ Indique si les dimensions sont prêtes

let showTimeout: number | null = null
let hideTimeout: number | null = null
let resizeObserver: ResizeObserver | null = null

// ==================== VISIBILITÉ ====================
const effectiveVisible = computed(() => {
  if (props.trigger === 'manual') return props.visible ?? false
  return isVisible.value
})

function show() {
  if (props.disabled) return
  clearTimers()
  showTimeout = window.setTimeout(() => {
    isVisible.value = true
    emit('update:visible', true)
    // Le ResizeObserver se chargera de calculer la position
    // quand le tooltip aura ses dimensions réelles
  }, props.delay)
}

function hide() {
  clearTimers()
  hideTimeout = window.setTimeout(() => {
    isVisible.value = false
    isMeasured.value = false
    emit('update:visible', false)
  }, props.hideDelay)
}

function clearTimers() {
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

function toggle() {
  if (effectiveVisible.value) hide()
  else show()
}

// ==================== POSITIONNEMENT ====================
function updatePosition() {
  if (!triggerRef.value || !tooltipRef.value) return

  // ✨ Forcer un reflow pour s'assurer que les dimensions sont à jour
  void tooltipRef.value.offsetHeight

  const trigger = triggerRef.value.getBoundingClientRect()
  const tooltip = tooltipRef.value.getBoundingClientRect()

  // Si le tooltip n'a pas encore de dimensions, attendre
  if (tooltip.width === 0 || tooltip.height === 0) {
    requestAnimationFrame(updatePosition)
    return
  }

  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  let pos = props.position
  const space = {
    top: trigger.top,
    bottom: viewport.height - trigger.bottom,
    left: trigger.left,
    right: viewport.width - trigger.right,
  }

  const needed = {
    top: tooltip.height + props.offset,
    bottom: tooltip.height + props.offset,
    left: tooltip.width + props.offset,
    right: tooltip.width + props.offset,
  }

  const flipMap: Record<Position, Position> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  }

  if (space[pos] < needed[pos] && space[flipMap[pos]] >= needed[flipMap[pos]]) {
    pos = flipMap[pos]
  }
  actualPosition.value = pos

  let top = 0
  let left = 0

  switch (pos) {
    case 'top':
      top = trigger.top - tooltip.height - props.offset
      left = trigger.left + trigger.width / 2 - tooltip.width / 2
      break
    case 'bottom':
      top = trigger.bottom + props.offset
      left = trigger.left + trigger.width / 2 - tooltip.width / 2
      break
    case 'left':
      top = trigger.top + trigger.height / 2 - tooltip.height / 2
      left = trigger.left - tooltip.width - props.offset
      break
    case 'right':
      top = trigger.top + trigger.height / 2 - tooltip.height / 2
      left = trigger.right + props.offset
      break
  }

  const padding = 8
  left = Math.max(padding, Math.min(left, viewport.width - tooltip.width - padding))
  top = Math.max(padding, Math.min(top, viewport.height - tooltip.height - padding))

  tooltipStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    maxWidth: props.maxWidth,
    zIndex: '9999',
  }

  isMeasured.value = true
}

// ==================== RESIZE OBSERVER ====================
// ✨ Recalcule la position dès que les dimensions du tooltip changent
function setupResizeObserver() {
  if (typeof window === 'undefined' || !tooltipRef.value) return

  resizeObserver = new ResizeObserver(() => {
    if (effectiveVisible.value && tooltipRef.value) {
      updatePosition()
    }
  })

  resizeObserver.observe(tooltipRef.value)
}

// Watcher pour setup l'observer quand le tooltip est monté
watch(
  tooltipRef,
  (el) => {
    if (el) {
      setupResizeObserver()
    }
  },
  { immediate: true },
)

// Watcher pour recalculer quand la position demandée change
watch(
  () => props.position,
  () => {
    if (effectiveVisible.value) {
      nextTick(updatePosition)
    }
  },
)

// ==================== EVENTS ====================
function onScrollOrResize() {
  if (effectiveVisible.value) updatePosition()
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', onScrollOrResize, true)
  window.addEventListener('resize', onScrollOrResize)
}

onBeforeUnmount(() => {
  clearTimers()
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', onScrollOrResize, true)
    window.removeEventListener('resize', onScrollOrResize)
  }
})

function onClickOutside(e: MouseEvent) {
  if (props.trigger !== 'click') return
  if (!effectiveVisible.value) return
  const target = e.target as Node
  if (triggerRef.value?.contains(target) || tooltipRef.value?.contains(target)) {
    return
  }
  hide()
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', onClickOutside, true)
}

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('click', onClickOutside, true)
  }
})

// ==================== THÈME ====================
const themeClasses = computed(() => {
  const map: Record<Theme, string> = {
    dark: 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900',
    light:
      'bg-white text-neutral-800 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700',
    primary: 'bg-[rgb(var(--tw-primary-500))] text-[rgb(var(--tw-primary-contrast))]',
    soft: 'bg-[rgb(var(--tw-primary-100))] text-[rgb(var(--tw-primary-800))] ring-1 ring-[rgb(var(--tw-primary-200))]',
  }
  return map[props.theme]
})

const arrowClasses = computed(() => {
  const map: Record<Position, string> = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-current',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-current',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-current',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-current',
  }
  return map[actualPosition.value]
})

// ==================== A11Y ====================
const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 9)}`
const triggerAttrs = computed(() => {
  if (props.disabled) return {}
  const base: Record<string, any> = {
    'aria-describedby': effectiveVisible.value ? tooltipId : undefined,
  }
  if (props.trigger === 'focus') {
    base.tabindex = '0'
  }
  return base
})
</script>

<template>
  <span class="ttooltip inline-flex">
    <span
      ref="triggerRef"
      class="ttooltip__trigger inline-flex"
      v-bind="triggerAttrs"
      @mouseenter="trigger === 'hover' && show()"
      @mouseleave="trigger === 'hover' && hide()"
      @focus="trigger === 'focus' && show()"
      @blur="trigger === 'focus' && hide()"
      @click="trigger === 'click' && toggle()"
    >
      <slot />
    </span>

    <!-- ✨ Teleport TOUJOURS présent, mais invisible quand pas actif -->
    <Teleport to="body">
      <div
        v-show="effectiveVisible && !disabled"
        :id="tooltipId"
        ref="tooltipRef"
        role="tooltip"
        :aria-hidden="!effectiveVisible"
        class="ttooltip__box rounded-md px-2.5 py-1.5 text-xs font-medium shadow-lg transition-opacity duration-150"
        :class="[themeClasses, effectiveVisible && isMeasured ? 'opacity-100' : 'opacity-0']"
        :style="tooltipStyle"
        @mouseenter="trigger === 'hover' && show()"
        @mouseleave="trigger === 'hover' && hide()"
      >
        <slot name="content">{{ content }}</slot>

        <span
          v-if="arrow"
          class="ttooltip__arrow absolute h-0 w-0 border-4 border-transparent"
          :class="arrowClasses"
        />
      </div>
    </Teleport>
  </span>
</template>

<style scoped>
/* Pas de transition sur le scale, seulement opacity pour éviter le flash */
</style>
