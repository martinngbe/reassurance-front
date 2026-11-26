<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState } from '@/composants/forms/common'
import { computed, ref, toValue, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import type { PaginationParams } from '@/type/pagination.ts'
import { useQuittances } from '@/services/quittances/quittance/useQuittance'
import { quittanceAllColumns, type Quittance } from '@/services/quittances/quittance/quittance'
import { formatDecimal } from '@/utilitaire/number'
import TDisplayNumber from '@/composants/utilitaire/TDisplayNumber.vue'
import { usePoliceStore } from '@/services/polices/police/police.store'
import IconeValider from '@/composants/icone/IconeValider.vue'
import TModal from '@/composants/display/TModal.vue'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store.ts'
import TAction from '@/composants/utilitaire/TAction.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import { 
  ECRAN_BORDEREAU, ECRAN_COMPTE, ECRAN_CONSULTATION, ECRAN_ECHEANCE_PMD, 
  ECRAN_FACULTATIVE, ECRAN_PLACEMENT, ECRAN_TRANCHE, MODULE_CESSION, 
  useEcransStore 
} from '@/services/ecrans/ecrans.store.ts'
import TQuittanceForm from './TQuittanceForm.vue'
import TQuittanceVueSynoptique from './TQuittanceVueSynoptique.vue'
import TButton from '@/composants/forms/TButton.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import QuittanceInfoPolice from './fiche/QuittanceInfoPolice.vue'
import TFicheQuittance from './fiche/ TFicheQuittance.vue'
import type { MenuItem } from '@/composants/menu-contextuel/contextMenu.ts'
import { useContextMenu } from '@/composants/menu-contextuel/useContextMenu.ts'
import TQuittancePlacement from '../quittance-placement/TQuittancePlacement.vue'
import { useQuittancePlacementStore } from '@/services/quittances/quittance-placement/quittance-placement.store.ts'
import { useQuittanceTrancheStore } from '@/services/quittances/quittance-tranche/quittance-tranche.store.ts'
import TQuittanceTranche from '../quittance-tranche/TQuittanceTranche.vue'
import { quittanceApi } from '@/services/quittances/quittance/quittance.api.ts'
import TPdfViewer from '@/composants/display/TPdfViewer.vue'

const titreFenetre = ref('QUITTANCES')
const { success, info ,error } = useToast()
const ecranStore = useEcransStore()
const policeStore = usePoliceStore()
const quittanceStore = useQuittanceStore()
const quittancePlacementStore = useQuittancePlacementStore()
const quittanceTrancheStore = useQuittanceTrancheStore()

const currentPolice = policeStore.currentPolice
const natureOffre = currentPolice?.natureOffre
const quittanceSelected = ref<QuittanceRow | null>(null)
//  ==================== ⭐ ÉTAT POUR LE PDF ====================
const showPdfModal = ref(false)
const pdfBlob = ref<Blob | null>(null)
const isPdfLoading = ref(false)
const pdfFilename = ref('')
// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const showModalFicheQuittance = ref(false)
const showModalModification = ref(false)
const showModaleVueSynotique = ref(false)
const showModalSecurite = ref(false)
const showModalTranche = ref(false)

const policeId = currentPolice?.id ?? null

const isCession = ecranStore.currentModule === MODULE_CESSION
const isEcranBordereau = ecranStore.currentEcran === ECRAN_BORDEREAU
const isEcranFacultative = ecranStore.currentEcran === ECRAN_FACULTATIVE
const isEcranEcheancePmd = ecranStore.currentEcran === ECRAN_ECHEANCE_PMD
const isEcranPlacement = ecranStore.currentEcran === ECRAN_PLACEMENT
const isEcranCompte = ecranStore.currentEcran === ECRAN_COMPTE
const isEcranConsultation = ecranStore.currentEcran === ECRAN_CONSULTATION
const isEcranTranche = ecranStore.currentEcran === ECRAN_TRANCHE

