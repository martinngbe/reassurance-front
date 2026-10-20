<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import Acteurs from './Acteurs.vue';


</script>

<template>
  <TLayoutModule   
    bottom-size="50%"
    :show-top="false"
    :show-left="false"
    >

    <template #default>
          <Acteurs/>
    </template>
    <template #footer>
          <p>Liste des contes pour acteur</p>
    </template>
    
  </TLayoutModule>
</template>