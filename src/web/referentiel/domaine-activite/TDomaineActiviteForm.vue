<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { DomaineActivite } from '@/services/referentiel/domaine-activite/domaine-activite';
import { useDomaineActivites } from '@/services/referentiel/domaine-activite/useDomaineActivite';

// ==================== PROPS & EMITS ====================
const props = defineProps<{
  domaineActivite?: DomaineActivite | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== SCHÉMA DU FORMULAIRE ====================
const domaineActiviteFields: FieldConfig[] = [
  { key: 'code',      label: 'Code',        type: 'text', required: true, placeholder: 'saisissez le code' },
  { key: 'libelle',   label: 'Libellé',     type: 'text', required: true, placeholder: 'saisissez le libellé' },
  { key: 'description',   label: 'Description',     type: 'textarea', required: false, placeholder: 'saisissez une description' },
]

// ==================== ÉTAT ====================
const isEditing = computed(() => !!props.domaineActivite?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.domaineActivite
    ? { ...props.domaineActivite }
    : Object.fromEntries(
        domaineActiviteFields.map((f) => [f.key, f.type === 'checkbox' ? true : '']),
      ),
)

const errorMessage = ref<string | null>(null)

// ==================== API ====================
const { createDomaineActivite, updateDomaineActivite } = useDomaineActivites()

const loading = computed(
  () =>
    createDomaineActivite.isPending.value || updateDomaineActivite.isPending.value,
)

// ==================== HANDLERS ====================
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.info(" ----- TDomaineActiviteForm.handleSubmit  data:",data)
  console.info("data:",data)
  try {
    if (isEditing.value && props.domaineActivite?.id) {
      await updateDomaineActivite.mutateAsync({
        id: props.domaineActivite.id,
        data: {
          code: data.code,
          libelle: data.libelle,
          description: data.description
        },
      })
      emit('success', 'DomaineActivite modifié avec succès')
    } else {
      await createDomaineActivite.mutateAsync({
        code: data.code,
        libelle: data.libelle,
        description: data.description
      })
      emit('success', 'DomaineActivite créé avec succès')
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
      :fields="domaineActiviteFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>