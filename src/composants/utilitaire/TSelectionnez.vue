<script setup lang="ts">
import TAlert from '../display/TAlert.vue';
const props =  defineProps<{
    message?: string
  }>()
</script>

<template>
            <div class="flex w-full  p-4 h-full items-center justify-center">                 
                  <TAlert variant="info">
                      <p class="text-2xl font-bold" v-if="props.message">{{ props.message }}.</p>
                      <p class="text-2xl font-bold" v-else>Selectionnez ....</p> 
                  </TAlert> 
            </div>

</template>