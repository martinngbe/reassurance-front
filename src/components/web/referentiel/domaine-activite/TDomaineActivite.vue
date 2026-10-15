<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import DomaineActivites from './DomaineActivites.vue';


</script>

<template>
  <TLayoutModule   
    :show-bottom="false"
    :show-top="false"
    :show-left="false"
    >

    <template #default>
          <DomaineActivites/>
    </template>

  </TLayoutModule>
</template>