<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import EnConstruction from '@/web/EnConstruction.vue';


</script>

<template>
  <TLayoutModule
    :show-bottom="false"
    :show-top="false"
    :show-left="false"
    >
   

    <template #default>
          <EnConstruction />
    </template>


  </TLayoutModule>
</template>