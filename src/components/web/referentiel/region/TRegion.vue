<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import Regions from './Regions.vue';


</script>

<template>
  <TLayoutModule   
    bottom-size="50%"
    :show-top="false"
    :show-left="false"
    >

    <template #default>
          <Regions/>
    </template>

  </TLayoutModule>
</template>