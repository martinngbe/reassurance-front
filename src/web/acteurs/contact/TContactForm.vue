<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { Contact } from '@/services/acteurs/contact/contact';
import { useContacts } from '@/services/acteurs/contact/useContact';
import type { PaginationParams } from '@/type/pagination';

// ==================== PROPS & EMITS ====================
const props = defineProps<{
  contact?: Contact | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== SCHÉMA DU FORMULAIRE ====================
const brancheFields: FieldConfig[] = [
  { key: 'nom',               label: 'Nom',         type: 'text', required: true, placeholder: 'Saisissez votre nom ......' },
  { key: 'prenoms',           label: 'Prénoms',     type: 'text', required: true, placeholder: 'Saisissez votre prénoms ...... ' },
  { key: 'email',             label: 'EMail',       type: 'text', required: false, placeholder: 'Ex: nom.prenoms@entreprise.ci ... ' },
  { key: 'telephone',   label: 'N° Téléphone',type: 'text', required: false, placeholder: 'Ex: +225 0123654789' },
]

// ==================== ÉTAT ====================
const isEditing = computed(() => !!props.contact?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.contact
    ? { ...props.contact }
    : Object.fromEntries(
        brancheFields.map((f) => [f.key, f.type === 'checkbox' ? true : '']),
      ),
)

const errorMessage = ref<string | null>(null)
const params = computed<PaginationParams>(() => ({}))
// ==================== API ====================
const { createContact, updateContact } = useContacts(params)

const loading = computed(
  () =>
    createContact.isPending.value || updateContact.isPending.value,
)

// ==================== HANDLERS ====================
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.info(" ----- TBrancheForm.handleSubmit  data:",data)
  console.info("data:",data)
  try {
    if (isEditing.value && props.contact?.id) {
      await updateContact.mutateAsync({
        id: props.contact.id,
        data: {
          acteurId: data.acteurId,
          nom: data.nom,
          prenoms: data.prenoms,
          email: data.email,
          telephone: data.telephone,
        },
      })
      emit('success', 'Contact modifié avec succès')
    } else {
      await createContact.mutateAsync({
          acteurId: data.acteurId,
          nom: data.nom,
          prenoms: data.prenoms,
          email: data.email,
          telephone: data.telephone,
      } as Contact)
      emit('success', 'Contact créé avec succès')
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