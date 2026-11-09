<script setup lang="ts">

import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TPatientez from '@/composants/utilitaire/TPatientez.vue';
import TSelectionnezQuittance from '@/composants/utilitaire/TSelectionnezQuittance.vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import TCompte from '@/web/flux-financier/comptes/compte/TCompte.vue';
import Quittances from '@/web/quittances/quittance/Quittances.vue';
import { computed, ref, watch } from 'vue';

const quittanceStore = useQuittanceStore()
const currentQuittance = computed(() => quittanceStore.currentQuittance)
// ////////////////////////////////////////
// On surveille le changementde  currentQuittance
// ////////////////////////////////////////

const isPatientez = ref(false)
let quittanceTimeout: number | undefined
watch(currentQuittance, () => {
 
  isPatientez.value=true
  console.warn(' ____ EcranCompte.watch(currentQuittance, () isPatientez.value:',isPatientez.value)
  window.clearTimeout(quittanceTimeout)

      quittanceTimeout = window.setTimeout(() => {
      isPatientez.value=false
     }, 300)
})



</script>

<template>
  <TLayoutModule
    top-size="50%"   
    :show-left="false"
    :show-bottom="false"
    >
    <template #header>
        <Quittances />    
    </template>
    <template #default>
          <TCompte v-if="currentQuittance && !isPatientez"/>
          <TPatientez v-else-if="isPatientez"/>
          <TSelectionnezQuittance v-else/>
         
    </template>
  


  </TLayoutModule>
</template>