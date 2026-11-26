<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type {   PaginationParams } from '@/type/pagination'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'
import type { CessionLegaleFormData, CreateCessionLegaleDto, UpdateCessionLegaleDto } from '@/services/referentiel/cession-legale/cession-legale'
import { useCessionLegaleStore } from '@/services/referentiel/cession-legale/cession-legale.store'
import { useCessionLegales } from '@/services/referentiel/cession-legale/useCessionLegale'
import { useActeurStore } from '@/services/acteurs/acteur/acteur.store'
import { useToast } from '@/composants/toast/useToast'

//////////////////////////////////////////////////////////////////
/////  FORMULAIE DE MODIFICACTION DE CESSION LEGALE UNIQUEMENT
//////////////////////////////////////////////////////////////////
const { success,  warning, info } = useToast()
// // CESSION LEGALE
const errorMessage = ref<string | null>(null)
const currentActeurStore = useActeurStore()
const currentActeur = currentActeurStore.currentActeur  
const cessionLegaleStore = useCessionLegaleStore()
// lecture de la cessionLegale en cours
const currentCessionLegale = computed(()=> cessionLegaleStore.currentCessionLegale)
const params = computed<PaginationParams>(() => ({}))
  // API
const { updateCessionLegale , createCessionLegale } = useCessionLegales( params)
const loading = computed(() =>  updateCessionLegale.isPending.value)
const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

console.log(' ================================== ')
console.log(' CessionLegaleForm.vue')
console.log(' ================================== ')


// ==================== FONCTIONS RESOLVE (SCROLL INFINI) ====================

// async function fetchActeur(query: string, page: number) {
//   const res = await apiClient.get('/acteur?roles=assureur,reassureur', {
//     params: { search: query, page, limit: 20 }
//   }) as IResponse

//   return {
//     options: res.data.items || res.data.data || [],
//     hasMore: res.data.pageInfo?.page < res.data.pageInfo?.totalPages || false
//   }
// }

// async function fetchActeurCourtier(query: string, page: number) {
//   const res = await apiClient.get('/acteur?roles=courtier', {
//     params: { search: query, page, limit: 20 }
//   }) as IResponse

//   return {
//     options: res.data.items || res.data.data || [],
//     hasMore: res.data.pageInfo?.page < res.data.pageInfo?.totalPages || false
//   }
// }
// async function fetchNatureOffre(query: string, page: number) {
//   const params = { search: query, page, limit: 20 , ...(
//     natureOffre.value && 
//     natureOffre.value.isFacultative && { isFacultative: true } ) }

//   const res = await apiClient.get('/nature-offre', {params}) as IResponse

//   return {
//     options: res.data.items || res.data.data || [],
//     hasMore: res.data.pageInfo?.page < res.data.pageInfo?.totalPages || false
//   }
// }
// async function fetchSousBranche(query: string, page: number) {
//   const res = await apiClient.get('/sous-branche', {
//     params: { search: query, page, limit: 20 }
//   })
//   return {
//     options: res.data.items || res.data.data || [],
//     hasMore: res.data.meta?.current_page < res.data.meta?.last_page || false
//   }
// }

// ==================== CONFIGURATION DES CHAMPS ====================

const cessionLegaleFields: FieldConfig[] = [
  // {
  //   key: 'acteurId',//'' acteurId
  //   label: 'Acteur',
  //   type: 'async-select',
  //   required: true,
  //   placeholder: 'Sélectionner un acteur ...',
  //   loadOptions: fetchActeur,
  //   autoSelectFirst: true,  // ✅ Pré-sélectionne le premier pays en mode création
  //   asyncOptions: {
  //     trackBy: 'id',
  //     labelBy: 'raisonSociale'
  //   }
  // },
{ key: 'taux',  label: 'Taux',   type: 'number' },
{ key: 'isFac', label: 'FAC',   type: 'checkbox' }, 


]

// ==================== LOGIQUE FORMULAIRE ====================

const isEditing = computed(() => !!currentCessionLegale.value?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): CessionLegaleFormData {
  if (!currentCessionLegale.value) {
    return Object.fromEntries(
      cessionLegaleFields.map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as  unknown as CessionLegaleFormData
  }

  const data = { ...currentCessionLegale.value } as CessionLegaleFormData
  console.log("_____ CessionLegaleForm.initializeFormData _____")
  console.log("currentCessionLegale.value:",currentCessionLegale.value)

  // ✅ Mapper les objets COMPLETS vers les clés attendues par le formulaire
  // Le composant TAsyncSelect a besoin de l'objet complet pour afficher le libellé
 
  if (data.acteur) {
    data.acteurId = data.acteur  // ✅ Objet complet, PAS juste l'ID
    delete data.acteur // ✅ Supprimer pour éviter les doublons
  }

  console.log("data:",data)
  return data as CessionLegaleFormData
}

const formData = ref<CessionLegaleFormData>(initializeFormData())

// ✅ Watcher pour gérer les changements de props.currentCessionLegale
watch(() => currentCessionLegale.value, (newCessionLegale) => {
  console.log("_____ CessionLegaleForm.watch.currentCessionLegale _____")
  console.log("newCessionLegale:",newCessionLegale)
  if (newCessionLegale) {
    formData.value = initializeFormData()
  }
}, { deep: true })


// ✅ Fonction helper pour extraire l'ID d'un objet ou retourner la valeur telle quelle
function extractId(value: any): number | undefined {
  if (value && typeof value === 'object' && value.id) {
    return value.id
  }
  return value
}


// ✅ Helper pour construire le payload commun (évite la duplication)
function buildPayload(data: Record<string, any>) {
 
  return {
    // On utilise currentActeur!.id car tu as déjà un guard (if !currentActeur) dans handleSubmit
    acteurId: currentActeur!.id, 
    taux: Number(data.taux), // ✅ Conversion propre en nombre
    isFac: Boolean(data.isFac), // ✅ Conversion propre en booléen              
   
  }
}
const handleSubmit = async (data: Record<string, any>) => {
  console.warn('TCessionLegaleForm.vue handleSubmit') 
  console.log('data:',data) 
  console.log('currentActeur:',currentActeur) 
  errorMessage.value = null
  if(!currentActeur){
    warning('Aucun acteur sélectionné.', 'Attention')
    return
  }
  try {
    if (isEditing.value && currentCessionLegale.value?.id) {
      const resultat = await updateCessionLegale.mutateAsync({
        id: currentCessionLegale.value.id,
        data: buildPayload(data)as unknown as UpdateCessionLegaleDto,
      })
      
      // ✅ Mettre à jour le store avec les nouvelles données
      cessionLegaleStore.updateCurrentCessionLegale(resultat)
      
      emit('success', 'CessionLegale modifiée avec succès')
    } else {
      //await createCessionLegale.mutateAsync( buildPayload(data)
      await createCessionLegale.mutateAsync(buildPayload(data) as unknown as CreateCessionLegaleDto)
      emit('success', 'Cession légale créé avec succès')
    }
  } catch (err: any) {
    console.error('Erreur sauvegarde:', err)
    errorMessage.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue.'
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
    <TTitreSousModule  libelle="CessionLegale" />  
   
    <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {{ errorMessage }}
    </div>
    <GenericCrudForm
      v-model="formData"
      :fields="cessionLegaleFields"
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