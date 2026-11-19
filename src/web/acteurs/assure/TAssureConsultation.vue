<script setup lang="ts">

import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import { computed, ref, watch } from 'vue';
import Assures from './Assures.vue';
import Polices from '@/web/polices/police/Polices.vue';
import TSelectionnez from '@/composants/utilitaire/TSelectionnez.vue';
import { useAssureStore } from '@/services/acteurs/assure/assure.store.ts';

const assureStore = useAssureStore()
// const policeStore = usePoliceStore()
// const quittanceStore = useQuittanceStore()

const currentAssure = computed(() => assureStore.currentAssure)
// const currentPolice = computed(() => policeStore.currentPolice)
// const currentQuittance = computed(() => quittanceStore.currentQuittance)
// ////////////////////////////////////////
// On surveille le changementde  currentPolice
// ////////////////////////////////////////
const isChangemementAssureTermine = ref(true)
//const isChangemementPoliceTerminee = ref(true)
// On surveille le changementde  currentAssure
let assureTimeout: number | undefined
watch(currentAssure, () => {
  console.log(" ------- watch(currentAssure assuré a changé ")
  // le changement d'un assuré antraine
  // la réinitialisation de
  isChangemementAssureTermine.value=false
  //isChangemementPoliceTerminee.value=false
  window.clearTimeout(assureTimeout)

  assureTimeout = window.setTimeout(() => {
   isChangemementAssureTermine.value=true
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
        <Assures  /> 
    </template>
    <template #footer>
          <Polices v-if="currentAssure && isChangemementAssureTermine"/>        
          <TSelectionnez v-else  message="Selectionnez un assure svp ..." /> 
    </template>


  </TLayoutModule>
</template>