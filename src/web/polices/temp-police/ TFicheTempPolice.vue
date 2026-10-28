<script setup lang="ts">
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
import type { TempPolice } from '@/services/polices/temp-police/temp-police';
import { computed } from 'vue'

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

// Configuration des champs pour l'affichage
const fields = computed<FormField[]>(() => [
  // Section Informations générales
  {
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
  /*{
    key: 'isIard',
    label: 'Type de police',
    size:'xl',
    type: 'checkbox',
    helpText: 'Oui = IARD, Non = VIE',
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
    ...props.police,
    // Formater les relations pour l'affichage
    natureOffreId: props.police.natureOffre,
    sousBrancheId: props.police.sousBranche,
    acteurCedanteId: props.police.acteurCedante,
    acteurCourtierId: props.police.acteurCourtier,
    assureId: props.police.assure,
    // Formater le nombre de quittances
    quittances: `${props.police.quittances?.length || 0} quittance(s)`,
  }
})

// Statut de la police
const status = computed(() => {
  if (props.police.isCession) {
    return { label: 'Cédée', variant: 'info' as const }
  }
  if (props.police.isReconductionTacite) {
    return { label: 'Reconduction tacite', variant: 'warning' as const }
  }
  return { label: 'Active', variant: 'success' as const }
})

// Sous-titre
const subtitle = computed(() => {
  const type = props.police.isIard ? 'IARD' : 'VIE'
  return `Police ${type} • ${props.police.numero}`
})
</script>

<template>
  <GenericDetailView
    :model-value="formattedPolice"
    :fields="fields"
    :subtitle="subtitle"
    :status="status"
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