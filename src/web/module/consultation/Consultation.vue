<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreModule from '@/composants/utilitaire/TTitreModule.vue';
import MenuConsultation from './MenuConsultation.vue';



</script>

<template>
  <TLayoutModule
    topSize="55px"
    leftSize="300px"
    :showBottom=false
    >
   <template #header>
        <TTitreModule libelle="Consultation"/>     
    </template>

   <template #left>
      <!--MenuConsultation /-->
    </template>

    <template #default>
     
    </template>

  </TLayoutModule>
</template>