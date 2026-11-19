<script setup lang="ts">
import TAlert from '@/composants/display/TAlert.vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import { computed } from 'vue';

const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=> quittanceStore.currentQuittance)
const policeQuittance =  computed(()=> currentQuittance.value?.police)
</script>

<template>

     <TAlert >
        <div class="flex  gap-12"v-if="policeQuittance">
                <p>{{ policeQuittance.acteurCedante.sigle }}</p>
                <p>{{ policeQuittance.natureOffre.code }}</p>
                <p>{{ policeQuittance.sousBranche.libelle }}</p>
        </div>
        <p v-else>Aucune quittance sélectionnée </p>
    </TAlert>
</template>