<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/components/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/components/forms/generic-form/types-form'
import { useRegions } from '@/referentiel/region/useRegion'
import type { Region } from '@/referentiel/region/region'

// ==================== PROPS & EMITS ====================
const props = defineProps<{
  region?: Region | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== SCHÉMA DU FORMULAIRE ====================
const regionFields: FieldConfig[] = [
  { key: 'code',      label: 'Code',        type: 'text', required: true, placeholder: 'code region' },
  { key: 'libelle',   label: 'Libellé',     type: 'text', required: true, placeholder: '...' },
]

// ==================== ÉTAT ====================
const isEditing = computed(() => !!props.region?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.region
    ? { ...props.region }
    : Object.fromEntries(
        regionFields.map((f) => [f.key, f.type === 'checkbox' ? true : '']),
      ),
)

const errorMessage = ref<string | null>(null)

// ==================== API ====================
const { createRegion, updateRegion } = useRegions()

const loading = computed(
  () =>
    createRegion.isPending.value || updateRegion.isPending.value,
)

// ==================== HANDLERS ====================
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.info(" ----- TRegionForm.handleSubmit  data:",data)
  console.info("data:",data)
  try {
    if (isEditing.value && props.region?.id) {
      await updateRegion.mutateAsync({
        id: props.region.id,
        data: {
          code: data.code,
          libelle: data.libelle,
        },
      })
      emit('success', 'Region modifié avec succès')
    } else {
      await createRegion.mutateAsync({
        code: data.code,
        libelle: data.libelle,
      })
      emit('success', 'Region créé avec succès')
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
      :fields="regionFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>