<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import MenuAcceptation from './MenuAcceptation.vue';
import TTitreModule from '@/composants/utilitaire/TTitreModule.vue';
import { computed, defineAsyncComponent, ref } from 'vue';


// Chargement dynamique des modules
const moduleComponents: Record<string, any> = {
  ecranTableauDeBord: defineAsyncComponent(() => import('@/web/module/ecrans/tableau-de-bord/EcranTableauDeBord.vue')),
  ecranFacultative: defineAsyncComponent(() => import('@/web/module/ecrans/facultative/EcranFacultative.vue')),
  ecranTraite: defineAsyncComponent(() => import('@/web/module/ecrans/traite/EcranTraite.vue')),

}

const activeMenu = ref('ecranTableauDeBord')
const currentModule = computed(() => moduleComponents[activeMenu.value] || moduleComponents.accueil)
function selectMenu(menuId: string) {
  console.log('________________________________')
  console.log('AcceptationModule')
  console.log('menuId:'+menuId)
  console.log('________________________________')
  activeMenu.value = menuId
}
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