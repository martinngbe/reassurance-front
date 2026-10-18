<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { PaginationParams } from '@/type/pagination'
import type { Assure } from '@/services/acteurs/assure/assure'
import { useAssures } from '@/services/acteurs/assure/useAssure'
import { apiClient } from '@/api/api-client' // 👈 Pour appeler les API Pays/Domaine

const props = defineProps<{
  assure?: Assure | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== FONCTIONS RESOLVE (SCROLL INFINI) ====================

// async function fetchPays(query: string, currentOptions: any[]) {
//   const page = Math.floor(currentOptions.length / 20) + 1
//   const res = await apiClient.get('/pays', {
//     params: { search: query, page, limit: 20 }
//   })
  
//   console.log(" >>> async function fetchPays res:",res)
//   // Adaptez selon la structure réelle de votre réponse API
//   // Exemple : res.data = { items: [...], meta: { current_page, last_page } }
//   return {
//     options: res.data.items || res.data.data || [],
//     hasMore: res.data.meta?.current_page < res.data.meta?.last_page || false
//   }
// }

// async function fetchDomaineActivite(query: string, currentOptions: any[]) {
//   const page = Math.floor(currentOptions.length / 20) + 1
//   const res = await apiClient.get('/domaine-activite', {
//     params: { search: query, page, limit: 20 }
//   })
//   console.log(" >>> async function fetchDomaineActivite res:",res)
//   return {
//     options: res.data.items || res.data.data || [],
//     hasMore: res.data.meta?.current_page < res.data.meta?.last_page || false
//   }
// }

// Dans TAssureForm.vue

async function fetchPays(query: string, page: number) {
  const res = await apiClient.get('/pays', {
    params: { search: query, page, limit: 20 }
  })

  return {
    options: res.data.items || res.data.data || [],
    hasMore: res.data.meta?.current_page < res.data.meta?.last_page || false
  }
}

async function fetchDomaineActivite(query: string, page: number) {
  const res = await apiClient.get('/domaine-activite', {
    params: { search: query, page, limit: 20 }
  })

  return {
    options: res.data.items || res.data.data || [],
    hasMore: res.data.meta?.current_page < res.data.meta?.last_page || false
  }
}
// ==================== CONFIGURATION DES CHAMPS ====================

const assureFields: FieldConfig[] = [
  {
    key: 'paysId',
    label: 'Pays',
    type: 'async-select', // 👈 Changé de 'select' à 'async-select'
    required: true,
    placeholder: 'Sélectionner le pays ...',
    loadOptions: fetchPays, // 👈 Fonction de chargement
    autoSelectFirst: true,  // ✅ Ajout
    asyncOptions: {
      trackBy: 'id',    // 👈 Clé de l'ID dans votre objet API
      labelBy: 'libelle' // 👈 Clé du texte affiché (adaptez selon votre API : 'name', 'libelle', etc.)
    }
  },
  {
    key: 'domaineActiviteId',
    label: "Domaine d'activité",
    type: 'async-select', // 👈 Changé de 'select' à 'async-select'
    required: true,
    placeholder: "Sélectionner le domaine d'activité ...",
    loadOptions: fetchDomaineActivite,
    autoSelectFirst: true,  // ✅ Ajout
    asyncOptions: {
      trackBy: 'id',
      labelBy: 'libelle' // Adaptez selon votre API
    }
  },
  { key: 'sigle',         label: 'Sigle',          type: 'text',   required: true,  placeholder: '' },
  { key: 'raisonSociale', label: 'Raison sociale', type: 'text',   required: true,  placeholder: '...' },
  { key: 'email',         label: 'Email',          type: 'text',   required: false },
]

// ==================== LOGIQUE FORMULAIRE ====================

const isEditing = computed(() => !!props.assure?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.assure
    ? { ...props.assure }
    : Object.fromEntries(assureFields.map((f) => [f.key, f.type === 'checkbox' ? true : ''])),
)

const errorMessage = ref<string | null>(null)
const params = computed<PaginationParams>(() => ({}))
const { createAssure, updateAssure } = useAssures(params)

const loading = computed(() => createAssure.isPending.value || updateAssure.isPending.value)

const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  try {
    if (isEditing.value && props.assure?.id) {
      await updateAssure.mutateAsync({
        id: props.assure.id,
        data: {
          paysId: data.paysId,
          domaineActiviteId: data.domaineActiviteId,
          sigle: data.sigle,
          raisonSociale: data.raisonSociale,
          email: data.email,
        },
      })
      emit('success', 'Assuré modifié avec succès')
    } else {
      await createAssure.mutateAsync({
        paysId: data.paysId,
        domaineActiviteId: data.domaineActiviteId,
        sigle: data.sigle,
        raisonSociale: data.raisonSociale,
        email: data.email,
      } as Assure)
      emit('success', 'Assuré créé avec succès')
    }
  } catch (err: any) {
    console.error('Erreur sauvegarde:', err)
    errorMessage.value = err?.response?.data?.message || err?.message || 'Erreur lors de la sauvegarde.'
  }
}

const handleCancel = () => {
  errorMessage.value = null
  emit('cancel')
}
</script>

<template>
  <div>
    <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {{ errorMessage }}
    </div>
    <GenericCrudForm
      v-model="formData"
      :fields="assureFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>