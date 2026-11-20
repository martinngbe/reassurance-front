<script setup lang="ts">
import TModal from '@/composants/display/TModal.vue'
import TButton from '@/composants/forms/TButton.vue'
import type { Acteur } from '@/services/acteurs/acteur/acteur'
import type { Campagne } from '@/services/referentiel/campagne/campagne'
import type { SousBranche } from '@/services/referentiel/sous-branche/sous-branche'
import Acteurs from '@/web/acteurs/acteur/Acteurs.vue'
import Quittances from '@/web/quittances/quittance/Quittances.vue'
import Campagnes from '@/web/referentiel/campagne/Campagnes.vue'
import SousBranches from '@/web/referentiel/sous-branche/SousBranches.vue'
// ⚠️ Ajuste le chemin d'import selon ton projet
import NatureOffres from '@/web/referentiel/nature-offre/NatureOffres.vue' 

import { computed, ref } from 'vue'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'
import type { NatureOffre } from '@/services/referentiel/nature-offre/nanture-offre'

// ==================== STORE ====================
const quittanceStore = useQuittanceStore()
const acteurCedante = computed(() => quittanceStore.filtreCedante)
const acteurCourtier = computed(() => quittanceStore.filtreCourtier)
const campagne = computed(() => quittanceStore.filtreCampagne)
const sousBranche = computed(() => quittanceStore.filtreSousBranche)
const natureOffre = computed(() => quittanceStore.filtreNatureOffre)

// Compteur pour le badge animé
const activeFiltersCount = computed(() =>
  [acteurCedante.value, acteurCourtier.value, campagne.value, sousBranche.value, natureOffre.value]
    .filter(Boolean).length
)

// ==================== MODALES ====================
const showModalActeurCedante = ref(false)
const showModalActeurCourtier = ref(false)
const showModalExercice = ref(false)
const showModalSousBranche = ref(false)
const showModalNatureOffre = ref(false)

// ==================== HANDLERS ====================
const onChoixExercice = (c: Campagne) => { quittanceStore.setFiltreCampagne(c); showModalExercice.value = false }
const onChoixCedante = (a: Acteur) => { quittanceStore.setFiltreCedante(a); showModalActeurCedante.value = false }
const onChoixCourtier = (a: Acteur) => { quittanceStore.setFiltreCourtier(a); showModalActeurCourtier.value = false }
const onChoixSousBranche = (b: SousBranche) => { quittanceStore.setFiltreSousBranche(b); showModalSousBranche.value = false }
const onChoixNatureOffre = (n: NatureOffre) => { quittanceStore.setFiltreNatureOffre(n); showModalNatureOffre.value = false }

const clearAllFilters = () => quittanceStore.resetFiltres()
</script>

<template>
  <div class="futuristic-wrapper">
    <!-- ============ BARRE DE FILTRES FUTURISTE ============ -->
    <div class="glass-filter-bar">
      <div class="filter-header">
        <div class="title-group">
          <h2 class="neon-title">Filtres</h2>
          <span v-if="activeFiltersCount > 0" class="glow-badge">
            {{ activeFiltersCount }}
          </span>
        </div>
        
        <button v-if="activeFiltersCount > 0" class="btn-clear-all" @click="clearAllFilters">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
          </svg>
          Réinitialiser
        </button>
      </div>

      <div class="chips-container">
        <!-- CAMPAGNE -->
        <button class="filter-chip" :class="{ active: campagne }" @click="showModalExercice = true">
          <span class="chip-icon">📅</span>
          <span class="chip-label">{{ campagne ? campagne.libelle : 'Toutes les campagnes' }}</span>
          <button v-if="campagne" class="chip-close-btn" @click.stop="quittanceStore.setFiltreCampagne(null)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </button>

        <!-- CÉDANTE -->
        <button class="filter-chip" :class="{ active: acteurCedante }" @click="showModalActeurCedante = true">
          <span class="chip-icon">🏢</span>
          <span class="chip-label">{{ acteurCedante ? acteurCedante.raisonSociale : 'Toutes les cédantes' }}</span>
          <button v-if="acteurCedante" class="chip-close-btn" @click.stop="quittanceStore.setFiltreCedante(null)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </button>

        <!-- COURTIER -->
        <button class="filter-chip" :class="{ active: acteurCourtier }" @click="showModalActeurCourtier = true">
          <span class="chip-icon">🤝</span>
          <span class="chip-label">{{ acteurCourtier ? acteurCourtier.raisonSociale : 'Tous les courtiers' }}</span>
          <button v-if="acteurCourtier" class="chip-close-btn" @click.stop="quittanceStore.setFiltreCourtier(null)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </button>

        <!-- SOUS-BRANCHE -->
        <button class="filter-chip" :class="{ active: sousBranche }" @click="showModalSousBranche = true">
          <span class="chip-icon">🌿</span>
          <span class="chip-label">{{ sousBranche ? sousBranche.libelle : 'Toutes les sous-branches' }}</span>
          <button v-if="sousBranche" class="chip-close-btn" @click.stop="quittanceStore.setFiltreSousBranche(null)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </button>

        <!-- NATURE DE L'OFFRE (NOUVEAU) -->
        <button class="filter-chip" :class="{ active: natureOffre }" @click="showModalNatureOffre = true">
          <span class="chip-icon">✨</span>
          <span class="chip-label">{{ natureOffre ? natureOffre.libelle : 'Toutes les offres' }}</span>
          <button v-if="natureOffre" class="chip-close-btn" @click.stop="quittanceStore.setFiltreNatureOffre(null)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </button>
      </div>
    </div>

    <!-- ============ TABLE ============ -->
    <div class="table-container">
      <Quittances />
    </div>
  </div>

  <!-- ============ MODALES ============ -->
  <TModal v-model="showModalActeurCedante" width="70%" height="65%" title="Choisissez une cédante">
    <template #default><Acteurs :masquer-bouton-action="true" @row-click="onChoixCedante" /></template>
    <template #footer><TButton variant="soft" @click="showModalActeurCedante = false">Fermer</TButton></template>
  </TModal>

  <TModal v-model="showModalActeurCourtier" width="70%" height="65%" title="Choisissez un courtier">
    <template #default><Acteurs :masquer-bouton-action="true" :types-filtre="['courtier']" @row-click="onChoixCourtier" /></template>
    <template #footer><TButton variant="soft" @click="showModalActeurCourtier = false">Fermer</TButton></template>
  </TModal>

  <TModal v-model="showModalExercice" width="70%" height="65%" title="Choisissez une campagne">
    <template #default><Campagnes :masquer-bouton-action="true" @row-click="onChoixExercice" /></template>
    <template #footer><TButton variant="soft" @click="showModalExercice = false">Fermer</TButton></template>
  </TModal>

  <TModal v-model="showModalSousBranche" width="70%" height="65%" title="Choisissez une sous-branche">
    <template #default><SousBranches :masquer-bouton-action="true" @row-click="onChoixSousBranche" /></template>
    <template #footer><TButton variant="soft" @click="showModalSousBranche = false">Fermer</TButton></template>
  </TModal>

  <TModal v-model="showModalNatureOffre" width="70%" height="65%" title="Choisissez une nature d'offre">
    <template #default><NatureOffres :masquer-bouton-action="true" @row-click="onChoixNatureOffre" /></template>
    <template #footer><TButton variant="soft" @click="showModalNatureOffre = false">Fermer</TButton></template>
  </TModal>
