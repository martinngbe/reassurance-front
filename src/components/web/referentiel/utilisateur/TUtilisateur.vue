<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import Utilisateurs from './Utilisateurs.vue';
import { ref } from 'vue';
import UserRolesTable from './UserRolesTable.vue';

const userId = ref<number | null>(null)
const onSelectRow =(utilisateurId: number,)=>{
  userId.value = null;
  setTimeout(()=>userId.value = utilisateurId , 200)
  
}
const onSaveRole =()=>{
 
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
          <!-- <Roles/> -->
          <!-- Mode ÉDITION (avec cases à cocher + bouton Enregistrer) -->
            <UserRolesTable v-if="userId"
              :user-id="userId"
              editable
              title="Gestion des rôles"
              height="600px"
              @saved="onSaveRole"
            />
    </template>

  </TLayoutModule>
</template>