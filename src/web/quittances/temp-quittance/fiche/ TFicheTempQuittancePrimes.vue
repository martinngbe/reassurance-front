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
const numberConfig = {
  decimals: 2,
  formatOptions: { style: 'decimal' },
  returnType: 'number' as const,
}
// Configuration des champs pour l'affichage
const fields = computed<FormField[]>(() => [
  /////////////////////////////// 
  ////// Prime 
  /////////////////////////////
  { key: 'primeBrute',          label: 'Prime Brute',     type: 'number' , size:'2xl' , helpText:"Prime Brute à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }}, 
  { key: 'primeNette',          label: 'Prime Nette',     type: 'number' , size:'2xl' , helpText:"Prime Nette à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }}, 
  { key: 'estimationPrime',     label: 'Estimation',      type: 'number' , size:'2xl' , helpText:"Estimation à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }}, 

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