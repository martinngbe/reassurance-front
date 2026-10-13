<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import Utilisateurs from './Utilisateurs.vue';
import Roles from '../role/Roles.vue';
import type { Utilisateur } from '@/referentiel/utilisateur/utilisateur.ts';

type UtilisateurRow = Utilisateur & { [key: string]: any }
const onSelectRow =(row: UtilisateurRow,)=>{
  
}
</script>

<template>
  <TLayoutModule
  
    :show-left="false"
    :show-top="false"
    bottom-size="50%"
    >
  
    <template #default>
          <Utilisateurs  @select-row="onSelectRow"/>
    </template>
      <template #footer>
          <Roles/>
    </template>

  </TLayoutModule>
</template>