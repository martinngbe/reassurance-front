<script setup lang="ts">

// NOTE: Si vous préférez utiliser le Store comme dans votre base de connaissances, 
// remplacez les lignes ci-dessus par :
import { usePoliceStore } from '@/services/polices/police/police.store';
import { computed } from 'vue';
const policeStore = usePoliceStore();
const police = computed(() => policeStore.currentPolice);

// --- Helpers de formatage ---
const formatBoolean = (value: boolean | undefined, trueLabel: string, falseLabel: string) => {
  if (value === undefined) return '—';
  return value ? trueLabel : falseLabel;
};

const formatIdOrLabel = (entity: any, id: number, labelField: string = 'libelle') => {
  if (entity && entity[labelField]) return entity[labelField];
  if (entity && entity.nom) return entity.nom;
  if (entity && entity.denomination) return entity.denomination;
  return `ID: ${id}`;
};
</script>

<template>
  <!-- Conteneur principal avec support Dark/Light -->
  <div class="max-w-5xl mx-auto p-6 sm:p-8 bg-[#fdfbf7] dark:bg-stone-900 border-2 border-[#d6d3d1] dark:border-stone-700 rounded-sm shadow-lg font-sans text-stone-800 dark:text-stone-200 transition-colors duration-300">
    
    <!-- État vide ou chargement -->
    <div v-if="!police" class="text-center py-12 font-mono text-stone-500 dark:text-stone-400">
      Aucune donnée de police disponible.
    </div>

    <template v-else>
      <!-- En-tête -->
      <div class="mb-8 border-b-2 border-[#a8a29e] dark:border-stone-600 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-serif font-bold text-[#44403c] dark:text-stone-100 tracking-widest uppercase">Police d'Assurance</h1>
          <p class="text-sm font-mono text-[#78716c] dark:text-stone-400 mt-1">
            N° <span class="text-[#44403c] dark:text-stone-200 font-bold">{{ police.numero }}</span>
          </p>
        </div>
        
        <!-- Badges d'état -->
        <div class="flex flex-wrap gap-2 text-xs font-mono font-bold uppercase tracking-wider">
          <span :class="police.isCession 
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' 
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'" 
            class="px-3 py-1 rounded-sm border border-current opacity-80">
            {{ police.isCession ? 'Cession' : 'Acceptation' }}
          </span>
          
          <span v-if="police.isIard !== undefined" :class="police.isIard 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' 
            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200'" 
            class="px-3 py-1 rounded-sm border border-current opacity-80">
            {{ police.isIard ? 'IARD' : 'Vie' }}
          </span>

          <span v-if="police.isFac !== undefined" :class="police.isFac 
            ? 'bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200' 
            : 'bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200'" 
            class="px-3 py-1 rounded-sm border border-current opacity-80">
            {{ police.isFac ? 'FAC' : 'Traité' }}
          </span>
        </div>
      </div>

      <!-- Tableau principal -->
      <table class="w-full text-sm border-collapse">
        
        <!-- SECTION: CARACTÉRISTIQUES DU CONTRAT -->
        <tbody class="border-b-2 border-[#a8a29e] dark:border-stone-600">
          <tr>
            <th colspan="4" class="bg-[#e7e5e4] dark:bg-stone-800 text-[#44403c] dark:text-stone-100 font-serif font-bold uppercase tracking-widest text-left px-4 py-3 border-b border-[#a8a29e] dark:border-stone-600">
              Caractéristiques du Contrat
            </th>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400 w-1/4">Nature d'offre</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200 w-1/4">
              {{ formatIdOrLabel(police.natureOffre, police.natureOffreId, 'libelle') }}
            </td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400 w-1/4">Sous-branche</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200 w-1/4">
              {{ formatIdOrLabel(police.sousBranche, police.sousBrancheId, 'libelle') }}
            </td>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Reconduction tacite</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">
              {{ formatBoolean(police.isReconductionTacite, 'Oui', 'Non') }}
            </td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400"></td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200"></td>
          </tr>
        </tbody>

        <!-- SECTION: PARTIES PRENANTES -->
        <tbody>
          <tr>
            <th colspan="4" class="bg-[#e7e5e4] dark:bg-stone-800 text-[#44403c] dark:text-stone-100 font-serif font-bold uppercase tracking-widest text-left px-4 py-3 border-b border-[#a8a29e] dark:border-stone-600">
              Parties Prenantes
            </th>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Cédante</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">
              {{ formatIdOrLabel(police.acteurCedante, police.acteurCedanteId, 'raisonSociale') }}
            </td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Courtier</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">
              {{ police.acteurCourtier && police.acteurCourtierId
                ? formatIdOrLabel(police.acteurCourtier, police.acteurCourtierId, 'raisonSociale') 
                : '—' }}
            </td>
          </tr>
          <tr class="hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors">
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400">Assuré</td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200">
              {{ police.assure && police.assureId
                ? formatIdOrLabel(police.assure, police.assureId, 'raisonSociale') 
                : '—' }}
            </td>
            <td class="px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400"></td>
            <td class="px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200"></td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pied de page -->
      <div class="mt-8 pt-4 border-t border-[#d6d3d1] dark:border-stone-700 text-center">
        <p class="text-xs font-serif italic text-[#78716c] dark:text-stone-500 tracking-wide">
          Document généré électroniquement — Fiche récapitulative de police.
        </p>
      </div>
    </template>
  </div>
</template>