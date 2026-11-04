<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import NaturePlacements from './NaturePlacements.vue';

</script>

<template>
  <TLayoutModule   
    
    :show-top="false"
    :show-left="false"
    :show-bottom="false"
    >

    <template #default>
          <NaturePlacements/>
    </template>
  
  </TLayoutModule>
</template>