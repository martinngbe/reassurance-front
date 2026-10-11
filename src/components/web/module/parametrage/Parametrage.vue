<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreModule from '@/components/utilitaire/TTitreModule.vue';
import MenuParametrage from './MenuParametrage.vue';
import { defineAsyncComponent, computed, ref } from 'vue';
import TLigneHorizontale from '@/components/utilitaire/TLigneHorizontale.vue';
import TLigneVerticale from '@/components/utilitaire/TLigneVerticale.vue';


const activeMenu = ref('campagne')
// Chargement dynamique des modules
const moduleComponents: Record<string, any> = {
  campagne: defineAsyncComponent(() => import('@/components/web/referentiel/campagne/TCampagne.vue')),
  profil: defineAsyncComponent(() => import('@/components/web/referentiel/role/TRole.vue')),
  utilisateur: defineAsyncComponent(() => import('@/components/web/referentiel/utilisateur/TUtilisateur.vue')),
  
}

const currentModule = computed(() => moduleComponents[activeMenu.value] || moduleComponents.accueil)

function selectMenu(menuId: string) {
  activeMenu.value = menuId
}
</script>

<template>
  <TLayoutModule
    topSize="55px"
    :topFixe="true"
    leftSize="300px"
    :showBottom=false
    >
   <template #header>
        <TTitreModule libelle="Paramétrage"/>
        <TLigneHorizontale/>     
    </template>

   <template #left>
      <MenuParametrage @select="selectMenu"/>
    </template>
    <!-- <template #right>
      <TLigneVerticale/>
    </template> -->
    <template #default>
      
              <keep-alive>
                  <component :is="currentModule"  />
              </keep-alive> 
     
    </template>

  </TLayoutModule>
</template>