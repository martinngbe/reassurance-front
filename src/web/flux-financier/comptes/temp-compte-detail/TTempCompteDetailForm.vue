<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { PaginationParams } from '@/type/pagination'
import { apiClient } from '@/api/api-client'
import type { TempCompte, TempCompteFormData } from '@/services/flux-financiers/comptes/temp-compte/temp-compte'
import { useTempComptes } from '@/services/flux-financiers/comptes/temp-compte/useTempCompte'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'
import type { TempCompteDetail, TempCompteDetailFormData } from '@/services/flux-financiers/comptes/temp-compte-detail/temp-compte-detail'
import { useTempCompteStore } from '@/services/flux-financiers/comptes/temp-compte/temp-compte.store'
import { useTempCompteDetails } from '@/services/flux-financiers/comptes/temp-compte-detail/useTempCompteDetail'

const props = defineProps<{
  tempCompteDetail?:  TempCompteDetail | null  // ✅ L'API envoie un Assur
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()
const quittanceStore = useQuittanceStore()
const currentQuittance =  quittanceStore.currentQuittance

const tempCompteStore = useTempCompteStore()
const currentTempCompte =  tempCompteStore.currentTempCompte
// ==================== FONCTIONS RESOLVE (SCROLL INFINI) ====================

// async function fetchCompteType(query: string, page: number) {
//   const res = await apiClient.get('/compte-type', {
//     params: { search: query, page, limit: 20 }
//   })
//   return {
//     options: res.data.items || res.data.data || [],
//     hasMore: res.data.meta?.current_page < res.data.meta?.last_page || false
//   }
// }


// ==================== CONFIGURATION DES CHAMPS ====================

const tempCompteFields: FieldConfig[] = [
    { key: 'debit'      ,label: 'Débit',  type: 'number', numberOptions: { min: 0 } },
    { key: 'credit'     ,label: 'Crédit', type: 'number', numberOptions: { min: 0 } },
]

// ==================== LOGIQUE FORMULAIRE ====================

const isEditing = computed(() => !!props.tempCompteDetail?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): TempCompteDetailFormData {
  if (!props.tempCompteDetail) {
    return Object.fromEntries(
      tempCompteFields.map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as  unknown as TempCompteDetailFormData
  }

  const data = { ...props.tempCompteDetail } as TempCompteDetailFormData

  // ✅ Mapper les objets COMPLETS vers les clés attendues par le formulaire
  // Le composant TAsyncSelect a besoin de l'objet complet pour afficher le libellé
  if (data.devise) {
    data.deviseId = data.devise  // ✅ Objet complet, PAS juste l'ID
    delete data.devise // ✅ Supprimer pour éviter les doublons
  }
  if (data.compte) {
    data.compteId = data.compte  // ✅ Objet complet, PAS juste l'ID
    delete data.compte // ✅ Supprimer pour éviter les doublons
  }
  if (data.compteRubrique) {
    data.compteRubriqueId = data.compteRubrique  // ✅ Objet complet, PAS juste l'ID
    delete data.compteRubrique // ✅ Supprimer pour éviter les doublons
  }



  return data as TempCompteDetailFormData
}

const formData = ref<TempCompteDetailFormData>(initializeFormData())

// ✅ Watcher pour gérer les changements de props.tempCompte
watch(() => props.tempCompteDetail, (newTempCompte) => {
  if (newTempCompte) {
    formData.value = initializeFormData()
  }
}, { deep: true })

const errorMessage = ref<string | null>(null)
const params = computed<PaginationParams>(() => ({}))
const { createTempCompteDetail, updateTempCompteDetail } = useTempCompteDetails({})

const loading = computed(() => createTempCompteDetail.isPending.value || updateTempCompteDetail.isPending.value)

// ✅ Fonction helper pour extraire l'ID d'un objet ou retourner la valeur telle quelle
function extractId(value: any): number | undefined {
  if (value && typeof value === 'object' && value.id) {
    return value.id
  }
  return value
}
function buildPayload(data: Record<string, any>) {

  return {
  //numero:data.numero,
  debit:data.debit?? 0,  
  credit: data.credit ?? 0,
  deviseId: currentTempCompte?.deviseId,
  coursDevise:currentTempCompte? Number(currentTempCompte.coursDevise):0 ,
  compteId: currentTempCompte?.id,
  compteRubriqueId: props.tempCompteDetail?.compteRubriqueId
   
   
  }
}
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  try {
    if (isEditing.value && props.tempCompteDetail?.id) {
     
      console.log("<<<<<<< handleSubmit data:",data)
     const resultat =  await updateTempCompteDetail.mutateAsync({
        id: props.tempCompteDetail.id,
        data: buildPayload(data)});
     console.log("<<<<<<< handleSubmit resultat:",resultat)   
        
        
      emit('success', 'Compte Détail Temporaire  modifié avec succès')
    } else {
    const resultat =   await createTempCompteDetail.mutateAsync(buildPayload(data) as TempCompteDetail)
    console.log("<<<<<<< handleSubmit createTempCompteDetail:",resultat)    
    emit('success', 'Compte Détail Temporaire  créé avec succès')
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
  <div>
    <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {{ errorMessage }}
    </div>
    <GenericCrudForm
      v-model="formData"
      :fields="tempCompteFields"
      :mode="formMode"
      :show-delete="false"
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