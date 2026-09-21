<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreModule from '@/components/utilitaire/TTitreModule.vue';
import MenuComptabilisation from './MenuComptabilisation.vue';



</script>

<template>
  <TLayoutModule
    topSize="100px"
    leftSize="30%"
    :showBottom=false
    >
   <template #header>
        <TTitreModule libelle="Comptabilisation"/>     
    </template>

   <template #left>
      <MenuComptabilisation />
    </template>

    <template #default>
     
    </template>

 

  </TLayoutModule>
</template>