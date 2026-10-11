<script setup lang="ts">
import { ref } from 'vue'
import TTab from '@/components/tab/TTab.vue'
import TTabItem from '@/components/tab/TTabItem.vue'
import TTabPanel from '@/components/tab/TTabPanel.vue'

const active = ref('overview')
</script>

<template>
  <div class="w-full">
    
    <TTab v-model="active" variant="underline" size="md">
      <TTabItem value="overview"  label="Vue d'ensemble"  />
      <TTabItem value="analytics" label="Analytiques"     />
      <TTabItem value="settings"  label="Paramètres"      />
      <TTabItem value="disabled"  label="Désactivé"      />

      <template #panels>
        <TTabPanel value="overview">
          <p class="text-gray-600 dark:text-gray-300">
            Contenu de la vue d'ensemble.
          </p>
        </TTabPanel>
        <TTabPanel value="analytics">
          <p class="text-gray-600 dark:text-gray-300">
            Graphiques et statistiques ici.
          </p>
        </TTabPanel>
        <TTabPanel value="settings">
          <p class="text-gray-600 dark:text-gray-300">
            Formulaire de paramètres.
          </p>
        </TTabPanel>
      </template>
    </TTab>

  </div>
</template>