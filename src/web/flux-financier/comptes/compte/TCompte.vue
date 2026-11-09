<script setup lang="ts">
    import TLayoutModule from '@/composants/layout/TLayoutModule.vue';

    import Comptes from './Comptes.vue';
    import ComptesDetails from '../compte-detail/ComptesDetails.vue';
import { useCompteStore } from '@/services/flux-financiers/comptes/compte/compte.store.ts';
import { computed, ref, watch } from 'vue';
import TSelectionnez from '@/composants/utilitaire/TSelectionnez.vue';
import TPatientez from '@/composants/utilitaire/TPatientez.vue';



const compteStore = useCompteStore()
const currentCompte = computed(() => compteStore.currentCompte)
// ////////////////////////////////////////
// On surveille le changementde  currentQuittance
// ////////////////////////////////////////

const isPatientez = ref(false)
let currentCompteTimeout: number | undefined
watch(currentCompte, () => {
 
  isPatientez.value=true
  console.warn(' ____ EcranCompte.watch(currentQuittance, () isPatientez.value:',isPatientez.value)
  window.clearTimeout(currentCompteTimeout)

      currentCompteTimeout = window.setTimeout(() => {
      isPatientez.value=false
     }, 300)
})

</script>


<template>
  <TLayoutModule
    :show-bottom="false"
    leftSize="40%"
    :show-top="false"
    >    
        <template #left>
             <Comptes />
        </template>
        <template #default>
          <ComptesDetails v-if="currentCompte && !isPatientez" />              
          <TPatientez v-else-if="isPatientez"/>
          <TSelectionnez message="Selectionnez un compte svp ..." v-else/>
        </template>

  </TLayoutModule>

</template>