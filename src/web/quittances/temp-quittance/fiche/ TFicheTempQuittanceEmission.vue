<script setup lang="ts">
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store';
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
const tempPoliceStore = useTempPoliceStore()
const curentNatureOffre = computed(()=> tempPoliceStore.currentTempPolice?.natureOffre)

const fields = computed(()=>{
     // la liste des champs par défaut et par aordre
        const localFields : FormField[]= [
                      // Section Informations générales
                      { section: 'Dévise et Période de couverture' },
                      {
                        key: 'deviseId',
                        label: 'Devise',
                        type: 'async-select',
                        required: true,
                        size:'xl',
                        asyncOptions: {
                          labelBy: 'libelle'
                        }
                      },
                      { key: 'coursDevise',           label: 'Cours devise',      type: 'number' , size:'xl',  required: true,},
                      { key: 'dateEffet',             label: 'Date Effet',        type: 'calendar', size:'xl'},  
                      { key: 'dateEcheance',          label: 'Date Echéance',     type: 'calendar', size:'xl' },
                      { section: 'Autres informations' },
                      { key: 'avisEcheance',          label: 'Avis Echéance',     type: 'number', size:'xl' , helpText:"Délais (jours) de notification avant échéance"},  
              
        ]
          // 2. On ajoute les champs conditionnels avec de simples 'if'
        if (curentNatureOffre.value && !curentNatureOffre.value.isProportionnelle) {
          // Offre Non proportionnelle
          localFields.push(
            { key: 'nombreEcheancePmd', label: 'Nb.échéance PMD', type: 'number' },
          );
        }


      // 3. On finit par les champs toujours présents
      localFields.push(
        { key: 'sinistreAuComptant', label: 'Sinistre au Comptant', type: 'number', helpText: 'Montant min à payer sans attendre' }, 
        { key: 'avisSinistre', label: 'Avis sinistre', type: 'number', helpText: 'Délais (jours) de notification du sinistre' }
      );

      // 4. On retourne le résultat
      return localFields;

}) ////const fields = computed(()=>{
    

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