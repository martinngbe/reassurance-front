<script setup lang="ts">
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import { computed } from 'vue'

const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=> quittanceStore.currentQuittance)

const numberConfig = {
  decimals: 2,
  returnType: 'number' as const,
}
// Configuration des champs pour l'affichage
const fields = computed<FormField[]>(() => [
  { key: 'tauxCedante',     label: 'Taux Cédente',     type: 'number', size: '2xl', helpText: 'Taux Cédente à 100%', numberOptions: numberConfig },
  { key: 'tauxAccepte',     label: 'Taux Accepté',     type: 'number', size: '2xl', helpText: 'Taux Accepté à 100%', numberOptions: numberConfig },
  { key: 'taxeSurPrime',    label: 'Taxe sur prime',      type: 'number', size: '2xl', numberOptions: numberConfig },

])

// Données formatées pour l'affichage
const formattedQuittance = computed(() => {
  return {
    ...currentQuittance.value,
    // Formater les relations pour l'affichage
    //deviseId: currentQuittance.devise,
  }
})
console.log("_______ formattedQuittance :",formattedQuittance.value)

</script>

<template>
  <GenericDetailView
    :model-value="formattedQuittance"
    :fields="fields"
    :show-header="true"
    :loading="false"
    :columns="3"
    title="Taux et Taxes"
    gap="md"
   
  />
</template>