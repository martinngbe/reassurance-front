<script setup lang="ts">
import TAlert from '@/composants/display/TAlert.vue';
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
import { AUCUN } from '@/services/common/constantes';
import type { TempQuittance } from '@/services/quittances/temp-quittance/temp-quittance';
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store';
import { computed } from 'vue'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';


const tempPoliceStore = useTempPoliceStore()
const currentTempPolice = computed(()=> tempPoliceStore.currentTempPolice)
const isAucunCourtier = computed(()=>currentTempPolice.value && 
         currentTempPolice.value.acteurCourtier && 
         currentTempPolice.value.acteurCourtier.sigle ===AUCUN)
const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=> quittanceStore.currentQuittance)


const numberConfig = {
  decimals: 2,
  returnType: 'number' as const,
}
// Configuration des champs pour l'affichage
const fields = computed<FormField[]>(() => [

  { key: 'tauxCommission',  label: 'Taux Commission',  type: 'number', size: '2xl', helpText: 'Taux Commission à 100%', numberOptions: numberConfig },
  { key: 'taxeSurCommission', label: 'Taxe sur commission', type: 'number', size: '2xl', numberOptions: numberConfig },

])

// Données formatées pour l'affichage
const formattedQuittance = computed(() => {
  return {
    ...currentQuittance.value,
    // Formater les relations pour l'affichage
    //deviseId: props.quittance.devise,
  }
})

</script>

<template>
        <GenericDetailView  v-if="currentQuittance && isAucunCourtier"
          :model-value="formattedQuittance"
          :fields="fields"
          :show-header="true"
          :loading="false"
          :columns="2"
          title="Courtage"
          gap="md"
        
        />    
      <div class="w-full" v-else>
                <TAlert  variant="warning">                  
                    <p class="text-xl"  >Aucun courtier ...</p>
                </TAlert>
      </div>
</template>