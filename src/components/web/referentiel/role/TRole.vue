<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import Roles from './Roles.vue';


</script>

<template>
  <TLayoutModule
  
    :show-left="false"
    :show-top="false"
    :show-bottom="false"
   
    >
  
    <template #default>
          <Roles/>
    </template>

  </TLayoutModule>
</template>