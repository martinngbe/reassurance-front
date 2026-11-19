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
import {  useEcransStore } from '@/services/ecrans/ecrans.store.ts'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store.ts'
import TDisplayDecimal from '@/composants/utilitaire/TDisplayDecimal.vue'
import TQuittanceTrancheForm from './TQuittanceTrancheForm.vue'
import { useQuittanceTrancheStore } from '@/services/quittances/quittance-tranche/quittance-tranche.store.ts'
import { useQuittanceTranches } from '@/services/quittances/quittance-tranche/useQuittanceTranche.ts'
import type { QuittanceTranche } from '@/services/quittances/quittance-tranche/quittance-tranche.ts'
import TAlert from '@/composants/display/TAlert.vue'
import TDisplayPourCentage from '@/composants/utilitaire/TDisplayPourCentage.vue'
import QuittanceInfoPolice from '../quittance/fiche/QuittanceInfoPolice.vue'

const props = defineProps<{
  isTrancheQuittanceTranche?: boolean 
}>()
const { success, error, warning, info } = useToast()
const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=> quittanceStore.currentQuittance)
const quittanceTrancheStore = useQuittanceTrancheStore()
const nombreTrancheMax = computed(()=>currentQuittance.value? currentQuittance.value.nombreTranche : 0)
const policeQuittance =  computed(()=> currentQuittance.value?.police)
const titreFenetre = ref('TRANCHES')
titreFenetre.value =currentQuittance.value?  "TRANCHES QUITTANCE N°"+ currentQuittance.value.numero : "BORDEREAUX"

console.log(' ____ nombreTrancheMax: ',nombreTrancheMax)
console.log(' ____ currentQuittance.value: ',currentQuittance.value)
console.log(' ____ policeQuittance.value: ',policeQuittance.value)

// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const emit = defineEmits<{ 
  (e: 'row-click',  quittanceTranche: any): void
  (e: 'form-success'): void
}>()
//const showModalFicheQuittanceTranche = ref(false)
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
const store = useQuittanceTranches(quittanceId,params)

// ✅ Destructurer les mutations dont tu as besoin
const { quittanceTranches, updateQuittanceTranche, deleteQuittanceTranche } = store

type QuittanceTrancheRow = QuittanceTranche & { [key: string]: any }
const quittanceTrancheToEdit = ref<QuittanceTranche | null | undefined>(null)

// ==================== COLONNES ====================
const quittanceTrancheColumns = computed(()=>{
    const allColumns: TableColumn[] = [
                    { key: 'numeroTranche',   label: 'N°Tranche',       width: '02%',  minWidth: 80 , align:'center'},
                    { key: 'priorite',        label: 'Priorité',        width: '20%',  minWidth: 100,  align:'right' },
                    { key: 'portee',          label: 'portee',          width: '20%',  minWidth: 200,  align:'right' },
                    { key: 'estimationPrime', label: 'Assiette Prime',  width: '20%',  minWidth: 200,  align:'right' },                    
                    { key: 'tauxPrime',       label: 'Taux Prime',      width: '05%',   minWidth: 80,   align:'right' },
                    { key: 'primeTranche',    label: 'Prime tranche',   width: '20%',  minWidth: 200,  align:'right' },                 
                  ]
  
  return allColumns

})
             
