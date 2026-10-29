<script setup lang="ts">
import { ECRAN_BORDEREAU, ECRAN_COMPTE, ECRAN_ECHEANCE_PMD, ECRAN_FACULTATIVE, ECRAN_PLACEMENT, ECRAN_TABLEAU_DE_BORD, ECRAN_TRAITE, useEcransStore } from '@/services/ecrans/ecrans.store';
import { computed, onMounted, ref } from 'vue';


const emit = defineEmits<{
  (e: 'select', menuId: string): void
}>()

interface MenuItem {
  id: string
  label: string
 // icon: string
}
//const activeMenu = ref('ecranTableauDeBord')
const ecranStore = useEcransStore()
const activeMenu = computed(()=> ecranStore.currentEcran)
const menus: MenuItem[] = [
  { id: ECRAN_TABLEAU_DE_BORD,      label: 'Tableau de bord'},
  { id: ECRAN_FACULTATIVE,          label: 'Facultative'},
  { id: ECRAN_TRAITE,               label: 'Traité',},
  { id: ECRAN_PLACEMENT,            label: 'Placement' },
  { id: ECRAN_BORDEREAU,            label: 'Borderau réçu' },
  { id: ECRAN_ECHEANCE_PMD,         label: 'Echéance PMD'},
  { id: ECRAN_COMPTE,               label: 'Compte' }

];


// Gestion sélection menu
function selectMenu(menuId: string) {
  console.log("AppMenu selectMenu("+menuId+")")
  ecranStore.setFormeEcran(menuId)
  emit('select', menuId)
}
const ecransStore = useEcransStore()
onMounted(()=>{
   ecransStore.setFormeEcran(ECRAN_TABLEAU_DE_BORD)
})
</script>

<template>
  <nav class="flex h-full flex-col">
    <div class="px-4 py-3">
      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Menu
      </p>
    </div>
    <ul class="flex flex-1 flex-col gap-1 px-2">
      <li v-for="menu in menus" :key="menu.id">
        <button
          class="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
        
         :class="
            activeMenu === menu.id
              ? 'text-primary-600 shadow-lg shadow-primary-700 dark:shadow-primary-500/50'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          "
          
        
          @click="selectMenu( menu.id)"
          
        >
            <!-- Remplacement du SVG par une balise <i> avec les classes PrimeIcon -->
          <i 
            :class="[ 'h-5 w-5 flex-shrink-0 text-lg text-center']"
          ></i>
          
          <span 
            :class="activeMenu === menu.id ? 'text-primary-700 dark:text-primary-300' : 'text-slate-800 dark:text-slate-100'"
            class="uppercase text-lg font-bold"
          >
            {{ menu.label }}
          </span>
          
        </button>
      </li>
    </ul>
   
  </nav>
</template>