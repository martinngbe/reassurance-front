<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FormField } from '@/composants/forms/generic-form/types-form'
import type { PaginationParams } from '@/type/pagination'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'
import { useTempQuittanceStore } from '@/services/quittances/temp-quittance/temp-quittance.store'
import type { TempQuittance, TempQuittanceFormData } from '@/services/quittances/temp-quittance/temp-quittance'
import { useTempQuittances } from '@/services/quittances/temp-quittance/useTempQuittance'
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store'
import { useMouvementStore } from '@/services/referentiel/mouvement/mouvement.store'
import TAlert from '@/composants/display/TAlert.vue'
import TSelectionnez from '@/composants/utilitaire/TSelectionnez.vue'

// ==================== STORES & COMPUTED ====================
const tempQuittanceStore = useTempQuittanceStore()
const tempPoliceStore = useTempPoliceStore()
const mouvementStore = useMouvementStore()

const currentTempQuittance = computed(() => tempQuittanceStore.currentTempQuittance)
const currentMouvement = computed(() => mouvementStore.currentMouvement)
const currentTempPolice = tempPoliceStore.currentTempPolice
const natureOffre = currentTempPolice?.natureOffre
const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

console.log('==================================')
console.log('TempQuittanceTaxesEtTauxForm.vue')
console.log('==================================')
console.log('currentTempPolice    :', currentTempPolice)
console.log('currentTempQuittance.value :', currentTempQuittance.value)
console.log('currentMouvement.value     :', currentMouvement.value)
console.log('==================================')

// ==================== CONFIGURATION DES CHAMPS ====================

// ✅ Configuration commune pour les nombres
// const numberConfig = {
//   decimals: 2,
//   min: 0,        // 👈 Prix minimum = 0
//   max: 100, // 👈 Prix maximum
//   returnType: 'number' as const,
// }

// ✅ Helper pour créer un champ numérique rapidement
const createNumberField = (key: string, label: string, helpText?: string): FormField => ({
  key,
  label,
  type: 'number',
  size: 'xl',
  helpText: `${label} à 100%`,
  numberOptions:  {
    decimals: 2,
    formatOptions: { style: 'decimal' },
    returnType: 'number',
    min: 0,        // 👈 Prix minimum = 0
    max: 100, // 👈 Prix maximum
  },
})

const tempQuittanceFields = computed<FormField[]>(() => {
  // 1. Liste COMPLÈTE des champs (y compris conditionnels)
  const allFields: FormField[] = [

    { section: 'Taux et Taxes' },
    createNumberField( 'tauxCedante', 'Taux Cédante'  ),
    createNumberField( 'tauxAccepte', 'Taux Accepté'  ),
    createNumberField( 'tauxCession', 'Taux Cession' ),
    createNumberField( 'tauxRetention', 'Taux Retention' ),
    createNumberField( 'tauxCommission', 'Taux commission' ),
    createNumberField( 'taxeSurPrime', 'Taxe sur prime' ),
    createNumberField( 'taxeSurCommission', 'Taxe sur commission' ),

  ]

  // 2. Champs à retirer selon l'état courant
  // ✅ Utiliser policeQuittance.value (maintenant réactif)
  // const isOffreProportionnelle = currentTempPolice.value
  //   ? currentTempPolice.value.natureOffre?.isProportionnelle === true
  //   : false
  const isEdp =natureOffre?.isEdp   
  const isFacultative =natureOffre?.isFacultative
  const isFacObligatoire =natureOffre?.isFacObligatoire
  const isQuotePart =natureOffre?.isQuotePart
  const isXs =natureOffre?.isXs
  const excludedKeys = new Set<string>()
  if(isEdp){
    excludedKeys.add( 'tauxCedante')
    excludedKeys.add( 'tauxAccepte')
    excludedKeys.add( 'tauxCession' )
    excludedKeys.add( 'tauxRetention' )    
    excludedKeys.add( 'tauxCommission' )
    excludedKeys.add( 'taxeSurPrime' )
    excludedKeys.add( 'taxeSurCommission' )

  }else if(isFacObligatoire){
    excludedKeys.add( 'tauxCedante')
    excludedKeys.add( 'tauxAccepte')
    //excludedKeys.add( 'tauxCession' )
    excludedKeys.add( 'tauxRetention' )    
    excludedKeys.add( 'tauxCommission' )
    excludedKeys.add( 'taxeSurPrime' )
    excludedKeys.add( 'taxeSurCommission' )  
  }else if(isQuotePart){
    excludedKeys.add( 'tauxCedante')
    excludedKeys.add( 'tauxAccepte')
    //excludedKeys.add( 'tauxCession' )
    //excludedKeys.add( 'tauxRetention' )    
    excludedKeys.add( 'tauxCommission' )
    excludedKeys.add( 'taxeSurPrime' )
    excludedKeys.add( 'taxeSurCommission' )  
  }else if(isXs){
    excludedKeys.add( 'tauxCedante')
    excludedKeys.add( 'tauxAccepte')
    excludedKeys.add( 'tauxCession' )
    excludedKeys.add( 'tauxRetention' )    
    excludedKeys.add( 'tauxCommission' )
    excludedKeys.add( 'taxeSurPrime' )
    excludedKeys.add( 'taxeSurCommission' )  
  }

    // Le les champs  ont été rétirée
  // donc on retourne un tableau vide
  if(excludedKeys.size===7) return [] 
  // 3. Application du filtre
  if (excludedKeys.size === 0) return allFields

  return allFields.filter(
    (field) => !('key' in field) || !excludedKeys.has(field.key as string)
  )
})

