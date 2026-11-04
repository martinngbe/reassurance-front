<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

import type { PaginationParams } from '@/type/pagination.ts'
import TDisplayNumber from '@/composants/utilitaire/TDisplayNumber.vue'
import { usePoliceStore } from '@/services/polices/police/police.store'
import TModal from '@/composants/display/TModal.vue'
import TAction from '@/composants/utilitaire/TAction.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import { MODULE_CESSION, useEcransStore } from '@/services/ecrans/ecrans.store.ts'
import { useQuittancePlacementStore } from '@/services/quittances/quittance-placement/quittance-placement.store'
import type { QuittancePlacement } from '@/services/quittances/quittance-placement/quittance-placement'
import { useQuittancePlacements } from '@/services/quittances/quittance-placement/useQuittancePlacement'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store.ts'
import TDisplayDecimal from '@/composants/utilitaire/TDisplayDecimal.vue'
import TQuittancePlacementForm from './TQuittancePlacementForm.vue'
import { useCumulTauxCession } from '@/services/quittances/quittance-placement/useCumulTauxCession.ts'

const props = defineProps<{
  isPlacementQuittancePlacement?: boolean 
}>()
const { success, error, warning, info } = useToast()
const ecranStore = useEcransStore()
const policeStore = usePoliceStore()
const currentPolice = computed(()=> policeStore.currentPolice)
const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=> quittanceStore.currentQuittance)
const quittancePlacementStore = useQuittancePlacementStore()


// ✅ AJOUT : composable de cumul des taux
const quittanceIdRef = computed(() => currentQuittance.value?.id ?? null)
const {
  tauxAccepte,
  cumulTauxCession,
  tauxDisponible,
  isCumulDepasse,
  nombrePlacementsActifs,
  fetchCumulTaux,
} = useCumulTauxCession(quittanceIdRef)
// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const emit = defineEmits<{ 
  (e: 'row-click',  quittancePlacement: any): void
  (e: 'form-success'): void
}>()
//const showModalFicheQuittancePlacement = ref(false)
const showModal = ref(false)

// ✅ Corrigé
const params = computed<PaginationParams>(() => ({
  page: 1,
  limit: PAGE_SIZE,
  search: tableSearch.value.trim() || undefined,
  sortKey: sortState.value.key ?? undefined,
  sortDirection: sortState.value.direction as 'ASC' | 'DESC' | undefined,
}))

// ==================== API + CRUD ====================
const quittanceId = currentQuittance.value? currentQuittance.value.id : 0
const store = useQuittancePlacements(quittanceId,params)

// ✅ Destructurer les mutations dont tu as besoin
const { quittancePlacements, updateQuittancePlacement, deleteQuittancePlacement } = store

type QuittancePlacementRow = QuittancePlacement & { [key: string]: any }
const quittancePlacementToEdit = ref<QuittancePlacement | null | undefined>(null)

// ==================== COLONNES ====================
const quittancePlacementColumns = computed(()=>{
    const allColumns: TableColumn[] = [
                    { key: 'numero',       label: 'N°',  width: 200,   minWidth: 80 , resizable:true},
                   
                    { key: 'primeBrute',      label: 'Prime Brute',    width: 150,  minWidth: 100,  align:'right' },
                    { key: 'tauxCession',     label: 'Taux Cession',    width: 80,  minWidth: 100,  align:'right' },  
                    
                    { key: 'primeCedee',        label: 'Prime Cédée',    width: 150,  minWidth: 200,  align:'right' },
                    { key: 'tauxCommission',    label: 'Taux Cie.',    width: 80,  minWidth: 200,  align:'right' },
                    { key: 'commissionFixe',    label: 'Commission Fixe',    width: 150,  minWidth: 100,  align:'right' },
                  
                    { key: 'primeNette',    label: 'Prime Nette',    width: 200,  minWidth: 200,  align:'right' },
  { key: 'acteur',       label: 'Rtrocessionnaire',  width: 400,   minWidth: 80 , resizable:true},
                  
                  ]
  console.warn("---- QUITTANCES allColumns:",allColumns )
 
  return allColumns

})
             
