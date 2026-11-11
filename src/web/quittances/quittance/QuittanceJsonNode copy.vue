<template>
  <JsonOrganigram :json-data="dependenciesData" />
</template>

<script setup lang="ts">
import JsonOrganigram from '@/composants/json-node/JsonOrganigram.vue'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'
import { computed } from 'vue'

const quittanceStore = useQuittanceStore()

const currentQuittance = computed(() => quittanceStore.currentQuittance)

/**
 * Filtre la quittance pour ne garder que les dépendances (objets/tableaux)
 * et les enrobe dans un nœud racine "Quittance"
 */
const dependenciesData = computed(() => {
  const q = currentQuittance.value
  if (!q) return null

  // Liste des clés qui représentent des dépendances (relations)
  // À adapter selon ton modèle réel
  const relationKeys = [
    // 'assurance',
    // 'police',
    // 'devise',
    // 'mouvement',

    'bordereau',
    'bordereaux',
    'compte',
    'comptes',
    'echeancePmd',
    'echeancesPmd',
    'sinistre',
    'sinistres',
    'quittancePlacements',
    'quittancePlacement',
    // 'prime',
    // 'primes',
    // 'commission',
    // 'commissions'
  ]

  // Construit l'objet racine avec uniquement les dépendances existantes
const root: any = {
  [`Quittance #${q.numero || q.id}`]: {} as any
}

  const quittanceNode = root[Object.keys(root)[0] as string]

  relationKeys.forEach(key => {
    const value = (q as any)[key]  // 👈 Cast en any
    //const value = q[key]
    if (value === undefined || value === null) return

    // Garde uniquement si c'est un objet non-null ou un tableau non-vide
    if (Array.isArray(value)) {
      if (value.length > 0) {
        quittanceNode[key] = value
      }
    } else if (typeof value === 'object') {
      quittanceNode[key] = value
    }
  })

  return root
})
</script>