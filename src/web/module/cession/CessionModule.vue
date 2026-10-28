<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreModule from '@/composants/utilitaire/TTitreModule.vue';
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';
import MenuCession from './MenuCession.vue';
import { ECRAN_TABLEAU_DE_BORD, useEcransStore } from '@/services/ecrans/ecrans.store.ts';


// Chargement dynamique des modules
const moduleComponents: Record<string, any> = {
  ecranTableauDeBord: defineAsyncComponent(() => import('@/web/module/ecrans/tableau-de-bord/EcranTableauDeBord.vue')),
  ecranFacultative: defineAsyncComponent(() => import('@/web/module/ecrans/facultative/EcranFacultative.vue')),
  ecranTraite: defineAsyncComponent(() => import('@/web/module/ecrans/traite/EcranTraite.vue')),

}

const ecranStore = useEcransStore()
const activeMenu = computed(()=>ecranStore.currentEcran)
const currentModule = computed(() => moduleComponents[activeMenu.value] || moduleComponents.ecranTableauDeBord)

////////////////////////  ECRANS  //////////////////
////////////////////////
function selectMenu(menuId: string) {
  console.log(activeMenu.value)
  ecranStore.setFormeEcran(menuId)
 
}
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