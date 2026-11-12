<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FormField } from '@/composants/forms/generic-form/types-form'
import type { PaginationParams } from '@/type/pagination'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'
import { useTempQuittanceStore } from '@/services/quittances/temp-quittance/temp-quittance.store'
import type { TempQuittance, TempQuittanceFormData } from '@/services/quittances/temp-quittance/temp-quittance'
import { useTempQuittances } from '@/services/quittances/temp-quittance/useTempQuittance'
import { useMouvementStore } from '@/services/referentiel/mouvement/mouvement.store'
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store'
import TAlert from '@/composants/display/TAlert.vue'

// ==================== STORES & COMPUTED ====================
const mouvementStore = useMouvementStore()
const tempPoliceStore = useTempPoliceStore()
const tempQuittanceStore = useTempQuittanceStore()

const currentMouvement = computed(() => mouvementStore.currentMouvement)
const currentTempQuittance = computed(() => tempQuittanceStore.currentTempQuittance)
const currentTempPolice = tempPoliceStore.currentTempPolice
const natureOffre = currentTempPolice?.natureOffre
const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

console.log('==================================')
console.log('TempQuittanceCapitauxForm.vue')
console.log('==================================')
console.log('currentTempPolice    :', currentTempPolice)
console.log('currentTempQuittance.value :', currentTempQuittance.value)
console.log('currentMouvement.value     :', currentMouvement.value)
console.log('==================================')

// ==================== CONFIGURATION DES CHAMPS ====================

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

// ✅ Génération dynamique et lisible des champs
// const tempQuittanceFields = computed<FormField[]>(() => {
//   // 1. Champs de base (toujours présents)
//   const fields: FormField[] = [
//     createNumberField('capitaux', 'Capitaux'),
//     createNumberField('lci', 'LCI'),
//     createNumberField('smp', 'SMP'),
//   ]
//   // 2. Champs conditionnels (si l'offre n'est pas proportionnelle)
  
//   if(currentNatureOffre.value)  {
//             if ( currentNatureOffre.value.isEdp) {
//                 fields.push(
//                   createNumberField('retention', 'Rétention'),
//                   createNumberField('aliment', 'Aliment'),
//                 )
//               }
//               if ( currentNatureOffre.value.isXs) {
//                 fields.push(
//                   createNumberField('capacite', 'Portée'),
//                   createNumberField('retention', 'Franchise'),
//                 )
//               }
//               if (
//                 currentNatureOffre.value.isFacObligatoire || 
//                 currentNatureOffre.value.isQuotePart
//               ) {
//                 fields.push(
//                   createNumberField('aliment', 'Aliment'),
//                   createNumberField('capacite', 'Capacité'),
//                 )
//               }

//   }//if(currentNatureOffre.value) 

//   return fields
// })
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

// ==================== LOGIQUE FORMULAIRE ====================

const isEditing = computed(() => !!currentTempQuittance.value?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

// ✅ Fonction pour initialiser le formData avec le bon mapping
// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): TempQuittanceFormData {
  // Correction 1 : Ajout de .value et suppression de l'espace dans "currentTempQuittance"
  if (!currentTempQuittance.value) {
    return Object.fromEntries(
      tempQuittanceFields.value
        // Correction 2 : On filtre pour ne garder que les champs qui ont une 'key' (exclut les SectionHeader)
        .filter((f): f is Extract<FormField, { key: string }> => 'key' in f)
        .map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as unknown as TempQuittanceFormData
  }

  const data = { ...currentTempQuittance.value } as TempQuittanceFormData
  return data as TempQuittanceFormData
}

const formData = ref<TempQuittanceFormData>(initializeFormData())

// ✅ Watcher pour gérer les changements de currentTempQuittance
watch(() => currentTempQuittance, (newQuittance) => {
  if (newQuittance) {
    formData.value = initializeFormData()
  }
}, { deep: true })

const errorMessage = ref<string | null>(null)
const params = computed<PaginationParams>(() => ({}))
const { createTempQuittance, updateTempQuittance } = useTempQuittances(params)

const loading = computed(() => createTempQuittance.isPending.value || updateTempQuittance.isPending.value)

// ✅ Fonction helper pour extraire l'ID d'un objet ou retourner la valeur telle quelle
function extractId(value: any): number | undefined {
  if (value && typeof value === 'object' && value.id) {
    return value.id
  }
  return value
}


// ✅ Helper pour construire le payload commun (évite la duplication)
function buildPayload(data: Record<string, any>) {
   const mouvementId = data.mouvementId || currentMouvement.value?.id
   const policeId = data.policeId || currentTempPolice?.id
  return {
          mouvementId,
          capitaux: data.capitaux,
          lci: data.lci,
          smp: data.smp,
          limite: data.limite,
          retention: data.retention,
          conservation: data.conservation,
          capacite: data.capacite,
  }
}

const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.log('____ AVANT _____ TempQuittanceCapitauxForm.handleSubmit _________ ')
  console.log('currentMouvement.value: ', currentMouvement.value)
  console.log('data: ', data)

  try {
  

    if (isEditing.value && currentTempQuittance.value?.id) {
      console.log(" < < < < < < < handleSubmit data: ", data)
      await updateTempQuittance.mutateAsync({
        id: currentTempQuittance.value.id,
        data: buildPayload(data),
      })
      emit('success', 'TempQuittance Capitaux modifié avec succès')
    } else {
      await createTempQuittance.mutateAsync(buildPayload(data) as TempQuittance)
      emit('success', 'Quittance créée avec succès')    }
  } catch (err: any) {
    console.error('Erreur sauvegarde:', err)
    errorMessage.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue lors de la sauvegarde.'
  }

  console.log('____ APRES _____ TempQuittanceCapitauxForm.handleSubmit _________ ')
}

const handleCancel = () => {
  errorMessage.value = null
  emit('cancel')
}
</script>

<template>
  <div class="flex flex-col">
    <TTitreSousModule libelle="Quittance Capitaux" class="mb-8" />
    
    <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {{ errorMessage }}
    </div>

    <GenericCrudForm 
      v-if="currentTempPolice"
      v-model="formData"
      :fields="tempQuittanceFields"
      :mode="formMode"
      :show-delete="false"
      :columns="4"
      responsive
      gap="md"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
    
    <div v-else class="w-full">
      <TAlert variant="warning">
        <p class="text-xl">Saisissez d'abord la police svp ...</p>
      </TAlert>
    </div>
  </div>
</template>

<style scoped>
/* Animation pour le message d'erreur */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>