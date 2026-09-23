<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreModule from '@/components/utilitaire/TTitreModule.vue';
import MenuAcceptation from '../acceptation/MenuAcceptation.vue';
import { computed, defineAsyncComponent, ref } from 'vue';
import MenuCession from './MenuCession.vue';


// Chargement dynamique des modules
const moduleComponents: Record<string, any> = {
  tableauDeBord: defineAsyncComponent(() => import('@/components/web/acceptation/AcceptationTableauDeBord.vue')),
  facultative: defineAsyncComponent(() => import('@/components/web/facultative/Facultative.vue')),
  traite: defineAsyncComponent(() => import('@/components/web/traite/Traite.vue')),

}

const activeMenu = ref('tableauDeBord')
const currentModule = computed(() => moduleComponents[activeMenu.value] || moduleComponents.accueil)
function selectMenu(menuId: string) {
  console.log('menuId:'+menuId)
  activeMenu.value = menuId
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