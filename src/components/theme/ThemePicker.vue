<script setup lang="ts">
import { useTheme } from '../../theme/useTheme'

const { theme, setPrimary } = useTheme()

const presets: readonly string[] = [
  '#6366f1',
  '#2563eb',
  '#0891b2',
  '#0d9488',
  '#16a34a',
  '#ca8a04',
  '#ea580c',
  '#dc2626',
  '#db2777',
  '#7c3aed',
  '#0f172a',
] as const
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      v-for="c in presets"
      :key="c"
      type="button"
      :title="c"
      class="h-7 w-7 rounded-full ring-offset-2 transition hover:scale-110"
      :class="theme.primary.toLowerCase() === c ? 'ring-2 ring-neutral-400' : ''"
      :style="{ backgroundColor: c }"
      @click="setPrimary(c)"
    />
    <label
      class="relative ml-1 flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-neutral-300 bg-white"
      title="Couleur personnalisée"
    >
      <span class="h-full w-full" :style="{ backgroundColor: theme.primary }" />
      <input
        type="color"
        class="absolute inset-0 cursor-pointer opacity-0"
        :value="theme.primary"
        @input="setPrimary(($event.target as HTMLInputElement).value)"
      />
    </label>
    <code class="ml-1 rounded bg-neutral-200 px-2 py-1 font-mono text-xs text-neutral-600">{{
      theme.primary
    }}</code>
  </div>
</template>
