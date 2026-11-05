<!-- TEcheancePmdForm.vue -->
<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FormField } from '@/composants/forms/generic-form/types-form'
import { apiClient } from '@/api/api-client'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'
import { useEcheancesPmd } from '@/services/flux-financiers/echeance-pmd/useEcheancesPmd'
import type { EcheancePmd, EcheancePmdFormData } from '@/services/flux-financiers/echeance-pmd/echeance-pmd'
import { useEcheancePmdStore } from '@/services/flux-financiers/echeance-pmd/echeance-pmd.store'
import { formatNumber } from '@/utilitaire/number'

const quittanceStore = useQuittanceStore()
// ✅ Rendre currentQuittance réactif
const currentQuittance = computed(() => quittanceStore.currentQuittance)
const bordereauStore = useEcheancePmdStore()

const currentEcheancePmd = computed(() => bordereauStore.currentEcheancePmd)
const { createEcheancePmd, updateEcheancePmd } = useEcheancesPmd({})

const props = defineProps<{
  echeancePmdToEdit?: EcheancePmd | null
}>()

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

// ==================== FETCH EXISTING ECHEANCES ====================
const existingEcheances = ref<any[]>([])

async function loadExistingEcheances() {
  // ✅ Utiliser .value pour accéder à la valeur réactive
  if (!currentQuittance.value?.id) return
  try {
    const res = await apiClient.get('/echeance-pmd', {
      params: { quittanceId: currentQuittance.value.id, limit: 1000 }
    })
    existingEcheances.value = res.data.items || res.data.data || []
  } catch (e) {
    console.error('Erreur chargement échéances', e)
  }
}

onMounted(() => {
  loadExistingEcheances()
})

// ==================== CONFIGURATION DES CHAMPS ====================
const bordereauFields = computed<FormField[]>(() => [
  { key: 'numeroTranche', label: 'N° Tranche', type: 'text', required: true },
  { key: 'periode', label: 'Période', type: 'text' },
  { key: 'dateEcheance', label: 'Date Échéance', type: 'calendar', required: true },
  { key: 'prime', label: 'Prime brute', type: 'number', numberOptions: { min: 0, step: 0.01 } },
])

// ==================== LOGIQUE FORMULAIRE ====================
// ✅ Vérifier l'ID pour détecter correctement le mode édition
const isEditing = computed(() => !!props.echeancePmdToEdit?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

function initializeFormData(): EcheancePmdFormData {
  if (!props.echeancePmdToEdit?.id) {
    return {
      // ✅ Utiliser .value pour accéder à la valeur réactive
      deviseId: currentQuittance.value?.deviseId,
      coursDevise: currentQuittance.value?.coursDevise ?? 0,
    } as unknown as EcheancePmdFormData
  }

  const source = props.echeancePmdToEdit as any
  const data = { ...props.echeancePmdToEdit } as EcheancePmdFormData
  if (source.quittance) data.quittanceId = source.quittance
  return data
}

const formData = ref<EcheancePmdFormData>(initializeFormData())

// ✅ Watcher avec immediate pour initialiser au montage
watch(
  () => props.echeancePmdToEdit?.id,
  () => {
    formData.value = initializeFormData()
  },
  { immediate: true }
)

const errorMessage = ref<string | null>(null)
const loading = computed(() => createEcheancePmd.isPending.value || updateEcheancePmd.isPending.value)

// ==================== VALIDATION DES LIMITES (FRONTEND) ====================
const maxEcheances = computed(() => (currentQuittance.value as any)?.nombreEcheancePmd ?? 0)
const maxPrime = computed(() => Number((currentQuittance.value as any)?.estimationPrime ?? 0))

const usedEcheances = computed(() => {
  if (isEditing.value && props.echeancePmdToEdit?.id) {
    return existingEcheances.value.filter(e => e.id !== props.echeancePmdToEdit!.id).length + 1
  }
  return existingEcheances.value.length + 1
})

const usedPrime = computed(() => {
  let sum = 0
  for (const e of existingEcheances.value) {
    if (isEditing.value && e.id === props.echeancePmdToEdit?.id) continue
    sum += Number(e.prime || 0)
  }
  sum += Number(formData.value.prime || 0)
  return sum
})

const isCountExceeded = computed(() => usedEcheances.value > maxEcheances.value)
const isPrimeExceeded = computed(() => usedPrime.value > maxPrime.value)
const isFormInvalid = computed(() => isCountExceeded.value || isPrimeExceeded.value)

// ==================== PAYLOAD & SUBMIT ====================
function buildPayload(data: Record<string, any>) {
  return {
    // ✅ Utiliser .value pour accéder à la valeur réactive
    deviseId: currentQuittance.value?.deviseId,
    coursDevise: currentQuittance.value?.coursDevise,
    numeroTranche: data.numeroTranche,
    periode: data.periode,
    dateEcheance: data.dateEcheance,
    prime: data.prime,
    quittanceId: currentQuittance.value?.id,
    quittancePlacementId: null,
  }
}

const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null

  if (isFormInvalid.value) {
    errorMessage.value = 'Les limites de la quittance sont dépassées. Veuillez vérifier le nombre d\'échéances et le cumul des primes.'
    return
  }

  try {
    if (isEditing.value && props.echeancePmdToEdit?.id) {
      const resultat = await updateEcheancePmd.mutateAsync({
        id: props.echeancePmdToEdit.id,
        data: buildPayload(data),
      })
      if (resultat) bordereauStore.updateCurrentEcheancePmd(resultat)
      emit('success', 'Échéance PMD modifiée avec succès')
    } else {
      await createEcheancePmd.mutateAsync(buildPayload(data) as any)
      emit('success', 'Échéance PMD créée avec succès')
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
</script>

<template>
  <div class="flex flex-col">
    <TTitreSousModule libelle="EcheancePmd" />
    
    <!-- ✅ Affichage des limites et alertes visuelles -->
    <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="rounded-lg border p-3 transition-colors" 
           :class="isCountExceeded ? 'border-red-500 bg-red-50 dark:border-red-900 dark:bg-red-950' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'">
        <div class="text-sm text-gray-600 dark:text-gray-400">Échéances (Max: {{ maxEcheances }})</div>
        <div class="text-lg font-bold" :class="isCountExceeded ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-gray-100'">
          {{ usedEcheances }} / {{ maxEcheances }}
        </div>
      </div>
      <div class="rounded-lg border p-3 transition-colors" 
           :class="isPrimeExceeded ? 'border-red-500 bg-red-50 dark:border-red-900 dark:bg-red-950' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'">
        <div class="text-sm text-gray-600 dark:text-gray-400">Cumul des Primes (Max: {{ formatNumber( maxPrime.toFixed(2)) }})</div>
        <div class="text-lg font-bold" :class="isPrimeExceeded ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-gray-100'">
          {{ formatNumber(usedPrime.toFixed(2)) }} / {{ formatNumber( maxPrime.toFixed(2)) }}
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {{ errorMessage }}
    </div>
    
    <div v-if="isFormInvalid && !errorMessage" class="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300">
      <ul class="list-disc pl-5">
        <li v-if="isCountExceeded">Le nombre d'échéances dépasse la limite autorisée.</li>
        <li v-if="isPrimeExceeded">Le cumul des primes dépasse l'estimation de prime de la quittance.</li>
      </ul>
    </div>

    <GenericCrudForm
      v-model="formData"
      :fields="bordereauFields"
      :mode="formMode"
      :show-delete="false"
      :loading="loading"
      :columns="1"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      :disabled="isFormInvalid"
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