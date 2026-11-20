import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Quittance } from './quittance'
import type { Acteur } from '@/services/acteurs/acteur/acteur'
import type { Campagne } from '@/services/referentiel/campagne/campagne'
import type { SousBranche } from '@/services/referentiel/sous-branche/sous-branche'
import type { NatureOffre } from '@/services/referentiel/nature-offre/nanture-offre'

// ✅ Type pour la Nature de l'offre
// export type NatureOffre = {
//   id: string | number
//   libelle: string
// }

export const useQuittanceStore = defineStore('quittanceStore', () => {
  // ==================== STATE QUITTANCE ====================
  const currentQuittance = ref<Quittance | null>(null)
  const selectedQuittances = ref<(string | number)[]>([])

  // ==================== FILTRES ====================
  const filtreCedante = ref<Acteur | null>(null)
  const filtreCourtier = ref<Acteur | null>(null)
  const filtreCampagne = ref<Campagne | null>(null)
  const filtreSousBranche = ref<SousBranche | null>(null)
  const filtreNatureOffre = ref<NatureOffre | null>(null) // ✅ NOUVEAU

  // ==================== GETTERS ====================
  const isSelected = computed(() => currentQuittance.value !== null)
  const currentQuittanceId = computed(() => currentQuittance.value?.id ?? null)

  const filtreCedanteId = computed(() => filtreCedante.value?.id ?? null)
  const filtreCourtierId = computed(() => filtreCourtier.value?.id ?? null)
  const filtreCampagneId = computed(() => filtreCampagne.value?.id ?? null)
  const filtreSousBrancheId = computed(() => filtreSousBranche.value?.id ?? null)
  const filtreNatureOffreId = computed(() => filtreNatureOffre.value?.id ?? null) // ✅ NOUVEAU

  // ==================== ACTIONS QUITTANCE ====================
  const clearSelection = () => {
    currentQuittance.value = null
    selectedQuittances.value = []
  }
  const setSelectedQuittances = (ids: (string | number)[]) => { selectedQuittances.value = ids }
  const selectQuittance = (quittance: Quittance | null) => { currentQuittance.value = quittance }
  const toggleAssureSelection = (id: string | number) => {
    const index = selectedQuittances.value.indexOf(id)
    if (index === -1) selectedQuittances.value.push(id)
    else selectedQuittances.value.splice(index, 1)
  }
  const updateCurrentQuittance = (data: Partial<Quittance>) => {
    if (currentQuittance.value) currentQuittance.value = { ...currentQuittance.value, ...data }
  }
  const removeIfCurrent = (id: number) => {
    if (currentQuittance.value?.id === id) currentQuittance.value = null
  }

  // ==================== ACTIONS FILTRES ====================
  const setFiltreCedante = (acteur: Acteur | null) => { filtreCedante.value = acteur; clearSelection() }
  const setFiltreCourtier = (acteur: Acteur | null) => { filtreCourtier.value = acteur ; clearSelection()}
  const setFiltreCampagne = (campagne: Campagne | null) => { filtreCampagne.value = campagne ; clearSelection()}
  const setFiltreSousBranche = (sb: SousBranche | null) => { filtreSousBranche.value = sb ; clearSelection()}
  const setFiltreNatureOffre = (nature: NatureOffre | null) => { filtreNatureOffre.value = nature ; clearSelection()} // ✅ NOUVEAU

  const resetFiltres = () => {
    filtreCedante.value = null
    filtreCourtier.value = null
    filtreCampagne.value = null
    filtreSousBranche.value = null
    filtreNatureOffre.value = null // ✅ NOUVEAU
  }

  return {
    currentQuittance, isSelected, currentQuittanceId, selectedQuittances,
    toggleAssureSelection, setSelectedQuittances, selectQuittance,
    clearSelection, updateCurrentQuittance, removeIfCurrent,
    filtreCedante, filtreCourtier, filtreCampagne, filtreSousBranche, filtreNatureOffre,
    filtreCedanteId, filtreCourtierId, filtreCampagneId, filtreSousBrancheId, filtreNatureOffreId,
    setFiltreCedante, setFiltreCourtier, setFiltreCampagne, setFiltreSousBranche, setFiltreNatureOffre,
    resetFiltres,
  }
})