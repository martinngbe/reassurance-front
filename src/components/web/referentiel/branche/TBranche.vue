<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import Branches from './Branches.vue';
import SousBranches from '../sous-branche/SousBranches.vue';
import { onUnmounted, ref } from 'vue';
import type { Branche } from '@/referentiel/branche/branche.ts';


const brancheSelected = ref<Branche| null>(null)

// Variable pour stocker l'identifiant du timeout
let selectionTimeout: ReturnType<typeof setTimeout> | null = null

const onSelection = (branche: Branche) => {
  // 1. Annuler le timeout précédent s'il y en a un en attente
  if (selectionTimeout) {
    clearTimeout(selectionTimeout)
  }
  
  // 2. Réinitialiser l'ID (permet de vider le tableau ou d'afficher un loader)
  brancheSelected.value = null
  
  // 3. Programmer la nouvelle sélection (une seule fois après 500ms)
  selectionTimeout = setTimeout(() => {
    brancheSelected.value = branche
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
          <Branches  @row-click="onSelection"/>
    </template>
    <template #footer>
          <SousBranches :branche="brancheSelected" v-if="brancheSelected"/>
    </template>
  </TLayoutModule>
</template>