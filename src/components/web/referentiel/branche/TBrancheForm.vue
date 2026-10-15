<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/components/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/components/forms/generic-form/types-form'
import { useBranches } from '@/referentiel/branche/useBranche'
import type { Branche } from '@/referentiel/branche/branche'

// ==================== PROPS & EMITS ====================
const props = defineProps<{
  branche?: Branche | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== SCHÉMA DU FORMULAIRE ====================
const brancheFields: FieldConfig[] = [
  { key: 'code',      label: 'Code',        type: 'text', required: true, placeholder: 'code branche' },
  { key: 'libelle',   label: 'Libellé',     type: 'text', required: true, placeholder: '...' },
]

// ==================== ÉTAT ====================
const isEditing = computed(() => !!props.branche?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.branche
    ? { ...props.branche }
    : Object.fromEntries(
        brancheFields.map((f) => [f.key, f.type === 'checkbox' ? true : '']),
      ),
)

const errorMessage = ref<string | null>(null)

// ==================== API ====================
const { createBranche, updateBranche } = useBranches()

const loading = computed(
  () =>
    createBranche.isPending.value || updateBranche.isPending.value,
)

// ==================== HANDLERS ====================
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.info(" ----- TBrancheForm.handleSubmit  data:",data)
  console.info("data:",data)
  try {
    if (isEditing.value && props.branche?.id) {
      await updateBranche.mutateAsync({
        id: props.branche.id,
        data: {
          code: data.code,
          libelle: data.libelle,
        },
      })
      emit('success', 'Branche modifié avec succès')
    } else {
      await createBranche.mutateAsync({
        code: data.code,
        libelle: data.libelle,
      })
      emit('success', 'Branche créé avec succès')
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
      :fields="brancheFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>