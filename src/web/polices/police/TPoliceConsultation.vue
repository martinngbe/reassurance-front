<script setup lang="ts">

import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import Polices from './Polices.vue';
import Quittances from '@/web/quittances/quittance/Quittances.vue';
import { usePoliceStore } from '@/services/polices/police/police.store.ts';
import { computed, ref, watch } from 'vue';
import TAlert from '@/composants/display/TAlert.vue';
import TPatientez from '@/composants/utilitaire/TPatientez.vue';


const policeStore = usePoliceStore()
const currentPolice = computed(() => policeStore.currentPolice)
// ////////////////////////////////////////
// On surveille le changementde  currentPolice
// ////////////////////////////////////////

const isChangemementPoliceTerminee = ref(true)
let policeTimeout: number | undefined
watch(currentPolice, () => {
  console.warn(" EcranTraite.watch(currentPolice) la police a changé ")
  isChangemementPoliceTerminee.value=false
  window.clearTimeout(policeTimeout)

  policeTimeout = window.setTimeout(() => {
   isChangemementPoliceTerminee.value=true
  }, 300)
})



</script>

<template>
  <TLayoutModule
    bottom-size="40%"
    :show-top="false"
    :show-left="false"
    >
    <template #default>
        <Polices  /> 
    </template>
    <template #footer>
          <Quittances  v-if="currentPolice && isChangemementPoliceTerminee" />
    
              <div  class="flex w-full  p-24 h-full items-center justify-center" v-else>
                  <TAlert variant="info"  v-if="!currentPolice">
                      <p class="text-2xl font-bold">Selectionnez une police svp ...</p> 
                  </TAlert> 
                  <TPatientez v-else-if="!isChangemementPoliceTerminee" />
            </div>
    </template>


  </TLayoutModule>
</template>