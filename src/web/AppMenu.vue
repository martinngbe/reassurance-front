<script setup lang="ts">
import { MODULE_ACCEPTATION, MODULE_ACCUEIL, MODULE_CESSION, MODULE_COMPTABILITE, MODULE_COMPTE, MODULE_CONSULTATION, MODULE_PARAMETRAGE, MODULE_REGLEMENT, MODULE_SINISTRE } from '@/services/ecrans/ecrans.store';
import { useTheme } from '@/theme/useTheme';
import { computed, ref } from 'vue';

const { theme } = useTheme();

defineProps<{
  activeMenu: string;
  accentColor: string;
}>();

const isDark = computed<boolean>(() => theme.resolvedMode === 'dark');

const emit = defineEmits<{
  (e: 'select', menuId: string): void;
}>();

interface MenuItem {
  id: string;
  label: string;
  icon: string; // Contient désormais les classes PrimeIcon (ex: 'pi pi-home')
}

const activeMenu = ref(MODULE_ACCUEIL);


const menus: MenuItem[] = [
  { id: MODULE_ACCUEIL,       label: 'Accueil', icon: 'pi pi-home' },
  { id: MODULE_ACCEPTATION,   label: 'Acceptation', icon: 'pi pi-file-check' },
  { id: MODULE_CESSION,       label: 'Cession', icon: 'pi pi-arrow-right-arrow-left' },
  { id: MODULE_SINISTRE,      label: 'Sinistre', icon: 'pi pi-exclamation-triangle' },
  { id: MODULE_COMPTE,        label: 'Compte', icon: 'pi pi-id-card' },
  { id: MODULE_REGLEMENT,     label: 'Règlement', icon: 'pi pi-dollar' },
  { id: MODULE_COMPTABILITE,  label: 'Comptabilisation', icon: 'pi pi-book' },
  { id: MODULE_CONSULTATION,  label: 'Consultation', icon: 'pi pi-eye' },
  //{ id: 'acteur',             label: 'Acteur', icon: 'pi pi-users' },
  { id: MODULE_PARAMETRAGE,   label: 'Paramétrage', icon: 'pi pi-cog' },
];

// Gestion sélection menu
function selectMenu(menuId: string) {
  console.log("AppMenu selectMenu(" + menuId + ")");
  activeMenu.value = menuId;
  emit('select', menuId);
}
</script>

<template>
  <nav class="flex h-full flex-col">
    <div class="px-4 py-3">
      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Navigation
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
          @click="selectMenu(menu.id)"
        >
          <!-- Remplacement du SVG par une balise <i> avec les classes PrimeIcon -->
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
    <div class="border-t border-slate-200 p-3 dark:border-slate-700">
      <div class="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
        <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Version 2.4.1
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Build 2026.09.11
        </p>
      </div>
    </div>
  </nav>
</template>