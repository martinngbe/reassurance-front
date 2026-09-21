<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreModule from '@/components/utilitaire/TTitreModule.vue';
import MenuParametrage from './MenuParametrage.vue';


</script>

<template>
  <TLayoutModule
    topSize="100px"
    leftSize="300px"
    :showBottom=false
    >
   <template #header>
        <TTitreModule libelle="Paramétrage"/>     
    </template>

   <template #left>
      <MenuParametrage />
    </template>

    <template #default>
     
    </template>

 

  </TLayoutModule>
</template>