// ============================================
// LOGIQUE MÉTIER & FILTRES
// ============================================

// ✅ Récupération des 4 filtres depuis le store (Computed pour la réactivité)
const cedanteIdVal = computed(() => quittanceStore.filtreCedanteId)
const courtierIdVal = computed(() => quittanceStore.filtreCourtierId)
const campagneIdVal = computed(() => quittanceStore.filtreCampagneId)
const sousBrancheIdVal = computed(() => quittanceStore.filtreSousBrancheId)
const natureOffreIdVal = computed(() => quittanceStore.filtreNatureOffreId)

const policeIdVal = (isEcranBordereau || isEcranPlacement || isEcranEcheancePmd) ? null : toValue(policeId)
const isFacVal = isEcranBordereau ? true : isEcranCompte ? false : null
const isProportionnelleVal = (isEcranEcheancePmd || isEcranTranche) ? false : null

const titreQuittance = isCession ? "QUITTANCES CESSION " : "QUITTANCES ACCEPTATION "
titreFenetre.value = isEcranBordereau ? titreQuittance + " FAC " :
  (isEcranEcheancePmd || isEcranTranche) ? titreQuittance + " NON PROPORTIONNELLES " : 
  isEcranCompte ? titreQuittance + " TRAITÉS " : titreQuittance

// ============================================
// COMPUTED POUR LA PAGINATION + RECHERCHE
// ============================================
const paginationParams = computed<PaginationParams>(() => ({
  page: 1,
  limit: PAGE_SIZE,
  search: tableSearch.value,
  sortKey: '',
  sortDirection: undefined,
}))

// ✅ APPEL AU COMPOSABLE (Sans .value pour garder la réactivité)
const store = useQuittances({
  policeId: policeIdVal,
  cedanteId: cedanteIdVal,           // ✅ Computed
  courtierId: courtierIdVal,         // ✅ Computed
  campagneId: campagneIdVal,         // ✅ Computed
  sousBrancheId: sousBrancheIdVal,   // ✅ Computed
  natureOffreId: natureOffreIdVal,
  isCession: isCession,
  isFac: isFacVal,
  isProportionnelle: isProportionnelleVal,
  params: paginationParams,
})

const { quittances, updateQuittance } = store

type QuittanceRow = Quittance & { [key: string]: any }

// ==================== COLONNES & DONNÉES ====================
const quittanceColumns = computed(() => quittanceAllColumns(natureOffre, isProportionnelleVal))
const quittanceRows = computed(() => store.quittances.items.value)
const tableLoading = computed(() => store.quittances.isLoading.value)
const loadingMore = computed(() => store.quittances.loadingMore.value)
const hasMore = computed(() => store.quittances.hasMore.value)
const totalItems = computed(() => quittances.pageInfo.value?.total ?? 0)

const isAfficheSearch = computed(() => tableSearch.value == " " ? totalItems.value > PAGE_SIZE : true)
const isLigneSelectionnee = computed(() => selectedQuittances.value.length > 0)

const selectedQuittances = computed({
  get: () => quittanceStore.selectedQuittances,
  set: (value) => quittanceStore.setSelectedQuittances(value)
})

const titleModal = ref('')

// ==================== TRI & SCROLL ====================
function onSort(state: SortState): void { sortState.value = state }

async function handleLoadMore() { 
  if (loadingMore.value || !hasMore.value) return
  await quittances.loadMore()
}

// ==================== MODALES & CRUD ====================
const onRowClick = (row: any , index : number) => {
  quittanceSelected.value = row as Quittance
  quittanceStore.selectQuittance(row as Quittance)       
}

const onRowDoubleClick = () => { showModalFicheQuittance.value = true }

const closeModal = () => { showModalModification.value = false }

const onFormSuccess = async (message: string) => {
  closeModal()
  success(message, 'Succès')
  await quittances.refresh()
}

