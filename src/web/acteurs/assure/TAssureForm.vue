<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { PaginationParams } from '@/type/pagination'
import type { Assure, AssureFormData } from '@/services/acteurs/assure/assure'
import { useAssures } from '@/services/acteurs/assure/useAssure'
import { apiClient } from '@/api/api-client'

const props = defineProps<{
  assure?:  Assure | null  // ✅ L'API envoie un Assur
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
    autoSelectFirst: true,  // ✅ Pré-sélectionne le premier pays en mode création
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
    autoSelectFirst: true,  // ✅ Pré-sélectionne le premier domaine en mode création
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

// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): AssureFormData {
  if (!props.assure) {
    return Object.fromEntries(
      assureFields.map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as  unknown as AssureFormData
  }

  const data = { ...props.assure } as AssureFormData

  // ✅ Mapper les objets COMPLETS vers les clés attendues par le formulaire
  // Le composant TAsyncSelect a besoin de l'objet complet pour afficher le libellé
  if (data.pays) {
    data.paysId = data.pays  // ✅ Objet complet, PAS juste l'ID
    delete data.pays // ✅ Supprimer pour éviter les doublons
  }
  if (data.domaineActivite) {
    data.domaineActiviteId = data.domaineActivite  // ✅ Objet complet, PAS juste l'ID
    delete data.domaineActivite // ✅ Supprimer pour éviter les doublons
  }

  return data as AssureFormData
}

const formData = ref<AssureFormData>(initializeFormData())

// ✅ Watcher pour gérer les changements de props.assure
watch(() => props.assure, (newAssure) => {
  if (newAssure) {
    formData.value = initializeFormData()
  }
}, { deep: true })

const errorMessage = ref<string | null>(null)
const params = computed<PaginationParams>(() => ({}))
const { createAssure, updateAssure } = useAssures(params)

const loading = computed(() => createAssure.isPending.value || updateAssure.isPending.value)

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
    if (isEditing.value && props.assure?.id) {
      console.log("<<<<<<< handleSubmit data:",data)
      await updateAssure.mutateAsync({
        id: props.assure.id,
        data: {
          paysId: extractId(data.paysId),
          domaineActiviteId: extractId(data.domaineActiviteId),
          sigle: data.sigle,
          raisonSociale: data.raisonSociale,
          email: data.email,
          adresse: data.email,
          localite: data.localite,
          quartier: data.quartier,
          rue: data.rue,
          description: data.description,
          telephone: data.telephone, 
        },
      })
      emit('success', 'Assuré modifié avec succès')
    } else {
      await createAssure.mutateAsync({
        paysId: extractId(data.paysId),
        domaineActiviteId: extractId(data.domaineActiviteId),
        sigle: data.sigle,
        raisonSociale: data.raisonSociale,
        email: data.email,
        adresse: data.email,
        localite: data.localite,
        quartier: data.quartier,
        rue: data.rue,
        description: data.description,
        telephone: data.telephone,         
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