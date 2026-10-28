<script setup lang="ts">
import TAlert from '@/composants/display/TAlert.vue';
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TPatientez from '@/composants/utilitaire/TPatientez.vue';
import { usePoliceStore } from '@/services/polices/police/police.store';
import Polices from '@/web/polices/police/Polices.vue';
import Quittances from '@/web/quittances/quittance/Quittances.vue';
import { computed, ref, watch } from 'vue';

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
                   <Polices  />
                </template>
                <template  #default>
                      <div  class="flex w-full  p-24 h-full items-center justify-center"  v-if="!currentPolice">
                          <TAlert variant="info" >
                              <p class="text-2xl font-bold">Détail des informations</p> 
                          </TAlert> 
                    </div> 
                </template>
          </TLayoutModule>
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