const openEdit = (quittance: QuittanceRow) => {
  quittanceStore.selectQuittance(quittance as Quittance)
  titleModal.value = 'Modifier quittance N°' + quittance.numero
  showModalModification.value = true
}

const handleModifier = () => {
  if (selectedQuittances.value.length === 0) {
    info('Veuillez sélectionner une quittance svp...', 'Info')
    return
  }
  const quittanceId = selectedQuittances.value[0]
  const quittance = quittanceRows.value.find((u: any) => u.id === quittanceId)
  if (quittance) openEdit(quittance)
}

const handleActualiser = () => { quittances.refresh() }
const isModifierQuittance = ref(true)
// //////////////////////////////////////////
// IMPRESSION 
// //////////////////////////////////////////

// ⭐ FONCTIONS POUR L'IMPRESSION
const handlePrintOne = async () => {
  if (selectedQuittances.value.length === 0) {
    info('Veuillez sélectionner une quittance à imprimer', 'Info')
    return
  }
  
  // lecture de la quittance sélectionnée
  const quittanceId = Number(selectedQuittances.value[0])
  const quittance = quittanceRows.value.find((u: any) => u.id === quittanceId)
   showPdfModal.value = true
  isPdfLoading.value = true
  pdfFilename.value = `Quittance-${quittance?.numero}.pdf`
 
  pdfBlob.value = null
  console.warn('QUITTANCES.VUES')
  try {
    pdfBlob.value = await quittanceApi.printOne(quittanceId)
   
    console.log('pdfBlob.value:',pdfBlob.value)
  } catch (err: any) {
    error('Erreur lors de la génération du PDF', 'Erreur')
    showPdfModal.value = false
  } finally {
    isPdfLoading.value = false
  }
}

// const handlePrintList = async () => {
//   isPdfLoading.value = true
//   pdfFilename.value = 'Liste-Acteurs.pdf'
//   showPdfModal.value = true
//   pdfBlob.value = null

//   try {
//     // On réutilise les paramètres de recherche et tri actuels
//     const currentParams = { ...params.value }
//     delete currentParams.page
//     delete currentParams.limit

//     pdfBlob.value = await acteurApi.printList(currentParams as any)
//   } catch (err: any) {
//     error('Erreur lors de la génération de la liste PDF', 'Erreur')
//     showPdfModal.value = false
//   } finally {
//     isPdfLoading.value = false
//   }
// }

// //////////////////////////////////////////
// MENU CONTEXTUEL 
// //////////////////////////////////////////
// const handleMenuContextuel =(event: any)=>{
//   openMenu(event)
// }
// ============ Clic droit SUR une ligne ============
const onRowContextMenu = (
  event: MouseEvent,
  row: Quittance,
  index: number
): void => {
  // La ligne est déjà sélectionnée par TTable, on ouvre juste le menu
  onRowClick(row, index)
  open(event, getQuittanceMenu(row))
}

// ============ Clic droit HORS ligne (fond du tableau) ============
const onTableContextMenu = (event: MouseEvent): void => {
  open(event, getTableMenu())
}


const { open } = useContextMenu();
const getQuittanceMenu = (row: Quittance): MenuItem[] => [
  {
    label: 'Voir le détail',
    shortcut: 'Entrée',
    action: () => showModaleVueSynotique.value=true
  },
  {
    label: 'Modifier',
   // shortcut: 'F2',
    disabled:  false,
    action: () => showModalModification.value=true
  },
  {
    label: 'Imprimer',
   // shortcut: 'F2',
   // disabled:  false,
    action: () => handlePrintOne()
  },
  
  { type: 'separator' },
  {
    label: 'Sécurité',
    //shortcut: 'Ctrl+S',
    action: () => {
      quittancePlacementStore.clearSelection()
      showModalSecurite.value=true;
    }
  },
  {
    label: 'Tranche',
    //shortcut: 'Ctrl+S',
    action: () => {
      quittanceTrancheStore.clearSelection()
      showModalTranche.value=true;
    }
  },
  /*{
    label: 'Envoyer par email',
    action: () => envoyerEmail(row)
  },
  {
    label: 'Télécharger PDF',
    action: () => telechargerPDF(row)
  },
  { type: 'separator' },
  {
    label: 'Annuler la quittance',
    danger: true,
    disabled: row.statut === 'ANNULÉE',
    action: () => annuler(row)
  }
  */
]