console.log("quittancePlacementColumns.value:",quittancePlacementColumns.value )
// ==================== DONNÉES TABLE ====================
// Accéder via store.quittancePlacements
const quittancePlacementRows = computed(() => store.quittancePlacements.items.value)
const tableLoading = computed(() => store.quittancePlacements.isLoading.value)
const loadingMore = computed(() => store.quittancePlacements.loadingMore.value)
const hasMore = computed(() => store.quittancePlacements.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => quittancePlacements.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
const isLigneSelectionnee = computed(() => selectedQuittancePlacements.value.length > 0)
//const selectedQuittancePlacements = ref<(string | number)[]>([])
const selectedQuittancePlacements = computed({
  get: () => quittancePlacementStore.selectedQuittancePlacements,
  set: (value) => quittancePlacementStore.setSelectedQuittancePlacements(value)
})

const titleModal = ref('')
const showModalConfirmation=ref(false)
// ==================== TRI ====================
function onSort(state: SortState): void {
  sortState.value = state
}

// ==================== INFINITE SCROLL ====================
async function handleLoadMore() { 
  if (loadingMore.value || !hasMore.value) return
  await quittancePlacements.loadMore()
}
const handleConfirmeSuppression = async () => {
  const quittancePlacement = quittancePlacementToEdit.value
  //console.warn(" -- QuittancePlacements.handleConfirmeSuppression -- ")
  //console.warn("quittancePlacement: ",quittancePlacement)
  if (!quittancePlacement) return
  try {
    await deleteQuittancePlacement.mutateAsync(quittancePlacement.id)
    showModalConfirmation.value = false
    success('Opération effectuée avec succès', 'Succès')
    selectedQuittancePlacements.value = selectedQuittancePlacements.value.filter((id) => id !== quittancePlacement.id)
    quittancePlacements.refresh()
     await fetchCumulTaux() // ← ✅ ACTUALISATION APRÈS DELETE
     emit('form-success')
  } catch (err: any) {
    error(
      err?.response?.data?.message || err?.message || 'Erreur lors de la suppression.',
      'Erreur',
    )
  }
}
const handleSupprimer = async () => {
  // console.log("----- Polices.handleSupprimer ------")
  // console.log("selectedQuittancePlacements.value.length:",selectedQuittancePlacements.value.length)
  // console.log("selectedQuittancePlacements.value:",selectedQuittancePlacements.value)
  // console.log("quittancePlacementRows.value:",quittancePlacementRows.value)
  if (selectedQuittancePlacements.value.length === 0) {
    warning('Veuillez sélectionner un placement',"Attention")
    return
  }
  
  const quittancePlacementId = selectedQuittancePlacements.value[0]
  //console.log("quittancePlacementId.handleSupprimer quittancePlacementId:",quittancePlacementId)
  quittancePlacementToEdit.value = quittancePlacementRows.value.find((u:any) => u.id === quittancePlacementId)
  //console.log("quittancePlacementToEdit.value:",quittancePlacementToEdit.value)
  if (!quittancePlacementToEdit.value) return
  showModalConfirmation.value=true 
  
}
// ==================== MODALES ====================
const onRowClick = ( row: any, index: number)=>{
    console.log(" --- QuittancePlacements.onRowClick  --- ")
    quittancePlacementStore.selectQuittancePlacement(row as QuittancePlacement)       
    emit('row-click',row as QuittancePlacement)
}

const closeModal = () => {
  showModal.value = false
  // ✅ Optionnel : effacer la sélection à la fermeture
  // quittancePlacementStore.clearSelection()
}

// ==================== HANDLERS CRUD ====================
const onFormSuccess = async (message: string) => {
  closeModal()
  success(message, 'Succès')
  // ✅ La quittancePlacement courante est déjà à jour via updateCurrentQuittancePlacement
  await quittancePlacements.refresh()
  await fetchCumulTaux() // ← ✅ ACTUALISATION APRÈS CREATE/UPDATE
  emit('form-success')
}
const openCreate = () => {
  quittancePlacementToEdit.value = null
  titleModal.value = 'Nouveau Placement'
  showModal.value = true
}
const handleNouveau = () => openCreate()

const openEdit = (quittancePlacement: QuittancePlacementRow) => {
  // ✅ Assigner l'objet à la ref pour le passer en prop au formulaire
  quittancePlacementToEdit.value = quittancePlacement as QuittancePlacement
  console.log(' ____________ QuittancePlacements.openEdit ___________ ')
  console.log('quittancePlacementToEdit.value:',quittancePlacementToEdit.value)
  console.log('quittancePlacement:',quittancePlacement)
  quittancePlacementStore.selectQuittancePlacement(quittancePlacement as QuittancePlacement)
  titleModal.value = 'Modifier quittancePlacement'
  showModal.value = true
}
const handleModifier = () => {
  if (selectedQuittancePlacements.value.length === 0) {
    info('Veuillez sélectionner une quittancePlacement svp...', 'Info')
    return
  }
  console.log(" _______________________________________________ ")
  console.log("  QuittancePlacements.handleModifier  ")
  console.log(" selectedQuittancePlacements.value:",selectedQuittancePlacements.value)
  const quittancePlacementId = selectedQuittancePlacements.value[0]
  const quittancePlacement = quittancePlacementRows.value.find((u: any) => u.id === quittancePlacementId)
  console.log(" quittancePlacementId:",quittancePlacementId)
  console.log(" quittancePlacement:",quittancePlacement)
 
  if (quittancePlacement) openEdit(quittancePlacement)
}

const handleRefreshQuittancePlacement = ()=>{
  quittancePlacements.refresh()
}
// Debounce recherche
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans useQuittancePlacement gère le reset + refetch automatiquement
  }, 300)
})
</script>

