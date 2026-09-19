<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'


const menuModule: Record<string, string> = {
  accueil: 'Accueil',
  acceptation: 'Facultative',
  cession: 'Traité',
  placement: 'Placement',
  compte: 'Compte',
  reglement: 'Règlement',
}


</script>

<template>
  <TLayoutModule 
    title="Accueil" 
    subtitle="Tableau de bord" 
    bottomSize="45%"
    :show-left="false"
    >
    <template #header>
      <div class="p-6">
        <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <p class="text-slate-600 dark:text-slate-300">
            Module <strong class="text-primary-600 dark:text-primary-400">Accueil</strong> —Tableau de bord
          </p>
        </div>
      </div>
    </template>

   <!--template #left>
      <div class="space-y-2 ml-1 mr-1 mb-2">
        <h3 class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Filtres rapides
        </h3>
        <div v-for="filter in ['Tous', 'Actifs', 'En attente', 'Clôturés', 'Archivés']" :key="filter"
             class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
          <p class="text-xs font-medium text-slate-800 dark:text-slate-100">{{ filter }}</p>
        </div>
      </div>
    </template-->

    <template #default>
      <div class="p-6">
        <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <p class="text-slate-600 dark:text-slate-300">
            Module <strong class="text-primary-600 dark:text-primary-400">Accueil</strong> — Gestion des contrats en cours d'acceptation
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="p-6">
        <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <p class="text-slate-600 dark:text-slate-300">
            Module <strong class="text-primary-600 dark:text-primary-400">Accueil</strong> — Gestion des contrats en cours d'acceptation
          </p>
        </div>
      </div>
    </template>

  </TLayoutModule>
</template>