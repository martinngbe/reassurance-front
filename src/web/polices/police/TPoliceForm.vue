<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type {  IResponse, PaginationParams } from '@/type/pagination'
import { apiClient } from '@/api/api-client'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'
import { useAssureStore } from '@/services/acteurs/assure/assure.store'
import { ECRAN_FACULTATIVE, MODULE_ACCEPTATION, useEcransStore } from '@/services/ecrans/ecrans.store'
import { AUCUN } from '@/services/common/constantes'
import { usePoliceStore } from '@/services/polices/police/police.store'
import { usePolices } from '@/services/polices/police/usePolice'
import type { Police, PoliceFormData } from '@/services/polices/police/police'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'
import { useQuittances } from '@/services/quittances/quittance/useQuittance'

const policeStore = usePoliceStore()
const currentPolice = computed(()=> policeStore.currentPolice)
// // QUITTANCE
const quittanceeStore = useQuittanceStore()
const currentQuittance = computed(()=> quittanceeStore.currentQuittance)
const paramsQUittance = computed<PaginationParams>(() => ({}))
const {updateQuittance} = useQuittances(paramsQUittance)

// on recupere l'assure en cours
const assureStore = useAssureStore()  
const currentAssure =assureStore.currentAssure
// on recupére l'cran sur lequel nous sommes
const {currentEcran , currentModule}  = useEcransStore()
const isEcranFac = computed(() => currentEcran === ECRAN_FACULTATIVE)
const isModuleAcceptation = computed(() => currentModule === MODULE_ACCEPTATION)
const isAucunCourtier = computed(()=>currentPolice.value && 
         currentPolice.value.acteurCourtier && 
         currentPolice.value.acteurCourtier.sigle ===AUCUN)


const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

console.log(' ================================== ')
console.log(' PoliceForm.vue')
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

const policeFields: FieldConfig[] = [
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

const isEditing = computed(() => !!currentPolice.value?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): PoliceFormData {
  if (!currentPolice) {
    return Object.fromEntries(
      policeFields.map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as  unknown as PoliceFormData
  }

  const data = { ...currentPolice.value } as PoliceFormData
  console.log("_____ PoliceForm.initializeFormData _____")
  console.log("currentPolice.value:",currentPolice.value)

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
  return data as PoliceFormData
}

const formData = ref<PoliceFormData>(initializeFormData())

// ✅ Watcher pour gérer les changements de props.currentPolice
watch(() => currentPolice, (newPolice) => {
  console.log("_____ PoliceForm.watch.currentPolice _____")
  console.log("newPolice:",newPolice)
  if (newPolice) {
    formData.value = initializeFormData()
  }
}, { deep: true })

const errorMessage = ref<string | null>(null)
const params = computed<PaginationParams>(() => ({}))
const { createPolice, updatePolice } = usePolices(params)

const loading = computed(() => createPolice.isPending.value || updatePolice.isPending.value)

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
 const isFac = isEcranFac.value
 const assureId =  isFac &&  // On est FAC et
      currentAssure && // Existe un assure et 
      !currentPolice.value?.assure ?  // la police n'a pas d'assure
       currentAssure.id : null 
  return {
    assureId,
    isFac,
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
  console.log('____________ PoliceForm.handleSubmit __________________')
  console.log('data: ',data)
 
  /**
   * La création ou la mise à jour de Police antraine automatiquement
   * sa sélection comme currentPolice.
   * NB: La mise à jour recharge depuis le serveur et la
   * sélectionne comme currentPolice. 
   */
    
  try {
    if (isEditing.value && currentPolice.value?.id) {
      await updatePolice.mutateAsync({
              id: currentPolice.value.id,
              data: buildPayload(data),
            })
      /* 
        Lors de la MAJ, on dois vérifier si le  acteurCourtier.sigle ===AUCUN
        afin de réinitialiser le taux de courtage
      */     
      if(isAucunCourtier.value){
        console.log(" _________________ MAJ AUCUN COURTIER _____________ ")
        // Initialisation du taux de courtage
        if(currentQuittance.value) {
                   console.log(" AVANT currentTempQuittance.value:",currentQuittance.value)
                    // La currentTempQuittance existe donc MAJ
                   await updateQuittance.mutateAsync({
                          id:currentQuittance.value.id,
                          data:{
                            tauxCommission:0,
                            taxeSurCommission:0
                          } 
                      })
                      
                  console.log(" APRES currentQuittance.value:",currentQuittance.value)
        }
           
      }   
      emit('success', 'Police modifiée avec succès')
    } else {
      await createPolice.mutateAsync( buildPayload(data) as Police)
        
      emit('success', 'Police créé avec succès')
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
      :fields="policeFields"
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