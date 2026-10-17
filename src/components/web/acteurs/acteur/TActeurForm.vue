<script setup lang="ts">
import { computed, ref } from 'vue'
import GenericCrudForm from '@/components/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/components/forms/generic-form/types-form'

import type { PaginationParams } from '@/type/pagination'
import type { Acteur } from '@/acteurs/acteur/acteur';
import { useActeurs } from '@/acteurs/acteur/useActeur';

const props = defineProps<{
  acteur?: Acteur | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

const acteurFields: FieldConfig[] = [
  { key: 'paysId',        label: 'Pays',          type: 'select', required: true,  placeholder: 'Sélectionner le pays ...' },
  { key: 'sigle',         label: 'Sigle',         type: 'text',   required: true,  placeholder: '' },
  { key: 'raisonSociale', label: 'Raison sociale',type: 'text',   required: true,  placeholder: '...' },
  { key: 'email',         label: 'Email',         type: 'text',   required: false },


  { key: 'isReassureur',  label: 'Réasseur',   type: 'checkbox' },
  { key: 'isCourtier',    label: 'Courtier',   type: 'checkbox' },
  { key: 'isCompagnieAssurance',    label:'Cie assurance' ,   type: 'checkbox' },

]

const isEditing = computed(() => !!props.acteur?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

const formData = ref<Record<string, any>>(
  props.acteur
    ? { ...props.acteur }
    : Object.fromEntries(acteurFields.map((f) => [f.key, f.type === 'checkbox' ? true : ''])),
)

const errorMessage = ref<string | null>(null)
const params = computed<PaginationParams>(() => ({}))
// ✅ Passer un objet vide pour éviter l'erreur "Expected 1 arguments"
const { createActeur, updateActeur } = useActeurs(params)

const loading = computed(() => createActeur.isPending.value || updateActeur.isPending.value)

const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  try {
    if (isEditing.value && props.acteur?.id) {
      await updateActeur.mutateAsync({
        id: props.acteur.id,
        data: { 
            paysId: data.paysId, 
            sigle: data.sigle, 
            raisonSociale: data.raisonSociale, 
            email: data.email,
            isReassureur: data.isReassureur,
            isCourtier: data.isCourtier,
            isCompagnieAssurance: data.isCompagnieAssurance
         
          },
      })
      emit('success', 'Acteur modifiée avec succès')
    } else {
      await createActeur.mutateAsync({
            paysId: data.paysId, 
            sigle: data.sigle, 
            raisonSociale: data.raisonSociale, 
            email: data.email,
            isReassureur: data.isReassureur,
            isCourtier: data.isCourtier,
            isCompagnieAssurance: data.isCompagnieAssurance
      } as Acteur)
      emit('success', 'Acteur créée avec succès')
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
      :fields="acteurFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>