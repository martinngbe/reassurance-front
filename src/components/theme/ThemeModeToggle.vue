<script setup lang="ts">
import { useTheme, type ThemeMode } from '../../theme/useTheme'

const { theme, setMode } = useTheme()

const options: Array<{ value: ThemeMode; label: string }> = [
  { value: 'light', label: 'Clair' },
  { value: 'system', label: 'Auto' },
  { value: 'dark', label: 'Sombre' },
]
</script>

<template>
  <div
    role="radiogroup"
    aria-label="Thème d'affichage"
    class="inline-flex items-center rounded-lg border border-neutral-300 bg-white p-0.5 dark:border-neutral-700 dark:bg-neutral-900"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      role="radio"
      :aria-checked="theme.mode === opt.value"
      class="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
      :class="
        theme.mode === opt.value
          ? 'bg-primary-500 text-primary-contrast shadow-sm'
          : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
      "
      @click="setMode(opt.value)"
    >
      <svg v-if="opt.value === 'light'" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path
          d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z"
        />
      </svg>
      <svg
        v-if="opt.value === 'system'"
        class="h-3.5 w-3.5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M2 4.25A2.25 2.25 0 0 1 4.25 2h11.5A2.25 2.25 0 0 1 18 4.25v8.5A2.25 2.25 0 0 1 15.75 15h-3.105a3.5 3.5 0 0 0 1.1 1.677A.75.75 0 0 1 13.26 18H6.74a.75.75 0 0 1-.484-1.323A3.5 3.5 0 0 0 7.355 15H4.25A2.25 2.25 0 0 1 2 12.75v-8.5Zm1.5 0a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75H4.25a.75.75 0 0 1-.75-.75v-7.5Z"
          clip-rule="evenodd"
        />
      </svg>
      <svg v-if="opt.value === 'dark'" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z"
          clip-rule="evenodd"
        />
      </svg>
      {{ opt.label }}
    </button>
  </div>
</template>
