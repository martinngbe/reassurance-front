<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import Mouvements from './Mouvements.vue';

</script>

<template>
  <TLayoutModule   
    
    :show-top="false"
    :show-left="false"
    :show-bottom="false"
    >

    <template #default>
          <Mouvements/>
    </template>
  
  </TLayoutModule>
</template>