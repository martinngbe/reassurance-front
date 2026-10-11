<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/components/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/components/forms/generic-form/types-form'
import { useUtilisateurs } from '@/referentiel/utilisateur/useUtilisateur'
import type { Utilisateur } from '@/referentiel/utilisateur/utilisateur'

// ==================== PROPS & EMITS ====================
const props = defineProps<{
  utilisateur?: Utilisateur | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== SCHÉMA DU FORMULAIRE ====================
const utilisateurFields: FieldConfig[] = [
  { key: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'Nom' },
  { key: 'prenoms', label: 'Prénoms', type: 'text', required: true, placeholder: 'Prénoms' },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    helpText: 'Utilisé pour la connexion',
  },
  { key: 'isActive', label: 'Actif', type: 'checkbox', placeholder: 'Compte activé' },
]

// ==================== ÉTAT ====================
const isEditing = computed(() => !!props.utilisateur?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.utilisateur
    ? { ...props.utilisateur }
    : Object.fromEntries(
        utilisateurFields.map((f) => [f.key, f.type === 'checkbox' ? true : '']),
      ),
)

const errorMessage = ref<string | null>(null)

// ==================== API ====================
const { createUtilisateur, updateUtilisateur } = useUtilisateurs()

const loading = computed(
  () =>
    createUtilisateur.isPending.value || updateUtilisateur.isPending.value,
)

// ==================== HANDLERS ====================
const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.info("data:",data)
  // try {
  //   if (isEditing.value && props.utilisateur?.id) {
  //     await updateUtilisateur.mutateAsync({
  //       id: props.utilisateur.id,
  //       data: {
  //         nom: data.nom,
  //         prenoms: data.prenoms,
  //         email: data.email,
  //       },
  //     })
  //     emit('success', 'Utilisateur modifié avec succès')
  //   } else {
  //     await createUtilisateur.mutateAsync({
  //       nom: data.nom,
  //       prenoms: data.prenoms,
  //       email: data.email,
  //     })
  //     emit('success', 'Utilisateur créé avec succès')
  //   }
  // } catch (err: any) {
  //   console.error('Erreur sauvegarde:', err)
  //   errorMessage.value =
  //     err?.response?.data?.message ||
  //     err?.message ||
  //     'Une erreur est survenue lors de la sauvegarde.'
  // }
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
      :fields="utilisateurFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>