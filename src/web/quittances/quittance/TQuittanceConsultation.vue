<script setup lang="ts">
import TModal from '@/composants/display/TModal.vue'
import TToolTip from '@/composants/display/TToolTip.vue'
import TButton from '@/composants/forms/TButton.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import type { Acteur } from '@/services/acteurs/acteur/acteur'
import type { Campagne } from '@/services/referentiel/campagne/campagne'
import type { SousBranche } from '@/services/referentiel/sous-branche/sous-branche'
import Acteurs from '@/web/acteurs/acteur/Acteurs.vue'
import Quittances from '@/web/quittances/quittance/Quittances.vue'
import Campagnes from '@/web/referentiel/campagne/Campagnes.vue'
import SousBranches from '@/web/referentiel/sous-branche/SousBranches.vue'
import { computed, ref } from 'vue'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'

// ==================== STORE ====================
const quittanceStore = useQuittanceStore()

// ✅ Lecture des filtres depuis le store (computed pour la réactivité)
const acteurCedante = computed(() => quittanceStore.filtreCedante)
const acteurCourtier = computed(() => quittanceStore.filtreCourtier)
const campagne = computed(() => quittanceStore.filtreCampagne)
const sousBranche = computed(() => quittanceStore.filtreSousBranche)

// ==================== MODALES ====================
const showModalActeurCedante = ref(false)
const showModalActeurCourtier = ref(false)
const showModalExercice = ref(false)
const showModalSousBranche = ref(false)

// ==================== HANDLERS DE SÉLECTION ====================
const onChoixExercice = (c: Campagne) => {
  quittanceStore.setFiltreCampagne(c)
  showModalExercice.value = false
}

const onChoixCedante = (cedante: Acteur) => {
  quittanceStore.setFiltreCedante(cedante)
  showModalActeurCedante.value = false
}

const onChoixCourtier = (courtier: Acteur) => {
  quittanceStore.setFiltreCourtier(courtier)
  showModalActeurCourtier.value = false
}

const onChoixSousBranche = (b: SousBranche) => {
  quittanceStore.setFiltreSousBranche(b)
  showModalSousBranche.value = false
}

// ==================== HANDLERS DE RESET ====================
const resetCedante = () => quittanceStore.setFiltreCedante(null)
const resetCourtier = () => quittanceStore.setFiltreCourtier(null)
const resetCampagne = () => quittanceStore.setFiltreCampagne(null)
const resetSousBranche = () => quittanceStore.setFiltreSousBranche(null)
</script>

