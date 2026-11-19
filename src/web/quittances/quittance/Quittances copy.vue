<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref, toValue, watch, type Ref } from 'vue'
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
import TFicheQuittance from './fiche/ TFicheQuittance.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import { ECRAN_BORDEREAU, ECRAN_COMPTE, ECRAN_CONSULTATION, ECRAN_ECHEANCE_PMD, ECRAN_FACULTATIVE, ECRAN_PLACEMENT, ECRAN_TRANCHE, MODULE_CESSION, useEcransStore } from '@/services/ecrans/ecrans.store.ts'
import TQuittanceForm from './TQuittanceForm.vue'
import TToolTip from '@/composants/display/TToolTip.vue'
import TQuittanceVueSynoptique from './TQuittanceVueSynoptique.vue'
import Acteurs from '@/web/acteurs/acteur/Acteurs.vue'
import TButton from '@/composants/forms/TButton.vue'
import type { Acteur } from '@/services/acteurs/acteur/acteur.ts'
import { useQueryClient } from '@tanstack/vue-query'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import { useActeurStore } from '@/services/acteurs/acteur/acteur.store.ts'
import QuittanceInfoPolice from './fiche/QuittanceInfoPolice.vue'

const titreFenetre = ref('QUITTANCES')
const props = defineProps<{
  isAllQuittance?: boolean 
}>()
const { success, error, warning, info } = useToast()
const ecranStore = useEcransStore()
const policeStore = usePoliceStore()
const quittanceStore = useQuittanceStore()
const acteurStore = useActeurStore()
const currentQuittance = computed(()=>quittanceStore.currentQuittance)
const currentPolice = policeStore.currentPolice
const currentActeur = computed(()=>acteurStore.currentActeur) 
const natureOffre = currentPolice?.natureOffre
// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const emit = defineEmits<{ 
  (e: 'row-click',  quittance: any): void
}>()
const showModalFicheQuittance = ref(false)
const showModalModification = ref(false)
const showModaleVueSynotique = ref(false)

const policeId = currentPolice? currentPolice.id : null
const acteurCourtierId = computed(()=> currentActeur.value && currentActeur.value.isCourtier? currentActeur.value.id : null)
const acteurCedanteId = computed(()=>currentActeur.value && !currentActeur.value.isCourtier? currentActeur.value.id : null)
const isCession = ecranStore.currentModule ===MODULE_CESSION
const isEcranBordereau = ecranStore.currentEcran ===ECRAN_BORDEREAU
const isEcranFacultative = ecranStore.currentEcran ===ECRAN_FACULTATIVE
const isEcranEcheancePmd = ecranStore.currentEcran ===ECRAN_ECHEANCE_PMD
const isEcranPlacement = ecranStore.currentEcran ===ECRAN_PLACEMENT // sécurité
const isEcranCompte = ecranStore.currentEcran ===ECRAN_COMPTE
const isEcranConsultation = ecranStore.currentEcran ===ECRAN_CONSULTATION
const isEcranTranche = ecranStore.currentEcran ===ECRAN_TRANCHE

console.warn(" __________ Quittances.vue _________")
console.log(" ----- currentPolice:",currentPolice)
console.log(" ----- ecranStore.currentModule:",ecranStore.currentModule)
console.log(" ----- ecranStore.currentEcran:",ecranStore.currentEcran)
console.log(" ----- policeId:",policeId)
console.log(" ----- isCession:",isCession)
console.log(" ----- isEcranBordereau:",isEcranBordereau)
console.log(" ----- isEcranPlacement:",isEcranPlacement)
console.log(" ----- isEcranCompte:",isEcranCompte)
// ==================== API + CRUD ====================

// ============================================
// 2. LOGIQUE MÉTIER EXISTANTE (inchangée)
// ============================================

// const cedanteIdVal = isEcranConsultation && acteurCedanteId? toValue(acteurCedanteId)  : null ; // les quittances d'une cédante
// const courtierIdVal = isEcranConsultation && acteurCourtierId? toValue(acteurCourtierId)  : null ; // les quittances d'une cédante
const cedanteIdVal = computed(()=> isEcranConsultation && acteurCedanteId.value? acteurCedanteId.value  : null ); // les quittances d'une cédante
const courtierIdVal =computed(()=>  isEcranConsultation && acteurCourtierId.value? acteurCourtierId.value  : null ) ; // les quittances d'une cédante



const policeIdVal  = isEcranBordereau || isEcranPlacement || isEcranEcheancePmd ? null : toValue(policeId)
const isFacVal     = isEcranBordereau ? true : // Quittances FAC  
                    isEcranCompte? false :  // Quittances Traités
                     null  // Indifférent

const isProportionnelleVal   =  isEcranEcheancePmd || isEcranTranche ? false : null
const titreQuittance = isCession?"QUITTANCES CESSION ":"QUITTANCES ACCEPTATION "
titreFenetre.value = isEcranBordereau ? titreQuittance+" FAC" :
                     isEcranEcheancePmd || isEcranTranche? titreQuittance+ "NON PROPORTIONNELLES" : 
                     isEcranCompte?      titreQuittance+ " TRAITéS" : titreQuittance

