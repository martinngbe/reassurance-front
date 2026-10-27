<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type {  FormField } from '@/composants/forms/generic-form/types-form'
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
const tempQuittanceStore = useTempQuittanceStore()
// lecture du currentTempQuittance en cours
// on a pris soin de le charger via tempPolice
const currentTempQuittance = computed(()=> tempQuittanceStore.currentTempQuittance)
// lecture du mouvement en cours
// on a pris soin de le reference dans AffaireNouvelle.vue
const currentMouvement = computed(()=> mouvementStore.currentMouvement)
const currentTempPolice = computed(()=> tempPoliceStore.currentTempPolice)
const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()
console.log('==================================')
console.log('TempQuittanceEmissionForm.vue')
console.log('==================================')
console.log('currentTempPolice.value    :',currentTempPolice.value)
console.log('currentTempQuittance.value :',currentTempQuittance.value)
console.log('currentMouvement.value     :',currentMouvement.value)
console.log('==================================')
// ✅ REMPLACER le ref local par un computed lié au store
console.log(" >>>>>> currentMouvement.value: ",currentMouvement.value)
// ==================== FONCTIONS RESOLVE (SCROLL INFINI) ====================

async function fetchDevise(query: string, page: number) {
  const res = await apiClient.get('/devise', {
    params: { search: query, page, limit: 20 }
  })
  return {
    options: res.data.items || res.data.data || [],
    hasMore: res.data.meta?.current_page < res.data.meta?.last_page || false
  }
}
// ==================== CONFIGURATION DES CHAMPS ====================

const tempQuittanceFields: FormField[] = [
  ///////////////////////////// 
  ////// Emission 
  /////////////////////////////
{ section: 'Dévise et Période de couverture' },
{
  key: 'deviseId',
  label: 'Devise',
  type: 'async-select',
  required: true,
  placeholder: 'Sélectionner une devise ...',
  loadOptions: fetchDevise,
  autoSelectFirst: true,  // ✅ Pré-sélectionne le premier pays en mode création
  asyncOptions: {
    trackBy: 'id',
    labelBy: 'libelle'
  }
},
{ key: 'coursDevise',           label: 'Cours devise',      type: 'number' ,required: true,},

{ key: 'dateEffet',             label: 'Date Effet',        type: 'calendar' },  
{ key: 'dateEcheance',          label: 'Date Echéance',     type: 'calendar' },

{ section: 'Autres informations' },
{ key: 'avisEcheance',          label: 'Avis Echéance',     type: 'number' , helpText:"Délais (jours) de notification avant échéance"},  
{ key: 'nombreEcheancePmd',     label: 'Nb.échéance PMD',   type: 'number' }, 
{ key: 'sinistreAuComptant',    label: 'Sinistre au Comptant',   type: 'number' , helpText:'Montant min à payer sans attendre'}, 
{ key: 'avisSinistre',          label: 'Avis sinistre',     type: 'number' , helpText:'Délais (jours) de notification du sinistre'}, 

]
// ==================== LOGIQUE FORMULAIRE ====================

const isEditing = computed(() => !!currentTempQuittance.value?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): TempQuittanceFormData {
  if (!currentTempQuittance) {
    return Object.fromEntries(
      tempQuittanceFields
        .filter((f) => 'key' in f)  // ✅ Garde uniquement les objets avec une propriété 'key'
        .map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as unknown as TempQuittanceFormData
  }

  const data = { ...currentTempQuittance.value } as TempQuittanceFormData

  // ✅ Mapper les objets COMPLETS vers les clés attendues par le formulaire
  // Le composant TAsyncSelect a besoin de l'objet complet pour afficher le libellé

    if (data.devise) {
    data.deviseId = data.devise  // ✅ Objet complet, PAS juste l'ID
    delete data.devise // ✅ Supprimer pour éviter les doublons
    }
   


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
  console.log('____ AVANT _____ TempQuittanceEmissionForme.handleSubmit _________ ')
  console.log('currentMouvement.value: ',currentMouvement.value)
  console.log('data: ',data)


  try {
    if(!data.mouvementId && currentMouvement.value)
      data.mouvementId = currentMouvement.value.id;

    if(!data.policeId && currentTempPolice.value)
      data.policeId = currentTempPolice.value.id;

    console.log(" _____ TempQuittanceEmissionForme.handleSubmit   data:",data)
   
    if (isEditing.value && currentTempQuittance.value?.id) {
      console.log("<<<<<<< handleSubmit data:",data)
      await updateTempQuittance.mutateAsync({
        id: currentTempQuittance.value.id,
        data: {
            ///////////////////////////// 
            ////// Emission 
            /////////////////////////////  
            mouvementId: data.mouvementId ,
            dateEffet: data.dateEffet ,  
            dateEcheance: data.dateEcheance,
            deviseId: extractId(data.deviseId),
            coursDevise: data.coursDevise,
            avisEcheance: data.avisEcheance,
            nombreEcheancePmd: data.nombreEcheancePmd,
            sinistreAuComptant: data.sinistreAuComptant ,
            avisSinistre: data.avisSinistre,
        },
      })
      emit('success', 'Quittance Emission modifié avec succès')
    } else {

      await createTempQuittance.mutateAsync({
            ///////////////////////////// 
            ////// Emission 
            ///////////////////////////
            mouvementId: currentMouvement.value?.id,
            policeId: currentTempPolice.value?.id,
            dateEffet: data.dateEffet ,  
            dateEcheance: data.dateEcheance,
            deviseId: extractId(data.deviseId),
            coursDevise: data.coursDevise,
            avisEcheance: data.avisEcheance,
            nombreEcheancePmd: data.nombreEcheancePmd,
            sinistreAuComptant: data.sinistreAuComptant ,
            avisSinistre: data.avisSinistre,
          
      } as TempQuittance)
      emit('success', 'Quittance Emission créé avec succès')
    }
  

  } catch (err: any) {
    console.error('Erreur sauvegarde:', err)
    errorMessage.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue lors de la sauvegarde.'
  }
    console.log('____ APRES _____ TempQuittanceEmissionForme.handleSubmit _________ ')
    console.log('currentMouvement.value: ',currentMouvement.value)
    console.log('data: ',data)
   
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
    <TTitreSousModule  libelle="Quittance Emission" class="mb-1" />  
   
    <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {{ errorMessage }}
    </div>
    <GenericCrudForm v-if="currentTempPolice"
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