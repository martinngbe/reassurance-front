<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { NaturePlacement } from '@/services/referentiel/nature-placement/nature-placement';
import { useNaturePlacements } from '@/services/referentiel/nature-placement/useNaturePlacement';

// ==================== PROPS & EMITS ====================
const props = defineProps<{
  naturePlacement?: NaturePlacement | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== SCHÉMA DU FORMULAIRE ====================
const naturePlacementFields: FieldConfig[] = [
  { key: 'code',              label: 'Code',        type: 'text', required: true, placeholder: 'code ...' },
  { key: 'libelle',           label: 'Libellé',     type: 'text', required: true, placeholder: '...' },
 
]

// ==================== ÉTAT ====================
const isEditing = computed(() => !!props.naturePlacement?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.naturePlacement
    ? { ...props.naturePlacement }
    : Object.fromEntries(
        naturePlacementFields.map((f) => [f.key, f.type === 'checkbox' ? true : '']),
      ),
)

const errorMessage = ref<string | null>(null)

// ==================== API ====================
const { createNaturePlacement, updateNaturePlacement } = useNaturePlacements()

const loading = computed(
  () =>
    createNaturePlacement.isPending.value || updateNaturePlacement.isPending.value,
)

// ==================== HANDLERS ====================
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.info(" ----- TNaturePlacementForm.handleSubmit  data:",data)
  console.info("data:",data)
  try {
    if (isEditing.value && props.naturePlacement?.id) {
      await updateNaturePlacement.mutateAsync({
        id: props.naturePlacement.id,
        data: {
          code: data.code,
          libelle: data.libelle,
        },
      })
      emit('success', 'NaturePlacement modifié avec succès')
    } else {
      await createNaturePlacement.mutateAsync({
        code: data.code,
        libelle: data.libelle,      
      })
      emit('success', 'NaturePlacement créé avec succès')
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
      :fields="naturePlacementFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>