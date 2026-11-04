<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GenericCrudForm from '@/composants/forms/generic-form/GenericCrudForm.vue'
import type { FormField } from '@/composants/forms/generic-form/types-form'
import type { PaginationParams } from '@/type/pagination'
import { apiClient } from '@/api/api-client'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'
import { useQuittances } from '@/services/quittances/quittance/useQuittance'
import type { QuittanceFormData } from '@/services/quittances/quittance/quittance'

//////////////////////////////////////////////////////////////////
/////  FORMULAIRE DE MODIFICATION DE QUITTANCE UNIQUEMENT
//////////////////////////////////////////////////////////////////

const quittanceStore = useQuittanceStore()

// ✅ currentQuittance depuis le store (réactif)
const currentQuittance = computed(() => quittanceStore.currentQuittance)

// ✅ policeQuittance RÉACTIF (computed) - lié à la police de la quittance courante
const policeQuittance = computed(() => currentQuittance.value?.police ?? null)

// ✅ Instance useQuittances pour avoir accès à updateQuittance
const paramsQuittance = computed<PaginationParams>(() => ({}))
const { updateQuittance } = useQuittances(null, null, paramsQuittance)

const emit = defineEmits<{
  success: [message: string]
  cancel: []
}>()

console.log(' ================================== ')
console.log(' QuittanceForm.vue')
console.log(' ================================== ')

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
const quittanceFields = computed<FormField[]>(() => {
  // 1. Liste COMPLÈTE des champs (y compris conditionnels)
  const allFields: FormField[] = [
    { section: 'Dévise et Période de couverture' },
    {
      key: 'deviseId',
      label: 'Devise',
      type: 'async-select',
      required: true,
      placeholder: 'Sélectionner une devise ...',
      loadOptions: fetchDevise,
      autoSelectFirst: true,
      asyncOptions: { trackBy: 'id', labelBy: 'libelle' },
    },
    { key: 'coursDevise', label: 'Cours Devise', type: 'number', numberOptions: { min: 0 } },

    { section: "Période d'ouverture et émission" },
    { key: 'dateEffet', label: 'Date Effet', type: 'calendar' },
    { key: 'dateEcheance', label: 'Date Échéance', type: 'calendar' },

    { key: 'avisEcheance', label: 'Avis échéance', type: 'number', numberOptions: { min: 0 } },
    { key: 'nombreEcheancePmd', label: 'Nb. échéance PMD', type: 'number', numberOptions: { min: 0 } },
    {
      key: 'sinistreAuComptant',
      label: 'Sinistre au Comptant',
      type: 'number',
      numberOptions: { min: 0 },
      helpText: 'Montant min à payer sans attendre'
    },
    {
      key: 'avisSinistre',
      label: 'Avis sinistre',
      type: 'number',
      numberOptions: { min: 0 },
      helpText: 'Délais (jours) de notification du sinistre'
    },

    { section: 'Capitaux' },
    { key: 'capitaux', label: 'Capitaux', type: 'number', numberOptions: { min: 0 } },
    { key: 'lci', label: 'LCI', type: 'number', numberOptions: { min: 0 } },
    { key: 'smp', label: 'SMP', type: 'number', numberOptions: { min: 0 } },
    { key: 'limite', label: 'Limite', type: 'number', numberOptions: { min: 0 } },
    { key: 'retention', label: 'Retention', type: 'number', numberOptions: { min: 0 } },
    { key: 'conservation', label: 'Conservation', type: 'number', numberOptions: { min: 0 } },
    { key: 'capacite', label: 'Capacité', type: 'number', numberOptions: { min: 0 } },

    { section: 'Primes' },
    { key: 'primeBrute', label: 'Prime brute', type: 'number', numberOptions: { min: 0 } },
    { key: 'primeNette', label: 'Prime nette', type: 'number', numberOptions: { min: 0 } },
    { key: 'estimationPrime', label: 'Estimation prime', type: 'number', numberOptions: { min: 0 } },

    { section: 'Taux et Taxes' },
    { key: 'tauxCedante', label: 'Taux Cédante', type: 'number', numberOptions: { min: 0 } },
    { key: 'tauxAccepte', label: 'Taux Accepté', type: 'number', numberOptions: { min: 0 } },
    { key: 'tauxCession', label: 'Taux Cession', type: 'number', numberOptions: { min: 0 } },
    { key: 'tauxRetention', label: 'Taux Retention', type: 'number', numberOptions: { min: 0 } },
    { key: 'tauxCommission', label: 'Taux commission', type: 'number', numberOptions: { min: 0 } },
    { key: 'taxeSurPrime', label: 'Taxe sur prime', type: 'number', numberOptions: { min: 0 } },
    { key: 'taxeSurCommission', label: 'Taxe sur commission', type: 'number', numberOptions: { min: 0 } },

    { section: 'Autres' },
    { key: 'aliment', label: 'Aliment', type: 'number', numberOptions: { min: 0 } },
  ]

  // 2. Champs à retirer selon l'état courant
  // ✅ Utiliser policeQuittance.value (maintenant réactif)
  const isOffreProportionnelle = policeQuittance.value
    ? policeQuittance.value.natureOffre?.isProportionnelle === true
    : false

  const excludedKeys = new Set<string>()
  if (isOffreProportionnelle) {
    // OFFRE PROPORTIONNELLE : retirer les champs Non-Proportionnelle
    excludedKeys.add('limite')
    excludedKeys.add('retention')
    excludedKeys.add('conservation')
    excludedKeys.add('capacite')
    excludedKeys.add('estimationPrime')
    excludedKeys.add('nombreEcheancePmd')
    excludedKeys.add('tauxCession')
    excludedKeys.add('tauxRetention')
    excludedKeys.add('aliment')
  } else {
    // OFFRE NON PROPORTIONNELLE : retirer les champs Proportionnelle
    excludedKeys.add('capitaux')
    excludedKeys.add('lci')
    excludedKeys.add('smp')
    excludedKeys.add('primeBrute')
    excludedKeys.add('primeNette')
    excludedKeys.add('tauxCedante')
    excludedKeys.add('tauxAccepte')
    excludedKeys.add('taxeSurPrime')
  }

  // 3. Application du filtre
  if (excludedKeys.size === 0) return allFields

  return allFields.filter(
    (field) => !('key' in field) || !excludedKeys.has(field.key as string)
  )
})

