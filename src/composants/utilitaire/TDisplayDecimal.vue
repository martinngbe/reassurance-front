<script setup lang="ts">
import { formatDecimal, formatInteger } from '@/utilitaire/number';

const props = defineProps<{
  value:  number | string
}>()
</script>


<template #empty>
        <span class="block w-full font-mono text-xl text-right" v-if="props.value!=0">
          {{ formatDecimal(value) }}
        </span>
        <span v-else>...</span>
</template>