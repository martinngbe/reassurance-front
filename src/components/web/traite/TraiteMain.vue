
0<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import { computed, defineAsyncComponent, ref } from 'vue';
import Assure from '../assure/Assures.vue/index.js';
import Police from '../police/police.vue';
import Quittance from '../quittance/quittance.vue';


// Chargement dynamique des modules
const moduleComponents: Record<string, any> = {
  tableauDeBord: defineAsyncComponent(() => import('@/components/web/acceptation/AcceptationTableauDeBord.vue')),
  facultative: defineAsyncComponent(() => import('@/components/web/facultative/Facultative.vue')),

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
    :showBottom=false
    topSize="1px"
    leftSize="50%"
    >
    <template #left>
      <div class="h-full w-full pb-8">
         <Police   />
      </div>
       
    </template>

    <template #default>
           <div class="h-full w-full pb-1">
                          <Quittance   />
                        </div>
    </template>

 

  </TLayoutModule>
</template>