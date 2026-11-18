<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue';

import { computed, ref, watch } from 'vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store.ts';
import { useCumulTauxCession } from '@/services/quittances/quittance-placement/useCumulTauxCession.ts';
import TQuittanceTrancheForm from './TQuittanceTrancheForm.vue';
import QuittanceTranches from './QuittanceTranches.vue';
import { useQuittanceTrancheStore } from '@/services/quittances/quittance-tranche/quittance-tranche.store.ts';


//const quittanceStore = useQuittanceStore();
//const currentQuittance = computed(() => quittanceStore.currentQuittance);
//const quittanceTrancheStore = useQuittanceTrancheStore()

const isPatientez = ref(false)
let searchTimeout: number | undefined
const actualiseFiche=()=>{
    isPatientez.value=true
    window.clearTimeout(searchTimeout)
    searchTimeout = window.setTimeout(() => {
            isPatientez.value=false
            //quittanceTrancheStore.clearSelection()
    }, 300)
}

</script>


<template>
  <TLayoutModule
    :show-bottom="false"
    :show-left="false"
    :show-top="false"
    >    
       
        <template #default>
              <QuittanceTranches @form-success="actualiseFiche" />
        </template>

  </TLayoutModule>

</template>