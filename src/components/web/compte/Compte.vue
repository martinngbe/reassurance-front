<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreModule from '@/components/utilitaire/TTitreModule.vue';
import CompteFooter from '@/components/web/compte/CompteFooter.vue';



</script>

<template>
  <TLayoutModule
    bottomSize="50%"
    topSize="55px"
    :show-left="false"
    >
    <template #header>
      <TTitreModule libelle="Compte"/> 
    </template>

    <template #default>
          <p class="text-slate-600 dark:text-slate-300">
            Module <strong class="text-primary-600 dark:text-primary-400">Accueil</strong> — Gestion des contrats en cours d'acceptation
          </p>
    </template>

    <template #footer>     
      <CompteFooter/>
    </template>

  </TLayoutModule>
</template>