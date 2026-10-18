<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '../../theme/useTheme'

type ToggleVariant = 'switch' | 'icon'

withDefaults(
  defineProps<{
    variant?: ToggleVariant
    ariaLabel?: string
  }>(),
  {
    variant: 'switch',
    ariaLabel: 'Basculer entre le mode clair et le mode sombre',
  },
)

const { theme, toggleMode } = useTheme()

/** mode réellement appliqué ('system' déjà résolu) */
const isDark = computed<boolean>(() => theme.resolvedMode === 'dark')
</script>

<template>
  <!-- Variante interrupteur (pilule soleil/lune) -->
  <button
    v-if="variant === 'switch'"
    type="button"
    role="switch"
    :aria-checked="isDark"
    :aria-label="ariaLabel"
    class="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
    :class="isDark ? 'bg-primary-600' : 'bg-neutral-300'"
    @click="toggleMode"
  >
    <span
      class="inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300"
      :class="isDark ? 'translate-x-7' : 'translate-x-1'"
    >
      <!-- Lune : mode sombre actif -->
      <svg
        v-if="isDark"
        class="h-3.5 w-3.5 text-primary-600"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z"
          clip-rule="evenodd"
        />
      </svg>
      <!-- Soleil : mode clair actif -->
      <svg v-else class="h-3.5 w-3.5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
        <path
          d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z"
        />
      </svg>
    </span>
  </button>

  <!-- Variante bouton icône compact -->
  <button
    v-else
    type="button"
    :aria-label="ariaLabel"
    class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 transition hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
    @click="toggleMode"
  >
    <svg v-if="isDark" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z"
        clip-rule="evenodd"
      />
    </svg>
    <svg v-else class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z"
      />
    </svg>
  </button>
</template>
