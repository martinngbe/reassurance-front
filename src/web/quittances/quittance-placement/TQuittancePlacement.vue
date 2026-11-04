<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue';

import QuittancePlacements from './QuittancePlacements.vue';
import TFicheQuittancePlacement from './fiche/ TFicheQuittancePlacement.vue';
import { computed, ref, watch } from 'vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store.ts';
import { useCumulTauxCession } from '@/services/quittances/quittance-placement/useCumulTauxCession.ts';
import TPatientez from '@/composants/utilitaire/TPatientez.vue';
import TAlert from '@/composants/display/TAlert.vue';

const quittanceStore = useQuittanceStore();
const currentQuittance = computed(() => quittanceStore.currentQuittance);
const quittanceIdRef = computed(() => currentQuittance.value?.id ?? null)
const {
  //tauxAccepte,
  cumulTauxCession,
  // tauxDisponible,
  // isCumulDepasse,
  // nombrePlacementsActifs
} = useCumulTauxCession(quittanceIdRef)

const isPatientez = ref(false)
let searchTimeout: number | undefined
const actualiseFiche=()=>{
    isPatientez.value=true
    window.clearTimeout(searchTimeout)
    searchTimeout = window.setTimeout(() => {
            isPatientez.value=false
    }, 300)
}

</script>


<template>
  <TLayoutModule
    :show-bottom="false"
    leftSize="30%"
    :show-top="false"
    >    
        <template #left>
              <TFicheQuittancePlacement  v-if="currentQuittance && !isPatientez"/>           
              <TPatientez v-else-if="isPatientez"/> 
              <div v-else class="flex w-full  p-4 h-full items-center justify-center">                 
                      <TAlert variant="info">
                          <p class="text-2xl font-bold">Selectionnez une quittance svp..</p> 
                      </TAlert> 
                </div>
        </template>
        <template #default>
              <QuittancePlacements @form-success="actualiseFiche" />
        </template>

  </TLayoutModule>

</template>