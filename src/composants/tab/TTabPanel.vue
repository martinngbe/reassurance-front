<script setup lang="ts">
import { computed, inject } from 'vue'
import { TAB_INJECTION_KEY, type TabContext } from './TTab.vue'

const props = defineProps<{ value: string | number }>()

const ctx = inject<TabContext>(TAB_INJECTION_KEY)!
const isActive = computed(() => ctx.activeKey === props.value)
</script>

<template>
  <div
    v-show="isActive"
    role="tabpanel"
    tabindex="0"
    class="
      p-5 outline-none
      focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded-lg
      animate-[tabFade_250ms_ease]
    "
  >
    <slot />
  </div>
</template>

<style>
/* Keyframe global (Tailwind arbitrary animation reference) */
@keyframes tabFade {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
}
</style>