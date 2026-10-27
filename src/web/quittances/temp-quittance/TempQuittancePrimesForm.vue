<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { PaginationParams } from '@/type/pagination'
import { apiClient } from '@/api/api-client'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'
import { useTempQuittanceStore } from '@/services/quittances/temp-quittance/temp-quittance.store'
import type { TempQuittance, TempQuittanceFormData } from '@/services/quittances/temp-quittance/temp-quittance'
import { useTempQuittances } from '@/services/quittances/temp-quittance/useTempQuittance'
import { useTempPoliceStore } from '@/services/temp-police/temp-police.store'
import TAlert from '@/composants/display/TAlert.vue'
import { useMouvementStore } from '@/services/referentiel/mouvement/mouvement.store'


const tempQuittanceStore = useTempQuittanceStore()
const tempPoliceStore = useTempPoliceStore()
const currentTempQuittance = computed(()=> tempQuittanceStore.currentTempQuittance)
const currentTempPolice = computed(()=> tempPoliceStore.currentTempPolice)
const mouvementStore = useMouvementStore()
const currentMouvement = computed(()=> mouvementStore.currentMouvement)

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()
console.log('==================================')
console.log('TempQuittancePrimesForm.vue')
console.log('==================================')
console.log('currentTempPolice.value    :',currentTempPolice.value)
console.log('currentTempQuittance.value :',currentTempQuittance.value)
console.log('currentMouvement.value     :',currentMouvement.value)
console.log('==================================')

// ✅ REMPLACER le ref local par un computed lié au store

// ==================== FONCTIONS RESOLVE (SCROLL INFINI) ====================

async function fetchActeur(query: string, page: number) {
  const res = await apiClient.get('/pays', {
    params: { search: query, page, limit: 20 }
  })
  return {
    options: res.data.items || res.data.data || [],
    hasMore: res.data.meta?.current_page < res.data.meta?.last_page || false
  }
}

async function fetchSousBranche(query: string, page: number) {
  const res = await apiClient.get('/sous-branche', {
    params: { search: query, page, limit: 20 }
  })
  return {
    options: res.data.items || res.data.data || [],
    hasMore: res.data.meta?.current_page < res.data.meta?.last_page || false
  }
}

// ==================== CONFIGURATION DES CHAMPS ====================
const numberConfig = {
  decimals: 2,
  returnType: 'number' as const,
}
const tempQuittanceFields: FieldConfig[] = [
  /////////////////////////////// 
  ////// Prime 
  /////////////////////////////
  { key: 'primeBrute',          label: 'Prime Brute',     type: 'number' , size:'lg' , helpText:"Prime Brute à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }}, 
  { key: 'primeNette',          label: 'Prime Nette',     type: 'number' , size:'lg' , helpText:"Prime Nette à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }}, 
  { key: 'estimationPrime',     label: 'Estimation',      type: 'number' , size:'lg' , helpText:"Estimation à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }}, 
 
 
]
// ==================== LOGIQUE FORMULAIRE ====================

const isEditing = computed(() => !!currentTempQuittance.value?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): TempQuittanceFormData {
  if (!currentTempQuittance) {
    return Object.fromEntries(
      tempQuittanceFields.map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as  unknown as TempQuittanceFormData
  }

  const data = { ...currentTempQuittance.value } as TempQuittanceFormData
  return data as TempQuittanceFormData
}

const formData = ref<TempQuittanceFormData>(initializeFormData())

// ✅ Watcher pour gérer les changements de props.currentTempQuittance
watch(() => currentTempQuittance, (newActeur) => {
  if (newActeur) {
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

const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
   if(!data.mouvementId && currentMouvement.value)
      data.mouvementId = currentMouvement.value.id;
  try {
    if (isEditing.value && currentTempQuittance.value?.id) {
      console.log("<<<<<<< handleSubmit data:",data)
      await updateTempQuittance.mutateAsync({
        id: currentTempQuittance.value.id,
        data: {          
           
            ///////////////////////////// 
            ////// Prime 
            /////////////////////////////
            estimationPrime: data.estimationPrime,
            primeBrute: data.primeBrute,
            primeNette: data.primeNette, 
        },
      })
      emit('success', 'Quittance des primes modifié avec succès')
    } else {
      await createTempQuittance.mutateAsync({
 
            ///////////////////////////// 
            ////// Prime 
            /////////////////////////////
            estimationPrime: data.estimationPrime,
            primeBrute: data.primeBrute,
            primeNette: data.primeNette, 
      } as TempQuittance)
      emit('success', 'Quittance des Primes créé avec succès')
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

const dismissError = () => {
  errorMessage.value = null
}
</script>

<template>
  <div class="flex flex-col ">
    <TTitreSousModule  libelle="Quittance Primes" class="mb-8" />  
   
    <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {{ errorMessage }}
    </div>
    <GenericCrudForm v-if="currentTempPolice"
      v-model="formData"
      :fields="tempQuittanceFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :columns="3"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
    <div class="w-full" v-else>
        <TAlert  variant="warning">
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