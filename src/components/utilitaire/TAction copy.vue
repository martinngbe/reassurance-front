<template>
  <div 
    class="flex flex-wrap gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border transition-colors duration-300"
    :class="isDark ? 'dark bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
  >
    <button
      v-for="action in actionsList"
      :key="action.id"
      class="
        flex items-center gap-2 border transition-all duration-200 font-semibold text-sm 
        focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 
        hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm 
        /* Mobile : bouton circulaire, centré, taille tactile minimale */
        p-3 rounded-full justify-center min-w-[44px] min-h-[44px] 
        /* Desktop (sm et plus) : bouton rectangulaire, texte visible */
        sm:px-4 sm:py-2.5 sm:rounded-lg sm:justify-start
      "
      :class="getThemeClasses(action.theme || action.id)"
      :title="action.label"
      @click="$emit('action-click', action)"
    >
      <i :class="action.icon"></i>
      <span class="hidden sm:inline whitespace-nowrap">{{ action.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isDark: {
    type: Boolean,
    default: false
  },
  customActions: {
    type: Array,
    default: () => []
  }
});

defineEmits(['action-click']);

const defaultActions = [
  { id: 'new', label: 'Nouveau', icon: 'pi pi-plus', theme: 'new' },
  { id: 'edit', label: 'Modifier', icon: 'pi pi-pencil', theme: 'edit' },
  { id: 'delete', label: 'Supprimer', icon: 'pi pi-trash', theme: 'delete' },
  { id: 'print', label: 'Imprimer', icon: 'pi pi-print', theme: 'print' }
];

const actionsList = computed(() => 
  props.customActions.length > 0 ? props.customActions : defaultActions
);

// Mapping des thèmes de couleurs (Light & Dark)
const themeClasses = {
  new: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-500 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/50 dark:focus:ring-emerald-700',
  edit: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 focus:ring-blue-500 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:focus:ring-blue-700',
  delete: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 focus:ring-red-500 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/50 dark:focus:ring-red-700',
  print: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-600',
  // Fallback pour les actions personnalisées non répertoriées
  default: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
};

const getThemeClasses = (theme) => {
  return themeClasses[theme] || themeClasses.default;
};
</script>