const getTableMenu = (): MenuItem[] => [
  {
    label: 'Nouvelle quittance',
    shortcut: 'Ctrl+N',
   // action: () => nouvelleQuittance()
  },
  {
    label: 'Rafraîchir',
    shortcut: 'F5',
    //action: () => rafraichir()
  },
  { type: 'separator' },
  {
    label: 'Exporter en Excel',
    //action: () => exporterExcel()
  }
]
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans useQuittance gère le reset + refetch
  }, 300)
})
</script>

<template>
  <TTable
    v-model:selected-keys="selectedQuittances"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="quittanceColumns"
    :rows="quittanceRows"
    :loading="tableLoading"
    :density="tableDensity"
    height="h-full"
    width="w-full"
    :title="titreFenetre"
    row-key="id"
    striped
    :infinite-scroll="true"
    :has-more="hasMore"
    :loading-more="loadingMore"
    :scroll-threshold="200"
    end-message="— Fin des données —"
    :show-end-message="true"
    @sort="onSort"
    @row-click="onRowClick"
    @row-double-click="onRowDoubleClick"
    @load-more="handleLoadMore"
   
    @row-contextmenu="onRowContextMenu"
    @table-contextmenu="onTableContextMenu"
  >
    <template #caption-extra>
      <div class="flex justify-between">
        <input v-if="isAfficheSearch"
          v-model="tableSearch"
          type="text"
          placeholder="Rechercher…"
          class="h-8 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
         <i v-if="isLigneSelectionnee"  class="pi pi-eye pl-3 pr-3 cursor-pointer 
              transition-transform duration-200 dark:text-primary-500 text-primary-800  text-xl  hover:scale-225" 
           
              @click="showModaleVueSynotique=true"
            />
      </div>
    </template>
    <template #caption>
      <QuittanceInfoPolice/>  
      <TButton v-if="isEcranFacultative" type="button" variant="soft"> 
        <span class="text-lg font-extrabold uppercase cursor-pointer">Avenant</span> 
      </TButton>
      <TAction v-if="isModifierQuittance"
        :masque-nouveau="true"
        :masque-supprimer="true"
        :active-modifier="isLigneSelectionnee"
        :active-impression="isLigneSelectionnee"
        :active-actualiser="true"
        @modifier="handleModifier"
        @actualiser="handleActualiser"
      />
      <TAction v-else
        :masque-nouveau="true"
        :masque-modifier="true"
        :masque-supprimer="true"
        :active-actualiser="true"
        @actualiser="handleActualiser"
      />
    </template>
    
    <!-- Templates de cellules (inchangés) -->
    <template #cell-isCession="{ row }"><IconeValider v-if="row.police.isCession" /><IconeNonValider v-else /></template>
    <template #cell-isIard="{ row }"><IconeValider v-if="row.police.isIard" /><IconeNonValider v-else /></template>    
    <template #cell-isSinistree><IconeNonValider /></template>
    <template #cell-police="{ value }"><span class="font-mono uppercase" v-if="value">{{ value.acteurCedante.sigle }}</span></template>
    <template #cell-mouvement="{ value }"><span class="font-mono uppercase">{{ value.code }}</span></template>
    <template #cell-dateEffet="{ value }"><span class="font-mono uppercase" v-if="value">{{ value }}</span><span class="font-mono uppercase" v-else>TBA</span></template>
    <template #cell-dateEcheance="{ value }"><span class="font-mono uppercase" v-if="value">{{ value }}</span><span class="font-mono uppercase" v-else>TBA</span></template>
    <template #cell-devise="{ value }"><span class="font-mono uppercase">{{ value.code }}</span></template>   
    <template #cell-coursDevise="{ value }"><span class="font-mono uppercase">{{ formatDecimal(value) }}</span></template>
    <template #cell-capitaux="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-lci="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-smp="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-limite="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-retention="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-conservation="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-priorite="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-portee="{ value }"><TDisplayNumber :value="value" /></template>        
    <template #cell-estimationPrime="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-sinistreAuComptant="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-primeBrute="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-primeNette="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-primeCedee="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-primeAcceptee="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-taxeSurPrime="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-tauxCedante="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-tauxAccepte="{ value }"><TDisplayNumber :value="value" /></template> 
    <template #cell-tauxCession="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-tauxCommission="{ value }"><TDisplayNumber :value="value" /></template> 
    <template #cell-tauxRetention="{ value }"><TDisplayNumber :value="value" /></template>
    <template #cell-taxeSurCommission="{ value }"><TDisplayNumber :value="value" /></template> 
    <template #cell-taxeSurCommissionFixe="{ value }"><TDisplayNumber :value="value" /></template>
  </TTable>
 <!-- ⭐ MODALE D'AFFICHAGE FICHE -->
  <TModal v-model="showModalFicheQuittance" width="50%">
    <template #default><TFicheQuittance /></template>
  </TModal>
 <!-- ⭐ MODALE D'AFFICHAGE SYNOPTIQUE -->
  <TModal v-model="showModaleVueSynotique" width="95%" height="95%">
    <template #header><p>Vue synoptique de la quittance N° 1236652244</p></template>
    <template #default><TQuittanceVueSynoptique/></template>
    <template #footer>
      <div class="flex justify-between">
        <TButton variant="solid" width="xl" @click="showModaleVueSynotique=false">Fermer</TButton>
      </div>
    </template>
  </TModal>

  <!-- ⭐ MODALE D'AFFICHAGE PLACEMENT (SECURITE) -->
  <TModal v-model="showModalModification" :title="titleModal" width="60%" height="75%">
    <TQuittanceForm :loading="updateQuittance.isPending.value" @success="onFormSuccess" @cancel="closeModal" />
  </TModal>
  <TModal v-model="showModalSecurite" title="Sécurité" width="90%" height="85%">   
    <template #default><TQuittancePlacement/></template>
    <template #footer>
      <div class="flex justify-between">
        <TButton variant="solid" width="xl" @click="showModalSecurite=false">Fermer</TButton>
      </div>
    </template>    
  </TModal>

   <!-- ⭐ MODALE D'AFFICHAGE TRANCHE -->
  <TModal v-model="showModalTranche" title="Tranche" width="90%" height="85%"> 
      
    <template #default><TQuittanceTranche/></template>
    <template #footer>
      <div class="flex justify-between">
        <TButton variant="solid" width="xl" @click="showModalTranche=false">Fermer</TButton>
      </div>
    </template>    
  </TModal>

    <!-- ⭐ MODALE D'AFFICHAGE PDF -->
    <TModal
      v-model="showPdfModal"
      :title="`Aperçu : ${pdfFilename}`"
      width="95%"
      height="95%"
    >
      <template #default>
        <div v-if="isPdfLoading" class="flex justify-center items-center h-64">
          <span class="text-neutral-500 animate-pulse">Génération du PDF en cours...</span>
        </div>
        <TPdfViewer v-else :blob="pdfBlob" :filename="pdfFilename" />
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <TButton 
            variant="soft"
            @click="showPdfModal = false" 
            class="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800"
          >
            Fermer
          </TButton>
        </div>
      </template>
    </TModal>
</template>