</template>

<style scoped>
/* ============ LAYOUT GLOBAL ============ */
.futuristic-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
}

.table-container {
  flex: 1;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.1);
  background: rgba(15, 23, 42, 0.4);
  /* ✅ Légère ombre pour détacher la table du fond */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* ============ BARRE DE FILTRES GLASSMORPHISM ============ */
.glass-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  /* Ombre classique + Glow coloré subtil (visible en Light) */
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.1),
    0 0 20px rgba(16, 185, 129, 0.08); 
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.neon-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
}

.glow-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  border-radius: 999px;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 12px rgba(16, 185, 129, 0.6); }
  50% { box-shadow: 0 0 20px rgba(16, 185, 129, 1); }
}

.btn-clear-all {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear-all:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.4);
  transform: translateY(-1px);
}

/* ============ CHIPS DE FILTRES ============ */
.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #cbd5e1;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.filter-chip:hover {
  transform: translateY(-2px);
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.filter-chip.active {
  color: #fff;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2));
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3), 0 4px 16px rgba(16, 185, 129, 0.2);
}

.chip-icon { font-size: 1rem; filter: grayscale(0.3); }
.chip-label { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ✅ BOUTON FERMETURE (X) - 100% FIABLE */
.chip-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-left: 0.25rem;
  padding: 0;
  background: rgba(248, 113, 113, 0.15);
  border: none;
  border-radius: 50%;
  color: #f87171;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip-close-btn:hover {
  background: rgba(248, 113, 113, 0.3);
  transform: scale(1.15) rotate(90deg);
}

.chip-close-btn svg {
  width: 10px;
  height: 10px;
}

/* ============ RESPONSIVE ============ */

@media (max-width: 768px) {
  .chips-container {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
  }
  .chip-label { max-width: 120px; }
}
.table-container {
  flex: 1;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.1);
  background: rgba(15, 23, 42, 0.4);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
/* ==========================================
   ✅ MODE DARK (Syntaxe CSS corrigée)
   ========================================== */

/* 1. Si tu utilises Tailwind avec la classe .dark sur le <html> ou <body> */
:global(.dark) .glass-filter-bar {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%);
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.6), 
    0 0 30px rgba(16, 185, 129, 0.15);
}

:global(.dark) .table-container {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(16, 185, 129, 0.15);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

/* 2. Si tu relies sur les préférences natives du système d'exploitation */
@media (prefers-color-scheme: dark) {
  .glass-filter-bar {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%);
    border-color: rgba(16, 185, 129, 0.3);
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.6), 
      0 0 30px rgba(16, 185, 129, 0.15);
  }

  .table-container {
    background: rgba(15, 23, 42, 0.6);
    border-color: rgba(16, 185, 129, 0.15);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
}
</style>