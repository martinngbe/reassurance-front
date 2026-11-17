<script setup lang="ts">
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store';
import { quittanceEmissionFields } from '@/services/quittances/quittance/quittance';
import type { TempQuittance } from '@/services/quittances/temp-quittance/temp-quittance';
import { computed } from 'vue'

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
const tempPoliceStore = useTempPoliceStore()
const natureOffre = tempPoliceStore.currentTempPolice?.natureOffre
// const tempQuittanceFields = computed<FormField[]>(() => {
//   // 1. On initialise un tableau explicitement typé
//   const allFields: FormField[] = [
//     { section: 'Dévise et Période de couverture' },
//     {    
//       key: 'deviseId',
//       label: 'Devise',
//       type: 'async-select',
//       size:'xl',
//       required: true,
//       asyncOptions: {  labelBy: 'libelle' }
//     },
//     { key: 'coursDevise', label: 'Cours devise', type: 'number', required: true },
//     { key: 'dateEffet', label: 'Date Effet', type: 'calendar' },  
//     { key: 'dateEcheance', label: 'Date Echéance', type: 'calendar' },
   
//     { section: 'Autres informations' },
//     { key: 'nombrePlein', label: 'Nombre Plein', type: 'number' },
//     { key: 'nombreEcheancePmd', label: 'Nb.échéance PMD', type: 'number' },     
//     { key: 'avisEcheance', label: 'Avis Echéance', type: 'number', helpText: "Délais (jours) de notification avant échéance" },  
   
//     { key: 'sinistreAuComptant', label: 'Sinistre au Comptant', type: 'number', helpText: 'Montant min à payer sans attendre' }, 
//     { key: 'avisSinistre', label: 'Avis sinistre', type: 'number', helpText: 'Délais (jours) de notification du sinistre' }
   
//   ];
//   const isEdp =natureOffre?.isEdp   
//   const isFacultative =natureOffre?.isFacultative
//   const isFacObligatoire =natureOffre?.isFacObligatoire
//   const isQuotePart =natureOffre?.isQuotePart
//   const isXs =natureOffre?.isXs
//   const excludedKeys = new Set<string>()
//   if(isEdp)  {
//     excludedKeys.add('nombreEcheancePmd')
//    //  excludedKeys.add('nombreEcheancePmd')
//   } if(isFacObligatoire || isFacultative || isQuotePart){
//      excludedKeys.add( 'nombreEcheancePmd')
//      excludedKeys.add( 'nombrePlein')
//      excludedKeys.add( 'nombreTranche')
//   } if(isXs){
//      excludedKeys.add('nombrePlein')
//   }
 
//   // 3. Application du filtre
//   if (excludedKeys.size === 0) return allFields

//   return allFields.filter(
//     (field) => !('key' in field) || !excludedKeys.has(field.key as string)
//   )   

// });

const tempQuittanceFields = computed<FormField[]>(() =>
quittanceEmissionFields(natureOffre, null) )

// // Données formatées pour l'affichage
const formattedQuittance = computed(() => {
  return {
    ...props.quittance,
    // Formater les relations pour l'affichage
    deviseId: props.quittance.devise,
  }
})

</script>

<template>
  <GenericDetailView
    :model-value="formattedQuittance"
    :fields="tempQuittanceFields"
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
  />
</template>