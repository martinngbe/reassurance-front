<script setup lang="ts">
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
import { usePoliceStore } from '@/services/polices/police/police.store';
import type { TempPolice } from '@/services/polices/temp-police/temp-police';
import { computed } from 'vue'
/*
const props = defineProps<{
  police: TempPolice
  loading?: boolean
  showHeader?: boolean
  colums?: 1 | 2 | 3 | 4 | undefined
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  back: []
}>()
*/

const policeStore = usePoliceStore()
const currentPolice = computed(()=> policeStore.currentPolice)

const curentNatureOffre = computed(()=> currentPolice.value?.natureOffre)
// Configuration des champs pour l'affichage
const fields = computed<FormField[]>(() => [
  // Section Informations générales
 /* {
    section: 'Informations générales',
  },

  {
    key: 'isCession',
    label: 'Cession',
    size:'xl',
    type: 'checkbox',
  },
    {
    key: 'isIard',
    label: 'IARD',
    size:'xl',
    type: 'checkbox',
  },
  {
    key: 'isReconductionTacite',
    label: 'Reconduction tacite',
    size:'xl',
    type: 'checkbox',
  },
*/
  // Section Référentiels
  {
    section: 'Référentiels',
  },
  {
    key: 'natureOffreId',
    label: 'Nature de l\'offre',
    type: 'async-select',
    required: true,
    size:'xl',
    asyncOptions: {
      labelBy: 'libelle',
    },
  },
  {
    key: 'sousBrancheId',
    label: 'Sous-branche',
    type: 'async-select',
    required: true,
    size:'xl',
    asyncOptions: {
      labelBy: 'libelle',
    },
  },

  // Section Acteurs
  {
    section: 'Acteurs',
  },
  {
    key: 'acteurCedanteId',
    label: 'Cédante',
    type: 'async-select',
    required: true,
    size:'xl',
    asyncOptions: {
      labelBy: 'raisonSociale',
    },
  },
  {
    key: 'acteurCourtierId',
    label: 'Courtier',
    type: 'async-select',
    size:'xl',
    asyncOptions: {
      labelBy: 'raisonSociale',
    },
  },
  {
    key: 'assureId',
    label: 'Assuré',
    type: 'async-select',
    size:'xl',
    asyncOptions: {
      labelBy: 'raisonSociale',
    },
  },

])

// Données formatées pour l'affichage
const formattedPolice = computed(() => {
  return {
    ...currentPolice.value,
    // Formater les relations pour l'affichage
    natureOffreId: currentPolice.value?.natureOffre,
    sousBrancheId: currentPolice.value?.sousBranche,
    acteurCedanteId: currentPolice.value?.acteurCedante,
    acteurCourtierId: currentPolice.value?.acteurCourtier,
    assureId: currentPolice.value?.assure,
   
  }
})

// Statut de la police
const status = computed(() => {
  if (currentPolice.value?.isCession) {
    return { label: 'Cédée', variant: 'info' as const }
  }
  if (currentPolice.value?.isReconductionTacite) {
    return { label: 'Reconduction tacite', variant: 'warning' as const }
  }
  return { label: 'Active', variant: 'success' as const }
})

// Sous-titre
// const subtitle = computed(() => {
//   const type = currentPolice.value?.isIard ? 'IARD' : 'VIE'
//   return `Police ${type} • ${currentPolice.value?.numero}`
// })

</script>

<template>
  <GenericDetailView
    :model-value="formattedPolice"
    :fields="fields"
   
    :status="status"
    :show-header="true"
    :loading="false"
    :columns="3"
    title="Police"
    gap="md"
  
  />
</template>