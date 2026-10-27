<script setup lang="ts">
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
import type { TempQuittance } from '@/services/quittances/temp-quittance/temp-quittance';
import { computed } from 'vue'

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

// Configuration des champs pour l'affichage
const fields = computed<FormField[]>(() => [
///////////////////////////// 
////// Capitaux 
/////////////////////////////
  { key: 'capitaux',     label: 'Capitaux',     type: 'number' , size:'2xl', helpText:"Capitaux à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
  { key: 'lci',          label: 'LCI',          type: 'number', size:'2xl' , helpText:"LCI à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
  { key: 'smp',          label: 'SMP',          type: 'number' , size:'2xl', helpText:"SMP à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
  { key: 'limite',       label: 'Limite',       type: 'number' , size:'2xl', helpText:"Limite à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
  { key: 'retention',    label: 'Retention',    type: 'number' , size:'2xl', helpText:"Retention à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
  { key: 'conservation', label: 'Conservation', type: 'number' , size:'2xl', helpText:"Conservation à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
  { key: 'capacite',     label: 'Capacite',     type: 'number' , size:'2xl', helpText:"Capacite à 100%",
        numberOptions: {
          decimals: 2,
          formatOptions: { style: 'decimal' },
          returnType: 'number',
        }
  }, 
])

// Données formatées pour l'affichage
const formattedQuittance = computed(() => {
  return {
    ...props.quittance,
    // Formater les relations pour l'affichage
    deviseId: props.quittance.devise,
  }
})

</script>

<template>
  <GenericDetailView
    :model-value="formattedQuittance"
    :fields="fields"
    :show-header="props.showHeader"
    :loading="loading"
    :columns="props.colums?? 2"
    gap="md"
    :show-edit="true"
    :show-delete="true"
    :show-back="true"
    @edit="emit('edit')"
    @delete="emit('delete')"
    @back="emit('back')"
  />
</template>