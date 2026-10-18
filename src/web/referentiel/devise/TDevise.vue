<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import Devises from './Devises.vue';



</script>

<template>
  <TLayoutModule   
    :show-bottom="false"
    :show-top="false"
    :show-left="false"
    >

    <template #default>
          <Devises/>
    </template>
    
  </TLayoutModule>
</template>