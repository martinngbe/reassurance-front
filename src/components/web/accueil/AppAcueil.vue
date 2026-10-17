<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreModule from '@/components/utilitaire/TTitreModule.vue';
import EnConstruction from '../EnConstruction.vue';


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
    bottomSize="45%"
    topSize="55px"
    :show-left="false"
    :show-bottom="false"
    >
    <template #header>
      <TTitreModule libelle="Tableau de bord"/> 
    </template>

    <template #default>
      <!--div class="p-6">
        <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <p class="text-slate-600 dark:text-slate-300">
            Module <strong class="text-primary-600 dark:text-primary-400">Accueil</strong> — Gestion des contrats en cours d'acceptation
          </p>
        </div>
      </div-->
      <div class="p-6 w-full h-full">
       <EnConstruction   />
        </div>
    </template>

  </TLayoutModule>
</template>