<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import Acteurs from './Acteurs.vue';
import Contacts from '../contact/Contacts.vue';
import { onUnmounted, ref } from 'vue';
import type { Acteur } from '@/services/acteurs/acteur/acteur.ts';


const acteurSelected = ref<Acteur| null>(null)

// Variable pour stocker l'identifiant du timeout
let selectionTimeout: ReturnType<typeof setTimeout> | null = null

const onSelection = (acteur: Acteur) => {
  // 1. Annuler le timeout précédent s'il y en a un en attente
  if (selectionTimeout) {
    clearTimeout(selectionTimeout)
  }
  
  // 2. Réinitialiser l'ID (permet de vider le tableau ou d'afficher un loader)
  acteurSelected.value = null
  
  // 3. Programmer la nouvelle sélection (une seule fois après 500ms)
  selectionTimeout = setTimeout(() => {
    acteurSelected.value = acteur
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
          <Acteurs   @row-click="onSelection"/>
    </template>
    <template #footer>
          <Contacts  :acteur="acteurSelected" v-if="acteurSelected"/>
    </template>
    
    

  </TLayoutModule>
</template>