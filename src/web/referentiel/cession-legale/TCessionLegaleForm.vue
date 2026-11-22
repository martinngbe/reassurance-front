<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { CessionLegale } from '@/services/referentiel/cession-legale/cession-legale';
import { useCessionLegales } from '@/services/referentiel/cession-legale/useCessionLegale';

// ==================== PROPS & EMITS ====================
const props = defineProps<{
  cessionLegale?: CessionLegale | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== SCHÉMA DU FORMULAIRE ====================
const cessionLegaleFields: FieldConfig[] = [
  { key: 'taux',    label: 'Taux %',        type: 'number' , numberOptions:{min:0 , max:100} },
  { key: 'isFac',   label: 'FAC',     type: 'checkbox' },
]

// ==================== ÉTAT ====================
const isEditing = computed(() => !!props.cessionLegale?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.cessionLegale
    ? { ...props.cessionLegale }
    : Object.fromEntries(
        cessionLegaleFields.map((f) => [f.key, f.type === 'checkbox' ? true : '']),
      ),
)

const errorMessage = ref<string | null>(null)

// ==================== API ====================
const { createCessionLegale, updateCessionLegale } = useCessionLegales()

const loading = computed(
  () =>
    createCessionLegale.isPending.value || updateCessionLegale.isPending.value,
)

// ==================== HANDLERS ====================
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.info(" ----- TBrancheForm.handleSubmit  data:",data)
  console.info("data:",data)
  try {
    if (isEditing.value && props.cessionLegale?.id) {
      await updateCessionLegale.mutateAsync({
        id: props.cessionLegale.id,
        data: {
          taux: data.taux,
          isFac: data.isFac,
        },
      })
      emit('success', 'Sous Branche modifié avec succès')
    } else {
      await createCessionLegale.mutateAsync({
        acteurId: data.acteurId,
        taux: data.taux,
        isFac: data.isFac,
      })
      emit('success', 'Sous Branche créé avec succès')
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
      :fields="cessionLegaleFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>