<script setup lang="ts">
import { computed } from 'vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import TDisplayNumber from '@/composants/utilitaire/TDisplayNumber.vue';
import TDisplayPourCentage from '@/composants/utilitaire/TDisplayPourCentage.vue';

// ─── Données ─────────────────────────────────────────────────────────────────
const quittance = computed(() => useQuittanceStore().currentQuittance);
const listeTranches = computed(() => quittance.value?.quittanceTranches ?? []);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const isEmpty = (v: unknown): v is null | undefined => v === undefined || v === null;
const EMPTY = '—';

// ─── Totaux ──────────────────────────────────────────────────────────────────
const estimationPrime = computed(() => quittance.value?.estimationPrime ?? 0);
const totaux = computed(() => {
  const actifs = listeTranches.value.filter((t) => !t.isAnnule);
  return {
   // estimation: actifs.reduce((s, t) => s + (t.estimationPrime ?? 0), 0),
    nette: actifs.reduce((s, t) => s + (t.primeTranche ?? 0), 0),
    count: actifs.length,
  };
});

// ─── Styles ──────────────────────────────────────────────────────────────────
const css = {
  card: 'w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg shadow-sm',
  header:
    'flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800',
  title: 'text-sm font-semibold tracking-wide text-stone-900 dark:text-stone-100 uppercase',
  subtitle: 'text-xs text-stone-500 dark:text-stone-400 font-mono',
  empty: 'px-6 py-16 text-center text-sm text-stone-400 dark:text-stone-500 font-mono',
  table: 'w-full text-sm border-collapse',
  thead: 'bg-stone-50 dark:bg-stone-900',
  th: 'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800',
  thNum: 'px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800',
  td: 'px-4 py-3 text-stone-700 dark:text-stone-300 border-b border-stone-100 dark:border-stone-900',
  tdNum: 'px-4 py-3 text-right text-stone-700 dark:text-stone-300 border-b border-stone-100 dark:border-stone-900 tabular-nums font-mono',
  row: 'hover:bg-stone-50/60 dark:hover:bg-stone-900/40 transition-colors',
  rowAnnule: 'opacity-50 line-through hover:bg-stone-50/60 dark:hover:bg-stone-900/40 transition-colors',
  badge: 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  tfoot: 'bg-stone-50/60 dark:bg-stone-900/40',
  tfootLabel: 'px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 border-t-2 border-stone-200 dark:border-stone-800',
  tfootValue: 'px-4 py-3 text-right text-sm font-semibold text-stone-900 dark:text-stone-100 border-t-2 border-stone-200 dark:border-stone-800 tabular-nums font-mono',
};
</script>

<template>
  <div :class="css.card">
    <!-- En-tête -->
    <div :class="css.header">
      <div>
        <div :class="css.title">Tranches</div>
        <div :class="css.subtitle">Répartition par tranche</div>
      </div>
      <div v-if="quittance" :class="css.subtitle">
        Quittance n° {{ quittance.numero }}
      </div>
    </div>

    <!-- État vide -->
    <div v-if="!quittance" :class="css.empty">Aucune donnée de quittance disponible.</div>
    <div v-else-if="listeTranches.length === 0" :class="css.empty">
      Aucune tranche enregistrée.
    </div>

    <!-- Tableau -->
    <table v-else :class="css.table">
      <thead :class="css.thead">
        <tr>
          <th :class="css.thNum">N° Tranche</th>
          <th :class="css.thNum">Estimation prime</th>
          <th :class="css.thNum">Taux prime</th>
          <th :class="css.thNum">Taux commission</th>
          <th :class="css.thNum">Prime Tranche</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="tranche in listeTranches"
          :key="tranche.id"
          :class="tranche.isAnnule ? css.rowAnnule : css.row"
        >
          <td :class="css.tdNum">
            <div class="flex items-center justify-end gap-2">
              <span>{{ tranche.numeroTranche ?? EMPTY }}</span>
              <span v-if="tranche.isAnnule" :class="css.badge">Annulé</span>
            </div>
          </td>

          <td :class="css.tdNum">
            <TDisplayNumber v-if="!isEmpty(tranche.estimationPrime)" :value="tranche.estimationPrime" />
            <span v-else>{{ EMPTY }}</span>
          </td>

          <td :class="css.tdNum">
            <TDisplayPourCentage v-if="!isEmpty(tranche.tauxPrime)" :value="tranche.tauxPrime" />
            <span v-else>{{ EMPTY }}</span>
          </td>

          <td :class="css.tdNum">
            <TDisplayPourCentage v-if="!isEmpty(tranche.tauxCommission)" :value="tranche.tauxCommission" />
            <span v-else>{{ EMPTY }}</span>
          </td>

          <td :class="css.tdNum">
            <TDisplayNumber v-if="!isEmpty(tranche.primeTranche)" :value="tranche.primeTranche" />
            <span v-else>{{ EMPTY }}</span>
          </td>
        </tr>
      </tbody>

      <!-- Totaux -->
      <tfoot :class="css.tfoot">
        <tr>
          <td :class="css.tfootLabel" colspan="1">
            {{ totaux.count }} tranche{{ totaux.count > 1 ? 's' : '' }} active{{ totaux.count > 1 ? 's' : '' }}
          </td>
          <td :class="css.tfootValue">
            <TDisplayNumber :value="estimationPrime" />
          </td>
          <td :class="css.tfootValue">—</td>
          <td :class="css.tfootValue">—</td>
          <td :class="css.tfootValue">
            <TDisplayNumber :value="totaux.nette" />
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>