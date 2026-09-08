<script setup lang="ts">
withDefaults(
  defineProps<{
    padded?: boolean
    hoverable?: boolean
  }>(),
  { padded: true, hoverable: false },
)
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 transition dark:bg-neutral-900 dark:ring-neutral-800"
    :class="hoverable && 'hover:shadow-md hover:ring-primary-300 dark:hover:ring-primary-700'"
  >
    <header
      v-if="$slots.header"
      class="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800"
    >
      <slot name="header" />
    </header>
    <div :class="padded ? 'p-5' : ''"><slot /></div>
    <footer
      v-if="$slots.footer"
      class="border-t border-neutral-200 bg-neutral-50 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-800/50"
    >
      <slot name="footer" />
    </footer>
  </div>
</template>