// ============================================
// 3. COMPUTED POUR LA PAGINATION + RECHERCHE
// ============================================
// C'est ce computed qui sera transmis au composable via l'option `params`
const paginationParams = computed<PaginationParams>(() => ({
  page: 1,
  limit: PAGE_SIZE,
  search: tableSearch.value,         // ⭐ La recherche est ici
  sortKey: '',
  sortDirection: undefined,
}))


const store = useQuittances({
  policeId: policeIdVal,
  cedanteId: cedanteIdVal.value,
  courtierId: courtierIdVal.value,
  isCession: isCession,
  isFac: isFacVal,
  isProportionnelle: isProportionnelleVal,
  params: paginationParams, // ⭐ Le computed contenant la recherche
})

// ✅ Destructurer les mutations dont tu as besoin
const { quittances, updateQuittance, deleteQuittance } = store

type QuittanceRow = Quittance & { [key: string]: any }
// ==================== COLONNES ====================
const quittanceColumns = computed(()=> quittanceAllColumns(natureOffre , isProportionnelleVal))             


console.log("quittanceColumns.value:",quittanceColumns.value )
// ==================== DONNÉES TABLE ====================
// Accéder via store.quittances
const quittanceRows = computed(() => store.quittances.items.value)
const tableLoading = computed(() => store.quittances.isLoading.value)
const loadingMore = computed(() => store.quittances.loadingMore.value)
const hasMore = computed(() => store.quittances.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => quittances.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
const isLigneSelectionnee = computed(() => selectedQuittances.value.length > 0)
//const selectedQuittances = ref<(string | number)[]>([])
const selectedQuittances = computed({
  get: () => quittanceStore.selectedQuittances,
  set: (value) => quittanceStore.setSelectedQuittances(value)
})

const titleModal = ref('')

// ==================== TRI ====================
function onSort(state: SortState): void {
  sortState.value = state
}

// ==================== INFINITE SCROLL ====================
async function handleLoadMore() { 
  if (loadingMore.value || !hasMore.value) return
  await quittances.loadMore()
}

// ==================== MODALES ====================
const onRowClick = ( row: any, index: number)=>{
    console.log(" --- Quittances.onRowClick  --- ")
    quittanceStore.selectQuittance(row as Quittance)       
    emit('row-click',row as Quittance)
}
const onRowDoubleClick = ( row: any, index: number)=>{       
    //emit('row-click',row as Quittance)
    showModalFicheQuittance.value=true
}
const closeModal = () => {
  showModalModification.value = false
  // ✅ Optionnel : effacer la sélection à la fermeture
  // quittanceStore.clearSelection()
}

// ==================== HANDLERS CRUD ====================
const onFormSuccess = async (message: string) => {
  closeModal()
  success(message, 'Succès')
  // ✅ La quittance courante est déjà à jour via updateCurrentQuittance
  await quittances.refresh()
}
// ✅ APRÈS
const openEdit = (quittance: QuittanceRow) => {
  console.log(' ___  Quittances.openEdit _____')
  // ✅ Sélectionner via le store
  quittanceStore.selectQuittance(quittance as Quittance)
  titleModal.value = 'Modifier quittance N°'+ quittance.numero
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

const handleActualiser = ()=>{
  quittances.refresh()
}
//const showModal = ref(false)
const isModifierQuittance=ref(true)
//const showModalActeur = ref(false)

// //////////////////////////////
// Debounce recherche
// //////////////////////////////
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans useQuittance gère le reset + refetch automatiquement
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
    !selectable
    
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
  >
    <template #caption-extra>
      <div class="flex justify-between">
        <input  v-if="isAfficheSearch"
          v-model="tableSearch"
          type="text"
          placeholder="Rechercher…"
          class="h-8 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>
    </template>

    <template #caption>
       
        <QuittanceInfoPolice/>  
        <TButton  v-if="isEcranFacultative"
            type="button"
            variant="soft" > 
              <span class="text-lg font-extrabold uppercase cursor-pointer">Avenant</span> 
        </TButton>
        <TAction  v-if="isModifierQuittance"
          :masque-nouveau="true"
          :masque-supprimer="true"
          :active-modifier="isLigneSelectionnee"
          :active-impression="isLigneSelectionnee"
          :active-actualiser="true"
          @modifier="handleModifier"
          @actualiser="handleActualiser"
        />
        <TAction  v-else
          :masque-nouveau="true"
          :masque-modifier="true"
          :masque-supprimer="true"
          :active-actualiser="true"
          @actualiser="handleActualiser"
        />

    </template>
        <template #cell-isCession="{  row }">       
                  <IconeValider  v-if="row.police.isCession" />
                  <IconeNonValider  v-else />
        </template>
        <template #cell-isIard="{  row }">       
                  <IconeValider  v-if="row.police.isIard" />
                  <IconeNonValider  v-else />
          
        </template>    
        <template #cell-isSinistree="{ value , row }">        
                  <!-- TAF Charger NB Sinsitre ou IsSinistree-->              
                  <IconeNonValider  />        
        </template>

        <template #cell-police="{ value }">
            <span class="font-mono  uppercase" v-if="value" >
              {{ value.acteurCedante.sigle }}
            </span>
        </template>
        <template #cell-mouvement="{ value }">
          <span class="font-mono  uppercase" >{{ value.code }}</span>
        </template>
        <template #cell-dateEffet="{ value }">
          <span class="font-mono  uppercase" v-if="value">{{ value }}</span>
          <span class="font-mono  uppercase" v-else>TBA</span>
        </template>
        <template #cell-dateEcheance="{ value }">
          <span class="font-mono  uppercase" v-if="value">{{ value }}</span>
          <span class="font-mono  uppercase" v-else>TBA</span>
        </template>
        <template #cell-devise="{ value }">
          <span class="font-mono  uppercase" >{{ value.code }}</span>
        </template>   
        <template #cell-coursDevise="{ value }">      
          <span class="font-mono  uppercase" >{{formatDecimal(value,)  }}</span>
        </template>
        <template #cell-capitaux="{ value }">      
          <TDisplayNumber :value="value" />
        </template>
        <template #cell-lci="{ value }">      
          <TDisplayNumber :value="value" />
        </template>
        <template #cell-smp="{ value }">
            <TDisplayNumber :value="value" />
        </template>
        <template #cell-limite="{ value }">
            <TDisplayNumber :value="value" />
        </template>
        <template #cell-retention="{ value }">
            <TDisplayNumber :value="value" />
        </template>
          <template #cell-conservation="{ value }">
            <TDisplayNumber :value="value" />
        </template>
  
        <template #cell-priorite="{ value }">
            <TDisplayNumber :value="value" />
        </template>
          <template #cell-portee="{ value }">
            <TDisplayNumber :value="value" />
        </template>        

        <template #cell-estimationPrime="{ value }">
            <TDisplayNumber :value="value" />
        </template>

        <template #cell-sinistreAuComptant="{ value }">
            <TDisplayNumber :value="value" />
        </template>
        <template #cell-primeBrute="{ value }">
            <TDisplayNumber :value="value" />
        </template>
        <template #cell-primeNette="{ value }">
            <TDisplayNumber :value="value" />
        </template>
        <template #cell-primeCedee="{ value }">
            <TDisplayNumber :value="value" />
        </template>
        <template #cell-primeAcceptee="{ value }">
            <TDisplayNumber :value="value" />
        </template>


        <template #cell-taxeSurPrime="{ value }">
          <TDisplayNumber :value="value" />
        </template>
            <template #cell-tauxCedante="{ value }">
            <TDisplayNumber :value="value" />
        </template>
            <template #cell-tauxAccepte="{ value }">
            <TDisplayNumber :value="value" />
        </template> 
  
        <template #cell-tauxCession="{ value }">
            <TDisplayNumber :value="value" />
        </template>
        <template #cell-tauxCommission="{ value }">
            <TDisplayNumber :value="value" />
        </template> 
            <template #cell-tauxRetention="{ value }">
            <TDisplayNumber :value="value" />
        </template>
            <template #cell-taxeSurCommission="{ value }">
            <TDisplayNumber :value="value" />
        </template> 
            <template #cell-taxeSurCommissionFixe="{ value }">
            <TDisplayNumber :value="value" />
        </template>

  </TTable>

  <TModal v-model="showModalFicheQuittance" width="50%" >
          <template #default>
                <TFicheQuittance/>
          </template>
  </TModal>
    <TModal v-model="showModaleVueSynotique"
     width="95%" height="95%" >
          <template #header>
                <p>Vue synoptique de la quittance N° 1236652244</p>
          </template>
          <template #default>
                <TQuittanceVueSynoptique/>
          </template>
          <template #footer>
                <div class="flex justify-between">
                      <TButton 
                        variant="solid" 
                        width="xl"
                        @click="showModaleVueSynotique=false"
                        >Fermer</TButton>
                </div>
          </template>
  </TModal>
  <TModal v-model="showModalModification" :title="titleModal"
     width="60%"  height="75%" >
      <TQuittanceForm
        :loading="updateQuittance.isPending.value"
        @success="onFormSuccess"
        @cancel="closeModal"
      />
  </TModal>
  <!--TModal v-model="showModalActeur" 
      width="70%"  
      height="65%" 
      title="Choisissez un acteur" 
   >
        <template #default>
            <Acteurs 
                :masquer-bouton-action="true" 
                @row-click="onChoixActeur"
            />
        </template>
        <template #footer>
            <TButton  variant="soft" @click="showModalActeur=false">Ferner</TButton>
        </template>    

  </TModal-->
</template>