<template>
  <TLayoutModule
    left-size="20%"
    :show-top="false"
    :show-bottom="false"
  >
    <template #left>
      <div class="flex flex-col">
        <p class="text-sm italic lowercase">Filtre sur quittances</p>

        <!-- ============ CAMPAGNE ============ -->
        <div class="flex items-center">
          <TToolTip
            v-if="campagne"
            class="pt-4"
            position="top"
            content="Cliquez pour retirer le filtre campagne"
          >
            <IconeNonValider @click="resetCampagne" />
          </TToolTip>
          <TToolTip
            position="top"
            content="Cliquez pour afficher toutes les quittances d'une campagne particulière..."
            @click="showModalExercice = true"
          >
            <p
              v-if="campagne"
              class="text-primary-600 text-md uppercase pt-4 cursor-pointer hover:italic dark:text-primary-400"
            >
              {{ campagne.libelle }}
            </p>
            <p
              v-else
              class="text-primary-600 text-md uppercase pt-4 cursor-pointer hover:italic dark:text-primary-400"
            >
              Toutes les Campagnes
            </p>
          </TToolTip>
        </div>

        <!-- ============ CÉDANTE ============ -->
        <div class="flex items-center">
          <TToolTip
            v-if="acteurCedante"
            position="left"
            class="pt-4"
            content="Cliquez pour retirer le filtre cédante"
          >
            <IconeNonValider @click="resetCedante" />
          </TToolTip>
          <TToolTip
           position="left"
            content="Cliquez pour afficher toutes les quittances d'une cédante particulière..."
            @click="showModalActeurCedante = true"
          >
            <p
              v-if="acteurCedante"
              class="text-primary-600 text-md uppercase pt-4 cursor-pointer hover:italic dark:text-primary-400"
            >
              Cédante: {{ acteurCedante.raisonSociale }}
            </p>
            <p
              v-else
              class="text-primary-600 text-md uppercase pt-4 cursor-pointer hover:italic dark:text-primary-400"
            >
              Toutes les cédantes
            </p>
          </TToolTip>
        </div>

        <!-- ============ COURTIER ============ -->
        <div class="flex items-center">
          <TToolTip
            v-if="acteurCourtier"
            position="right"
            class="pt-4"
            content="Cliquez pour retirer le filtre courtier"
          >
            <IconeNonValider @click="resetCourtier" />
          </TToolTip>
          <TToolTip
            position="right"
            content="Cliquez pour afficher toutes les quittances d'un courtier particulier..."
            @click="showModalActeurCourtier = true"
          >
            <p
              v-if="acteurCourtier"
              class="text-primary-600 text-md uppercase pt-4 cursor-pointer hover:italic dark:text-primary-400"
            >
              Courtier: {{ acteurCourtier.raisonSociale }}
            </p>
            <p
              v-else
              class="text-primary-600 text-md uppercase pt-4 cursor-pointer hover:italic dark:text-primary-400"
            >
              Tous les courtiers
            </p>
          </TToolTip>
        </div>

        <!-- ============ SOUS-BRANCHE ============ -->
        <div class="flex items-center">
          <TToolTip
            v-if="sousBranche"
            class="pt-4"
            position="bottom"
            content="Cliquez pour retirer le filtre sous-branche"
          >
            <IconeNonValider @click="resetSousBranche" />
          </TToolTip>
          <TToolTip
            position="bottom"
            content="Cliquez pour afficher les quittances d'une sous-branche particulière..."
            @click="showModalSousBranche = true"
          >
            <p
              v-if="sousBranche"
              class="text-primary-600 text-md uppercase pt-4 cursor-pointer hover:italic dark:text-primary-400"
            >
              {{ sousBranche.libelle }}
            </p>
            <p
              v-else
              class="text-primary-600 text-md uppercase pt-4 cursor-pointer hover:italic dark:text-primary-400"
            >
              Toutes les sous-branches
            </p>
          </TToolTip>
        </div>
      </div>
    </template>

    <template #default>
      <Quittances />
    </template>
  </TLayoutModule>

  <!-- ============ MODALE CÉDANTE ============ -->
  <TModal
    v-model="showModalActeurCedante"
    width="70%"
    height="65%"
    title="Choisissez une cédante"
  >
    <template #default>
      <Acteurs
        :masquer-bouton-action="true"
        @row-click="onChoixCedante"
      />
    </template>
    <template #footer>
      <TButton variant="soft" @click="showModalActeurCedante = false">Fermer</TButton>
    </template>
  </TModal>

  <!-- ============ MODALE COURTIER ============ -->
  <TModal
    v-model="showModalActeurCourtier"
    width="70%"
    height="65%"
    title="Choisissez un courtier"
  >
    <template #default>
      <Acteurs
         :masquer-bouton-action="true"
         :types-filtre="['courtier']" 
        @row-click="onChoixCourtier"
      />
    </template>
    <template #footer>
      <TButton variant="soft" @click="showModalActeurCourtier = false">Fermer</TButton>
    </template>
  </TModal>

  <!-- ============ MODALE CAMPAGNE ============ -->
  <TModal
    v-model="showModalExercice"
    width="70%"
    height="65%"
    title="Choisissez une campagne"
  >
    <template #default>
      <Campagnes
        :masquer-bouton-action="true"
        @row-click="onChoixExercice"
      />
    </template>
    <template #footer>
      <TButton variant="soft" @click="showModalExercice = false">Fermer</TButton>
    </template>
  </TModal>

  <!-- ============ MODALE SOUS-BRANCHE ============ -->
  <TModal
    v-model="showModalSousBranche"
    width="70%"
    height="65%"
    title="Choisissez une sous-branche"
  >
    <template #default>
      <SousBranches
        :masquer-bouton-action="true"
        @row-click="onChoixSousBranche"
      />
    </template>
    <template #footer>
      <TButton variant="soft" @click="showModalSousBranche = false">Fermer</TButton>
    </template>
  </TModal>
</template>