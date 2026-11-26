<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue';

import QuittancePlacements from './QuittancePlacements.vue';
import TFicheQuittancePlacement from './fiche/ TFicheQuittancePlacement.vue';
import { computed, ref, watch } from 'vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store.ts';
import { useCumulTauxCession } from '@/services/quittances/quittance-placement/useCumulTauxCession.ts';
import TPatientez from '@/composants/utilitaire/TPatientez.vue';
import TAlert from '@/composants/display/TAlert.vue';
import TQuittanceCessionsLegales from './TQuittanceCessionsLegales.vue';

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

const isExecuteCessionLegale = ref(false)
const onCessionLegaleExecute = ()=>{
     actualiseQuittancePlacement()
}
const isPatientez = ref(false)
let searchTimeout: number | undefined
const actualiseFiche=()=>{
    isPatientez.value=true
    window.clearTimeout(searchTimeout)
    searchTimeout = window.setTimeout(() => {
            isPatientez.value=false
    }, 300)
}
const actualiseQuittancePlacement=()=>{
    isExecuteCessionLegale.value=true
    window.clearTimeout(searchTimeout)
    searchTimeout = window.setTimeout(() => {
            isExecuteCessionLegale.value=false
    }, 300)
}

</script>


<template>
  <TLayoutModule
    :show-bottom="false"
    :show-left="false"
    :show-top="false"
    >    
        <!--template #left>
                <TLayoutModule
                :show-bottom="false"
                topSize="50%"
                :show-left="false"
                >
                    <template  #header>
                              <TFicheQuittancePlacement  v-if="currentQuittance && !( isPatientez || isExecuteCessionLegale)"/>           
                              <TPatientez v-else-if="isPatientez"/> 
                              <div v-else class="flex w-full  p-4 h-full items-center justify-center">                 
                                      <TAlert variant="info">
                                          <p class="text-2xl font-bold">Selectionnez une quittance svp..</p> 
                                      </TAlert> 
                                </div>
                    </template>
                    <template #default>
                          <TQuittanceCessionsLegales @cession-legale-execute="onCessionLegaleExecute"/>
                    </template>

                </TLayoutModule>


        </template-->
        <template #default>
              <TPatientez v-if="isExecuteCessionLegale"/>
              <QuittancePlacements @form-success="actualiseFiche" v-else/>
        </template>

  </TLayoutModule>

</template>