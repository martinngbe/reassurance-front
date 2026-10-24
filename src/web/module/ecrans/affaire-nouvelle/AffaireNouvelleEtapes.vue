<script setup lang="ts">
import { useTheme } from '@/theme/useTheme'
const { theme, toggleMode } = useTheme()

// ✅ 1. Recevoir activeMenu depuis le parent (OBLIGATOIRE, pas undefined)
const props = defineProps<{
  activeMenu: string
}>()

const emit = defineEmits<{
  (e: 'select', menuId: string): void
}>()

interface MenuItem {
  id: string
  label: string
  icon: string
}

const menus: MenuItem[] = [
  { id: 'historiqueSaisie', label: 'Historique', icon: 'pi pi-calendar' },
  { id: 'tempPolice', label: 'Police', icon: 'pi pi-calendar' },
  { id: 'emission', label: 'Emission', icon: 'pi pi-sitemap' },
  { id: 'capitaux', label: 'Capitaux', icon: 'pi pi-sitemap' },
  { id: 'primes', label: 'Primes', icon: 'pi pi-sitemap' },
  { id: 'tauxEtTaxes', label: 'Taux et taxe', icon: 'pi pi-sitemap' },
  { id: 'courtage', label: 'Courtage', icon: 'pi pi-globe' },
  { id: 'recapitulation', label: 'Récapitulation', icon: 'pi pi-briefcase' },
]

// ✅ 2. NE PLUS gérer activeMenu localement → juste émettre l'événement
function selectMenu(menuId: string) {
  emit('select', menuId)
}
</script>

<template>
  <nav class="flex h-full flex-col">
    <div class="px-4 py-3">
      <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Etapes
      </p>
    </div>
    <ul class="flex flex-1 flex-col gap-1 px-2 mt-1 ">
      <li v-for="menu in menus" :key="menu.id">
        <button
          class="group flex w-full items-center gap-12 rounded-lg px-3 py-2.5 text-md font-medium transition-all"
          :class="
            props.activeMenu === menu.id
              ? 'text-primary-600 shadow-lg shadow-primary-700 dark:shadow-primary-500/50'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          "
          @click="selectMenu(menu.id)"
        >
          <span
            :class="props.activeMenu === menu.id ? 'text-primary-700 dark:text-primary-300' : 'text-slate-800 dark:text-slate-100'"
            class="uppercase text-lg font-bold"
          >
            {{ menu.label }}
          </span>
        </button>
      </li>
    </ul>
  </nav>
</template>