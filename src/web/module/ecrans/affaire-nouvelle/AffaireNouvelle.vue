<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreModule from '@/composants/utilitaire/TTitreModule.vue';
import { defineAsyncComponent, computed, ref } from 'vue';
import TLigneHorizontale from '@/composants/utilitaire/TLigneHorizontale.vue';
import EtapesAffaireNouvelle from './EtapesAffaireNouvelle.vue';
import { useAssureStore } from '@/services/acteurs/assure/assure.store.ts';

const assureStore = useAssureStore()
const assureEnCours = computed(() => assureStore.currentAssure)

const activeMenu = ref('tempPolice')
// Chargement dynamique des modules
const moduleComponents: Record<string, any> = {
  tempPolice: defineAsyncComponent(() => import('@/web/module/ecrans/affaire-nouvelle/TempPoliceForm.vue')),
  emission: defineAsyncComponent(() => import('@//web/referentiel/role/TRole.vue')),
  capitauxPrimes: defineAsyncComponent(() => import('@//web/referentiel/utilisateur/TUtilisateur.vue')),
  courtage: defineAsyncComponent(() => import('@//web/referentiel/branche/TBranche.vue')),
  recapitulation: defineAsyncComponent(() => import('@//web/referentiel/region/TRegion.vue')),
  
}

const currentModule = computed(() => moduleComponents[activeMenu.value] || moduleComponents.accueil)

function selectMenu(menuId: string) {
  activeMenu.value = menuId
}
</script>

<template>
  <TLayoutModule
    topSize="100px"
    :topFixe="true"
    leftSize="300px"
    :showBottom=false
    >
   <template #header >
        <div class="flex flex-col  p-1">
          <TTitreModule :libelle="assureEnCours?.raisonSociale?? 'AFFAIRE NOUVELLE' "/>
          <div v-if="assureEnCours" class="flex">
                <div class="w-48 flex">
                  <span class="w-10">N°</span> 
                  <span class="text-md font-bold">{{ assureEnCours.numero }} </span></div>
                <div >
                  <span class="w-2">Activité</span>
                  <span class="text-md font-bold">{{ assureEnCours.domaineActivite?.libelle }}</span>
                </div>
          </div>
          <TLigneHorizontale/>
        </div>    
    </template>

   <template #left>
      <EtapesAffaireNouvelle @select="selectMenu"/>
    </template>
   
    <template #default>
    
              <keep-alive class="ml-20">
                  <component :is="currentModule"  />
              </keep-alive> 
     
    </template>

  </TLayoutModule>
</template>