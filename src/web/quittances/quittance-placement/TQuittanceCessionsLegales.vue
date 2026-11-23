<script setup lang="ts">
import TButton from '@/composants/forms/TButton.vue'
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import { useToast } from '@/composants/toast/useToast'
import { useQuittancePlacements } from '@/services/quittances/quittance-placement/useQuittancePlacement'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'
import { useCessionLegaleStore } from '@/services/referentiel/cession-legale/cession-legale.store'
import type { PaginationParams } from '@/type/pagination'
import CessionsLegales from '@/web/referentiel/cession-legale/CessionsLegales.vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
const { success,  warning } = useToast()
const emit = defineEmits<{ 
  (e: 'cession-legale-execute'): void
}>()
const quittanceStore = useQuittanceStore()
const cessionLegaleStore = useCessionLegaleStore()

const currentQuittance = computed(() => quittanceStore.currentQuittance)
const currentCessionLegale = computed(() => cessionLegaleStore.currentCessionLegale)
const params = computed<PaginationParams>(() => ({}))
const {createQuittanceCessionLegale} = useQuittancePlacements(null ,params )
// Visible seulement si LES DEUX valeurs sont présentes
const canShowButton = computed(
  () => !!currentQuittance.value && !!currentCessionLegale.value
)
//const isExecuteCessionLegale = ref(false)
const ajoutCessionLegale=async ()=>{
  if(!currentQuittance.value){
    warning('Vous devez selectionner une quittance svp ...')
    return
  }
  if(!currentCessionLegale.value){
    warning('Vous devez selectionner une cession légale svp ...')
    return
  }
  isPatientez.value=true
  const response = await createQuittanceCessionLegale.mutateAsync({
    quittanceId :currentQuittance.value.id,
    cessionLegaleId:  currentCessionLegale.value.id
  })
  console.warn(' _____  Exécution ajoutCessionLegale')
  console.log(' response:',response)
  success('Cession légale', 'OK')
  isPatientez.value=false
  emit('cession-legale-execute')
}
const isPatientez = ref(false)
let timeoutId: ReturnType<typeof setTimeout> | undefined

watch(
  [currentQuittance, currentCessionLegale],
  () => {
    // Chaque changement masque le bouton, puis le réaffiche après 300 ms
    isPatientez.value = true
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      isPatientez.value = false
    }, 300)
  },
  { flush: 'post' } // pas besoin de `immediate` : isPatientez vaut false au départ
)

onBeforeUnmount(() => {clearTimeout(timeoutId) ; cessionLegaleStore.clearSelection()})
</script>

<template>
  <TLayoutModule top-size="25%" :top-fixe="true" :show-left="false" :show-bottom="false">
    <template #header class="flex justify-center">

        <div class="flex justify-center w-full mt-4">
      
            <TButton v-if="canShowButton && !isPatientez" variant="soft" size="2xl" 
                    @click="ajoutCessionLegale" >
              <div class="flex flex-col justify-center mt-4 w-full cursor-pointer">
                 <p class="uppercase font-extrabold">{{ currentCessionLegale!.acteur.raisonSociale }}</p> 
                  <p class="lowercase text-xs italic">Ajouter comme cession légale</p>
               </div>
            </TButton>
         </div>   
     

    </template>

    <template #default>
      <!-- <TPatientez  v-if="isExecuteCessionLegale"/> -->
      <CessionsLegales :masquer-bouton-action="true" />
      
    </template>
  </TLayoutModule>
</template>