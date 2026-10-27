<script setup lang="ts">
import TAlert from '@/composants/display/TAlert.vue';
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
import { AUCUN } from '@/services/common/constantes';
import type { TempQuittance } from '@/services/quittances/temp-quittance/temp-quittance';
import { useTempPoliceStore } from '@/services/temp-police/temp-police.store';
import { computed } from 'vue'


const tempPoliceStore = useTempPoliceStore()
const currentTempPolice = computed(()=> tempPoliceStore.currentTempPolice)
const isAucunCourtier = computed(()=>currentTempPolice.value && 
         currentTempPolice.value.acteurCourtier && 
         currentTempPolice.value.acteurCourtier.sigle ===AUCUN)



const props = defineProps<{
  quittance: TempQuittance
  loading?: boolean
  showHeader?:boolean
  colums?: 1 | 2 | 3 | 4 | undefined
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  back: []
}>()
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
    ...props.quittance,
    // Formater les relations pour l'affichage
    deviseId: props.quittance.devise,
  }
})

</script>

<template>
  <GenericDetailView  v-if="currentTempPolice && !isAucunCourtier"
    :model-value="formattedQuittance"
    :fields="fields"
    :show-header="props.showHeader"
    :loading="loading"
    :columns="props.colums?? 2"
    gap="md"
    :show-edit="true"
    :show-delete="true"
    :show-back="true"
    @edit="emit('edit')"
    @delete="emit('delete')"
    @back="emit('back')"
  />    <div class="w-full" v-else>
        <TAlert  variant="warning">
            <p class="text-xl"  v-if="!currentTempPolice">
              Saisissez d'abord la police svp ...
            </p >
            <p class="text-xl" v-else >
             Aucun courtier ...
            </p>
        </TAlert>
    </div>
</template>