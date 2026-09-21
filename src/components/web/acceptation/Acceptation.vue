<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import MenuAcceptation from './MenuAcceptation.vue';
import TTitreModule from '@/components/utilitaire/TTitreModule.vue';


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
        <TTitreModule libelle="Acceptation"/>     
    </template>

   <template #left>
      <MenuAcceptation />
    </template>

    <template #default>
     
    </template>

 

  </TLayoutModule>
</template>