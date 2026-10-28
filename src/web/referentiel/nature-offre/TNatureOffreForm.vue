<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { NatureOffre } from '@/services/referentiel/nature-offre/nanture-offre';
import { useNatureOffres } from '@/services/referentiel/nature-offre/useNatureOffre';

// ==================== PROPS & EMITS ====================
const props = defineProps<{
  natureOffre?: NatureOffre | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== SCHÉMA DU FORMULAIRE ====================
const natureOffreFields: FieldConfig[] = [
  { key: 'code',              label: 'Code',        type: 'text', required: true, placeholder: 'code ...' },
  { key: 'libelle',           label: 'Libellé',     type: 'text', required: true, placeholder: '...' },
  { key: 'isProportionnelle', label: 'Proportionnelle',               type: 'checkbox',  },
  { key: 'isFacultative',     label: 'Facultative',                   type: 'checkbox',   },
  { key: 'isFacObligatoire',  label: 'Facultative obligatoire',       type: 'checkbox',   },


  { key: 'isEdp',           label: 'EDP',                  type: 'checkbox',  },
  { key: 'isQuotePart',     label: 'QP',                   type: 'checkbox',   },
  { key: 'isXs',            label: 'Facultative XS',       type: 'checkbox',   },

]

// ==================== ÉTAT ====================
const isEditing = computed(() => !!props.natureOffre?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.natureOffre
    ? { ...props.natureOffre }
    : Object.fromEntries(
        natureOffreFields.map((f) => [f.key, f.type === 'checkbox' ? true : '']),
      ),
)

const errorMessage = ref<string | null>(null)

// ==================== API ====================
const { createNatureOffre, updateNatureOffre } = useNatureOffres()

const loading = computed(
  () =>
    createNatureOffre.isPending.value || updateNatureOffre.isPending.value,
)


// ✅ Helper pour construire le payload commun (évite la duplication)
function buildPayload(data: Record<string, any>) {
 
  return {
  
    code: data.code,
    libelle: data.libelle,
    isProportionnelle: data.isProportionnelle,
    isFacultative: data.isFacultative,
    isFacObligatoire: data.isFacObligatoire,
    isEdp : data.isEdp,
    isXs : data.isXs ,
    isQuotePart : data.isQuotePart
  }
}
// ==================== HANDLERS ====================
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.info(" ----- TNatureOffreForm.handleSubmit  data:",data)
  console.info("data:",data)
  try {
    if (isEditing.value && props.natureOffre?.id) {
      await updateNatureOffre.mutateAsync({
        id: props.natureOffre.id,
        data:buildPayload(data),
      })
      emit('success', 'NatureOffre modifié avec succès')
    } else {
      await createNatureOffre.mutateAsync(buildPayload(data))
      emit('success', 'NatureOffre créé avec succès')
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
      :fields="natureOffreFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>