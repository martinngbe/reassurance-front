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
const isMeasured = ref(false)

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

  // Force un reflow pour s'assurer que les dimensions sont à jour
  void tooltipRef.value.offsetHeight

  const trigger = triggerRef.value.getBoundingClientRect()
  const tooltip = tooltipRef.value.getBoundingClientRect()

  if (tooltip.width === 0 || tooltip.height === 0) {
    requestAnimationFrame(updatePosition)
    return
  }

  const viewport = { width: window.innerWidth, height: window.innerHeight }
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

  let top = 0,
    left = 0

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
function setupResizeObserver() {
  if (typeof window === 'undefined' || !tooltipRef.value) return
  resizeObserver = new ResizeObserver(() => {
    if (effectiveVisible.value && tooltipRef.value) updatePosition()
  })
  resizeObserver.observe(tooltipRef.value)
}

watch(
  tooltipRef,
  (el) => {
    if (el) setupResizeObserver()
  },
  { immediate: true },
)
watch(
  () => props.position,
  () => {
    if (effectiveVisible.value) nextTick(updatePosition)
  },
)

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
  if (typeof document !== 'undefined') {
    document.removeEventListener('click', onClickOutside, true)
  }
})

function onClickOutside(e: MouseEvent) {
  if (props.trigger !== 'click' || !effectiveVisible.value) return
  const target = e.target as Node
  if (triggerRef.value?.contains(target) || tooltipRef.value?.contains(target)) return
  hide()
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', onClickOutside, true)
}

// ==================== THÈME & STYLE (Dynamique + Dark/Light) ====================
const themeClasses = computed(() => {
  const map: Record<Theme, string> = {
    // Dark : fond sombre, texte blanc. S'adapte légèrement en mode nuit.
    dark: 'bg-neutral-900 text-white shadow-lg dark:bg-neutral-800 dark:text-neutral-100',

    // Light : fond blanc, texte sombre. Devient gris foncé en mode nuit.
    light:
      'bg-white text-neutral-800 ring-1 ring-neutral-200 shadow-lg dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700',

    // Primary : utilise la couleur active de la palette + texte contrasté (calculé par useTheme)
    primary: 'bg-[rgb(var(--tw-primary-600))] text-[rgb(var(--tw-primary-contrast))] shadow-lg',

    // Soft : Pastel clair en mode jour, Pastel foncé en mode nuit pour la lisibilité
    soft: 'bg-[rgb(var(--tw-primary-100))] text-[rgb(var(--tw-primary-800))] ring-1 ring-[rgb(var(--tw-primary-200))] shadow-md dark:bg-[rgb(var(--tw-primary-900))] dark:text-[rgb(var(--tw-primary-200))] dark:ring-[rgb(var(--tw-primary-800))]',
  }
  return map[props.theme]
})

const arrowBgClass = computed(() => {
  const map: Record<Theme, string> = {
    dark: 'bg-neutral-900 dark:bg-neutral-800',
    light: 'bg-white dark:bg-neutral-800',
    primary: 'bg-[rgb(var(--tw-primary-600))]',
    soft: 'bg-[rgb(var(--tw-primary-100))] dark:bg-[rgb(var(--tw-primary-900))]',
  }
  return map[props.theme]
})

const arrowPositionClass = computed(() => {
  const map: Record<Position, string> = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2  border-r border-b border-primary',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2  border-l border-t border-primary',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-r border-b border-primary',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-l border-b border-primary',
  }
  return map[actualPosition.value]
})

const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 9)}`
const triggerAttrs = computed(() => {
  if (props.disabled) return {}
  const base: Record<string, any> = {
    'aria-describedby': effectiveVisible.value ? tooltipId : undefined,
  }
  if (props.trigger === 'focus') base.tabindex = '0'
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

    <Teleport to="body">
      <div
        v-show="effectiveVisible && !disabled"
        :id="tooltipId"
        ref="tooltipRef"
        role="tooltip"
        :aria-hidden="!effectiveVisible"
        class="ttooltip__box rounded-lg px-3 py-2 text-sm font-medium transition-opacity duration-200  border border-primary"
        :class="[themeClasses, effectiveVisible && isMeasured ? 'opacity-100' : 'opacity-0']"
        :style="tooltipStyle"
        @mouseenter="trigger === 'hover' && show()"
        @mouseleave="trigger === 'hover' && hide()"
      >
        <slot name="content">{{ content }}</slot>
        <span
          v-if="arrow"
          class="absolute h-2 w-2 rotate-45"
          :class="[arrowPositionClass, arrowBgClass]"
        />
      </div>
    </Teleport>
  </span>
</template>

<style scoped>
/* Transition fluide sans déformation (scale retiré pour éviter les artefacts de mesure) */
</style>
