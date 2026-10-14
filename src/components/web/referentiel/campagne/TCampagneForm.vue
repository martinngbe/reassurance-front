<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/components/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/components/forms/generic-form/types-form'
import { useCampagnes } from '@/referentiel/campagne/useCampagne'
import type { Campagne } from '@/referentiel/campagne/campagne'

// ==================== PROPS & EMITS ====================
const props = defineProps<{
  campagne?: Campagne | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== SCHÉMA DU FORMULAIRE ====================
const campagneFields: FieldConfig[] = [
  { key: 'code',      label: 'Code',        type: 'text', required: true, placeholder: 'code campagne. Example : 2026' },
  { key: 'libelle',   label: 'Libellé',     type: 'text', required: true, placeholder: 'Example: Campagne 2026' },
  
  {
    key: 'dateDebut',
    label: 'Date début',
    type: 'calendar',
    required: true,
    helpText: 'Sélectionnez la date du début de la campagne',
    calendarOptions: {
      selectionMode: 'single',
      locale: 'fr-FR',
      firstDayOfWeek: 1,
     // maxDate: new Date(), // Pas de date future
      size: 'md',
      variant: 'default',
      outputFormat: "yyyy-MM-dd", //  Stocké comme "2026-10-14T00:00:00.000Z"
    },
  },
   {
    key: 'dateFin',
    label: 'Date fin',
    type: 'calendar',
    required: true,
    helpText: 'Sélectionnez la date de fin de la campagne',
    calendarOptions: {
      selectionMode: 'single',
      locale: 'fr-FR',
      firstDayOfWeek: 1,
     // maxDate: new Date(), // Pas de date future
      size: 'md',
      variant: 'default',
       outputFormat: "yyyy-MM-dd", //iso ou Date ou Stocké comme "2026-10-14T00:00:00.000Z"
    },
  }, 
  
  
  { key: 'isActif',   label: 'Actif', type: 'checkbox', placeholder: 'Campagne active?' },
]

// ==================== ÉTAT ====================
const isEditing = computed(() => !!props.campagne?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.campagne
    ? { ...props.campagne }
    : Object.fromEntries(
        campagneFields.map((f) => [f.key, f.type === 'checkbox' ? true : '']),
      ),
)

const errorMessage = ref<string | null>(null)

// ==================== API ====================
const { createCampagne, updateCampagne } = useCampagnes()

const loading = computed(
  () =>
    createCampagne.isPending.value || updateCampagne.isPending.value,
)

// ==================== HANDLERS ====================
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.info(" ----- TCampagneForm.handleSubmit  data:",data)
  console.info("data:",data)
  try {
    if (isEditing.value && props.campagne?.id) {
      await updateCampagne.mutateAsync({
        id: props.campagne.id,
        data: {
          code: data.code,
          libelle: data.libelle,
          dateDebut: data.dateDebut,
          dateFin: data.dateFin,
          isActif: data.isActif
        },
      })
      emit('success', 'Campagne modifié avec succès')
    } else {
      await createCampagne.mutateAsync({
        code: data.code,
        libelle: data.libelle,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        isActif: data.isActif
      })
      emit('success', 'Campagne créé avec succès')
    }
  } catch (err: any) {
    console.error('Erreur sauvegarde:', err)
    errorMessage.value =
      err?.response?.data?.message ||
      err?.message ||
      'Une erreur est survenue lors de la sauvegarde.'
  }
}

const handleCancel = () => {
  errorMessage.value = null
  emit('cancel')
}
</script>

<template>
  <div>
    <!-- Message d'erreur -->
    <div
      v-if="errorMessage"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
    >
      {{ errorMessage }}
    </div>

    <GenericCrudForm
      v-model="formData"
      :fields="campagneFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>