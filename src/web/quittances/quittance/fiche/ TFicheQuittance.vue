<script setup lang="ts">
import { computed } from 'vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';

// ─── Props ───────────────────────────────────────────────────────────────────
// `masqueAutreRelations` est conservée pour compatibilité (la section est désactivée).
const props = defineProps<{
  masqueEntete?: boolean;
  masqueEmission?: boolean;
  masqueCapitaux?: boolean;
  masquePrime?: boolean;
  masqueTauxEtTaxes?: boolean;
  masqueAutreRelations?: boolean;
}>();

// ─── Données ─────────────────────────────────────────────────────────────────
const quittance = computed(() => useQuittanceStore().currentQuittance);
const natureOffre = computed(() => quittance.value?.police?.natureOffre);

const isProportionnelle = computed(() => !!natureOffre.value?.isProportionnelle);
const isXs = computed(() => !!natureOffre.value?.isXs);
const isNonProportionnelleHorsXs = computed(() => !isProportionnelle.value && !isXs.value);

// ─── Formatage ───────────────────────────────────────────────────────────────
const EMPTY = '—';
const isEmpty = (v: unknown): v is null | undefined => v === undefined || v === null;

const formatNumber = (value?: number | null, decimals = 2) =>
  isEmpty(value)
    ? EMPTY
    : new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);

const formatPercent = (value?: number | null) =>
  isEmpty(value) ? EMPTY : `${formatNumber(value)} %`;

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : EMPTY;

// ─── Description du tableau ──────────────────────────────────────────────────
// Un champ = un couple libellé / valeur. Une ligne = 1 ou 2 champs.
// Un champ avec `show: false` n'est pas affiché ; une ligne sans champ visible disparaît.
interface Field {
  label: string;
  value: string;
  show?: boolean;
  bold?: boolean;
}
interface Section {
  title: string;
  visible: boolean;
  rows: Field[][];
}

const sections = computed<Section[]>(() => {
  const q = quittance.value;
  if (!q) return [];

  const prop = isProportionnelle.value;
  const xs = isXs.value;
  const horsXs = isNonProportionnelleHorsXs.value;

  const allSections: Section[] = [
    {
      title: 'Émission',
      visible: !props.masqueEmission,
      rows: [
        [
          { label: "Date d'émission", value: formatDate(q.dateEmission) },
          { label: "Date d'effet", value: formatDate(q.dateEffet) },
        ],
        [
          { label: "Date d'échéance", value: formatDate(q.dateEcheance) },
          { label: "Avis d'échéance", value: formatNumber(q.avisEcheance) },
        ],
        [
          { label: 'Nbre Échéance PMD', value: formatNumber(q.nombreEcheancePmd, 0), show: !prop },
          { label: 'Nbre Tranche', value: formatNumber(q.nombreTranche), show: !prop && xs },
        ],
        [
          { label: 'Avis sinistre', value: formatNumber(q.avisSinistre) },
          { label: 'Sinistre au comptant', value: formatNumber(q.sinistreAuComptant) },
        ],
      ],
    },
    {
      title: 'Capitaux',
      visible: !props.masqueCapitaux,
      rows: [
        [
          { label: 'Capitaux', value: formatNumber(q.capitaux), show: prop },
          { label: 'LCI', value: formatNumber(q.lci), show: prop },
        ],
        [{ label: 'SMP', value: formatNumber(q.smp), show: prop }],
        [
          { label: 'Rétention', value: formatNumber(q.retention), show: horsXs },
          { label: 'Conservation', value: formatNumber(q.conservation), show: horsXs },
        ],
        [
          { label: 'Capacité', value: formatNumber(q.capacite), show: horsXs },
          { label: 'Limite', value: formatNumber(q.limite), show: horsXs },
        ],
        [
          { label: 'Priorité', value: formatNumber(q.priorite), show: xs },
          { label: 'Portée', value: formatNumber(q.portee), show: xs },
        ],
      ],
    },
    {
      title: 'Primes',
      visible: !props.masquePrime,
      rows: [
        [
          { label: 'Prime Brute', value: formatNumber(q.primeBrute), show: prop, bold: true },
          { label: 'Prime Cédée', value: formatNumber(q.primeCedee), show: prop, bold: true },
        ],
        [
          { label: 'Prime Acceptée', value: formatNumber(q.primeAcceptee), show: prop, bold: true },
          { label: 'Prime Nette', value: formatNumber(q.primeNette), show: prop, bold: true },
        ],
        [{ label: 'Estimation Prime', value: formatNumber(q.estimationPrime), show: !prop }],
      ],
    },
    {
      title: 'Taux et Taxes',
      visible: !props.masqueTauxEtTaxes && prop,
      rows: [
        [
          { label: 'Taux Cédante', value: formatPercent(q.tauxCedante) },
          { label: 'Taux Accepté', value: formatPercent(q.tauxAccepte) },
        ],
        [
          { label: 'Taux Commission', value: formatPercent(q.tauxCommission) },
          { label: 'Taxe sur Commission', value: formatNumber(q.taxeSurCommission) },
        ],
        [{ label: 'Taxe sur Prime', value: formatNumber(q.taxeSurPrime) }],
      ],
    },
  ];

  return allSections
    .filter((section) => section.visible)
    .map((section) => ({
      ...section,
      rows: section.rows
        .map((row) => row.filter((field) => field.show !== false))
        .filter((row) => row.length > 0),
    }));
});

