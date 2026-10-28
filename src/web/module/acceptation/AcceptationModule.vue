<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import MenuAcceptation from './MenuAcceptation.vue';
import TTitreModule from '@/composants/utilitaire/TTitreModule.vue';
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';
import { ECRAN_TABLEAU_DE_BORD, useEcransStore } from '@/services/ecrans/ecrans.store.ts';


// Chargement dynamique des modules
const moduleComponents: Record<string, any> = {
  ecranTableauDeBord: defineAsyncComponent(() => import('@/web/module/ecrans/tableau-de-bord/EcranTableauDeBord.vue')),
  ecranFacultative: defineAsyncComponent(() => import('@/web/module/ecrans/facultative/EcranFacultative.vue')),
  ecranTraite: defineAsyncComponent(() => import('@/web/module/ecrans/traite/EcranTraite.vue')),

}

//const activeMenu = ref(ECRAN_TABLEAU_DE_BORD)
const ecranStore = useEcransStore()
const activeMenu = computed(()=>ecranStore.currentEcran)
const currentModule = computed(() => moduleComponents[activeMenu.value] || moduleComponents.ecranTableauDeBord)

////////////////////////  ECRANS  //////////////////
const ecransStore = useEcransStore()
////////////////////////
function selectMenu(menuId: string) {
  ecranStore.setFormeEcran(menuId)
  console.log("AcceptationModule.selectMenu",activeMenu.value)
  
  ///////////////////////////////////////////////////
}

onMounted(()=>{
    ecransStore.setFormeEcran(ECRAN_TABLEAU_DE_BORD)
})

</script>

<template>
  <TLayoutModule
    topSize="55px"
    leftSize="250px"
    :topFixe="true"
    :showBottom=false
    >
   <template #header>
        <TTitreModule libelle="Acceptation"/>     
    </template>

   <template #left>
      <MenuAcceptation   @select="selectMenu"/>
    </template>

    <template #default>      
        <keep-alive>
            <component :is="currentModule" />
        </keep-alive>
    </template>

 

  </TLayoutModule>
</template>