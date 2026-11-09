<script setup lang="ts">
    import TLayoutModule from '@/composants/layout/TLayoutModule.vue';

import { computed, ref, watch } from 'vue';
import TSelectionnez from '@/composants/utilitaire/TSelectionnez.vue';
import TPatientez from '@/composants/utilitaire/TPatientez.vue';
import TempComptes from './TempComptes.vue';
import { useTempCompteStore } from '@/services/flux-financiers/comptes/temp-compte/temp-compte.store.ts';
import TempComptesDetails from '../temp-compte-detail/TempComptesDetails.vue';


const tempCompteStore = useTempCompteStore()
const currentTempCompte = computed(() => tempCompteStore.currentTempCompte)

// ////////////////////////////////////////
// On surveille le changementde  currentQuittance
// ////////////////////////////////////////
const isPatientez = ref(false)
let currentCompteTimeout: number | undefined
watch(currentTempCompte, () => {
 
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
    leftSize="30%"
    :show-top="false"
    >    
        <template #left>
                <TempComptes />
        </template>
        <template #default>
                <TempComptesDetails v-if="currentTempCompte && !isPatientez"/>              
                <TPatientez v-else-if="isPatientez"/>
                <TSelectionnez message="Créer un Compte temporaire svp ..." v-else/>
        </template>

  </TLayoutModule>

</template>