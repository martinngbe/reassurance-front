<script setup lang="ts">
import TAlert from '@/composants/display/TAlert.vue';
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TPatientez from '@/composants/utilitaire/TPatientez.vue';
import { useQuittanceTrancheStore } from '@/services/quittances/quittance-tranche/quittance-tranche.store';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import TQuittanceTranche from '@/web/quittances/quittance-tranche/TQuittanceTranche.vue';
import Quittances from '@/web/quittances/quittance/Quittances.vue';
import { computed, ref, watch } from 'vue';
const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=>quittanceStore.currentQuittance)
const quittanceTrancheStore = useQuittanceTrancheStore()



let searchTimeout: number | undefined
const isPatientez = ref(false)
watch(currentQuittance, () => {
  isPatientez.value=true
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
   isPatientez.value=false
   quittanceTrancheStore.clearSelection()
  }, 400)
})

</script>

<template>
  <TLayoutModule
    bottom-size="50%"
    :show-top="false"
    :show-left="false"
    >
        <template #default>
              <Quittances/>
        </template>
        <template #footer>
                <TQuittanceTranche  v-if="currentQuittance && !isPatientez" />
                <TPatientez v-else-if="isPatientez"/> 
                <div v-else class="flex w-full  p-4 h-full items-center justify-center">                 
                  <TAlert variant="info">
                      <p class="text-2xl font-bold">Selectionnez une quittance svp..</p> 
                  </TAlert> 
                </div>
        </template>
  </TLayoutModule>
</template>