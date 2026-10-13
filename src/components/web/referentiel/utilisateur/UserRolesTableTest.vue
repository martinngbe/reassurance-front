<template>
  <div class="p-6 space-y-6">
    <!-- Mode LECTURE -->
    <UserRolesTable :user-id="userId" title="Rôles attribués" />

    <!-- Mode ÉDITION (avec cases à cocher + bouton Enregistrer) -->
    <UserRolesTable
      :user-id="userId"
      editable
      title="Gestion des rôles"
      height="600px"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserRolesTable from './UserRolesTable.vue';

const userId = ref(1);
const onSaved = () => console.log('✅ Rôles mis à jour');
</script>