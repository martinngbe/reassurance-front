<script setup lang="ts">
import type { Quittance } from '@/services/quittances/quittance/quittance';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import { computed } from 'vue';

const quittanceStore = useQuittanceStore();
const quittance = computed(() => quittanceStore.currentQuittance);

// --- Helpers de formatage ---
const formatNumber = (value: number | undefined | null, decimals = 2) => {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  }).format(value);
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
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
    <div v-if="!quittance" class="text-center py-12 font-mono text-stone-500 dark:text-stone-400">
      Aucune donnée de quittance disponible.
    </div>

    <template v-else>
      <!-- En-tête -->
      <div class="mb-8 border-b-2 border-[#a8a29e] dark:border-stone-600 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-serif font-bold text-[#44403c] dark:text-stone-100 tracking-widest uppercase">Quittance</h1>
          <p class="text-sm font-mono text-[#78716c] dark:text-stone-400 mt-1">
            N° <span class="text-[#44403c] dark:text-stone-200 font-bold">{{ quittance.numero }}</span>
          </p>
        </div>
        <div class="text-right text-sm font-mono text-[#57534e] dark:text-stone-400 space-y-1">
          <p>Devise : <span class="font-bold text-[#44403c] dark:text-stone-200">{{ quittance.devise?.code || 'N/A' }}</span></p>
          <p>Cours : <span class="font-bold text-[#44403c] dark:text-stone-200">{{ formatNumber(quittance.coursDevise, 4) }}</span></p>
        </div>
      </div>

      <!-- Tableau principal -->
      <table class="w-full text-sm border-collapse">
        
        <!-- SECTION: ÉMISSION -->
        <tbody class="border-b-2 border-[#a8a29e] dark:border-stone-600">
          <tr>
            <th colspan="4" class="bg-[#e7e5e4] dark:bg-stone-800 text-[#44403c] dark:text-stone-100 font-serif font-bold uppercase tracking-widest text-left px-4 py-3 border-b border-[#a8a29e] dark:border-stone-600">
              Émission
            </th>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400 w-1/4">Date d'émission</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200 w-1/4">{{ formatDate(quittance.dateEmission) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400 w-1/4">Date d'effet</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200 w-1/4">{{ formatDate(quittance.dateEffet) }}</td>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Date d'échéance</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatDate(quittance.dateEcheance) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Avis d'échéance</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.avisEcheance) }}</td>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Nbre Échéance PMD</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.nombreEcheancePmd, 0) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Sinistre au comptant</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.sinistreAuComptant) }}</td>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Avis sinistre</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.avisSinistre) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400"></td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200"></td>
          </tr>
        </tbody>

        <!-- SECTION: CAPITAUX -->
        <tbody class="border-b-2 border-[#a8a29e] dark:border-stone-600">
          <tr>
            <th colspan="4" class="bg-[#e7e5e4] dark:bg-stone-800 text-[#44403c] dark:text-stone-100 font-serif font-bold uppercase tracking-widest text-left px-4 py-3 border-b border-[#a8a29e] dark:border-stone-600">
              Capitaux
            </th>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Capitaux</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.capitaux) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">LCI</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.lci) }}</td>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">SMP</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.smp) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Limite</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.limite) }}</td>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Rétention</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.retention) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Conservation</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.conservation) }}</td>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Capacité</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.capacite) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400"></td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200"></td>
          </tr>
        </tbody>

        <!-- SECTION: PRIMES -->
        <tbody class="border-b-2 border-[#a8a29e] dark:border-stone-600">
          <tr>
            <th colspan="4" class="bg-[#e7e5e4] dark:bg-stone-800 text-[#44403c] dark:text-stone-100 font-serif font-bold uppercase tracking-widest text-left px-4 py-3 border-b border-[#a8a29e] dark:border-stone-600">
              Primes
            </th>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Estimation Prime</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.estimationPrime) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Prime Brute</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-100 font-bold">{{ formatNumber(quittance.primeBrute) }}</td>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Prime Nette</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-100 font-bold">{{ formatNumber(quittance.primeNette) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400"></td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200"></td>
          </tr>
        </tbody>

        <!-- SECTION: TAUX ET TAXES -->
        <tbody class="border-b-2 border-[#a8a29e] dark:border-stone-600">
          <tr>
            <th colspan="4" class="bg-[#e7e5e4] dark:bg-stone-800 text-[#44403c] dark:text-stone-100 font-serif font-bold uppercase tracking-widest text-left px-4 py-3 border-b border-[#a8a29e] dark:border-stone-600">
              Taux et Taxes
            </th>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Taux Cession</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatPercent(quittance.tauxCession) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Taux Rétention</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatPercent(quittance.tauxRetention) }}</td>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Taux Cédante</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatPercent(quittance.tauxCedante) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Taux Accepté</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatPercent(quittance.tauxAccepte) }}</td>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Taux Commission</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatPercent(quittance.tauxCommission) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Taxe sur Prime</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.taxeSurPrime) }}</td>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Taxe sur Commission</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.taxeSurCommission) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400"></td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200"></td>
          </tr>
        </tbody>

        <!-- SECTION: AUTRES & RELATIONS -->
        <tbody>
          <tr>
            <th colspan="4" class="bg-[#e7e5e4] dark:bg-stone-800 text-[#44403c] dark:text-stone-100 font-serif font-bold uppercase tracking-widest text-left px-4 py-3 border-b border-[#a8a29e] dark:border-stone-600">
              Autres & Relations
            </th>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Aliment</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ formatNumber(quittance.aliment) }}</td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Mouvement</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">
              {{ quittance.mouvement?.libelle || `ID: ${quittance.mouvementId}` }}
            </td>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Police</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">
              {{ quittance.police?.numero || `ID: ${quittance.policeId}` }}
            </td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Devise (ID)</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">{{ quittance.devise.libelle }}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pied de page -->
      <div class="mt-8 pt-4 border-t border-[#d6d3d1] dark:border-stone-700 text-center">
        <p class="text-xs font-serif italic text-[#78716c] dark:text-stone-500 tracking-wide">
          Document généré électroniquement — Ce tableau récapitulatif a valeur de présentation.
        </p>
      </div>
    </template>
  </div>
</template>