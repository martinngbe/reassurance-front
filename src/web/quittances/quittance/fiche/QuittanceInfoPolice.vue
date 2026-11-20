<script setup lang="ts">
import TAlert from '@/composants/display/TAlert.vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import { computed, ref, watch } from 'vue';

const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=> quittanceStore.currentQuittance)
const policeQuittance =  computed(()=> currentQuittance.value?.police)

const isAucuneSelection =ref(false)
watch(
   policeQuittance,
  () => {
   isAucuneSelection.value = policeQuittance.value? false : true 
  },
  { immediate: true }
)
</script>

<template>

     <TAlert >
        <div class="flex  gap-12"v-if="policeQuittance && !isAucuneSelection">
                <p>{{ policeQuittance.acteurCedante.sigle }}</p>
                <p>{{ policeQuittance.natureOffre.code }}</p>
                <p>{{ policeQuittance.sousBranche.libelle }}</p>
        </div>
        <p v-else>Aucune quittance sélectionnée </p>
    </TAlert>
</template>