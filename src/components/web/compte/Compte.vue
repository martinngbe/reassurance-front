<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreModule from '@/components/utilitaire/TTitreModule.vue';



</script>

<template>
  <TLayoutModule
    bottomSize="45%"
    topSize="100px"
    :show-left="false"
    >
    <template #header>
      <TTitreModule libelle="Compte"/> 
    </template>

    <template #default>
      
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