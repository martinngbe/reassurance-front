<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import Assures from './Assures.vue';


</script>

<template>
  <TLayoutModule   
    :show-bottom="false"
    :show-top="false"
    :show-left="false"
    >

    <template #default>
          <Assures/>
    </template>
    
  </TLayoutModule>
</template>