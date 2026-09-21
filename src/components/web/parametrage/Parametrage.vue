<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreModule from '@/components/utilitaire/TTitreModule.vue';
import MenuAcceptation from '../acceptation/MenuAcceptation.vue';
import MenuParametrage from './MenuParametrage.vue';


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
    topSize="100px"
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