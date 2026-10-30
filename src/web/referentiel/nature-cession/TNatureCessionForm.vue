<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { NatureCession } from '@/services/referentiel/nature-cession/nanture-cession';
import { useNatureCessions } from '@/services/referentiel/nature-cession/useNatureCession';

// ==================== PROPS & EMITS ====================
const props = defineProps<{
  natureCession?: NatureCession | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== SCHÉMA DU FORMULAIRE ====================
const natureCessionFields: FieldConfig[] = [
  { key: 'code',              label: 'Code',        type: 'text', required: true, placeholder: 'code ...' },
  { key: 'libelle',           label: 'Libellé',     type: 'text', required: true, placeholder: '...' },
  { key: 'isProportionnelle', label: 'Proportionnelle',               type: 'checkbox',  },
  { key: 'isFacultative',     label: 'Facultative',                   type: 'checkbox',   },
  { key: 'isFacObligatoire',  label: 'Facultative obligatoire',       type: 'checkbox',   },
]

// ==================== ÉTAT ====================
const isEditing = computed(() => !!props.natureCession?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.natureCession
    ? { ...props.natureCession }
    : Object.fromEntries(
        natureCessionFields.map((f) => [f.key, f.type === 'checkbox' ? true : '']),
      ),
)

const errorMessage = ref<string | null>(null)

// ==================== API ====================
const { createNatureCession, updateNatureCession } = useNatureCessions()

const loading = computed(
  () =>
    createNatureCession.isPending.value || updateNatureCession.isPending.value,
)

// ==================== HANDLERS ====================
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.info(" ----- TNatureCessionForm.handleSubmit  data:",data)
  console.info("data:",data)
  try {
    if (isEditing.value && props.natureCession?.id) {
      await updateNatureCession.mutateAsync({
        id: props.natureCession.id,
        data: {
          code: data.code,
          libelle: data.libelle,
        },
      })
      emit('success', 'NatureCession modifié avec succès')
    } else {
      await createNatureCession.mutateAsync({
        code: data.code,
        libelle: data.libelle,      
      })
      emit('success', 'NatureCession créé avec succès')
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
      :fields="natureCessionFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>