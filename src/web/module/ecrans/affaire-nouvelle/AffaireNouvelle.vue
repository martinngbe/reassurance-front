<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreModule from '@/composants/utilitaire/TTitreModule.vue'
import { defineAsyncComponent, computed, ref, watch } from 'vue'
import TLigneHorizontale from '@/composants/utilitaire/TLigneHorizontale.vue'
import { useAssureStore } from '@/services/acteurs/assure/assure.store.ts'
import AffaireNouvelleEtapes from './AffaireNouvelleEtapes.vue'
import { useEcransStore } from '@/services/ecrans/ecrans.store.ts'
import EnConstruction from '@/web/EnConstruction.vue'
import TAlert from '@/composants/display/TAlert.vue'
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store.ts'
import TempPolices from '@/web/polices/temp-police/TempPolices.vue'
import TModal from '@/composants/display/TModal.vue'
import { useMouvementStore } from '@/services/referentiel/mouvement/mouvement.store.ts'
import { useMouvements } from '@/services/referentiel/mouvement/useMouvement.ts'
import { MOUVEMENT_AFN } from '@/services/common/constantes.ts'

const assureStore = useAssureStore()
const assureEnCours = computed(() => assureStore.currentAssure)
const showTopHeader = computed(()=>  assureStore.currentAssure? true : false)
// ✅ 1. Définir l'ordre des étapes
const etapesOrdre = [
  'historiqueSaisie',
  'tempPolice',
  'emission',
  'capitaux',
  'primes',
  'tauxEtTaxes',
  'courtage',
  'recapitulation',
] as const

type EtapeId = typeof etapesOrdre[number]

// ✅ 2. VALEUR INITIALE OBLIGATOIRE → jamais undefined
const activeMenu = ref<EtapeId>('historiqueSaisie')

// ✅ 3. Navigation
function goToNextStep() {
  const currentIndex = etapesOrdre.indexOf(activeMenu.value)
  if (currentIndex === -1 || currentIndex === etapesOrdre.length - 1) return
  activeMenu.value = etapesOrdre[currentIndex + 1] as EtapeId
}

function selectMenu(menuId: string) {
  if (etapesOrdre.includes(menuId as EtapeId)) {
    activeMenu.value = menuId as EtapeId
  }
}

function onStepSuccess(message: string) {
  console.log(`✅ Étape validée : ${message}`)
  goToNextStep()
}

function onStepCancel() {
  console.log('❌ Annulation')
}

// ✅ 4. Record strictement typé
const moduleComponents: Record<EtapeId, any> = {
  historiqueSaisie: defineAsyncComponent(() => import('@/web/polices/temp-police/TempPoliceHistoriques.vue')),
  tempPolice: defineAsyncComponent(() => import('@/web/polices/temp-police/TempPoliceForm.vue')),
  emission: defineAsyncComponent(() => import('@/web/quittances/temp-quittance/TempQuittanceEmissionForm.vue')),
  capitaux: defineAsyncComponent(() => import('@/web/quittances/temp-quittance/TempQuittanceCapitauxForm.vue')),
  primes: defineAsyncComponent(() => import('@/web/quittances/temp-quittance/TempQuittancePrimesForm.vue')),
  tauxEtTaxes: defineAsyncComponent(() => import('@/web/quittances/temp-quittance/TempQuittanceTaxesEtTauxForm.vue')),
  courtage: defineAsyncComponent(() => import('@/web/quittances/temp-quittance/TempQuittanceCourtageForm.vue')),
  recapitulation: defineAsyncComponent(() => import('@/web/module/ecrans/affaire-nouvelle/Recapitulation.vue')),
}

const tempPoliceStore = useTempPoliceStore()
const ecransStore = useEcransStore()
const mouvementsStore = useMouvementStore()
const  {getMouvementByCode} = useMouvements()
const currenteModuleDisplay = computed(() => ecransStore.currentModule)
const currentEcran = computed(() => ecransStore.currentEcran)
const natureOffre = computed(()=>tempPoliceStore.currentTempPolice?.natureOffre)

// ✅ 5. Fallback garanti → jamais undefined
const currentModule = computed(() => moduleComponents[activeMenu.value] ?? EnConstruction)

// lecture du mouvement AFN
const afn = ref(MOUVEMENT_AFN);
const { data: mouvement } = getMouvementByCode(afn);

// ✅ SOLUTION : Utiliser watch pour attendre le chargement asynchrone
watch(mouvement  , (newData ) => {
   
  if (newData) {
    console.log(">>>>>> AffaireNouvelle.vue mouvement newData:", newData);
    // Note : Selon la configuration de votre intercepteur Axios, 
    // le mouvement réel se trouve soit dans newData.data, soit directement dans newData.
    // D'après votre screenshot, la réponse est {success: true, data: {...}}.
    // Si votre intercepteur fait "return response.data", alors le mouvement est dans newData.data.
    //const mouvementAStocker = newData.data ?? newData; 
    
    const mouvementAStocker = newData?? null; 
   
    
    console.log(">>>>>> AffaireNouvelle.vue mouvement chargé:", mouvementAStocker);
    mouvementsStore.selectMouvement(mouvementAStocker);
  }
}, { immediate: true }); 

</script>

<template>
  <TLayoutModule 
      topSize="80px" 
      leftSize="20%" 
      bottom-size="85px"
      :show-top="showTopHeader"
      >
    <template #header>
      <div class="flex flex-col p-1">
        <TTitreModule :libelle="assureEnCours?.raisonSociale ?? 'AFFAIRE NOUVELLE'" />
        <TLigneHorizontale />
      </div>
    </template>

    <template #left>
      <!-- ✅ 6. Passer activeMenu en prop -->
      <AffaireNouvelleEtapes        
        :active-menu="activeMenu"
        @select="selectMenu"
      />
    </template>

    <template #default>
      <keep-alive class="ml-5">
        <component
          :is="currentModule"
          :key="activeMenu"
          @success="onStepSuccess"
          @cancel="onStepCancel"
        />
      </keep-alive>
    </template>

    <template #footer >
      
      <div  class="flex w-full mt-2  items-center justify-center">                 
                  <TAlert variant="info">
                       <div class="flex flex-col">
                            <p  v-if="natureOffre" class="text-lg font-bold">{{ natureOffre.libelle }}</p>
                            <p class="text-md font-bold">{{ currenteModuleDisplay +' / '+ currentEcran }}</p> 
                       </div>
                  </TAlert> 
      </div>
    </template>

  </TLayoutModule>


</template>