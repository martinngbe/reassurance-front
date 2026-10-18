<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import Regions from './Regions.vue';
import type { Region } from '@/services/referentiel/region/region.ts';
import { ref, onUnmounted } from 'vue';
import ListePays from '../pays/ListePays.vue';


const regionSelected = ref<Region| null>(null)

// Variable pour stocker l'identifiant du timeout
let selectionTimeout: ReturnType<typeof setTimeout> | null = null

const onSelection = (region: Region) => {
  // 1. Annuler le timeout précédent s'il y en a un en attente
  if (selectionTimeout) {
    clearTimeout(selectionTimeout)
  }
  
  // 2. Réinitialiser l'ID (permet de vider le tableau ou d'afficher un loader)
  regionSelected.value = null
  
  // 3. Programmer la nouvelle sélection (une seule fois après 500ms)
  selectionTimeout = setTimeout(() => {
    regionSelected.value = region
  }, 500)
}

// Nettoyage mémoire si le composant est détruit
onUnmounted(() => {
  if (selectionTimeout) clearTimeout(selectionTimeout)
})

</script>

<template>
  <TLayoutModule   
    bottom-size="50%"
    :show-top="false"
    :show-left="false"
    >
    <template #default>
          <Regions   @row-click="onSelection"/>
    </template>
    <template #footer>
          <ListePays v-if="regionSelected" :region="regionSelected"/>
    </template>
  </TLayoutModule>
</template>