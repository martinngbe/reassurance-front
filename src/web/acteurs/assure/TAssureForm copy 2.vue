<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { PaginationParams } from '@/type/pagination'
import type { Assure } from '@/services/acteurs/assure/assure'
import { useAssures } from '@/services/acteurs/assure/useAssure'
import { apiClient } from '@/api/api-client'

const props = defineProps<{
  assure?: Assure | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== FONCTIONS RESOLVE (SCROLL INFINI) ====================

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
    type: 'async-select',
    required: true,
    placeholder: 'Sélectionner le pays ...',
    loadOptions: fetchPays,
    asyncOptions: {
      trackBy: 'id',
      labelBy: 'libelle'
    }
  },
  {
    key: 'domaineActiviteId',
    label: "Domaine d'activité",
    type: 'async-select',
    required: true,
    placeholder: "Sélectionner le domaine d'activité ...",
    loadOptions: fetchDomaineActivite,
    asyncOptions: {
      trackBy: 'id',
      labelBy: 'libelle'
    }
  },
  { key: 'sigle',         label: 'Sigle',          type: 'text', required: true,  placeholder: 'Ex: SARL, SA...' },
  { key: 'raisonSociale', label: 'Raison sociale', type: 'text', required: true,  placeholder: 'Nom complet de l\'entreprise' },
  { key: 'email',         label: 'Email',          type: 'text', required: false, placeholder: 'contact@entreprise.com' },
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
  <div class="w-full max-w-3xl mx-auto">
    <!-- Carte principale avec effet de profondeur -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
      
      <!-- En-tête moderne avec dégradé et icône -->
      <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750">
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
            <!-- Icône Entreprise/Assuré -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {{ isEditing ? 'Modifier l\'assuré' : 'Nouvel assuré' }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ isEditing ? 'Mettez à jour les informations de cette entité.' : 'Remplissez les informations pour créer une nouvelle entité.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Corps du formulaire -->
      <div class="p-6">
        <!-- Message d'erreur moderne avec transition -->
        <Transition name="slide-fade">
          <div v-if="errorMessage" class="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            <svg class="h-5 w-5 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="text-sm font-medium flex-1">{{ errorMessage }}</p>
            <button @click="dismissError" class="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Transition>

        <!-- Formulaire Générique -->
        <GenericCrudForm
          v-model="formData"
          :fields="assureFields"
          :mode="formMode"
          :show-delete="false"
          :loading="loading"
          :submit-label="isEditing ? 'Mettre à jour' : 'Créer l\'assuré'"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
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