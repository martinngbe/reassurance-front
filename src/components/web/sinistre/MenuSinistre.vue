<script setup lang="ts">
import { useTheme } from '@/theme/useTheme';
import { computed, ref } from 'vue';
const { theme, toggleMode } = useTheme()


/** mode réellement appliqué ('system' déjà résolu) */
const isDark = computed<boolean>(() => theme.resolvedMode === 'dark')
const emit = defineEmits<{
  (e: 'select', menuId: string): void
}>()

interface MenuItem {
  id: string
  label: string
  icon: string
}
const activeMenu = ref('tableau-bord')

const menus: MenuItem[] = [
  {
    id: 'tableau-bord',
    label: 'Tableau de bord',
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  },
  {
    id: 'declaration',
    label: 'Déclaration',
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><polyline points="9 11 11 13 15 9"/>',
  },
  {
    id: 'reglement',
    label: 'Règlement',
    icon: '<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.5a2.5 2.5 0 0 0-5 0V22"/><path d="M21 3l-9 9"/><path d="M3 3l9 9"/>',
  },

 

]

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
          <svg
            class="h-5 w-5 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            v-html="menu.icon"
          />
         <span :class=" activeMenu === menu.id ? 'text-primary-700 dark:text-primary-300' :  'text-slate-800 dark:text-slate-100'  "
            class="uppercase text-lg font-bold"
         >
            {{ menu.label }}
          </span>
          
        </button>
      </li>
    </ul>
   
  </nav>
</template>