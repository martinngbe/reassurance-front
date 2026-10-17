<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import Acteurs from './Acteurs.vue';


</script>

<template>
  <TLayoutModule   
    :show-bottom="false"
    :show-top="false"
    :show-left="false"
    >

    <template #default>
          <Acteurs/>
    </template>
    
  </TLayoutModule>
</template>