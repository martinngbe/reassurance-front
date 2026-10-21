<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreModule from '@/composants/utilitaire/TTitreModule.vue';
import { ref } from 'vue';
const active = ref('reassureurs')


</script>

<template>
  <TLayoutModule
    :show-bottom="false"
    :show-top="false"
    :show-left="false"
    >
   

    <template #default>
          <TTitreModule libelle="Ecran Tableau de bord"/>
    </template>


  </TLayoutModule>
</template>