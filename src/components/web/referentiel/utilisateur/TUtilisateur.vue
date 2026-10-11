<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import Utilisateurs from './Utilisateurs.vue';


</script>

<template>
  <TLayoutModule
  
    :show-left="false"
    :show-top="false"
    :show-bottom="false"
   
    >
  
    <template #default>
          <Utilisateurs/>
    </template>

  </TLayoutModule>
</template>