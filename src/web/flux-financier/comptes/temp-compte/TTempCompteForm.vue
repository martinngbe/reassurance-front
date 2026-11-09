<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { PaginationParams } from '@/type/pagination'
import { apiClient } from '@/api/api-client'
import type { TempCompte, TempCompteFormData } from '@/services/flux-financiers/comptes/temp-compte/temp-compte'
import { useTempComptes } from '@/services/flux-financiers/comptes/temp-compte/useTempCompte'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'

const props = defineProps<{
  tempCompte?:  TempCompte | null  // ✅ L'API envoie un Assur
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()
const quittanceStore = useQuittanceStore()
const currentQuittance =  quittanceStore.currentQuittance
// ==================== FONCTIONS RESOLVE (SCROLL INFINI) ====================

async function fetchCompteType(query: string, page: number) {
  const res = await apiClient.get('/compte-type', {
    params: { search: query, page, limit: 20 }
  })
  return {
    options: res.data.items || res.data.data || [],
    hasMore: res.data.meta?.current_page < res.data.meta?.last_page || false
  }
}


// ==================== CONFIGURATION DES CHAMPS ====================

const tempCompteFields: FieldConfig[] = [
  {
    key: 'compteTypeId',
    label: 'Compte Type',
    type: 'async-select',
    required: true,
    placeholder: 'Sélectionner le pays ...',
    loadOptions: fetchCompteType,
    autoSelectFirst: true,  // ✅ Pré-sélectionne le premier pays en mode création
    asyncOptions: {
      trackBy: 'id',
      labelBy: 'libelle'
    }
  },
  

]

// ==================== LOGIQUE FORMULAIRE ====================

const isEditing = computed(() => !!props.tempCompte?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): TempCompteFormData {
  if (!props.tempCompte) {
    return Object.fromEntries(
      tempCompteFields.map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as  unknown as TempCompteFormData
  }

  const data = { ...props.tempCompte } as TempCompteFormData

  // ✅ Mapper les objets COMPLETS vers les clés attendues par le formulaire
  // Le composant TAsyncSelect a besoin de l'objet complet pour afficher le libellé
  if (data.compteType) {
    data.compteTypeId = data.compteType  // ✅ Objet complet, PAS juste l'ID
    delete data.compteType // ✅ Supprimer pour éviter les doublons
  }


  return data as TempCompteFormData
}

const formData = ref<TempCompteFormData>(initializeFormData())

// ✅ Watcher pour gérer les changements de props.tempCompte
watch(() => props.tempCompte, (newTempCompte) => {
  if (newTempCompte) {
    formData.value = initializeFormData()
  }
}, { deep: true })

const errorMessage = ref<string | null>(null)
const params = computed<PaginationParams>(() => ({}))
const { createTempCompte, updateTempCompte } = useTempComptes({})

const loading = computed(() => createTempCompte.isPending.value || updateTempCompte.isPending.value)

// ✅ Fonction helper pour extraire l'ID d'un objet ou retourner la valeur telle quelle
function extractId(value: any): number | undefined {
  if (value && typeof value === 'object' && value.id) {
    return value.id
  }
  return value
}
function buildPayload(data: Record<string, any>) {

  return {
  numero:data.numero,
  solde:data.solde,  
  quittanceId : currentQuittance?.id,
  deviseId: currentQuittance?.deviseId,
  coursDevise: currentQuittance?.coursDevise, 
  compteTypeId: extractId(data.compteTypeId),
   
  }
}
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  try {
    if (isEditing.value && props.tempCompte?.id) {
      console.log("<<<<<<< handleSubmit data:",data)
      await updateTempCompte.mutateAsync({
        id: props.tempCompte.id,
        data: buildPayload(data)}),
      emit('success', 'Compte Temporaire  modifié avec succès')
    } else {
      await createTempCompte.mutateAsync(buildPayload(data) as TempCompte)
      emit('success', 'Compte Temporaire  créé avec succès')
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