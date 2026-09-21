<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreModule from '@/components/utilitaire/TTitreModule.vue';
import MenuConsultation from './MenuConsultation.vue';



</script>

<template>
  <TLayoutModule
    topSize="100px"
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