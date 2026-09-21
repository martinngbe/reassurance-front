<script setup lang="ts">
import { useTheme } from '../../theme/useTheme'
import TToolTip from '../display/TToolTip.vue';

const { theme, setPrimary } = useTheme()

const presets: readonly string[] = [

  '#0051ff',//bleu
  '#02f75c',//vert
  '#fbff00',//Jaune
  '#d400ff',//violet
  '#ff0000',//Rouge
  //'#16a34a',
  //'#ca8a04',
  //'#ea580c',
  //'#db2777',
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

    <TToolTip content="Couleur personnalisée" position="right">
          <label
            class="relative ml-10 flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-neutral-300 bg-white"
            title=""
          >
            <span class="h-full w-full" :style="{ backgroundColor: theme.primary }" />
            <input
              type="color"
              class="absolute inset-0 cursor-pointer opacity-0"
              :value="theme.primary"
              @input="setPrimary(($event.target as HTMLInputElement).value)"
            />
          </label>
    </TToolTip>
  
  </div>
</template>
