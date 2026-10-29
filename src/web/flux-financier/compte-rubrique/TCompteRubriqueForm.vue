<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { CompteRubrique } from '@/services/flux-financiers/compte-rubrique/compte-rubrique';
import { useCompteRubriques } from '@/services/flux-financiers/compte-rubrique/useCompteRubrique';

// ==================== PROPS & EMITS ====================
const props = defineProps<{
  compteRubrique?: CompteRubrique | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== SCHÉMA DU FORMULAIRE ====================
const brancheFields: FieldConfig[] = [
  { key: 'code',                  label: 'Code',        type: 'text', required: true, placeholder: 'code' },
  { key: 'libelle',               label: 'Libellé',     type: 'text', required: true, placeholder: '...' },
  { key: 'partie',                label: 'Partie',                type: 'text', required: true, placeholder: '...' },
  { key: 'isNonProportionnel',    label: 'Non Proportionnel',     type: 'checkbox', },
  { key: 'isProportionnel',       label: 'Proportionnel',         type: 'checkbox' },
]

// ==================== ÉTAT ====================
const isEditing = computed(() => !!props.compteRubrique?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.compteRubrique
    ? { ...props.compteRubrique }
    : Object.fromEntries(
        brancheFields.map((f) => [f.key, f.type === 'checkbox' ? true : '']),
      ),
)

const errorMessage = ref<string | null>(null)

// ==================== API ====================
const { createCompteRubrique, updateCompteRubrique } = useCompteRubriques()

const loading = computed(
  () =>
    createCompteRubrique.isPending.value || updateCompteRubrique.isPending.value,
)
// ✅ Helper pour construire le payload commun (évite la duplication)
function buildPayload(data: Record<string, any>) {

  return {
    code: data.code,
    libelle: data.libelle,
    partie: data.partie,
    isNonProportionnel: data.isNonProportionnel,
    isProportionnel: data.isProportionnel,
  }
}
// ==================== HANDLERS ====================
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.info(" ----- TBrancheForm.handleSubmit  data:",data)
  console.info("data:",data)
  try {
    if (isEditing.value && props.compteRubrique?.id) {
      await updateCompteRubrique.mutateAsync({
        id: props.compteRubrique.id,
        data:buildPayload(data),
      })
      emit('success', 'Compte Rubrique modifié avec succès')
    } else {
      await createCompteRubrique.mutateAsync(buildPayload(data))
      emit('success', 'Compte Rubrique créé avec succès')
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