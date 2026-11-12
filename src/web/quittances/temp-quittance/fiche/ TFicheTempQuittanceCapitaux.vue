<script setup lang="ts">
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store';
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
const natureOffre =  tempPoliceStore.currentTempPolice?.natureOffre


// ✅ Helper pour éviter de répéter la configuration des champs numériques
const createNumberField = (key: string, label: string): FormField => ({
  key,
  label,
  type: 'number',
  size: 'xl',
  helpText: `${label} à 100%`,
  numberOptions: {
    decimals: 2,
    formatOptions: { style: 'decimal' },
    returnType: 'number',
    min: 0,        // 👈 Prix minimum = 0
    max: 999999999999999.99, // 👈 Prix maximum
  },
})

const tempQuittanceFields = computed<FormField[]>(() => {
  // 1. Liste COMPLÈTE des champs (y compris conditionnels)
  const allFields: FormField[] = [
  
    { section: 'Capitaux' },
    createNumberField( 'capitaux', 'Capitaux'),
    createNumberField( 'lci',  'LCI'),
    createNumberField( 'smp',  'SMP'),
    createNumberField( 'limite',  'Limite'),
    createNumberField( 'aliment',  'Aliment'),
  
    createNumberField( 'retention',  'Retention'),
    createNumberField( 'conservation',  'Conservation'),
    createNumberField( 'capacite',  'Capacité'),
  ]

  // 2. Champs à retirer selon l'état courant
  // ✅ Utiliser policeQuittance.value (maintenant réactif)
 // const isOffreProportionnelle =natureOffre?.isProportionnelle
  
  const isEdp =natureOffre?.isEdp   
  const isFacultative =natureOffre?.isFacultative
  const isFacObligatoire =natureOffre?.isFacObligatoire
  const isQuotePart =natureOffre?.isQuotePart
  const isXs =natureOffre?.isXs

  const excludedKeys = new Set<string>()
  if (isEdp) {
    // OFFRE EDP : retirer les champs Non-Proportionnelle
    console.log('---- OFFRE EDP isEdp :',isEdp)
    excludedKeys.add( 'capitaux'),
    excludedKeys.add( 'lci'),
    excludedKeys.add( 'smp'),
    excludedKeys.add( 'limite'),  
    excludedKeys.add( 'retention'),
    excludedKeys.add( 'capacite')   
  }else if(isFacObligatoire || isQuotePart) {
    console.log('---- OFFRE FACOB  QP  isFacObligatoire :',isFacObligatoire)
    console.log('---- OFFRE FACOB  QP  isQuotePart :',isQuotePart)
    excludedKeys.add( 'capitaux'),
    excludedKeys.add( 'lci'),
    excludedKeys.add( 'smp'),
    excludedKeys.add( 'limite'),  
    excludedKeys.add( 'retention') 
    excludedKeys.add( 'conservation')
  }else if (isXs){
    console.log('---- OFFRE EDP isEdp :',isEdp)
    excludedKeys.add( 'capitaux'),
    excludedKeys.add( 'lci'),
    excludedKeys.add( 'smp'),
    excludedKeys.add( 'limite')//,  
   // excludedKeys.add( 'retention'),
   // excludedKeys.add( 'capacite')  
  }

  console.log('excludedKeys:', excludedKeys.values)

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