<script setup lang="ts">

import { useCumulTauxCession } from '@/services/quittances/quittance-placement/useCumulTauxCession';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import { formatInteger } from '@/utilitaire/number';
import { computed, ref, watch } from 'vue';

const quittanceStore = useQuittanceStore();
const currentQuittance = computed(() => quittanceStore.currentQuittance);
// ... imports existants ...

// ✅ AJOUT : composable de cumul des taux
const quittanceIdRef = computed(() => currentQuittance.value?.id ?? null)
const {
  tauxAccepte,
  cumulTauxCession,
  tauxDisponible,
  isCumulDepasse,
  nombrePlacementsActifs
} = useCumulTauxCession(quittanceIdRef)
// --- Helpers de formatage ---
const formatNumber = (value: number | undefined | null, decimals = 2) => {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  }).format(value);
};



const formatPercent = (value: number | undefined | null) => {
  if (value === undefined || value === null) return '—';
  return `${formatNumber(value, 2)} %`;
};


</script>

<template>
  <!-- Conteneur principal avec support Dark/Light -->
  <div class="max-w-5xl mx-auto p-6 sm:p-8 bg-[#fdfbf7] dark:bg-stone-900 border-2 border-[#d6d3d1] dark:border-stone-700 rounded-sm shadow-lg font-sans text-stone-800 dark:text-stone-200 transition-colors duration-300">
    
    <!-- État vide ou chargement -->
    <div v-if="!currentQuittance" class="text-center py-12 font-mono text-stone-500 dark:text-stone-400">
      Aucune donnée de quittance disponible.
    </div>

    <template v-else>
    

      <!-- Tableau principal -->
      <table class="w-full text-sm border-collapse">
      
        <!-- SECTION: PRIMES -->
        <tbody  class="border-b-2 border-[#a8a29e] dark:border-stone-600">
          <tr>
            <th colspan="4" class="bg-[#e7e5e4] dark:bg-stone-800 text-[#44403c] dark:text-stone-100 font-serif font-bold uppercase tracking-widest text-left px-4 py-3 border-b border-[#a8a29e] dark:border-stone-600">
              Primes
            </th>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors" >
            <td colspan="2" class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Prime Brute</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-100 font-bold">{{ formatNumber(currentQuittance.primeBrute) }}</td>
           
          </tr>
        </tbody>

        <!-- SECTION: TAUX ET TAXES -->
        <tbody   class="border-b-2 border-[#a8a29e] dark:border-stone-600">
          <tr>
            <th colspan="4" class="bg-[#e7e5e4] dark:bg-stone-800 text-[#44403c] dark:text-stone-100 font-serif font-bold uppercase tracking-widest text-left px-4 py-3 border-b border-[#a8a29e] dark:border-stone-600">
              Taux
            </th>
          </tr>
       
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td  class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Tx Cédante</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatPercent(currentQuittance.tauxCedante) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Tx Notre part</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatPercent(currentQuittance.tauxAccepte) }}</td>
          </tr>        
        </tbody>

              <!-- SECTION: TAUX ET TAXES -->
        <tbody   class="border-b-2 border-[#a8a29e] dark:border-stone-600">
          <tr>
            <th colspan="4" class="bg-[#e7e5e4] dark:bg-stone-800 text-[#44403c] dark:text-stone-100 font-serif font-bold uppercase tracking-widest text-left px-4 py-3 border-b border-[#a8a29e] dark:border-stone-600">
              Cumul Placement
            </th>
          </tr>
       
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td  class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Taux</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatPercent(cumulTauxCession) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">NB Placement</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatInteger(nombrePlacementsActifs) }}</td>
          </tr>        
        </tbody>
    </table>
      
     
    </template>
  </div>
</template>