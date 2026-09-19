<script setup lang="ts">
import { useTheme } from '@/theme/useTheme';
import { computed, ref } from 'vue';
const { theme, toggleMode } = useTheme()
defineProps<{
 // activeMenu: string
  accentColor: string
}>()


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
const activeMenu = ref('accueil')

const menus: MenuItem[] = [
  {
    id: 'accueil',
    label: 'Accueil',
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  },
  {
    id: 'acceptation',
    label: 'Acceptation',
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><polyline points="9 11 11 13 15 9"/>',
  },
  {
    id: 'cession',
    label: 'Cession',
    icon: '<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.5a2.5 2.5 0 0 0-5 0V22"/><path d="M21 3l-9 9"/><path d="M3 3l9 9"/>',
  },
  {
    id: 'sinistre',
    label: 'Sinistre',
    icon: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  },
  {
    id: 'compte',
    label: 'Compte',
    icon: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
  },
  {
    id: 'reglement',
    label: 'Règlement',
    icon: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
  },
  {
    id: 'acteur',
    label: 'Acteur',
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  },
  {
    id: 'parametrage',
    label: 'Paramétrage',
    icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
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
        Navigation
      </p>
    </div>
    <ul class="flex flex-1 flex-col gap-1 px-2">
      <li v-for="menu in menus" :key="menu.id">
        <button
          class="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
        
         :class="
            activeMenu === menu.id
              ? 'text-primary-600 shadow-md'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          "
          :style="
            activeMenu === menu.id
              ? { backgroundColor: accentColor }
              : {}
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
         
          <span class="uppercase text-lg font-bold  text-slate-800 dark:text-slate-100">
            {{ menu.label }}
          </span>
          <span
            v-if="activeMenu === menu.id"
            class="ml-auto h-2 w-2 rounded-full bg-white/80 "
          />
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