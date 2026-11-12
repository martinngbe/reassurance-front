<script setup lang="ts">
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store';
import type { TempQuittance } from '@/services/quittances/temp-quittance/temp-quittance';
import { useTempQuittanceStore } from '@/services/quittances/temp-quittance/temp-quittance.store';
import { computed } from 'vue'

const tempQuittanceStore = useTempQuittanceStore()
const tempPoliceStore = useTempPoliceStore()
const currentTempQuittance = computed(()=> tempQuittanceStore.currentTempQuittance)
const currentTempPolice = tempPoliceStore.currentTempPolice
const natureOffre = currentTempPolice?.natureOffre
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
// const fields = computed<FormField[]>(() => [
//   /////////////////////////////// 
//   ////// Prime 
//   /////////////////////////////
//   { key: 'primeBrute',          label: 'Prime Brute',     type: 'number' , size:'2xl' , helpText:"Prime Brute à 100%",
//         numberOptions: {
//           decimals: 2,
//           formatOptions: { style: 'decimal' },
//           returnType: 'number',
//         }}, 
//   { key: 'primeNette',          label: 'Prime Nette',     type: 'number' , size:'2xl' , helpText:"Prime Nette à 100%",
//         numberOptions: {
//           decimals: 2,
//           formatOptions: { style: 'decimal' },
//           returnType: 'number',
//         }}, 
//   { key: 'estimationPrime',     label: 'Estimation',      type: 'number' , size:'2xl' , helpText:"Estimation à 100%",
//         numberOptions: {
//           decimals: 2,
//           formatOptions: { style: 'decimal' },
//           returnType: 'number',
//         }}, 

// ])
const tempQuittanceFields = computed<FormField[]>(() => {
  // 1. Liste COMPLÈTE des champs (y compris conditionnels)
  const allFields: FormField[] = [ 
   
    { section: 'Primes' },
    { key: 'primeBrute', label: 'Prime brute', type: 'number', numberOptions: { min: 0 } , helpText:'Prime à100%' },
    { key: 'estimationPrime', label: 'Estimation prime', type: 'number', numberOptions: { min: 0 } , helpText:'Prime à100%'},   
  ]


  const isEdp =natureOffre?.isEdp   
  const isFacultative =natureOffre?.isFacultative
  const isFacObligatoire =natureOffre?.isFacObligatoire
  const isQuotePart =natureOffre?.isQuotePart
  const isXs =natureOffre?.isXs
  const excludedKeys = new Set<string>()
  if (isEdp || isFacObligatoire || isQuotePart) {
    // OFFRE PROPORTIONNELLE : retirer les champs Non-Proportionnelle
    excludedKeys.add('estimationPrime')
    excludedKeys.add('primeBrute')
   
  }else if(isXs){
    excludedKeys.add('primeBrute')
  }

  // Le deux champs primes ont été rétirée
  // donc on retourne un tableau vide
  if(excludedKeys.size===2) return [] 
  // 3. Application du filtre
  if (excludedKeys.size === 0) return allFields

  return allFields.filter(
    (field) => !('key' in field) || !excludedKeys.has(field.key as string)
  )
})

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