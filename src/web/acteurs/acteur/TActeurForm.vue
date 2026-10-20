<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/composants/forms/generic-form/types-form'
import type { PaginationParams } from '@/type/pagination'
import type { Acteur, ActeurFormData } from '@/services/acteurs/acteur/acteur'
import { useActeurs } from '@/services/acteurs/acteur/useActeur'
import { apiClient } from '@/api/api-client'

const props = defineProps<{
  acteur?:  Acteur | null  // ✅ L'API envoie un Assur
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== FONCTIONS RESOLVE (SCROLL INFINI) ====================

async function fetchPays(query: string, page: number) {
  const res = await apiClient.get('/pays', {
    params: { search: query, page, limit: 20 }
  })
  return {
    options: res.data.items || res.data.data || [],
    hasMore: res.data.meta?.current_page < res.data.meta?.last_page || false
  }
}

async function fetchDomaineActivite(query: string, page: number) {
  const res = await apiClient.get('/domaine-activite', {
    params: { search: query, page, limit: 20 }
  })
  return {
    options: res.data.items || res.data.data || [],
    hasMore: res.data.meta?.current_page < res.data.meta?.last_page || false
  }
}

// ==================== CONFIGURATION DES CHAMPS ====================

const acteurFields: FieldConfig[] = [
  {
    key: 'paysId',
    label: 'Pays',
    type: 'async-select',
    required: true,
    placeholder: 'Sélectionner le pays ...',
    loadOptions: fetchPays,
    autoSelectFirst: true,  // ✅ Pré-sélectionne le premier pays en mode création
    asyncOptions: {
      trackBy: 'id',
      labelBy: 'libelle'
    }
  },
  
  { key: 'sigle',         label: 'Sigle',         type: 'text',   required: true,  placeholder: '' },
  { key: 'raisonSociale', label: 'Raison sociale',type: 'text',   required: true,  placeholder: '...' },
  { key: 'email',         label: 'Email',         type: 'text',   required: false },


  { key: 'isReassureur',  label: 'Réasseur',   type: 'checkbox' },
  { key: 'isCourtier',    label: 'Courtier',   type: 'checkbox' },
  { key: 'isCompagnieAssurance',    label:'Cie assurance' ,   type: 'checkbox' },

]

// ==================== LOGIQUE FORMULAIRE ====================

const isEditing = computed(() => !!props.acteur?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): ActeurFormData {
  if (!props.acteur) {
    return Object.fromEntries(
      acteurFields.map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as  unknown as ActeurFormData
  }

  const data = { ...props.acteur } as ActeurFormData

  // ✅ Mapper les objets COMPLETS vers les clés attendues par le formulaire
  // Le composant TAsyncSelect a besoin de l'objet complet pour afficher le libellé
  if (data.pays) {
    data.paysId = data.pays  // ✅ Objet complet, PAS juste l'ID
    delete data.pays // ✅ Supprimer pour éviter les doublons
  }


  return data as ActeurFormData
}

const formData = ref<ActeurFormData>(initializeFormData())

// ✅ Watcher pour gérer les changements de props.acteur
watch(() => props.acteur, (newActeur) => {
  if (newActeur) {
    formData.value = initializeFormData()
  }
}, { deep: true })

const errorMessage = ref<string | null>(null)
const params = computed<PaginationParams>(() => ({}))
const { createActeur, updateActeur } = useActeurs(params)

const loading = computed(() => createActeur.isPending.value || updateActeur.isPending.value)

// ✅ Fonction helper pour extraire l'ID d'un objet ou retourner la valeur telle quelle
function extractId(value: any): number | undefined {
  if (value && typeof value === 'object' && value.id) {
    return value.id
  }
  return value
}

const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  try {
    if (isEditing.value && props.acteur?.id) {
      console.log("<<<<<<< handleSubmit data:",data)
      await updateActeur.mutateAsync({
        id: props.acteur.id,
        data: {
          paysId: extractId(data.paysId),
          sigle: data.sigle,
          raisonSociale: data.raisonSociale,
          email: data.email,
          adresse: data.adresse,
          telephone: data.telephone,
          siteweb: data.siteweb,
          coordonneesBancaire: data.coordonneesBancaire,

          isCompagnieAssurance: data.isCompagnieAssurance,
          isReassureur: data.isReassureur,
          isCourtier: data.isCourtier,
        },
      })
      emit('success', 'Assuré modifié avec succès')
    } else {
      await createActeur.mutateAsync({
        paysId: extractId(data.paysId),
        sigle: data.sigle,
        raisonSociale: data.raisonSociale,
        email: data.email,
        adresse: data.adresse,
        telephone: data.telephone,
        siteweb: data.siteweb,
        coordonneesBancaire: data.coordonneesBancaire,        
        isCompagnieAssurance: data.isCompagnieAssurance,
        isReassureur: data.isReassureur,
        isCourtier: data.isCourtier,
      } as Acteur)
      emit('success', 'Assuré créé avec succès')
    }
  } catch (err: any) {
    console.error('Erreur sauvegarde:', err)
    errorMessage.value = err?.response?.data?.message || err?.message || 'Une erreur est survenue lors de la sauvegarde.'
  }
}

const handleCancel = () => {
  errorMessage.value = null
  emit('cancel')
}

const dismissError = () => {
  errorMessage.value = null
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
<style scoped>
/* Animation pour le message d'erreur */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>