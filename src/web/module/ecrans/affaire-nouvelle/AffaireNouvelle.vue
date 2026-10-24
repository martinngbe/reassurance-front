<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreModule from '@/composants/utilitaire/TTitreModule.vue'
import { defineAsyncComponent, computed, ref } from 'vue'
import TLigneHorizontale from '@/composants/utilitaire/TLigneHorizontale.vue'
import { useAssureStore } from '@/services/acteurs/assure/assure.store.ts'
import AffaireNouvelleEtapes from './AffaireNouvelleEtapes.vue'
import { useEcransStore } from '@/services/ecrans/ecrans.store.ts'
import EnConstruction from '@/web/EnConstruction.vue'
import TAlert from '@/composants/display/TAlert.vue'
import { useTempPoliceStore } from '@/services/temp-police/temp-police.store.ts'
import TempPolices from '@/web/police/TempPolices.vue'
import TModal from '@/composants/display/TModal.vue'

const assureStore = useAssureStore()
const assureEnCours = computed(() => assureStore.currentAssure)

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
  historiqueSaisie: defineAsyncComponent(() => import('@/web/police/TempPoliceHistoriques.vue')),
  tempPolice: defineAsyncComponent(() => import('@/web/module/ecrans/affaire-nouvelle/TempPoliceForm.vue')),
  emission: defineAsyncComponent(() => import('@/web/module/ecrans/affaire-nouvelle/TempQuittanceEmissionForm.vue')),
  capitaux: defineAsyncComponent(() => import('@/web/module/ecrans/affaire-nouvelle/TempQuittanceCapitauxForm.vue')),
  primes: defineAsyncComponent(() => import('@/web/module/ecrans/affaire-nouvelle/TempQuittancePrimesForm.vue')),
  tauxEtTaxes: defineAsyncComponent(() => import('@/web/module/ecrans/affaire-nouvelle/TempQuittancePrimeTaxeEtTauxForm.vue')),
  courtage: defineAsyncComponent(() => import('@/web/EnConstruction.vue')),
  recapitulation: defineAsyncComponent(() => import('@/web/EnConstruction.vue')),
}

const tempPoliceStore = useTempPoliceStore()
const ecransStore = useEcransStore()
const currenteModuleDisplay = computed(() => ecransStore.currenteModule)
const currenteFormeEcran = computed(() => ecransStore.currenteFormeEcran)
const currentTempPilice = computed(() =>tempPoliceStore.currentTempPolice)
const titleHistoriqueSaisie= computed(() =>currentTempPilice.value? 
'Historique des saisies N°Temp Police:'+currentTempPilice.value.id :
'Historique des saisies '
)
// ✅ 5. Fallback garanti → jamais undefined
const currentModule = computed(() => moduleComponents[activeMenu.value] ?? EnConstruction)
const showModal = ref(false)
const onAfficheHistoriqueTempPolice =()=>{
   console.log(" -- const onAfficheHistoriqueTempPolice -- ")
  showModal.value=true
}
</script>

<template>
  <TLayoutModule 
      topSize="80px" 
      leftSize="30%" 
      bottom-size="8%"
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
      <div class="flex gap-1 justify-between items-center ">      
        <TAlert  
          variant="primary" :title="titleHistoriqueSaisie" 
          class="cursor-pointer"
          @click ="onAfficheHistoriqueTempPolice"
          />  
        <TAlert  variant="info" :title="currenteModuleDisplay +' / '+ currenteFormeEcran"/>
      </div>
    </template>
  </TLayoutModule>
  <TModal v-model="showModal" width="45%" title="Historique saisie tempPolice" >
    <TempPolices :masque-affaire-nouvelle="true"/>
  </TModal>
</template>