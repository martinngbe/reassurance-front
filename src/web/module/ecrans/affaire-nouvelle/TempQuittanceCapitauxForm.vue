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


const tempQuittanceStore = useTempQuittanceStore()
const tempQuittance = computed(()=> tempQuittanceStore.currentTempQuittance)
const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()
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

const tempQuittanceFields: FieldConfig[] = [
  ///////////////////////////// 
  ////// Emission 
  /////////////////////////////  
  //dateEmission?: string; date système
  /////////////////////////////

// { key: 'dateEffet',             label: 'Date Effet',        type: 'calendar' },  
// { key: 'dateEcheance',          label: 'Date Echéance',     type: 'calendar' },

// {
//   key: 'deviseId',
//   label: 'Devise',
//   type: 'async-select',
//   required: true,
//   placeholder: 'Sélectionner une devise ...',
//   loadOptions: fetchActeur,
//   autoSelectFirst: true,  // ✅ Pré-sélectionne le premier pays en mode création
//   asyncOptions: {
//     trackBy: 'id',
//     labelBy: 'libelle'
//   }
// },

// { key: 'coursDevise',           label: 'Cours devise',      type: 'number' },
// { key: 'avisEcheance',          label: 'Avis sinistre',     type: 'number' },  
// { key: 'nombreEcheancePmd',     label: 'Nb.échéance PMD',   type: 'number' }, 
// { key: 'sinistreAuComptant',    label: 'Sinistre au Comptant',   type: 'number' }, 
// { key: 'avisSinistre',          label: 'Avis sinistre',     type: 'number' }, 
///////////////////////////// 
////// Capitaux 
/////////////////////////////
  { key: 'capitaux',     label: 'Avis sinistre',     type: 'number' }, 
 // { key: 'limiteCapitauxImpliques',          label: 'Avis sinistre',     type: 'number' }, 
  { key: 'lci',          label: 'LCI',          type: 'number' }, 
  { key: 'smp',          label: 'SMP',          type: 'number' }, 
  { key: 'limite',       label: 'Limite',       type: 'number' }, 
  { key: 'retention',    label: 'Retention',    type: 'number' }, 
  { key: 'conservation', label: 'Conservation', type: 'number' }, 
  { key: 'capacite',     label: 'Capacite',     type: 'number' }, 
  ///////////////////////////// 
  ////// Prime 
  /////////////////////////////
  // { key: 'estimationPrime',     label: 'Estimation',      type: 'number' }, 
  // { key: 'primeBrute',          label: 'Prime Brute',     type: 'number' }, 
  // { key: 'primeNette',          label: 'Prime Nette',     type: 'number' }, 

  // ///////////////////////////// 
  // ////// Taux et Taxes 
  // /////////////////////////////
  //   { key: 'tauxCedante',          label: 'Taux Cédente',     type: 'number' }, 
  //   { key: 'tauxAccepte',          label: 'Taux Accepté',     type: 'number' }, 
  //   { key: 'tauxCommission',       label: 'Taux Commission',  type: 'number' }, 
  //   { key: 'taxeSurPrime',         label: 'Taxe sur prime',     type: 'number' }, 
  //   { key: 'taxeSurCommission',    label: 'Taxe sur commission',     type: 'number' }, 

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

  // ✅ Mapper les objets COMPLETS vers les clés attendues par le formulaire
  // Le composant TAsyncSelect a besoin de l'objet complet pour afficher le libellé
  if (data.mouvement) {
    data.mouvementId = data.mouvement  // ✅ Objet complet, PAS juste l'ID
    delete data.mouvement // ✅ Supprimer pour éviter les doublons
  }
    if (data.devise) {
    data.deviseId = data.devise  // ✅ Objet complet, PAS juste l'ID
    delete data.devise // ✅ Supprimer pour éviter les doublons
  }
  if (data.tempPolice) {
    data.tempPoliceId = data.tempPolice  // ✅ Objet complet, PAS juste l'ID
    delete data.tempPolice // ✅ Supprimer pour éviter les doublons
  }


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
  try {
    if (isEditing.value && tempQuittance.value?.id) {
      console.log("<<<<<<< handleSubmit data:",data)
      await updateTempQuittance.mutateAsync({
        id: tempQuittance.value.id,
        data: {
            ///////////////////////////// 
            ////// Emission 
            /////////////////////////////  
            // dateEmission: data.dateEmission,// date système
            ///////////////////////////
            
            // dateEffet: data.dateEffet ,  
            // dateEcheance: data.dateEcheance,
            // deviseId: extractId(data.deviseId),
            // coursDevise: data.coursDevise,
            // avisEcheance: data.avisEcheance,
            // nombreEcheancePmd: data.nombreEcheancePmd,
            // sinistreAuComptant: data.sinistreAuComptant ,
            // avisSinistre: data.avisSinistre,
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

            // ///////////////////////////// 
            // ////// Taux et Taxes 
            // /////////////////////////////
            // tauxCedante: data.tauxCedante, 
            // tauxAccepte: data.tauxAccepte,
            // tauxCommission: data.tauxCommission,
            // taxeSurPrime: data.taxeSurPrime, 
            // taxeSurCommission: data.taxeSurCommission,


            // Relations
            //mouvementId: extractId(data.mouvementId),
            //tempPoliceId: extractId(data.tempPoliceId),
            
        },
      })
      emit('success', 'TempQuittance Capitaux modifié avec succès')
    } else {
      await createTempQuittance.mutateAsync({
            ///////////////////////////// 
            ////// Emission 
            /////////////////////////////  
            // dateEmission: data.dateEmission,// date système
            ///////////////////////////
            
            // dateEffet: data.dateEffet ,  
            // dateEcheance: data.dateEcheance,
            // deviseId: extractId(data.deviseId),
            // coursDevise: data.coursDevise,
            // avisEcheance: data.avisEcheance,
            // nombreEcheancePmd: data.nombreEcheancePmd,
            // sinistreAuComptant: data.sinistreAuComptant ,
            // avisSinistre: data.avisSinistre,
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
            // estimationPrime: data.estimationPrime,
            // primeBrute: data.primeBrute,
            // primeNette: data.primeNette, 

            // ///////////////////////////// 
            // ////// Taux et Taxes 
            // /////////////////////////////
            // tauxCedante: data.tauxCedante, 
            // tauxAccepte: data.tauxAccepte,
            // tauxCommission: data.tauxCommission,
            // taxeSurPrime: data.taxeSurPrime, 
            // taxeSurCommission: data.taxeSurCommission,


            // Relations
            //mouvementId: extractId(data.mouvementId),
            //tempPoliceId: extractId(data.tempPoliceId),
            //.deviseId),

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
    <GenericCrudForm
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