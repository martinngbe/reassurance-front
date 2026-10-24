<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import { useAssureStore } from '@/services/acteurs/assure/assure.store';
import { useEcransStore } from '@/services/ecrans/ecrans.store';
import Polices from '@/web/police/Polices.vue';
import Quittances from '@/web/quittances/quittance/Quittances.vue';
import { computed, onMounted } from 'vue';


const assureStore = useAssureStore()
//const assureEnCours = computed(()=> assureStore.currentAssure)
const ecransStore = useEcransStore()
onMounted(()=>{
  ecransStore.setTraite(true)
  assureStore.clearCurrentAssure()
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
                   <Polices />
                </template>
                <template  #default>
                    <span>Informations détaillé</span>
                </template>
          </TLayoutModule>
    </template>
    <template #footer>
          <Quittances/>
    </template>


  </TLayoutModule>
</template>