<script setup lang="ts">
import { computed } from 'vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import { useCumulTauxCession } from '@/services/quittances/quittance-placement/useCumulTauxCession';
import { formatInteger } from '@/utilitaire/number';

// ─── Données ─────────────────────────────────────────────────────────────────
const quittance = computed(() => useQuittanceStore().currentQuittance);
const isProportionnelle = computed(() => !!quittance.value?.police?.natureOffre?.isProportionnelle);

// Cumul des taux de cession des placements actifs de la quittance
const quittanceId = computed(() => quittance.value?.id ?? null);
const { cumulTauxCession, nombrePlacementsActifs } = useCumulTauxCession(quittanceId);

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

  const allSections: Section[] = [
    {
      title: 'Primes',
      visible: true,
      rows: [
        [
          { label: 'Prime Brute', value: formatNumber(q.primeBrute), show: prop, bold: true },
          { label: 'Estimation de prime', value: formatNumber(q.estimationPrime), show: !prop, bold: true },
        ],
      ],
    },
    {
      title: 'Taux',
      visible: prop,
      rows: [
        [
          { label: 'Tx Cédante', value: formatPercent(q.tauxCedante) },
          { label: 'Tx Notre part', value: formatPercent(q.tauxAccepte) },
        ],
      ],
    },
    {
      title: 'Cumul Placement',
      visible: true,
      rows: [
        [
          { label: 'Taux', value: formatPercent(cumulTauxCession.value) },
          { label: 'NB Placement', value: formatInteger(nombrePlacementsActifs.value) },
        ],
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
  sectionBody: 'border-b-2 border-[#a8a29e] dark:border-stone-600',
  sectionTitle: 'bg-[#e7e5e4] dark:bg-stone-800 text-[#44403c] dark:text-stone-100 font-serif font-bold uppercase tracking-widest text-left px-4 py-3 border-b border-[#a8a29e] dark:border-stone-600',
  row: 'hover:bg-[#f5f5f4] dark:hover:bg-stone-800/50 transition-colors',
  label: 'px-4 py-2.5 font-medium text-[#57534e] dark:text-stone-400',
  value: 'px-4 py-2.5 font-mono text-[#292524] dark:text-stone-200',
  valueBold: 'font-bold dark:text-stone-100',
};
</script>

<template>
  <div :class="css.card">
    <!-- État vide -->
    <div v-if="!quittance" class="text-center py-12 font-mono text-stone-500 dark:text-stone-400">
      Aucune donnée de quittance disponible.
    </div>

    <!-- Tableau principal : une section par bloc -->
    <table v-else class="w-full text-sm border-collapse">
      <tbody v-for="section in sections" :key="section.title" :class="css.sectionBody">
        <tr>
          <th colspan="4" :class="css.sectionTitle">{{ section.title }}</th>
        </tr>
        <tr v-for="(row, i) in section.rows" :key="i" :class="css.row">
          <template v-for="field in row" :key="field.label">
            <!-- Ligne à un seul champ : le libellé occupe 2 colonnes -->
            <td :colspan="row.length === 1 ? 2 : 1" :class="css.label">{{ field.label }}</td>
            <td :class="[css.value, field.bold && css.valueBold]">{{ field.value }}</td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>