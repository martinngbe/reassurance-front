<script setup lang="ts">
import { computed } from 'vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import TDisplayNumber from '@/composants/utilitaire/TDisplayNumber.vue';
import TDisplayPourCentage from '@/composants/utilitaire/TDisplayPourCentage.vue';

// ─── Données ─────────────────────────────────────────────────────────────────
const quittance = computed(() => useQuittanceStore().currentQuittance);
const listeSecurite = computed(() => quittance.value?.quittancePlacements ?? []);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const isEmpty = (v: unknown): v is null | undefined => v === undefined || v === null;
const EMPTY = '—';

const estimationPrime = computed(() => quittance.value?.estimationPrime ?? 0);
// ─── Totaux ──────────────────────────────────────────────────────────────────
const totaux = computed(() => {
  const actifs = listeSecurite.value.filter((p) => !p.isAnnule);
  return {
    //estimation: actifs.reduce((s, p) => s + (p.estimationPrime ?? 0), 0),
    cedee: actifs.reduce((s, p) => {
      if (isEmpty(p.estimationPrime) || isEmpty(p.tauxCession)) return s;
      return s + (p.estimationPrime! * p.tauxCession!) / 100;
    }, 0),
    commission: actifs.reduce((s, p) => s + (p.commissionFixe ?? 0), 0),
    nette: actifs.reduce((s, p) => s + (p.primeNette ?? 0), 0),
    count: actifs.length,
  };
});

// ─── Styles ──────────────────────────────────────────────────────────────────
const css = {
  card: 'w-full bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg shadow-sm',
  header: 'flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800',
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
        <div :class="css.title">Liste de sécurité</div>
        <div :class="css.subtitle">Placements auprès des réassureurs</div>
      </div>
      <div v-if="quittance" :class="css.subtitle">
        Quittance n° {{ quittance.numero }}
      </div>
    </div>

    <!-- État vide -->
    <div v-if="!quittance" :class="css.empty">Aucune donnée de quittance disponible.</div>
    <div v-else-if="listeSecurite.length === 0" :class="css.empty">
      Aucun placement enregistré.
    </div>

    <!-- Tableau -->
    <table v-else :class="css.table">
      <thead :class="css.thead">
        <tr>
          <th :class="css.th">Rétrocessionnaire</th>
          <th :class="css.th">Nature</th>
          <th :class="css.thNum">Taux cession</th>
          <th :class="css.thNum">Estimation prime</th>
          <th :class="css.thNum">Prime cédée</th>
          <th :class="css.thNum">Tx cie</th>
          <th :class="css.thNum">Commission</th>
          <th :class="css.thNum">Prime nette</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="securite in listeSecurite"
          :key="securite.id ?? securite.acteurId"
          :class="securite.isAnnule ? css.rowAnnule : css.row"
        >
          <td :class="css.td">
            <div class="flex items-center gap-2">
              <span>{{ securite.acteur?.raisonSociale ?? EMPTY }}</span>
              <span v-if="securite.isAnnule" :class="css.badge">Annulé</span>
            </div>
          </td>
          <td :class="css.td">{{ securite.naturePlacement?.libelle ?? EMPTY }}</td>

          <td :class="css.tdNum">
            <TDisplayPourCentage v-if="!isEmpty(securite.tauxCession)" :value="securite.tauxCession" />
            <span v-else>{{ EMPTY }}</span>
          </td>

          <td :class="css.tdNum">
            <TDisplayNumber v-if="!isEmpty(securite.estimationPrime)" :value="securite.estimationPrime" />
            <span v-else>{{ EMPTY }}</span>
          </td>

          <td :class="css.tdNum">
            <TDisplayNumber
              v-if="!isEmpty(securite.estimationPrime) && !isEmpty(securite.tauxCession)"
              :value="(securite.estimationPrime! * securite.tauxCession!) / 100"
            />
            <span v-else>{{ EMPTY }}</span>
          </td>

          <td :class="css.tdNum">
            <TDisplayPourCentage v-if="!isEmpty(securite.tauxCommission)" :value="securite.tauxCommission" />
            <span v-else>{{ EMPTY }}</span>
          </td>

          <td :class="css.tdNum">
            <TDisplayNumber v-if="!isEmpty(securite.commissionFixe)" :value="securite.commissionFixe" />
            <span v-else>{{ EMPTY }}</span>
          </td>

          <td :class="css.tdNum">
            <TDisplayNumber v-if="!isEmpty(securite.primeNette)" :value="securite.primeNette" />
            <span v-else>{{ EMPTY }}</span>
          </td>
        </tr>
      </tbody>

      <!-- Totaux -->
      <tfoot :class="css.tfoot">
        <tr>
          <td :class="css.tfootLabel" colspan="3">
            {{ totaux.count }} placement{{ totaux.count > 1 ? 's' : '' }} actif{{ totaux.count > 1 ? 's' : '' }}
          </td>
          <td :class="css.tfootValue">
            <TDisplayNumber :value="estimationPrime" />
          </td>
          <td :class="css.tfootValue">
            <TDisplayNumber :value="totaux.cedee" />
          </td>
          <td :class="css.tfootValue">—</td>
          <td :class="css.tfootValue">
            <TDisplayNumber :value="totaux.commission" />
          </td>
          <td :class="css.tfootValue">
            <TDisplayNumber :value="totaux.nette" />
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>