<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import EcheancesPmd from './EcheancesPmd.vue';


</script>

<template>
  <TLayoutModule   
    top-size="60%"    
    :show-left="false"
    :show-bottom="false"
    >

    <template #default>
          <EcheancesPmd />
    </template>
  </TLayoutModule>
</template>