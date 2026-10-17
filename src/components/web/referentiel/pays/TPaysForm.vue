<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/components/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/components/forms/generic-form/types-form'

import type { Pays } from '@/referentiel/pays/pays'
import { useLesPays } from '@/referentiel/pays/usePays';

// ==================== PROPS & EMITS ====================
const props = defineProps<{
  pays?: Pays | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== SCHÉMA DU FORMULAIRE ====================
const paysFields: FieldConfig[] = [
  { key: 'indicatif',     label: 'Indicatif',        type: 'text', required: true, placeholder: 'code pays' },
  { key: 'code',          label: 'Code',        type: 'text', required: true, placeholder: 'code pays' },
  { key: 'libelle',       label: 'Libellé',     type: 'text', required: true, placeholder: '...' },
]

// ==================== ÉTAT ====================
const isEditing = computed(() => !!props.pays?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.pays
    ? { ...props.pays }
    : Object.fromEntries(
        paysFields.map((f) => [f.key, f.type === 'checkbox' ? true : '']),
      ),
)

const errorMessage = ref<string | null>(null)

// ==================== API ====================
const { createPays, updatePays } = useLesPays()

const loading = computed(
  () =>
    createPays.isPending.value || updatePays.isPending.value,
)

// ==================== HANDLERS ====================
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.info(" ----- TPaysForm.handleSubmit  data:",data)
  console.info("data:",data)
  try {
    if (isEditing.value && props.pays?.id) {
      await updatePays.mutateAsync({
        id: props.pays.id,
        data: {
          regionId: data.regionId,
          indicatif: data.indicatif,
          code: data.code,
          libelle: data.libelle,
        },
      })
      emit('success', 'Pays modifié avec succès')
    } else {
      await createPays.mutateAsync({
        regionId: data.regionId,
        indicatif: data.indicatif,
        code: data.code,
        libelle: data.libelle,
      })
      emit('success', 'Pays créé avec succès')
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
      :fields="paysFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>