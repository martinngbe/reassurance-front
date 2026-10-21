<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { PaginationParams } from '@/type/pagination'
import { apiClient } from '@/api/api-client'
import type { TempPolice, TempPoliceFormData } from '@/services/temp-police/temp-police'
import { useTempPoliceStore } from '@/services/temp-police/temp-police.store'
import { useTempPolices } from '@/services/temp-police/useTempPolice'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'
import TLigneHorizontale from '@/composants/utilitaire/TLigneHorizontale.vue'


const tempPoliceStore = useTempPoliceStore()
const tempPolice = computed(()=> tempPoliceStore.currentTempPolice)
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

const tempPoliceFields: FieldConfig[] = [
  {
    key: 'acteurCedanteId',
    label: 'Cédente',
    type: 'async-select',
    required: true,
    placeholder: 'Sélectionner une cédente ...',
    loadOptions: fetchActeur,
    autoSelectFirst: true,  // ✅ Pré-sélectionne le premier pays en mode création
    asyncOptions: {
      trackBy: 'id',
      labelBy: 'libelle'
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
{ key: 'isCession',             label: 'Cession',   type: 'checkbox' },  
{ key: 'isReconductionTacite',  label: 'Tacite reconduction',   type: 'checkbox' },
{ key: 'isIard',                label: 'IARD',   type: 'checkbox' },
{ key: 'isFacPure',             label: 'FAC pure',   type: 'checkbox' },  

]

// ==================== LOGIQUE FORMULAIRE ====================

const isEditing = computed(() => !!tempPolice.value?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): TempPoliceFormData {
  if (!tempPolice) {
    return Object.fromEntries(
      tempPoliceFields.map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as  unknown as TempPoliceFormData
  }

  const data = { ...tempPolice.value } as TempPoliceFormData

  // ✅ Mapper les objets COMPLETS vers les clés attendues par le formulaire
  // Le composant TAsyncSelect a besoin de l'objet complet pour afficher le libellé
  if (data.sousBranche) {
    data.sousBrancheId = data.sousBranche  // ✅ Objet complet, PAS juste l'ID
    delete data.sousBranche // ✅ Supprimer pour éviter les doublons
  }


  return data as TempPoliceFormData
}

const formData = ref<TempPoliceFormData>(initializeFormData())

// ✅ Watcher pour gérer les changements de props.tempPolice
watch(() => tempPolice, (newActeur) => {
  if (newActeur) {
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

const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  try {
    if (isEditing.value && tempPolice.value?.id) {
      console.log("<<<<<<< handleSubmit data:",data)
      await updateTempPolice.mutateAsync({
        id: tempPolice.value.id,
        data: {
            numero: data.numero,
            isCession: data.isCession,
            isReconductionTacite: data.isReconductionTacite,
            isIard: data.isIard,
            isFacPure: data.isFacPure,
            // Relations
            sousBrancheId: extractId(data.sousBrancheId),
            acteurCedanteId: extractId(data.acteurCedanteId),
            acteurCourtierId: extractId(data.acteurCourtierId),
            assureId: extractId(data.paysId),
        },
      })
      emit('success', 'Assuré modifié avec succès')
    } else {
      await createTempPolice.mutateAsync({
            numero: data.numero,
            isCession: data.isCession,
            isReconductionTacite: data.isReconductionTacite,
            isIard: data.isIard,
            isFacPure: data.isFacPure,
            // Relations
            sousBrancheId: extractId(data.sousBrancheId),
            acteurCedanteId: extractId(data.acteurCedanteId),
            acteurCourtierId: extractId(data.acteurCourtierId),
            assureId: extractId(data.paysId),

      } as TempPolice)
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
    <TTitreSousModule  libelle="Police" class="mb-8" />  
   
    <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {{ errorMessage }}
    </div>
    <GenericCrudForm
      v-model="formData"
      :fields="tempPoliceFields"
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