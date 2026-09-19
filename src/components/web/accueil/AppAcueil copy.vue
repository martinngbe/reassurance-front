<script setup lang="ts">
import ModuleLayout from '@/components/layout/ModuleLayout.vue'

defineProps<{
  accentColor?: string
}>()
</script>

<template>
  <ModuleLayout
    title="Accueil"
    subtitle="Tableau de bord principal — Module d'accueil"
    :accent-color="accentColor"
  >
    <template #header-actions>
      <button
        class="px-3 py-1.5 rounded-lg text-white text-sm font-medium shadow-sm"
        :style="{ backgroundColor: accentColor || '#4f46e5' }"
      >
        + Nouveau dossier
      </button>
    </template>
     <template #header>
        <div class="h-full flex items-center justify-between px-5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/30 dark:to-purple-500/30 border-b-2 border-indigo-400/50">
          <div class="min-w-0">
            <h2 class="truncate text-xl font-bold text-indigo-900 dark:text-indigo-100">
              <slot name="header-title"> title || 'Module' </slot>
            </h2>
         
          </div>
          <slot name="header-actions" />
        </div>
      </template>
    <template #left>
      <div class="space-y-2">
        <h3 class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Filtres rapides
        </h3>
        <div v-for="filter in ['Tous', 'Actifs', 'En attente', 'Clôturés', 'Archivés']" :key="filter"
             class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
          <p class="text-xs font-medium text-slate-800 dark:text-slate-100">{{ filter }}</p>
        </div>
      </div>
    </template>

    <template #content>
      <div class="space-y-4">
        <!--div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div v-for="n in 4" :key="n"
               class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
            <p class="text-xs text-slate-500 dark:text-slate-400">Métrique {{ n }}</p>
            <p class="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">1,234</p>
          </div>
        </div-->

        <!--div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Répartition du ModuleLayout
          </h3>
          <ul class="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <li>• <strong>Haut (10%)</strong> : Titre et actions du module</li>
            <li>• <strong>Gauche (15%)</strong> : Filtres et navigation interne</li>
            <li>• <strong>Centre (65%)</strong> : Contenu principal (cette zone)</li>
            <li>• <strong>Bas (10%)</strong> : Informations complémentaires</li>
          </ul>
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Ces dimensions sont relatives à la <strong>zone centrale de EcranPrincipal</strong>,
            pas à la fenêtre entière.
          </p>
        </div-->
      </div>
    </template>

    <template #footer>
      <!--div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
          <p class="text-[10px] text-slate-500 dark:text-slate-400">Contrats actifs</p>
          <p class="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">1,234</p>
        </div>
        <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
          <p class="text-[10px] text-slate-500 dark:text-slate-400">Sinistres en cours</p>
          <p class="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">56</p>
        </div>
        <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
          <p class="text-[10px] text-slate-500 dark:text-slate-400">Taux de satisfaction</p>
          <p class="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">98.5%</p>
        </div>
      </div-->
    </template>
  </ModuleLayout>
</template>