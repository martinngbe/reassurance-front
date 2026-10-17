<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import ListePays from './ListePays.vue';


</script>

<template>
  <TLayoutModule   
    bottom-size="50%"
    :show-top="false"
    :show-left="false"
    >

    <template #default>
          <ListePays/>
    </template>

  </TLayoutModule>
</template>