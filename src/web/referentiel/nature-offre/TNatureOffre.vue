<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import NatureOffres from './NatureOffres.vue';

</script>

<template>
  <TLayoutModule   
    
    :show-top="false"
    :show-left="false"
    :show-bottom="false"
    >

    <template #default>
          <NatureOffres/>
    </template>
  
  </TLayoutModule>
</template>