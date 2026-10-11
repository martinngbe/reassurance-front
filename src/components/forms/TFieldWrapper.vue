<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    hint?: string
    error?: string
    required?: boolean
    htmlFor?: string
  }>(),
  { label: '', hint: '', error: '', required: false, htmlFor: undefined },
)
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="htmlFor"
      class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-200"
    >
      {{ label }} <span v-if="required" class="text-primary-500 text-xl">*</span>
    </label>
    <slot />
    <p
      v-if="error"
      class="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400"
    >
      <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0Zm-8-5a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1Zm0 10a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
          clip-rule="evenodd"
        />
      </svg>
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">{{ hint }}</p>
  </div>
</template>
