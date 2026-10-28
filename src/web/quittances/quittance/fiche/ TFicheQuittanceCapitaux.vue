<script setup lang="ts">
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import type { TempQuittance } from '@/services/quittances/temp-quittance/temp-quittance';
import { computed } from 'vue'
/*
const props = defineProps<{
  quittance: TempQuittance
  loading?: boolean
  showHeader?:boolean
  colums?: 1 | 2 | 3 | 4 | undefined
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  back: []
}>()
*/
const policeStore = useTempPoliceStore()
const curentNatureOffre = computed(()=> policeStore.currentTempPolice?.natureOffre)

const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=> quittanceStore.currentQuittance)

// 1. Configuration commune pour les nombres (déclarée en dehors du computed pour optimiser les performances)
const baseNumberOptions = {
  decimals: 2,
  formatOptions: { style: 'decimal' as const },
  returnType: 'number' as const,
}

// 2. Tableau contenant uniquement les données uniques (la clé et le label)
const fieldsConfig = computed(()=>{
          const localFieldsConfig = [
            { key: 'capitaux', label: 'Capitaux' },
            { key: 'lci', label: 'LCI' },
            { key: 'smp', label: 'SMP' },
           
          ]
          // 2. On ajoute les champs conditionnels avec de simples 'if'
          if (curentNatureOffre.value && !curentNatureOffre.value.isProportionnelle) {
            // Offre Non proportionnelle
            localFieldsConfig.push(
               { key: 'capacite', label: 'Capacite' },
               { key: 'retention', label: 'Retention' },
            /*
              { key: 'limite', label: 'Limite' },              
              { key: 'conservation', label: 'Conservation' },
            */
            );
          }

          return localFieldsConfig
})

// 3. Génération dynamique de tes FormField
const fields = computed<FormField[]>(() => 
  fieldsConfig.value.map(({ key, label }) => ({
    key,
    label,
    type: 'number',
    size: '2xl',
    helpText: `${label} à 100%`,
    numberOptions: baseNumberOptions,
  }))
)
// Données formatées pour l'affichage
const formattedQuittance = computed(() => {
  return {
    ...currentQuittance.value,
    // Formater les relations pour l'affichage
    //deviseId: currentQuittance.value.devise,
  }
})

</script>

<template>
  <GenericDetailView
    :model-value="formattedQuittance"
    :fields="fields"
    
    :loading="false"
    :columns="3"
    title="Capitaux"
    :show-header="true"
    gap="md"
   
    
  />
</template>