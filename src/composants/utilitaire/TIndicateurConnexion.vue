<script setup lang="ts">


const props = withDefaults(
  defineProps<{
    isOnline: boolean
  }>(),
  { isOnline: false },
)
</script>


<template>
        <!-- Indicateur de connexion -->
    <div 
      class="flex items-center gap-2 px-1 py-1 rounded-full text-xs font-medium transition-colors"
      :class="isOnline 
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse'"
    >
      <span class="h-2 w-2 rounded-full" :class="isOnline ? 'bg-emerald-500' : 'bg-red-500'" />
      {{ isOnline ? 'En ligne' : 'Hors ligne' }}
    </div>
</template>