<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreModule from '@/composants/utilitaire/TTitreModule.vue';




</script>

<template>
  <TLayoutModule
    bottomSize="45%"
    topSize="55px"
    :show-left="false"
    >
    <template #header>
      <TTitreModule libelle="Règlement"/> 
    </template>

    <template #default>
      
    </template>

    <template #footer>
      
    </template>

  </TLayoutModule>
</template>