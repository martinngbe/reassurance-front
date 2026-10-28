<script setup lang="ts">
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import type { TempQuittance } from '@/services/quittances/temp-quittance/temp-quittance';
import { computed } from 'vue'
/*
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
*/

/*const policeStore = usePoliceStore()
const currentPolice = computed(()=> policeStore.currentPolice)

const curentNatureOffre = computed(()=> currentPolice.value?.natureOffre)
*/
const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=> quittanceStore.currentQuittance)
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
    ...currentQuittance,
    // Formater les relations pour l'affichage
    //deviseId: currentQuittance.devise,
  }
})

</script>

<template>
  <GenericDetailView
    :model-value="formattedQuittance"
    :fields="fields"
    :show-header="true"
    :loading="false"
    :columns="3"
    title="Primes"
    gap="md"

  />
</template>