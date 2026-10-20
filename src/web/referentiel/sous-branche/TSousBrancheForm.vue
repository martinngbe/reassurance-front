<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { Branche } from '@/services/referentiel/branche/branche'
import { useSousBranches } from '@/services/referentiel/sous-branche/useSousBranche'
import type { SousBranche } from '@/services/referentiel/sous-branche/sous-branche'

// ==================== PROPS & EMITS ====================
const props = defineProps<{
  sousBranche?: SousBranche | null
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
const isEditing = computed(() => !!props.sousBranche?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.sousBranche
    ? { ...props.sousBranche }
    : Object.fromEntries(
        brancheFields.map((f) => [f.key, f.type === 'checkbox' ? true : '']),
      ),
)

const errorMessage = ref<string | null>(null)

// ==================== API ====================
const { createSousBranche, updateSousBranche } = useSousBranches()

const loading = computed(
  () =>
    createSousBranche.isPending.value || updateSousBranche.isPending.value,
)

// ==================== HANDLERS ====================
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.info(" ----- TBrancheForm.handleSubmit  data:",data)
  console.info("data:",data)
  try {
    if (isEditing.value && props.sousBranche?.id) {
      await updateSousBranche.mutateAsync({
        id: props.sousBranche.id,
        data: {
          code: data.code,
          libelle: data.libelle,
        },
      })
      emit('success', 'Sous Branche modifié avec succès')
    } else {
      await createSousBranche.mutateAsync({
        brancheId: data.brancheId,
        code: data.code,
        libelle: data.libelle,
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