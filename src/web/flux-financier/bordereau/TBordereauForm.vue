<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FormField } from '@/composants/forms/generic-form/types-form'
import { apiClient } from '@/api/api-client'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'
import { useBordereauStore } from '@/services/flux-financiers/bordereau/bordereau.store'
import { useBordereaux } from '@/services/flux-financiers/bordereau/useBordereaux'
import type { BordereauFormData } from '@/services/flux-financiers/bordereau/bordereau'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'

////////////////////////////////////////
/////  FORMULAIRE CRUD DE BORDEREAU
////////////////////////////////////////
const quittanceStore = useQuittanceStore()
const currentQuittance = quittanceStore.currentQuittance
const bordereauStore = useBordereauStore()

// ✅ currentBordereau depuis le store (réactif)
const currentBordereau = computed(() => bordereauStore.currentBordereau)

const { createBordereau, updateBordereau, deleteBordereau } = useBordereaux({})

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== FETCH ASYNC ====================
async function fetchDevise(query: string, page: number) {
  const res = await apiClient.get('/devise', {
    params: { search: query, page, limit: 20 }
  })
  return {
    options: res.data.items || res.data.data || [],
    hasMore: res.data.meta?.current_page < res.data.meta?.last_page || false
  }
}

// ==================== CONFIGURATION DES CHAMPS ====================
const bordereauFields = computed<FormField[]>(() => {
  const allFields: FormField[] = [
    // --- Identification ---
    { section: 'Identification' },
    { key: 'reference', label: 'Numéro référence', type: 'text', required: true },
    { key: 'dateReception', label: 'Date de réception', type: 'calendar' },

    // --- Période ---
    { section: "Période et devise" },
    { key: 'periodeDebut', label: 'Période début', type: 'calendar', required: true },
    { key: 'periodeFin', label: 'Période fin', type: 'calendar', required: true },

    // --- Devise ---
    {
      key: 'deviseId',
      label: 'Devise',
      type: 'async-select',
      //required: true,
      disabled: true, // 🔒 Champ affiché mais non modifiable
      placeholder: 'Sélectionner une devise ...',
      loadOptions: fetchDevise,
      autoSelectFirst: true,
      asyncOptions: { trackBy: 'id', labelBy: 'libelle' },
    },
    { key: 'coursDevise', label: 'Cours Devise', type: 'number', numberOptions: { min: 0 } },

    // --- Primes ---
    { section: 'Primes' },
    { key: 'primeBrute', disabled: true,label: 'Prime brute', type: 'number', numberOptions: { min: 0 } },
    { key: 'primeCedee',disabled: true, label: 'Prime cédée', type: 'number', numberOptions: { min: 0 } },
    { key: 'primeAcceptee',disabled: true, label: 'Prime acceptée', type: 'number', numberOptions: { min: 0 } },

    { key: 'primeNette',disabled: true, label: 'Prime nette', type: 'number', numberOptions: { min: 0 } },
  
    // --- Taux et Taxes ---
    { section: 'Taux et Taxes' },
    { key: 'tauxCedante', disabled: true, label: 'Taux Cédante', type: 'number', numberOptions: { min: 0 } },
    { key: 'tauxAccepte',disabled: true, label: 'Taux Accepté', type: 'number', numberOptions: { min: 0 } },
   // { key: 'tauxCession', label: 'Taux Cession', type: 'number', numberOptions: { min: 0 } },
    { key: 'commissionFixe',disabled: true, label: 'Commission fixe', type: 'number', numberOptions: { min: 0 } },
    { key: 'tauxCommission',disabled: true, label: 'Taux commission', type: 'number', numberOptions: { min: 0 } },
   // { key: 'taxeSurPrime', disabled: true,label: 'Taxe sur prime', type: 'number', numberOptions: { min: 0 } },
   // { key: 'taxeSurCommission',disabled: true, label: 'Taxe sur commission', type: 'number', numberOptions: { min: 0 } },
  ]
  return allFields
})

