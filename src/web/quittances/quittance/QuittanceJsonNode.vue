<script setup lang="ts">
import { computed } from 'vue'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store.ts'
import JsonTree from '@/composants/json-tree/JsonTree.vue';
//import JsonTree from '@/composants/json-tree/JsonTree.vue';

const quittanceStore = useQuittanceStore()
const currentQuittance = computed(() => quittanceStore.currentQuittance)
const title = computed(()=>"Quittance N°"+currentQuittance.value?.numero)
</script>


<template>
  <div class="my-view">
    <p class="text-md uppercase font-extrabold">{{title  }}</p>
    <h2 class="italic">Arbre de dépendance</h2>

    <!-- Protection : on n'affiche l'arbre que si la quittance est bien chargée -->
    <JsonTree v-if="currentQuittance" :json-data="currentQuittance" />

    <!-- Message d'attente sinon -->
    <p v-else class="loading">Chargement de la quittance...</p>
  </div>
</template>



<style scoped>
.my-view {
  padding: 16px;
}

.loading {
  color: #64748b;
  font-style: italic;
}
</style>