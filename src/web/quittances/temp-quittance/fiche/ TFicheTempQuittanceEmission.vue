<script setup lang="ts">
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
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

// Configuration des champs pour l'affichage
const fields = computed<FormField[]>(() => [
  // Section Informations générales
{ section: 'Dévise et Période de couverture' },
{
  key: 'deviseId',
  label: 'Devise',
  type: 'async-select',
  required: true,
  size:'xl',
  asyncOptions: {
    labelBy: 'libelle'
  }
},
{ key: 'coursDevise',           label: 'Cours devise',      type: 'number' , size:'xl',  required: true,},
{ key: 'dateEffet',             label: 'Date Effet',        type: 'calendar', size:'xl'},  
{ key: 'dateEcheance',          label: 'Date Echéance',     type: 'calendar', size:'xl' },

{ section: 'Autres informations' },
{ key: 'avisEcheance',          label: 'Avis Echéance',     type: 'number', size:'xl' , helpText:"Délais (jours) de notification avant échéance"},  
{ key: 'nombreEcheancePmd',     label: 'Nb.échéance PMD',   type: 'number', size:'xl' }, 
{ key: 'sinistreAuComptant',    label: 'Sinistre au Comptant',   type: 'number', size:'xl' , helpText:'Montant min à payer sans attendre'}, 
{ key: 'avisSinistre',          label: 'Avis sinistre',     type: 'number', size:'xl' , helpText:'Délais (jours) de notification du sinistre'}, 

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
  <GenericDetailView
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
  />
</template>