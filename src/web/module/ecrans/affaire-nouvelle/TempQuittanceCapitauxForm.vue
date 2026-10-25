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
import { useMouvementStore } from '@/services/referentiel/mouvement/mouvement.store'
import { useTempPoliceStore } from '@/services/temp-police/temp-police.store'
import TAlert from '@/composants/display/TAlert.vue'

const mouvementStore = useMouvementStore()
const tempPoliceStore = useTempPoliceStore()
const currentMouvement = computed(()=> mouvementStore.currentMouvement)
const currentTempPolice = computed(()=> tempPoliceStore.currentTempPolice)


const tempQuittanceStore = useTempQuittanceStore()
const tempQuittance = computed(()=> tempQuittanceStore.currentTempQuittance)
const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()


// ==================== CONFIGURATION DES CHAMPS ====================

const tempQuittanceFields: FieldConfig[] = [
///////////////////////////// 
////// Capitaux 
/////////////////////////////
  { key: 'capitaux',     label: 'Capitaux',     type: 'number' , size:'lg', helpText:"Capitaux à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
  { key: 'lci',          label: 'LCI',          type: 'number', size:'lg' , helpText:"LCI à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
  { key: 'smp',          label: 'SMP',          type: 'number' , size:'lg', helpText:"SMP à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
  { key: 'limite',       label: 'Limite',       type: 'number' , size:'lg', helpText:"Limite à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
  { key: 'retention',    label: 'Retention',    type: 'number' , size:'lg', helpText:"Retention à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
  { key: 'conservation', label: 'Conservation', type: 'number' , size:'lg', helpText:"Conservation à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
  { key: 'capacite',     label: 'Capacite',     type: 'number' , size:'lg', helpText:"Capacite à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
  
]
// ==================== LOGIQUE FORMULAIRE ====================

const isEditing = computed(() => !!tempQuittance.value?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): TempQuittanceFormData {
  if (!tempQuittance) {
    return Object.fromEntries(
      tempQuittanceFields.map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as  unknown as TempQuittanceFormData
  }

  const data = { ...tempQuittance.value } as TempQuittanceFormData
  return data as TempQuittanceFormData
}

const formData = ref<TempQuittanceFormData>(initializeFormData())

// ✅ Watcher pour gérer les changements de props.tempQuittance
watch(() => tempQuittance, (newActeur) => {
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
    if (isEditing.value && tempQuittance.value?.id) {
      console.log("<<<<<<< handleSubmit data:",data)
      await updateTempQuittance.mutateAsync({
        id: tempQuittance.value.id,
        data: {
           
            ///////////////////////////// 
            ////// Capitaux 
            /////////////////////////////
            capitaux: data.capitaux, 
            //limiteCapitauxImpliques: data.dateEmission,
            lci: data.lci,
            smp: data.smp,
            limite: data.limite,
            retention: data.retention,
            conservation: data.conservation,
            capacite: data.capacite,
            ///////////////////////////// 
            ////// Prime 
            /////////////////////////////
            estimationPrime: data.estimationPrime,
            primeBrute: data.primeBrute,
            primeNette: data.primeNette, 
            
        },
      })
      emit('success', 'TempQuittance Capitaux modifié avec succès')
    } else {
      await createTempQuittance.mutateAsync({
            
            ///////////////////////////// 
            ////// Capitaux 
            /////////////////////////////
            capitaux: data.capitaux, 
            //limiteCapitauxImpliques: data.dateEmission,
            lci: data.lci,
            smp: data.smp,
            limite: data.limite,
            retention: data.retention,
            conservation: data.conservation,
            capacite: data.capacite,
      } as TempQuittance)
      emit('success', 'Assuré créé avec succès')
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
    <TTitreSousModule  libelle="Quittance Capitaux" class="mb-8" />  
   
    <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {{ errorMessage }}
    </div>
    <GenericCrudForm v-if="currentTempPolice"
      v-model="formData"
      :fields="tempQuittanceFields"
      :mode="formMode"
      :show-delete="false"
      :columns="2"
      responsive
      gap="md"
      :loading="loading"
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