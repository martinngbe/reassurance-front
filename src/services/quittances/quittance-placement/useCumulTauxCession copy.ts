// src/services/quittances/quittance-placement/useCumulTauxCession.ts
import { ref, computed, watch, type Ref } from 'vue'
import { apiClient } from '@/api/api-client'

interface CumulTauxResponse {
  quittanceId: number
  tauxAccepte: string
  cumulTauxCession: string
  tauxDisponible: string
  nombrePlacementsActifs: number
}

/**
 * Composable qui récupère et calcule le cumul des taux de cession
 * via un endpoint dédié (plus performant que de charger toute la quittance)
 */
export function useCumulTauxCession(quittanceId: Ref<number | null | undefined>) {
  const data = ref<CumulTauxResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ── Fetch des données ────────────────────────────────────
  async function fetchCumulTaux() {
    if (!quittanceId.value) {
      data.value = null
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await apiClient.get<CumulTauxResponse>(
        `/quittance-placement/cumul-taux/${quittanceId.value}`,
      )
      data.value = response.data
    } catch (err: any) {
      console.error('Erreur lors du chargement du cumul des taux :', err)
      error.value = err?.response?.data?.message || 'Erreur lors du chargement'
    } finally {
      isLoading.value = false
    }
  }

  // ── Computed helpers ─────────────────────────────────────
  const tauxAccepte = computed<number>(
    () => (data.value ? parseFloat(data.value.tauxAccepte) : 0),
  )

  const cumulTauxCession = computed<number>(
    () => (data.value ? parseFloat(data.value.cumulTauxCession) : 0),
  )

  const tauxDisponible = computed<number>(
    () => (data.value ? parseFloat(data.value.tauxDisponible) : 0),
  )

  const nombrePlacementsActifs = computed<number>(
    () => (data.value ? data.value.nombrePlacementsActifs : 0),
  )

  const isCumulDepasse = computed<boolean>(
    () => cumulTauxCession.value > tauxAccepte.value,
  )

  /**
   * Vérifie si l'ajout d'un nouveau taux ferait dépasser le taux accepté
   */
  function verifierDepassement(tauxSaisi: number | null | undefined): {
    depasse: boolean
    nouveauCumul: number
    depassement: number
  } {
    const taux = Number(tauxSaisi) || 0
    const nouveauCumul = cumulTauxCession.value + taux
    const depassement = nouveauCumul - tauxAccepte.value

    return {
      depasse: nouveauCumul > tauxAccepte.value,
      nouveauCumul,
      depassement: depassement > 0 ? depassement : 0,
    }
  }

  // ── Auto-fetch quand quittanceId change ──────────────────
  watch(
    quittanceId,
    (newId) => {
      if (newId) {
        fetchCumulTaux()
      } else {
        data.value = null
      }
    },
    { immediate: true },
  )

  return {
    data,
    isLoading,
    error,
    tauxAccepte,
    cumulTauxCession,
    tauxDisponible,
    nombrePlacementsActifs,
    isCumulDepasse,
    verifierDepassement,
    fetchCumulTaux, // ← pour refresh manuel après create/update/delete
  }
}