// ==================== LOGIQUE FORMULAIRE ====================

const isEditing = computed(() => !!currentTempQuittance.value?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))
const isAucunTauxASaisir = computed(()=> tempQuittanceFields.value.length===0)

// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): TempQuittanceFormData {
  if (!currentTempQuittance.value) {
    return Object.fromEntries(
      tempQuittanceFields.value
        .filter((f): f is Extract<FormField, { key: string }> => 'key' in f)
        .map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as unknown as TempQuittanceFormData
  }

  return { ...currentTempQuittance.value } as TempQuittanceFormData
}

const formData = ref<TempQuittanceFormData>(initializeFormData())

// ✅ Watcher corrigé : on watch la VALEUR du computed
watch(
  () => currentTempQuittance.value,
  () => { formData.value = initializeFormData() },
  { deep: true }
)

const errorMessage = ref<string | null>(null)
const params = computed<PaginationParams>(() => ({}))
const { createTempQuittance, updateTempQuittance } = useTempQuittances(params)
const loading = computed(() => createTempQuittance.isPending.value || updateTempQuittance.isPending.value)

// ==================== SOUMISSION DU FORMULAIRE ====================

// ✅ Helper pour construire le payload commun (évite la duplication)
function buildPayload(data: Record<string, any>) {
  const mouvementId = data.mouvementId || currentMouvement.value?.id

  return {
    mouvementId,
    tauxCedante: data.tauxCedante,
    tauxAccepte: data.tauxAccepte,
    taxeSurPrime: data.taxeSurPrime,
  }
}

const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  
  try {
    const payload = buildPayload(data)

    if (isEditing.value && currentTempQuittance.value?.id) {
      console.log('<<<<<<< handleSubmit data:', data)
      await updateTempQuittance.mutateAsync({
        id: currentTempQuittance.value.id,
        data: payload,
      })
      emit('success', 'Quittance des Taux et Taxes modifiée avec succès')
    } else {
      await createTempQuittance.mutateAsync(payload as TempQuittance)
      emit('success', 'Quittance des Taux et Taxes créée avec succès')
    }
  } catch (err: any) {
    console.error('Erreur sauvegarde:', err)
    errorMessage.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue lors de la sauvegarde.'
  }
}

const handleCancel = () => {
  errorMessage.value = null
  emit('cancel')
}
</script>

<template>
    <div  class="flex w-full  p-24 mt-24 h-full items-center justify-center"
    v-if="isAucunTauxASaisir">
          <TSelectionnez 
            message="Aucun taux à saisir pour cette offre"
          /> 
  </div>
  <div class="flex flex-col" v-else>
    <TTitreSousModule libelle="Quittance Taux et Taxes" class="mb-8" />
    
    <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {{ errorMessage }}
    </div>

    <GenericCrudForm
      v-if="currentTempPolice"
      v-model="formData"
      :fields="tempQuittanceFields"
      :mode="formMode"
      :show-delete="false"
      :columns="3"
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