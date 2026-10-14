<script setup lang="ts">
const props = defineProps<{
  message?: string
}>()
</script>


<template #empty>
      <div class="flex flex-col items-center gap-2 py-4 text-neutral-400">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span v-if="props.message">{{ props.message }}</span>
        <span v-else>Aucune donnée trouvée</span>
      </div>
</template>