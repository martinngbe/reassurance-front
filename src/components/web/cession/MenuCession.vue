<script setup lang="ts">
import { useTheme } from '@/theme/useTheme';
import { ref } from 'vue';
const { theme, toggleMode } = useTheme()


const emit = defineEmits<{
  (e: 'select', menuId: string): void
}>()

interface MenuItem {
  id: string
  label: string
  icon: string
}
const activeMenu = ref('tableauDeBord')

const menus: MenuItem[] = [
  {
    id: 'tableauDeBord',
    label: 'Tableau de bord',
    icon: 'pi pi-home', // ou 'pi pi-th-large'
  },
  {
    id: 'facultative',
    label: 'Facultative',
    icon: 'pi pi-file', // ou 'pi pi-clipboard' pour l'analyse de dossier
  },
  {
    id: 'traite',
    label: 'Traité',
    icon: 'pi pi-shield', // ou 'pi pi-sync' pour le côté automatique, ou 'pi pi-arrows-h'
  },
];


// Gestion sélection menu
function selectMenu(menuId: string) {
  console.log("AppMenu selectMenu("+menuId+")")
  activeMenu.value = menuId
  emit('select', menuId)
}
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
         <i :class="[menu.icon, 'h-5 w-5 flex-shrink-0 text-lg text-center']"
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