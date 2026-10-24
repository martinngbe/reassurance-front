<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import NatureCessions from './NatureCessions.vue';

</script>

<template>
  <TLayoutModule   
    
    :show-top="false"
    :show-left="false"
    :show-bottom="false"
    >

    <template #default>
          <NatureCessions/>
    </template>
  
  </TLayoutModule>
</template>