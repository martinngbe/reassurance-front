<script setup lang="ts">
import TAlert from '@/composants/display/TAlert.vue';
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TPatientez from '@/composants/utilitaire/TPatientez.vue';
import { useAssureStore } from '@/services/acteurs/assure/assure.store';
import { usePoliceStore } from '@/services/polices/police/police.store';

import Assures from '@/web/acteurs/assure/Assures.vue';
import Polices from '@/web/polices/police/Polices.vue';
import Quittances from '@/web/quittances/quittance/Quittances.vue';
import { computed, ref, watch } from 'vue';

// Nous sommes sur Ecran des FAC
// Lecture de l'assuré en cours
const assureStore = useAssureStore()
const currentAssure = computed(() => assureStore.currentAssure)

const policeStore = usePoliceStore()
const currentPolice = computed(() => policeStore.currentPolice)


const isChangemementAssureTermine = ref(true)
const isChangemementPoliceTerminee = ref(true)
// On surveille le changementde  currentAssure
let assureTimeout: number | undefined
watch(currentAssure, () => {
  console.log(" ------- watch(currentAssure assuré a changé ")
  // le changement d'un assuré antraine
  // la réinitialisation de
  isChangemementAssureTermine.value=false
  isChangemementPoliceTerminee.value=false
  window.clearTimeout(assureTimeout)

  assureTimeout = window.setTimeout(() => {
   isChangemementAssureTermine.value=true
  }, 300)
})

// ////////////////////////////////////////
// On surveille le changementde  currentPolice
// ////////////////////////////////////////
let policeTimeout: number | undefined
watch(currentPolice, () => {
  console.log(" ------- watch(currentPolice la police a changé ")
  isChangemementPoliceTerminee.value=false
  window.clearTimeout(policeTimeout)

  policeTimeout = window.setTimeout(() => {
   isChangemementPoliceTerminee.value=true
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
          <TLayoutModule
              left-size="50%"
              :show-top="false"
              :show-bottom="false"
            >
                <template  #left>
                    <Assures />
                </template>
                <template  #default>
                    <Polices :current-assure="currentAssure" v-if="currentAssure && isChangemementAssureTermine" />                   
                    <div  class="flex w-full  p-24 h-full items-center justify-center" v-else>
                          <TPatientez v-if="!isChangemementAssureTermine" />
                          <TAlert variant="info" v-else>
                              <p class="text-2xl font-bold">Selectionnez un assuré svp ...</p> 
                           </TAlert> 
                    </div>
                   
                </template>
          </TLayoutModule>
    </template>
    <template #footer>
            <Quittances :current-police="currentPolice" v-if="currentAssure && currentPolice && isChangemementPoliceTerminee" />
           
            <div  class="flex w-full  p-24 h-full items-center justify-center" v-else>
                                 
                  <TAlert variant="info"  v-if="!currentPolice">
                      <p class="text-2xl font-bold">Selectionnez une police svp ...</p> 
                  </TAlert> 
                   <TPatientez v-else-if="!isChangemementPoliceTerminee" /> 
                   

            </div>

    </template>


  </TLayoutModule>
</template>