<template>
  <TTable
    v-model:selected-keys="selectedQuittancePlacements"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="quittancePlacementColumns"
    :rows="quittancePlacementRows"
    :loading="tableLoading"
    :density="tableDensity"
    height="h-full"
    width="w-full"
    title="Placements"
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
    @load-more="handleLoadMore"
  >
    <template #caption-extra>
      <div class="flex justify-between" v-if="isAfficheSearch">
        <input
          v-model="tableSearch"
          type="text"
          placeholder="Rechercher…"
          class="h-8 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>
    </template>

        <template #caption>
          <div class="flex items-center justify-between gap-4">
            <!-- ✅ AJOUT : Indicateur de cumul -->
            <div
              class="flex items-center gap-3 rounded-lg border px-3 py-1.5 text-xs"
              :class="
                isCumulDepasse
                  ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
              "
            >
              <span class="font-semibold">Cumul :</span>
              <span>{{ cumulTauxCession.toFixed(2) }}% / {{ tauxAccepte.toFixed(2) }}%</span>
              <span class="opacity-75">•</span>
              <span class="font-semibold">Disponible :</span>
              <span>{{ tauxDisponible.toFixed(2) }}%</span>
            </div>

            <!-- Boutons d'action existants -->
            <TAction
              :active-modifier="isLigneSelectionnee"
              :active-impression="isLigneSelectionnee"
              :active-supprimer="isLigneSelectionnee"
              :active-actualiser="totalItems>0"
              @modifier="handleModifier"
              @nouveau="handleNouveau"
              @supprimer="handleSupprimer"
              @actualiser="handleRefreshQuittancePlacement"
            />
          </div>
        </template> 
       
        <template #cell-primeBrute="{ value }">
          <TDisplayNumber :value="value" />
        </template>  
        <template #cell-primeNette="{ value }">
          <TDisplayNumber :value="value" />
        </template>           
        <template #cell-tauxCession="{ value }">
          <TDisplayDecimal :value="value" />
        </template>
        <template #cell-primeCedee="{ value }">
          <TDisplayNumber :value="value" />
        </template>
        <template #cell-taxeSurPrime="{ value }">
          <TDisplayDecimal :value="value" />
        </template>
        <template #cell-tauxCommission="{ value }">
          <TDisplayDecimal :value="value" />
        </template>   
        <template #cell-commissionFixe="{ value }">
          <TDisplayNumber :value="value" />
        </template>                  
        <template #cell-taxeSurCommission="{ value }">
          <TDisplayDecimal :value="value" />
        </template> 
        <template #cell-acteur="{ value }">
          <p  v-if="value">{{  value.raisonSociale }}</p>
        </template>

  </TTable>

  
    <TModal v-model="showModal" :title="titleModal"
     >
      <TQuittancePlacementForm
        :loading="updateQuittancePlacement.isPending.value"
        :quittance-placement="quittancePlacementToEdit"
        @success="onFormSuccess"
        @cancel="closeModal"
      />
    </TModal>
     <TModal v-model="showModalConfirmation" title="Demande de confirmation">
                <TDemandeConfirmation
                  @annuler="showModalConfirmation = false"
                  @confirmer="handleConfirmeSuppression"
                >
                  <template #message>
                    <p class="text-xl text-neutral-800 dark:text-neutral-300 pb-4">
                      Voulez-vous supprimer le placement
                      <span class="font-extrabold">{{ quittancePlacementToEdit?.numero }}</span>
                    </p>
                  </template>
                </TDemandeConfirmation>
  </TModal>
</template>