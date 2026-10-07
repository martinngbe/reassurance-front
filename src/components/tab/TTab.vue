<script lang="ts">
import type { InjectionKey } from 'vue'

export type TabVariant = 'underline' | 'pills' | 'boxed'
export type TabSize = 'sm' | 'md' | 'lg'

export interface TabContext {
  activeKey: string | number
  variant: TabVariant
  size: TabSize
  register: (key: string | number, el: HTMLElement) => void
  unregister: (key: string | number) => void
  select: (key: string | number) => void
}

export const TAB_INJECTION_KEY: InjectionKey<TabContext> = Symbol('TTab')
</script>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  provide,
  onMounted,
  onBeforeUnmount,
  type ComputedRef,
} from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    variant?: TabVariant
    size?: TabSize
    fullWidth?: boolean
  }>(),
  {
    modelValue: 0,
    variant: 'underline',
    size: 'md',
    fullWidth: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

const tablistRef = ref<HTMLElement | null>(null)
const indicatorRef = ref<HTMLElement | null>(null)
const tabs = ref<Map<string | number, HTMLElement>>(new Map())

// ✅ Typage explicite du computed
const activeKey: ComputedRef<string | number> = computed(() => props.modelValue ?? 0)

const register = (key: string | number, el: HTMLElement) => tabs.value.set(key, el)
const unregister = (key: string | number) => tabs.value.delete(key)

const select = (key: string | number) => {
  if (key === activeKey.value) return
  emit('update:modelValue', key)
  emit('change', key)
}

provide<TabContext>(TAB_INJECTION_KEY, {
  get activeKey() { return activeKey.value },
  get variant() { return props.variant },
  get size() { return props.size },
  register,
  unregister,
  select,
})

const updateIndicator = () => {
  const key = activeKey.value
  const el = tabs.value.get(key)
  const indicator = indicatorRef.value
  const list = tablistRef.value
  if (!el || !indicator || !list) return

  const listRect = list.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()

  indicator.style.width = `${elRect.width}px`
  indicator.style.left = `${elRect.left - listRect.left + list.scrollLeft}px`
  indicator.style.opacity = '1'
}

const handleKeydown = (e: KeyboardEvent) => {
  const keys = Array.from(tabs.value.keys())
  const currentKey = activeKey.value
  
  // ✅ Guard clause pour TypeScript
  if (currentKey === undefined) return
  
  const idx = keys.indexOf(currentKey)
  if (idx === -1) return

  let next: number = idx
  if (e.key === 'ArrowRight') next = (idx + 1) % keys.length
  else if (e.key === 'ArrowLeft') next = (idx - 1 + keys.length) % keys.length
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = keys.length - 1
  else return

  e.preventDefault()
  const nextKey = keys[next]
  if (nextKey === undefined) return

  select(keys[next]!)
  tabs.value.get(keys[next]!)?.focus()
}

let ro: ResizeObserver | null = null

onMounted(() => {
  updateIndicator()
  if (tablistRef.value) {
    ro = new ResizeObserver(updateIndicator)
    ro.observe(tablistRef.value)
  }
})

onBeforeUnmount(() => ro?.disconnect())

watch(activeKey, () => requestAnimationFrame(updateIndicator))

const listVariantClasses: Record<TabVariant, string> = {
  underline: 'border-b border-gray-200 dark:border-gray-700',
  pills: 'bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl border-0 gap-1',
  boxed: 'border-b border-gray-200 dark:border-gray-700 gap-0',
}

const listClasses: ComputedRef<string[]> = computed(() => [
  'relative flex overflow-x-auto scrollbar-none',
  listVariantClasses[props.variant],
])
</script>

<template>
  <div class="w-full font-sans antialiased">
    <div
      ref="tablistRef"
      role="tablist"
      aria-orientation="horizontal"
      :class="listClasses"
      @keydown="handleKeydown"
    >
      <span
        v-if="variant === 'underline'"
        ref="indicatorRef"
        aria-hidden="true"
        class="
          absolute bottom-0 left-0 h-0.5 rounded-t-full
          bg-primary-500 dark:bg-primary-400
          transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
          opacity-0
        "
      />
      <slot />
    </div>
    <slot name="panels" />
  </div>
</template>