// ─── Classes Tailwind (clair / sombre) ───────────────────────────────────────
const css = {
  card: 'max-w-5xl mx-auto p-6 sm:p-8 bg-[#fdfbf7] dark:bg-stone-900 border-2 border-[#d6d3d1] dark:border-stone-700 rounded-sm shadow-lg font-sans text-stone-800 dark:text-stone-200 transition-colors duration-300',
  header: 'mb-8 border-b-2 border-[#a8a29e] dark:border-stone-600 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4',
  sectionBody: 'border-b-2 border-[#a8a29e] dark:border-stone-600',
  sectionTitle: 'bg-[#e7e5e4] dark:bg-stone-800 text-[#44403c] dark:text-stone-100 font-serif font-bold uppercase tracking-widest text-left px-4 py-3 border-b border-[#a8a29e] dark:border-stone-600',
  row: 'hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors',
  label: 'px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400 w-1/4',
  value: 'px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200 w-1/4',
  valueBold: 'font-bold dark:text-stone-100',
  strong: 'font-bold text-[#44403c] dark:text-stone-200',
};
</script>

<template>
  <div :class="css.card">
    <!-- État vide -->
    <div v-if="!quittance" class="text-center py-12 font-mono text-stone-500 dark:text-stone-400">
      Aucune donnée de quittance disponible.
    </div>

    <template v-else>
      <!-- En-tête -->
      <div v-if="!props.masqueEntete" :class="css.header">
        <div>
          <h1 class="text-2xl sm:text-3xl font-serif font-bold text-[#44403c] dark:text-stone-100 tracking-widest uppercase">
            Quittance
          </h1>
          <p class="text-sm font-mono text-[#78716c] dark:text-stone-400 mt-1">
            N° <span :class="css.strong">{{ quittance.numero }}</span>
          </p>
        </div>
        <div class="text-right text-sm font-mono text-[#57534e] dark:text-stone-400 space-y-1">
          <p>Devise : <span :class="css.strong">{{ quittance.devise?.code || 'N/A' }}</span></p>
          <p>Cours : <span :class="css.strong">{{ formatNumber(quittance.coursDevise, 4) }}</span></p>
        </div>
      </div>

      <!-- Tableau principal : une section par bloc -->
      <table class="w-full text-sm border-collapse">
        <tbody v-for="section in sections" :key="section.title" :class="css.sectionBody">
          <tr>
            <th colspan="4" :class="css.sectionTitle">{{ section.title }}</th>
          </tr>
          <tr v-for="(row, i) in section.rows" :key="i" :class="css.row">
            <template v-for="field in row" :key="field.label">
              <td :class="css.label">{{ field.label }}</td>
              <td :class="[css.value, field.bold && css.valueBold]">{{ field.value }}</td>
            </template>
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