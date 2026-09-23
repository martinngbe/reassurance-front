<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreModule from '@/components/utilitaire/TTitreModule.vue';
import MenuSinistre from './MenuSinistre.vue';


const menuModule: Record<string, string> = {
  accueil: 'Accueil',
  acceptation: 'Facultative',
  cession: 'Traité',
  placement: 'Placement',
  compte: 'Compte',
  reglement: 'Règlement',
}


</script>

<template>
  <TLayoutModule 
    topSize="55px"
    leftSize="250px"
    :showBottom=false
    >
   <template #header>
        <TTitreModule libelle="Sinistre"/>     
    </template>

   <template #left>
      <MenuSinistre />
    </template>

    <template #default>
     
    </template>

 

  </TLayoutModule>
</template>