console.log("quittanceTrancheColumns.value:",quittanceTrancheColumns.value )
// ==================== DONNÉES TABLE ====================
// Accéder via store.quittanceTranches
const quittanceTrancheRows = computed(() => store.quittanceTranches.items.value)
const tableLoading = computed(() => store.quittanceTranches.isLoading.value)
const loadingMore = computed(() => store.quittanceTranches.loadingMore.value)
const hasMore = computed(() => store.quittanceTranches.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => quittanceTranches.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
const isLigneSelectionnee = computed(() => selectedQuittanceTranches.value.length > 0)
//const selectedQuittanceTranches = ref<(string | number)[]>([])
const selectedQuittanceTranches = computed({
  get: () => quittanceTrancheStore.selectedQuittanceTranches,
  set: (value) => quittanceTrancheStore.setSelectedQuittanceTranches(value)
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
  await quittanceTranches.loadMore()
}
const handleConfirmeSuppression = async () => {
  const quittanceTranche = quittanceTrancheToEdit.value
  if (!quittanceTranche) return
  try {
    await deleteQuittanceTranche.mutateAsync(quittanceTranche.id)
    showModalConfirmation.value = false
    success('Opération effectuée avec succès', 'Succès')
    selectedQuittanceTranches.value = selectedQuittanceTranches.value.filter((id) => id !== quittanceTranche.id)
    quittanceTranches.refresh()
    
     emit('form-success')
  } catch (err: any) {
    error(
      err?.response?.data?.message || err?.message || 'Erreur lors de la suppression.',
      'Erreur',
    )
  }
}
const handleSupprimer = async () => {
  if (selectedQuittanceTranches.value.length === 0) {
    warning('Veuillez sélectionner la tranche svp ...',"Attention")
    return
  }
  
  const quittanceTrancheId = selectedQuittanceTranches.value[0]
  //console.log("quittanceTrancheId.handleSupprimer quittanceTrancheId:",quittanceTrancheId)
  quittanceTrancheToEdit.value = quittanceTrancheRows.value.find((u:any) => u.id === quittanceTrancheId)
  //console.log("quittanceTrancheToEdit.value:",quittanceTrancheToEdit.value)
  if (!quittanceTrancheToEdit.value) return
  showModalConfirmation.value=true 
  
}
// ==================== MODALES ====================
const onRowClick = ( row: any, index: number)=>{
    console.log(" --- QuittanceTranches.onRowClick  --- ")
    quittanceTrancheStore.selectQuittanceTranche(row as QuittanceTranche)       
    emit('row-click',row as QuittanceTranche)
}

const closeModal = () => {
  showModal.value = false
}

// ==================== HANDLERS CRUD ====================
const onFormSuccess = async (message: string) => {
  closeModal()
  success(message, 'Succès')
  // ✅ La quittanceTranche courante est déjà à jour via updateCurrentQuittanceTranche
  await quittanceTranches.refresh()
 
  emit('form-success')
}
const openCreate = () => {
  quittanceTrancheToEdit.value = null
  titleModal.value = 'Nouvelle Tranche'
  showModal.value = true
}
const handleNouveau = () => openCreate()

const openEdit = (quittanceTranche: QuittanceTrancheRow) => {
  // ✅ Assigner l'objet à la ref pour le passer en prop au formulaire
  quittanceTrancheToEdit.value = quittanceTranche as QuittanceTranche
  console.log(' ____________ QuittanceTranches.openEdit ___________ ')
  console.log('quittanceTrancheToEdit.value:',quittanceTrancheToEdit.value)
  console.log('quittanceTranche:',quittanceTranche)
  quittanceTrancheStore.selectQuittanceTranche(quittanceTranche as QuittanceTranche)
  titleModal.value = 'Modifier Tranche'
  showModal.value = true
}
const handleModifier = () => {
  if (selectedQuittanceTranches.value.length === 0) {
    info('Veuillez sélectionner une quittanceTranche svp...', 'Info')
    return
  }
  console.log(" _______________________________________________ ")
  console.log("  QuittanceTranches.handleModifier  ")
  console.log(" selectedQuittanceTranches.value:",selectedQuittanceTranches.value)
  const quittanceTrancheId = selectedQuittanceTranches.value[0]
  const quittanceTranche = quittanceTrancheRows.value.find((u: any) => u.id === quittanceTrancheId)
  console.log(" quittanceTrancheId:",quittanceTrancheId)
  console.log(" quittanceTranche:",quittanceTranche)
 
  if (quittanceTranche) openEdit(quittanceTranche)
}

const handleRefreshQuittanceTranche = ()=>{
  quittanceTranches.refresh()
}
// Debounce recherche
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans useQuittanceTranche gère le reset + refetch automatiquement
  }, 300)
})
</script>

<template>
  <TTable
    v-model:selected-keys="selectedQuittanceTranches"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="quittanceTrancheColumns"
    :rows="quittanceTrancheRows"
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

        <template #caption="{selectedCount , total}">
          <div class="flex items-center justify-between gap-4">
                
                <QuittanceInfoPolice />
                <!-- Boutons d'action existants -->
                <TAction
                  :active-nouveau="total < nombreTrancheMax"
                  :active-modifier="isLigneSelectionnee"
                  :active-impression="isLigneSelectionnee"
                  :active-supprimer="isLigneSelectionnee"
                  :active-actualiser="total>0"
                  @modifier="handleModifier"
                  @nouveau="handleNouveau"
                  @supprimer="handleSupprimer"
                  @actualiser="handleRefreshQuittanceTranche"
                />
          </div>
        </template> 
       
        <template #cell-primeTranche="{ value }">
            <TDisplayNumber :value="value" />
        </template>  
        <template #cell-priorite="{ value }">
              <TDisplayNumber :value="value" />
        </template>           
        <template #cell-portee="{ value }">
              <TDisplayDecimal :value="value" />
        </template>
         <template #cell-estimationPrime="{ value }">
              <TDisplayDecimal :value="value" />
        </template>   
         <template #cell-tauxPrime="{ value }">
              <TDisplayPourCentage :value="value" />
        </template>        
        
        

  </TTable>

  
    <TModal v-model="showModal" :title="titleModal"
     >
      <TQuittanceTrancheForm
        :loading="updateQuittanceTranche.isPending.value"
        :quittance-tranche="quittanceTrancheToEdit"
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
                      Voulez-vous supprimer cette tranche N°:
                      <span class="font-extrabold">{{ quittanceTrancheToEdit?.numeroTranche }}</span>
                    </p>
                  </template>
                </TDemandeConfirmation>
  </TModal>
</template>