import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Quittance } from './quittance'
import type { Acteur } from '@/services/acteurs/acteur/acteur'
import type { Campagne } from '@/services/referentiel/campagne/campagne'
import type { SousBranche } from '@/services/referentiel/sous-branche/sous-branche'

export const useQuittanceStore = defineStore('quittanceStore', () => {
  // ==================== STATE QUITTANCE ====================
  const currentQuittance = ref<Quittance | null>(null)
  const selectedQuittances = ref<(string | number)[]>([])

  // ==================== FILTRES (objets complets pour l'affichage) ====================
  const filtreCedante = ref<Acteur | null>(null)
  const filtreCourtier = ref<Acteur | null>(null)
  const filtreCampagne = ref<Campagne | null>(null)
  const filtreSousBranche = ref<SousBranche | null>(null)

  // ==================== GETTERS ====================
  const isSelected = computed(() => currentQuittance.value !== null)
  const currentQuittanceId = computed(() => currentQuittance.value?.id ?? null)

  // ✅ IDs extraits des objets (pour l'API)
  const filtreCedanteId = computed(() => filtreCedante.value?.id ?? null)
  const filtreCourtierId = computed(() => filtreCourtier.value?.id ?? null)
  const filtreCampagneId = computed(() => filtreCampagne.value?.id ?? null)
  const filtreSousBrancheId = computed(() => filtreSousBranche.value?.id ?? null)

  // ==================== ACTIONS QUITTANCE ====================
  const clearSelection = () => {
    console.warn("__________ INITIALISATION QUITTANCE _____________")
    currentQuittance.value = null
    selectedQuittances.value = []
  }

  const setSelectedQuittances = (ids: (string | number)[]) => {
    selectedQuittances.value = ids
  }

  const selectQuittance = (quittance: Quittance | null) => {
    console.warn("__________ SELECTION QUITTANCE __________")
    currentQuittance.value = quittance
  }

  const toggleAssureSelection = (id: string | number) => {
    const index = selectedQuittances.value.indexOf(id)
    if (index === -1) {
      selectedQuittances.value.push(id)
    } else {
      selectedQuittances.value.splice(index, 1)
    }
  }

  const updateCurrentQuittance = (data: Partial<Quittance>) => {
    if (currentQuittance.value) {
      currentQuittance.value = { ...currentQuittance.value, ...data }
    }
  }

  const removeIfCurrent = (id: number) => {
    if (currentQuittance.value?.id === id) {
      currentQuittance.value = null
    }
  }

  // ==================== ACTIONS FILTRES ====================
  const setFiltreCedante = (acteur: Acteur | null) => {
    filtreCedante.value = acteur
  }

  const setFiltreCourtier = (acteur: Acteur | null) => {
    filtreCourtier.value = acteur
  }

  const setFiltreCampagne = (campagne: Campagne | null) => {
    filtreCampagne.value = campagne
  }

  const setFiltreSousBranche = (sb: SousBranche | null) => {
    filtreSousBranche.value = sb
  }

  const resetFiltres = () => {
    filtreCedante.value = null
    filtreCourtier.value = null
    filtreCampagne.value = null
    filtreSousBranche.value = null
  }

  return {
    // Quittance
    currentQuittance,
    isSelected,
    currentQuittanceId,
    selectedQuittances,
    toggleAssureSelection,
    setSelectedQuittances,
    selectQuittance,
    clearSelection,
    updateCurrentQuittance,
    removeIfCurrent,
    // Filtres (objets)
    filtreCedante,
    filtreCourtier,
    filtreCampagne,
    filtreSousBranche,
    // Filtres (IDs pour l'API)
    filtreCedanteId,
    filtreCourtierId,
    filtreCampagneId,
    filtreSousBrancheId,
    // Actions filtres
    setFiltreCedante,
    setFiltreCourtier,
    setFiltreCampagne,
    setFiltreSousBranche,
    resetFiltres,
  }
})