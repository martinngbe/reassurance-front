
0<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import { computed, defineAsyncComponent, ref } from 'vue';
import Police from '../police/police.vue';
import Quittance from '../quittance/quittance.vue';
import Cedantes from './cedantes.vue';


// Chargement dynamique des modules
const moduleComponents: Record<string, any> = {
  tableauDeBord: defineAsyncComponent(() => import('@/components/web/acceptation/AcceptationTableauDeBord.vue')),
  facultative: defineAsyncComponent(() => import('@/components/web/module/facultative/Facultative.vue')),

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
    :showTop=false
    leftSize="50%"
    :leftFixe="false"
    >
    <template #left>
      <div class="h-full w-full pb-8">
         <Cedantes   />
      </div>
       
    </template>

    <template #default>
           <TLayoutModule
                :showTop=false
                :showLeft=false
                bottomSize="50%"
                >

                    <template #default>
                        <div class="h-full w-full pb-1">
                          <Police   />
                        </div>
                    </template>
                    <template #footer>
                        <div class="h-full w-full pb-1">
                          <Quittance   />
                        </div>
                    </template>

            </TLayoutModule>
    </template>

 

  </TLayoutModule>
</template>