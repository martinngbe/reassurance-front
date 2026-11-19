<script setup lang="ts">

import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import { computed, ref, watch } from 'vue';
import Acteurs from './Acteurs.vue';
import { useActeurStore } from '@/services/acteurs/acteur/acteur.store.ts';
import Polices from '@/web/polices/police/Polices.vue';
import TSelectionnez from '@/composants/utilitaire/TSelectionnez.vue';

const acteurStore = useActeurStore()
// const policeStore = usePoliceStore()
// const quittanceStore = useQuittanceStore()

const currentActeur = computed(() => acteurStore.currentActeur)
// const currentPolice = computed(() => policeStore.currentPolice)
// const currentQuittance = computed(() => quittanceStore.currentQuittance)
// ////////////////////////////////////////
// On surveille le changementde  currentPolice
// ////////////////////////////////////////
const isChangemementActeurTermine = ref(true)
//const isChangemementPoliceTerminee = ref(true)
// On surveille le changementde  currentActeur
let assureTimeout: number | undefined
watch(currentActeur, () => {
  console.log(" ------- watch(currentActeur assuré a changé ")
  // le changement d'un assuré antraine
  // la réinitialisation de
  isChangemementActeurTermine.value=false
  //isChangemementPoliceTerminee.value=false
  window.clearTimeout(assureTimeout)

  assureTimeout = window.setTimeout(() => {
   isChangemementActeurTermine.value=true
  }, 300)
})


</script>

<template>
  <TLayoutModule
    bottom-size="50%"
    :show-top="false"
    :show-left="false"
    >
    <template #default>
        <Acteurs  :masquer-bouton-action="true" /> 
    </template>
    <template #footer>
          <Polices v-if="currentActeur && isChangemementActeurTermine"/>        
          <TSelectionnez v-else  message="Selectionnez un acteur svp ..." /> 
    </template>


  </TLayoutModule>
</template>