<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreModule from '@/composants/utilitaire/TTitreModule.vue';
import MenuParametrage from './MenuParametrage.vue';
import { defineAsyncComponent, computed, ref } from 'vue';
import TLigneHorizontale from '@/composants/utilitaire/TLigneHorizontale.vue';


const activeMenu = ref('campagne')
// Chargement dynamique des modules
const moduleComponents: Record<string, any> = {
  campagne: defineAsyncComponent(() => import('@//web/referentiel/campagne/TCampagne.vue')),
  profil: defineAsyncComponent(() => import('@//web/referentiel/role/TRole.vue')),
  utilisateur: defineAsyncComponent(() => import('@//web/referentiel/utilisateur/TUtilisateur.vue')),
  branche: defineAsyncComponent(() => import('@//web/referentiel/branche/TBranche.vue')),
  region: defineAsyncComponent(() => import('@//web/referentiel/region/TRegion.vue')),
  domaineActivite: defineAsyncComponent(() => import('@//web/referentiel/domaine-activite/TDomaineActivite.vue')),
  devise: defineAsyncComponent(() => import('@//web/referentiel/devise/TDevise.vue')),
  natureOffre: defineAsyncComponent(() => import('@/web/referentiel/nature-offre/TNatureOffre.vue')),
  natureCession: defineAsyncComponent(() => import('@/web/referentiel/nature-cession/TNatureCession.vue')),

  acteur: defineAsyncComponent(() => import('@//web/acteurs/acteur/TActeur.vue')),
  assure: defineAsyncComponent(() => import('@//web/acteurs/assure/TAssure.vue')),
 
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