// ==================== LOGIQUE FORMULAIRE ====================
const isEditing = computed(() => !!currentBordereau.value?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

// ✅ Fonction pour initialiser le formData
function initializeFormData(): BordereauFormData {
  if (!currentBordereau.value) {
    return {
      periodeDebut: currentQuittance?.dateEffet ?? 0,
      periodeFin: currentQuittance?.dateEcheance ?? 0,
      coursDevise: currentQuittance?.coursDevise ?? 0,
      primeBrute: currentQuittance?.primeBrute ?? 0,
      primeCedee: currentQuittance?.primeCedee ?? 0,
      primeNette: currentQuittance?.primeNette ?? 0,
      primeAcceptee: currentQuittance?.primeAcceptee ?? 0,
      tauxCedante: currentQuittance?.tauxCedante ?? 0,
      tauxAccepte: currentQuittance?.tauxAccepte ?? 0,
      //commissionFixe: currentQuittance?.commissionFixe ?? 0,
      tauxCommission: currentQuittance?.tauxCommission ?? 0,
      isManuel: true,
      isAnnule: false,
    } as unknown as BordereauFormData
  }

  // ✅ Cast en any pour accéder à devise/quittance temporairement
  const source = currentBordereau.value as any
  const data = { ...currentBordereau.value } as BordereauFormData

  if (source.devise) {
    data.deviseId = source.devise
  }
  if (source.quittance) {
    data.quittanceId = source.quittance
  }

  return data
}
const formData = ref<BordereauFormData>(initializeFormData())

// ✅ Watcher simplifié (sans deep pour éviter les boucles)
watch(
  () => currentBordereau.value?.id,
  () => {
    formData.value = initializeFormData()
  }
)

const errorMessage = ref<string | null>(null)

// ✅ Loading prend en compte create ET update
const loading = computed(
  () => createBordereau.isPending.value || updateBordereau.isPending.value
)

// ✅ Helper pour extraire l'ID
function extractId(value: any): number | undefined {
  if (value && typeof value === 'object' && value.id) {
    return value.id
  }
  return value
}

// ✅ Payload aligné sur l'interface Bordereau
function buildPayload(data: Record<string, any>) {
  return {
    numero: data.numero,
    dateReception: data.dateReception,
    periodeDebut: data.periodeDebut,
    periodeFin: data.periodeFin,

    // Devise
    deviseId: extractId(data.deviseId) ?? currentQuittance?.deviseId,
    coursDevise: data.coursDevise,

    // Primes
    primeBrute: data.primeBrute,
    primeNette: data.primeNette,
    primeCedee: data.primeCedee,
    primeAcceptee: data.primeAcceptee,

    // Taux et Taxes
    tauxCedante: data.tauxCedante,
    tauxAccepte: data.tauxAccepte,
    tauxCession: data.tauxCession,
    commissionFixe: data.commissionFixe,
    tauxCommission: data.tauxCommission,
    taxeSurPrime: data.taxeSurPrime,
    taxeSurCommission: data.taxeSurCommission,

    // Relations
    quittanceId: currentQuittance?.id,
    quittancePlacementId: null,

    // Flags
    isManuel: true,
    isAnnule: false,
    bordereauIdAnnule: null,
  }
}

const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.log('____________ BordereauForm.handleSubmit __________________')
  console.log('data: ', data)

  try {
    if (isEditing.value && currentBordereau.value?.id) {
      const resultat = await updateBordereau.mutateAsync({
        id: currentBordereau.value.id,
        data: buildPayload(data),
      })
      if (resultat) {
        bordereauStore.updateCurrentBordereau(resultat)
      }
      emit('success', 'Bordereau modifiée avec succès')
    } else {
      await createBordereau.mutateAsync(buildPayload(data) as any)
      emit('success', 'Bordereau créé avec succès')
    }
  } catch (err: any) {
    console.error('Erreur sauvegarde:', err)
    errorMessage.value =
      err?.response?.data?.message || err?.message || 'Une erreur est survenue lors de la sauvegarde.'
  }
}

const handleCancel = () => {
  errorMessage.value = null
  emit('cancel')
}
</script>

<template>
  <div class="flex flex-col">
    <TTitreSousModule libelle="Bordereau" />
    <div
      v-if="errorMessage"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
    >
      {{ errorMessage }}
    </div>
    <GenericCrudForm
      v-model="formData"
      :fields="bordereauFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :columns="4"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from,
.slide-fade-leave-to { transform: translateX(-20px); opacity: 0; }
</style>