// ==================== LOGIQUE FORMULAIRE ====================
const isEditing = computed(() => !!currentQuittance.value?.id)
const formMode = computed<'create' | 'edit'>(() => (isEditing.value ? 'edit' : 'create'))

// ✅ Fonction pour initialiser le formData avec le bon mapping
function initializeFormData(): QuittanceFormData {
  // ✅ CORRECTION : currentQuittance.value au lieu de currentPolice
  if (!currentQuittance.value) {
    return Object.fromEntries(
      quittanceFields.value
        .filter((f) => 'key' in f)
        .map((f) => [f.key, f.type === 'checkbox' ? true : ''])
    ) as unknown as QuittanceFormData
  }

  const data = { ...currentQuittance.value } as QuittanceFormData
  console.log('_____ QuittanceForm.initializeFormData _____ ')
  console.log('currentQuittance.value: ', currentQuittance.value)

  // ✅ Mapper les objets COMPLETS vers les clés attendues par le formulaire
  // Le composant TAsyncSelect a besoin de l'objet complet pour afficher le libellé
  if (data.mouvement) {
    data.mouvementId = data.mouvement // ✅ Objet complet, PAS juste l'ID
    delete data.mouvement
  }
  if (data.devise) {
    data.deviseId = data.devise // ✅ Objet complet, PAS juste l'ID
    delete data.devise
  }
  if (data.police) {
    data.policeId = data.police // ✅ Objet complet, PAS juste l'ID
    delete data.police
  }

  console.log('data: ', data)
  return data as QuittanceFormData
}

const formData = ref<QuittanceFormData>(initializeFormData())

// ✅ Watcher CORRIGÉ : () => currentQuittance.value (au lieu de () => currentQuittance)
watch(
  () => currentQuittance.value,
  (newQuittance) => {
    console.log('_____ QuittanceForm.watch.currentQuittance _____ ')
    console.log('newQuittance: ', newQuittance)
    if (newQuittance) {
      formData.value = initializeFormData()
    }
  },
  { deep: true }
)

const errorMessage = ref<string | null>(null)
const loading = computed(() => updateQuittance.isPending.value)

// ✅ Fonction helper pour extraire l'ID d'un objet ou retourner la valeur telle quelle
function extractId(value: any): number | undefined {
  if (value && typeof value === 'object' && value.id) {
    return value.id
  }
  return value
}

// ✅ Helper pour construire le payload commun (évite la duplication)
function buildPayload(data: Record<string, any>) {
  return {
    numero: data.numero,
    dateEffet: data.dateEffet,
    dateEcheance: data.dateEcheance,
    coursDevise: data.coursDevise,
    avisEcheance: data.avisEcheance,
    nombreEcheancePmd: data.nombreEcheancePmd,
    sinistreAuComptant: data.sinistreAuComptant,
    avisSinistre: data.avisSinistre,
    /////////////////////////////
    ////// Capitaux
    /////////////////////////////
    capitaux: data.capitaux,
    lci: data.lci,
    smp: data.smp,
    limite: data.limite,
    retention: data.retention,
    conservation: data.conservation,
    capacite: data.capacite,
    /////////////////////////////
    ////// Prime
    /////////////////////////////
    estimationPrime: data.estimationPrime,
    primeBrute: data.primeBrute,
    primeNette: data.primeNette,
    /////////////////////////////
    ////// Taux et Taxes
    /////////////////////////////
    tauxCession: data.tauxCession,
    tauxRetention: data.tauxRetention,
    tauxCedante: data.tauxCedante,
    tauxAccepte: data.tauxAccepte,
    tauxCommission: data.tauxCommission,
    taxeSurPrime: data.taxeSurPrime,
    taxeSurCommission: data.taxeSurCommission,
    /////////////////////////////
    ////// Autres
    /////////////////////////////
    aliment: data.aliment,
    ////// Relation
    mouvementId: extractId(data.mouvementId),
    policeId: extractId(data.policeId),
    deviseId: extractId(data.deviseId),
  }
}

const handleSubmit = async (data: Record<string, any>) => {
  errorMessage.value = null
  console.log('____________ QuittanceForm.handleSubmit __________________')
  console.log('data: ', data)

  /**
   * La création ou la mise à jour de Quittance entraîne automatiquement
   * sa sélection comme currentQuittance.
   * NB: La mise à jour recharge depuis le serveur et la
   * sélectionne comme currentQuittance.
   */
  try {
    if (isEditing.value && currentQuittance.value?.id) {
      const resultat = await updateQuittance.mutateAsync({
        id: currentQuittance.value.id,
        data: buildPayload(data),
      })

      // ✅ Mettre à jour le store avec les données fraîches du serveur
      if (resultat) {
        quittanceStore.updateCurrentQuittance(resultat)
      }

      emit('success', 'Quittance modifiée avec succès')
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

const dismissError = () => {
  errorMessage.value = null
}
</script>

<template>
  <div class="flex flex-col">
    <TTitreSousModule libelle="Quittance" />
    <div
      v-if="errorMessage"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
    >
      {{ errorMessage }}
    </div>
    <GenericCrudForm
      v-model="formData"
      :fields="quittanceFields"
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