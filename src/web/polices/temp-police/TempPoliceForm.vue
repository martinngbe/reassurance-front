<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type {  IResponse, PaginationParams } from '@/type/pagination'
import { apiClient } from '@/api/api-client'
import type { TempPolice, TempPoliceFormData } from '@/services/polices/temp-police/temp-police'
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store'
import { useTempPolices } from '@/services/polices/temp-police/useTempPolice'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'
import { useAssureStore } from '@/services/acteurs/assure/assure.store'
import { ECRAN_FACULTATIVE, MODULE_ACCEPTATION, useEcransStore } from '@/services/ecrans/ecrans.store'
import { AUCUN } from '@/services/common/constantes'
import { useTempQuittanceStore } from '@/services/quittances/temp-quittance/temp-quittance.store'
import { useTempQuittances } from '@/services/quittances/temp-quittance/useTempQuittance'

const tempPoliceStore = useTempPoliceStore()
const currentTempPolice = computed(()=> tempPoliceStore.currentTempPolice)
// QUITTANCE
const tempQuittanceeStore = useTempQuittanceStore()
const currentTempQuittance = computed(()=> tempQuittanceeStore.currentTempQuittance)
const paramsTempQUittance = computed<PaginationParams>(() => ({}))
const {updateTempQuittance} = useTempQuittances(paramsTempQUittance)

// on recupere l'assure en cours
const assureStore = useAssureStore()  
const currentAssure =assureStore.currentAssure
// on recupére l'cran sur lequel nous sommes
const {currentEcran , currentModule}  = useEcransStore()
const isEcranFac = computed(() => currentEcran === ECRAN_FACULTATIVE)
const isModuleAcceptation = computed(() => currentModule === MODULE_ACCEPTATION)
const isAucunCourtier = computed(()=>currentTempPolice.value && 
         currentTempPolice.value.acteurCourtier && 
         currentTempPolice.value.acteurCourtier.sigle ===AUCUN)


const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

console.log(' ================================== ')
console.log(' TempPoliceForm.vue')
console.log(' isEcranFac:',isEcranFac)
console.log(' ================================== ')

// ✅ REMPLACER le ref local par un computed lié au store

// ==================== FONCTIONS RESOLVE (SCROLL INFINI) ====================

async function fetchActeurCedante(query: string, page: number) {
  const res = await apiClient.get('/acteur?roles=assureur,reassureur', {
    params: { search: query, page, limit: 20 }
  }) as IResponse

  return {
    options: res.data.items || res.data.data || [],
    hasMore: res.data.pageInfo?.page < res.data.pageInfo?.totalPages || false
  }
}

