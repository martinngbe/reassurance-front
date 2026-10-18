<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import { useDevises } from '@/services/referentiel/devise/useDevise'
import type { Devise } from '@/services/referentiel/devise/devise'
import type { PaginationParams } from '@/type/pagination'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

const props = defineProps<{
  devise?: Devise | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

const deviseFields: FieldConfig[] = [
  { key: 'code',    label: 'Code',    type: 'text', required: true,  placeholder: 'code devise' },
  { key: 'libelle', label: 'Libellé', type: 'text', required: true,  placeholder: '...' },
  { key: 'cours',   label: 'Cours',   type: 'number', required: false, placeholder: '0.00' },
]

const isEditing = computed(() => !!props.devise?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.devise
    ? { ...props.devise }
    : Object.fromEntries(deviseFields.map((f) => [f.key, f.type === 'checkbox' ? true : ''])),
)

const errorMessage = ref<string | null>(null)
const params = computed<PaginationParams>(() => ({}))
// ✅ Passer un objet vide pour éviter l'erreur "Expected 1 arguments"
const { createDevise, updateDevise } = useDevises(params)

const loading = computed(() => createDevise.isPending.value || updateDevise.isPending.value)

const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  try {
    if (isEditing.value && props.devise?.id) {
      await updateDevise.mutateAsync({
        id: props.devise.id,
        data: { code: data.code, libelle: data.libelle, cours: data.cours },
      })
      emit('success', 'Devise modifiée avec succès')
    } else {
      await createDevise.mutateAsync({
        code: data.code,
        libelle: data.libelle,
        cours: data.cours,
      } as Devise)
      emit('success', 'Devise créée avec succès')
    }
  } catch (err: any) {
    console.error('Erreur sauvegarde:', err)
    errorMessage.value = err?.response?.data?.message || err?.message || 'Erreur lors de la sauvegarde.'
  }
}

const handleCancel = () => {
  errorMessage.value = null
  emit('cancel')
}
</script>

<template>
  <div>
    <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {{ errorMessage }}
    </div>
    <GenericCrudForm
      v-model="formData"
      :fields="deviseFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>