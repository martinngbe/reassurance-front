<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import type { CompteRubrique } from '@/services/flux-financiers/comptes/compte-rubrique/compte-rubrique.ts';
import { onUnmounted, ref } from 'vue';
import Bordereaux from './Bordereaux.vue';


const compteRubriqueSelected = ref<CompteRubrique| null>(null)

// Variable pour stocker l'identifiant du timeout
let selectionTimeout: ReturnType<typeof setTimeout> | null = null

const onSelection = (compteRubrique: CompteRubrique) => {
  // 1. Annuler le timeout précédent s'il y en a un en attente
  if (selectionTimeout) {
    clearTimeout(selectionTimeout)
  }
  
  // 2. Réinitialiser l'ID (permet de vider le tableau ou d'afficher un loader)
  compteRubriqueSelected.value = null
  
  // 3. Programmer la nouvelle sélection (une seule fois après 500ms)
  selectionTimeout = setTimeout(() => {
    compteRubriqueSelected.value = compteRubrique
  }, 500)
}

// Nettoyage mémoire si le composant est détruit
onUnmounted(() => {
  if (selectionTimeout) clearTimeout(selectionTimeout)
})
</script>

<template>
  <TLayoutModule   
    top-size="60%"    
    :show-left="false"
    :show-bottom="false"
    >

    <template #default>
          <Bordereaux />
    </template>
  </TLayoutModule>
</template>