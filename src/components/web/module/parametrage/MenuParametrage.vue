<script setup lang="ts">
import { useTheme } from '@/theme/useTheme';
import { computed, ref } from 'vue';
const { theme, toggleMode } = useTheme()


/** mode réellement appliqué ('system' déjà résolu) */
//const isDark = computed<boolean>(() => theme.resolvedMode === 'dark')
const emit = defineEmits<{
  (e: 'select', menuId: string): void
}>()

interface MenuItem {
  id: string
  label: string
  icon: string
}
const activeMenu = ref('campagne')


const menus: MenuItem[] = [
  {
    id: 'campagne',
    label: 'Campagne',
    icon: 'pi pi-calendar',
  },
  {
    id: 'profil',
    label: 'Profil',
    icon: 'pi pi-user',
  },
  {
    id: 'utilisateur',
    label: 'Utilisateur',
    icon: 'pi pi-user',
  },
 
  {
    id: 'domaineActivite',
    label: 'Domaine activité',
    icon: 'pi pi-briefcase',
  },
  {
    id: 'branche',
    label: 'Branche',
    icon: 'pi pi-sitemap',
  },
   {
    id: 'devise',
    label: 'Dévise',
    icon: 'pi pi-dollar',
  },
  {
    id: 'region',
    label: 'Pays',
    icon: 'pi pi-globe',
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
          <!-- Remplacement du SVG par une balise <i> avec les classes PrimeIcon -->
          <i 
            :class="[menu.icon, 'h-5 w-5 flex-shrink-0 text-lg text-center']"
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