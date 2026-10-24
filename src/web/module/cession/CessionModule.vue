<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreModule from '@/composants/utilitaire/TTitreModule.vue';
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';
import MenuCession from './MenuCession.vue';
import { FORME_ECRAN_TABLEAU_DE_BORD, useEcransStore } from '@/services/ecrans/ecrans.store.ts';


// Chargement dynamique des modules
const moduleComponents: Record<string, any> = {
  ecranTableauDeBord: defineAsyncComponent(() => import('@/web/module/ecrans/tableau-de-bord/EcranTableauDeBord.vue')),
  ecranFacultative: defineAsyncComponent(() => import('@/web/module/ecrans/facultative/EcranFacultative.vue')),
  ecranTraite: defineAsyncComponent(() => import('@/web/module/ecrans/traite/EcranTraite.vue')),

}

const activeMenu = ref(FORME_ECRAN_TABLEAU_DE_BORD)
const currentModule = computed(() => moduleComponents[activeMenu.value] || moduleComponents.accueil)

////////////////////////  ECRANS  //////////////////
const ecransStore = useEcransStore()
//ecransStore.setFormeEcran(FORME_ECRAN_TABLEAU_DE_BORD)
const currentModuleEcran = computed(()=> ecransStore.currenteModule)
const currenteFormeEcran = computed(()=> ecransStore.currenteFormeEcran)
////////////////////////
function selectMenu(moduleId: string) {
  activeMenu.value = moduleId
  console.log(activeMenu.value)
  ecransStore.setFormeEcran(moduleId)
  ///////////////////////////////////////////////////
  //console.log('_____________________________________')
  //console.log(" _______ ECRANS : CESSION_MODULE ______ ")
  //console.log(" ___ currentModuleEcran    :",currentModuleEcran.value)
  //console.log(" ___ currenteFormeEcran:",currenteFormeEcran.value)
}
onMounted(()=>{
  //console.log('_____________________________________')
  //console.log(" _______ ECRANS : CESSION_MODULE onMounted ______ ")
    ecransStore.setFormeEcran(FORME_ECRAN_TABLEAU_DE_BORD)
})
</script>

<template>
  <TLayoutModule
    topSize="55px"
    leftSize="250px"
    :showBottom=false
    >
    <template #header>
        <TTitreModule libelle="Cession"/>     
    </template>

    <template #left>
      <MenuCession    @select="selectMenu"/>
    </template>

    <template #default>
        <keep-alive>
            <component :is="currentModule" />
        </keep-alive>     
    </template>

 

  </TLayoutModule>
</template>