async function fetchActeurCourtier(query: string, page: number) {
  const res = await apiClient.get('/acteur?roles=courtier', {
    params: { search: query, page, limit: 20 }
  }) as IResponse

  return {
    options: res.data.items || res.data.data || [],
    hasMore: res.data.pageInfo?.page < res.data.pageInfo?.totalPages || false
  }
}
async function fetchNatureOffre(query: string, page: number) {
  const params = { search: query, page, limit: 20 , ...(isEcranFac.value && { isFacultative: true }) }

  const res = await apiClient.get('/nature-offre', {params}) as IResponse

  return {
    options: res.data.items || res.data.data || [],
    hasMore: res.data.pageInfo?.page < res.data.pageInfo?.totalPages || false
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

const tempPoliceFields: FieldConfig[] = [
  {
    key: 'acteurCedanteId',//'' acteurId
    label: 'Cédente',
    type: 'async-select',
    required: true,
    placeholder: 'Sélectionner une cédante ...',
    loadOptions: fetchActeurCedante,
    autoSelectFirst: true,  // ✅ Pré-sélectionne le premier pays en mode création
    asyncOptions: {
      trackBy: 'id',
      labelBy: 'raisonSociale'
    }
  },
  {
    key: 'acteurCourtierId',//'' acteurId
    label: 'Courtier',
    type: 'async-select',
    required: false,
    placeholder: 'Sélectionner un courtier ...',
    loadOptions: fetchActeurCourtier,
    autoSelectFirst: true,  // ✅ Pré-sélectionne le premier pays en mode création
    asyncOptions: {
      trackBy: 'id',
      labelBy: 'raisonSociale'
    }
  },
  {
    key: 'sousBrancheId',
    label: 'Sous Branche',
    type: 'async-select',
    required: true,
    placeholder: 'Sélectionner une sous branche ...',
    loadOptions: fetchSousBranche,
    autoSelectFirst: true,  // ✅ Pré-sélectionne le premier pays en mode création
    asyncOptions: {
      trackBy: 'id',
      labelBy: 'libelle'
    }
  },
  {
    key: 'natureOffreId',
    label: 'Nature offre',
    type: 'async-select',
    required: true,
    placeholder: 'Sélectionner une offre ...',
    loadOptions: fetchNatureOffre,
    autoSelectFirst: true,  // ✅ Pré-sélectionne le premier pays en mode création
    asyncOptions: {
      trackBy: 'id',
      labelBy: 'libelle'
    }
  },
{ key: 'isIard',             label: 'IARD',   type: 'checkbox' },  
{ key: 'isReconductionTacite',  label: 'Tacite reconduction',   type: 'checkbox' },

]

// ==================== LOGIQUE FORMULAIRE ====================

const isEditing = computed(() => !!currentTempPolice.value?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): TempPoliceFormData {
  if (!currentTempPolice) {
    return Object.fromEntries(
      tempPoliceFields.map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as  unknown as TempPoliceFormData
  }

  const data = { ...currentTempPolice.value } as TempPoliceFormData
  console.log("_____ TempPoliceForm.initializeFormData _____")
  console.log("currentTempPolice.value:",currentTempPolice.value)
/* 

    //  En FAC il faut absolument un assuré
  if( isEcranFac && 
      currentAssure && !currentTempPolice.value?.assure){
    data.assureId = currentAssure.id
  } else {
    data.assureId = null
  }

*/

  // ✅ Mapper les objets COMPLETS vers les clés attendues par le formulaire
  // Le composant TAsyncSelect a besoin de l'objet complet pour afficher le libellé
  if (data.sousBranche) {
    data.sousBrancheId = data.sousBranche  // ✅ Objet complet, PAS juste l'ID
    delete data.sousBranche // ✅ Supprimer pour éviter les doublons
  }
  if (data.natureOffre) {
    data.natureOffreId = data.natureOffre  // ✅ Objet complet, PAS juste l'ID
    delete data.natureOffre // ✅ Supprimer pour éviter les doublons
  }
  if (data.acteurCedante) {
    data.acteurCedanteId = data.acteurCedante  // ✅ Objet complet, PAS juste l'ID
    delete data.acteurCedante // ✅ Supprimer pour éviter les doublons
  }
  if (data.acteurCourtier) {
    data.acteurCourtierId = data.acteurCourtier  // ✅ Objet complet, PAS juste l'ID
    delete data.acteurCourtier // ✅ Supprimer pour éviter les doublons
  }

  console.log("data:",data)
  return data as TempPoliceFormData
}

const formData = ref<TempPoliceFormData>(initializeFormData())

// ✅ Watcher pour gérer les changements de props.currentTempPolice
watch(() => currentTempPolice, (newPolice) => {
  console.log("_____ TempPoliceForm.watch.currentTempPolice _____")
  console.log("newPolice:",newPolice)
  if (newPolice) {
    formData.value = initializeFormData()
  }
}, { deep: true })

const errorMessage = ref<string | null>(null)
const params = computed<PaginationParams>(() => ({}))
const { createTempPolice, updateTempPolice } = useTempPolices(params)

const loading = computed(() => createTempPolice.isPending.value || updateTempPolice.isPending.value)

// ✅ Fonction helper pour extraire l'ID d'un objet ou retourner la valeur telle quelle
function extractId(value: any): number | undefined {
  if (value && typeof value === 'object' && value.id) {
    return value.id
  }
  return value
}


// ✅ Helper pour construire le payload commun (évite la duplication)
function buildPayload(data: Record<string, any>) {
 // // EN Facultative il faut absolument un assuré
 const isCession = !isModuleAcceptation.value
 const assureId =  isEcranFac &&  // On est FAC et
      currentAssure && // Existe un assure et 
      !currentTempPolice.value?.assure ?  // la police n'a pas d'assure
       currentAssure.id : null 
  return {
    assureId,
    isCession,
    numero: data.numero,
    isIard: data.isIard,
    isReconductionTacite: data.isReconductionTacite,                  
    // Relations
    natureOffreId: extractId(data.natureOffreId),
    sousBrancheId: extractId(data.sousBrancheId),
    acteurCedanteId: extractId(data.acteurCedanteId),
    acteurCourtierId: extractId(data.acteurCourtierId),
   
  }
}
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.log('____________ TempPoliceForm.handleSubmit __________________')
  console.log('data: ',data)
 
  /**
   * La création ou la mise à jour de TempPolice antraine automatiquement
   * sa sélection comme currentTempPolice.
   * NB: La mise à jour recharge depuis le serveur et la
   * sélectionne comme currentTempPolice. 
   */
    
  try {
    if (isEditing.value && currentTempPolice.value?.id) {
      await updateTempPolice.mutateAsync({
              id: currentTempPolice.value.id,
              data: {            
                  numero: data.numero,
                  isCession: data.isCession,
                  isIard: data.isIard,
                  isReconductionTacite: data.isReconductionTacite,                  
                  // Relations
                  natureOffreId: extractId(data.natureOffreId),
                  sousBrancheId: extractId(data.sousBrancheId),
                  acteurCedanteId: extractId(data.acteurCedanteId),
                  acteurCourtierId: extractId(data.acteurCourtierId),
                  assureId: data.assureId,
              },
            })
      /* 
        Lors de la MAJ, on dois vérifier si le  acteurCourtier.sigle ===AUCUN
        afin de réinitialiser le taux de courtage
      */     
      if(isAucunCourtier.value){
        console.log(" _________________ MAJ AUCUN COURTIER _____________ ")
        // Initialisation du taux de courtage
        if(currentTempQuittance.value) {
                   console.log(" AVANT currentTempQuittance.value:",currentTempQuittance.value)
                    // La currentTempQuittance existe donc MAJ
                   await updateTempQuittance.mutateAsync({
                          id:currentTempQuittance.value.id,
                          data:{
                            tauxCommission:0,
                            taxeSurCommission:0
                          } 
                      })
                  console.log(" APRES currentTempQuittance.value:",currentTempQuittance.value)
        }
           
      }   
      emit('success', 'TempPolice modifiée avec succès')
    } else {
      await createTempPolice.mutateAsync({
            numero: data.numero,
            isCession: data.isCession,
            isIard: data.isIard,
            isReconductionTacite: data.isReconductionTacite,
           
            // Relations
            natureOffreId: extractId(data.natureOffreId),
            sousBrancheId: extractId(data.sousBrancheId),
            acteurCedanteId: extractId(data.acteurCedanteId),
            acteurCourtierId: extractId(data.acteurCourtierId),
            assureId: data.assureId,

      } as TempPolice)
        
      emit('success', 'TempPolice créé avec succès')
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
    <TTitreSousModule  libelle="Police" />  
   
    <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {{ errorMessage }}
    </div>
    <GenericCrudForm
      v-model="formData"
      :fields="tempPoliceFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :columns="2"
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