<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import type { CompteType } from '@/services/flux-financiers/comptes/compte-type/compte-type.ts';
import { onUnmounted, ref } from 'vue';
import CompteTypes from './CompteTypes.vue';


const compteTypeSelected = ref<CompteType| null>(null)

// Variable pour stocker l'identifiant du timeout
let selectionTimeout: ReturnType<typeof setTimeout> | null = null

const onSelection = (compteType: CompteType) => {
  // 1. Annuler le timeout précédent s'il y en a un en attente
  if (selectionTimeout) {
    clearTimeout(selectionTimeout)
  }
  
  // 2. Réinitialiser l'ID (permet de vider le tableau ou d'afficher un loader)
  compteTypeSelected.value = null
  
  // 3. Programmer la nouvelle sélection (une seule fois après 500ms)
  selectionTimeout = setTimeout(() => {
    compteTypeSelected.value = compteType
  }, 500)
}

// Nettoyage mémoire si le composant est détruit
onUnmounted(() => {
  if (selectionTimeout) clearTimeout(selectionTimeout)
})
</script>

<template>
  <TLayoutModule   
    
    :show-top="false"
    :show-left="false"
    :show-bottom="false"
    >

    <template #default>
          <CompteTypes  @row-click="onSelection"/>
    </template>
  </TLayoutModule>
</template>