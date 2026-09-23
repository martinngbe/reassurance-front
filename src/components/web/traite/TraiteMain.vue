<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import { computed, defineAsyncComponent, ref } from 'vue';


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
    :showLeft="false"
    topSize="1px"
    >
 
   

    <template #default>
    </template>

 

  </TLayoutModule>
</template>