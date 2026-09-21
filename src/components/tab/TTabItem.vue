<script setup lang="ts">
import { computed, inject, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { TAB_INJECTION_KEY, type TabContext } from './TTab.vue'

const props = withDefaults(
  defineProps<{
    value: string | number
    label?: string
    disabled?: boolean
    icon?: string
  }>(),
  { disabled: false },
)

const emit = defineEmits<{ (e: 'click', value: string | number): void }>()

const ctx = inject<TabContext>(TAB_INJECTION_KEY)
if (!ctx) throw new Error('<TTabItem> must be used inside <TTab>')

const elRef = ref<HTMLElement | null>(null)
const isActive = computed(() => ctx.activeKey === props.value)

onMounted(() => { if (elRef.value) ctx.register(props.value, elRef.value) })
onBeforeUnmount(() => ctx.unregister(props.value))
watch(elRef, (el) => { if (el) ctx.register(props.value, el) })

const sizeMap: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3.5 text-base gap-2.5',
}

const baseItem = [
  'relative inline-flex items-center justify-center',
  'font-medium whitespace-nowrap select-none',
  'transition-all duration-200 ease-out',
  'outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  'dark:focus-visible:ring-offset-gray-900',
].join(' ')

const inactiveMap: Record<string, string> = {
  underline: 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
  pills: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/40',
  boxed: 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50',
}

const activeMap: Record<string, string> = {
  underline: 'text-primary-600 dark:text-primary-400',
  pills: 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-700',
  boxed: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white',
}

const variantShapeMap: Record<string, string> = {
  underline: 'rounded-t-md',
  pills: 'rounded-lg',
  boxed: 'rounded-none first:rounded-tl-lg last:rounded-tr-lg',
}

const classes = computed(() => [
  baseItem,
  sizeMap[ctx.size],
  variantShapeMap[ctx.variant],
  isActive.value ? activeMap[ctx.variant] : inactiveMap[ctx.variant],
  props.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
])
const handleClick = () => {
  if (props.disabled) return
  ctx.select(props.value)
  emit('click', props.value)
}
</script>

<template>
  <button
    ref="elRef"
    type="button"
    role="tab"
    :tabindex="isActive ? 0 : -1"
    :aria-selected="isActive"
    :aria-disabled="disabled || undefined"
    :disabled="disabled"
    :class="classes"   
    @click="handleClick"
  >
    <slot name="label" :active="isActive">
      <span v-if="icon" class="inline-flex text-[1.1em]" aria-hidden="true">
        {{ icon }}
      </span>
      <span v-if="label" class="leading-tight  text-2xl">{{ label }}</span>
    </slot>
  </button>
</template>