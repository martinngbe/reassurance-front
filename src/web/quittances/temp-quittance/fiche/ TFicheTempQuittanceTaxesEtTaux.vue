<script setup lang="ts">
import type { FormField } from '@/composants/forms/generic-form/types-form';
import GenericDetailView from '@/composants/forms/genericDetail/GenericDetailView.vue';
import TSelectionnez from '@/composants/utilitaire/TSelectionnez.vue';
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store';
import { quittanceTauxEtTaxesFields } from '@/services/quittances/quittance/quittance';
import type { TempQuittance } from '@/services/quittances/temp-quittance/temp-quittance';
import { computed } from 'vue'

const tempPoliceStore = useTempPoliceStore()
const currentTempPolice = tempPoliceStore.currentTempPolice
const natureOffre = currentTempPolice?.natureOffre
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
const numberConfig = {
  decimals: 2,
  returnType: 'number' as const,
}
// Configuration des champs pour l'affichage
// const fields = computed<FormField[]>(() => [
//   { key: 'tauxCedante',     label: 'Taux Cédente',     type: 'number', size: '2xl', helpText: 'Taux Cédente à 100%', numberOptions: numberConfig },
//   { key: 'tauxAccepte',     label: 'Taux Accepté',     type: 'number', size: '2xl', helpText: 'Taux Accepté à 100%', numberOptions: numberConfig },
//   { key: 'taxeSurPrime',      label: 'Taxe sur prime',      type: 'number', size: '2xl', numberOptions: numberConfig },

// ])
// ✅ Helper pour créer un champ numérique rapidement
// const createNumberField = (key: string, label: string, helpText?: string): FormField => ({
//   key,
//   label,
//   type: 'number',
//   size: 'xl',
//   helpText: `${label} à 100%`,
//   numberOptions:  {
//     decimals: 2,
//     formatOptions: { style: 'decimal' },
//     returnType: 'number',
//     min: 0,        // 👈 Prix minimum = 0
//     max: 100, // 👈 Prix maximum
//   },
// })

// const tempQuittanceFields = computed<FormField[]>(() => {
//   // 1. Liste COMPLÈTE des champs (y compris conditionnels)
//   const allFields: FormField[] = [

//     { section: 'Taux et Taxes' },
//     createNumberField( 'tauxCedante', 'Taux Cédante'  ),
//     createNumberField( 'tauxAccepte', 'Taux Accepté'  ),
//     createNumberField( 'tauxCession', 'Taux Cession' ),
//     createNumberField( 'tauxRetention', 'Taux Retention' ),
//     createNumberField( 'tauxCommission', 'Taux commission' ),
//     createNumberField( 'taxeSurPrime', 'Taxe sur prime' ),
//     createNumberField( 'taxeSurCommission', 'Taxe sur commission' ),

//   ]

//   // 2. Champs à retirer selon l'état courant
//   // ✅ Utiliser policeQuittance.value (maintenant réactif)
//   // const isOffreProportionnelle = currentTempPolice.value
//   //   ? currentTempPolice.value.natureOffre?.isProportionnelle === true
//   //   : false
//   const isEdp =natureOffre?.isEdp   
//   const isFacultative =natureOffre?.isFacultative
//   const isFacObligatoire =natureOffre?.isFacObligatoire
//   const isQuotePart =natureOffre?.isQuotePart
//   const isXs =natureOffre?.isXs
//   const excludedKeys = new Set<string>()
//   if(isEdp){
//     excludedKeys.add( 'tauxCedante')
//     excludedKeys.add( 'tauxAccepte')
//     excludedKeys.add( 'tauxCession' )
//     excludedKeys.add( 'tauxRetention' )    
//     excludedKeys.add( 'tauxCommission' )
//     excludedKeys.add( 'taxeSurPrime' )
//     excludedKeys.add( 'taxeSurCommission' )

//   }else if(isFacObligatoire || isFacultative){
//    // excludedKeys.add( 'tauxCedante')
//     //excludedKeys.add( 'tauxAccepte')
//     excludedKeys.add( 'tauxCession' )
//     excludedKeys.add( 'tauxRetention' )    
//     excludedKeys.add( 'tauxCommission' )
//     excludedKeys.add( 'taxeSurPrime' )
//     excludedKeys.add( 'taxeSurCommission' )  
//   }
//    if(isQuotePart){
//     excludedKeys.add( 'tauxCedante')
//     excludedKeys.add( 'tauxAccepte')
//     //excludedKeys.add( 'tauxCession' )
//     //excludedKeys.add( 'tauxRetention' )    
//     excludedKeys.add( 'tauxCommission' )
//     excludedKeys.add( 'taxeSurPrime' )
//     excludedKeys.add( 'taxeSurCommission' )  
//   }
//   if(isXs){
//     excludedKeys.add( 'tauxCedante')
//     excludedKeys.add( 'tauxAccepte')
//     excludedKeys.add( 'tauxCession' )
//     excludedKeys.add( 'tauxRetention' )    
//     excludedKeys.add( 'tauxCommission' )
//     excludedKeys.add( 'taxeSurPrime' )
//     excludedKeys.add( 'taxeSurCommission' )  
//   }

//     // Le les champs  ont été rétirée
//   // donc on retourne un tableau vide
//   if(excludedKeys.size===7) return [] 
//   // 3. Application du filtre
//   if (excludedKeys.size === 0) return allFields

//   return allFields.filter(
//     (field) => !('key' in field) || !excludedKeys.has(field.key as string)
//   )
// })
const tempQuittanceFields = computed<FormField[]>(() =>
  quittanceTauxEtTaxesFields(natureOffre)
)


const isAucunTauxASaisir = computed(()=> tempQuittanceFields.value.length===0)

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
  <div  class="flex w-full  p-24 mt-24 h-full items-center justify-center"
    v-if="isAucunTauxASaisir">
          <TSelectionnez 
            message="Aucun taux à saisir pour cette offre"
          /> 
  </div>
  <GenericDetailView v-else
    :model-value="formattedQuittance"
    :fields="tempQuittanceFields"
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