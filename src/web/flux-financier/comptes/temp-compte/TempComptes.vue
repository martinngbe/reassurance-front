<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

import type { PaginationParams } from '@/type/pagination.ts'
import TModal from '@/composants/display/TModal.vue'
import { useTempComptes } from '@/services/flux-financiers/comptes/temp-compte/useTempCompte'
import type { TempCompte } from '@/services/flux-financiers/comptes/temp-compte/temp-compte'
import TTempCompteForm from './TTempCompteForm.vue'
import TAction from '@/composants/utilitaire/TAction.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import { useTempCompteStore } from '@/services/flux-financiers/comptes/temp-compte/temp-compte.store.ts'
import TDisplayDecimal from '@/composants/utilitaire/TDisplayDecimal.vue'
import IconeValider from '@/composants/icone/IconeValider.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'

// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const emit = defineEmits<{ 
  (e: 'row-click',  tempCompte: any): void
}>()
const { success, error, warning, info } = useToast()

const props = defineProps<{
  masqueAffaireNouvelle?: boolean
}>()

// ✅ Corrigé
const params = computed<PaginationParams>(() => ({
  page: 1,
  limit: PAGE_SIZE,
  search: tableSearch.value.trim() || undefined,
  sortKey: sortState.value.key ?? undefined,
  sortDirection: sortState.value.direction as 'ASC' | 'DESC' | undefined,
}))
// ==================== API + CRUD ====================
// Ne pas destructurer tempComptes
const tempCompteStore = useTempCompteStore()
const currentTempCompte = tempCompteStore.currentTempCompte
const store = useTempComptes({})
const { tempComptes , deleteTempCompte } = store

type TempCompteRow = TempCompte & { [key: string]: any }

// ==================== COLONNES ====================

const tempCompteColumns: TableColumn[] = [ 
  //{ key: 'numero',           label: 'N° Compte',          width: '20%',  minWidth: 150 , sortable: true},
  { key: 'solde',            label: 'Solde',              width: '35%',  minWidth: 150 , align:'right' },  
  { key: 'compteType',       label: 'Type',               width: '35%',  minWidth: 150 , }, 
  { key: 'isEnNotreFaveur',  label: 'En Notre faveur',    width: '30%',  minWidth: 150 , align:'center' },
 
]

// ==================== DONNÉES TABLE ====================
// Accéder via store.tempComptes
const tempCompteRows = computed(() => store.tempComptes.items.value)
const tableLoading = computed(() => store.tempComptes.isLoading.value)
const loadingMore = computed(() => store.tempComptes.loadingMore.value)
const hasMore = computed(() => store.tempComptes.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => tempComptes.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
const isLigneSelectionnee = computed(() => selectedTempComptes.value.length > 0)


// Le store doit exposer un tableau d'IDs (ex: number[] ou string[])
const selectedTempComptes = computed({
  get: () => tempCompteStore.selectedTempComptes,
  set: (value: (string | number)[]) => tempCompteStore.setSelectedTempComptes(value) // ✅ le bon setter
})
// ==================== TRI ====================
function onSort(state: SortState): void {
  sortState.value = state
}
const openCreate = () => {
  titleModal.value = 'Nouveau compte temporaire'
  showModal.value = true
}
const closeModal = () => {
  showModal.value = false
  
}

const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
  tempComptes.refresh()
}
const handleNouveau = () => openCreate()
// ==================== INFINITE SCROLL ====================
async function handleLoadMore() { 
  if (loadingMore.value || !hasMore.value) return
  await tempComptes.loadMore()
}

const handleSupprimer = () => {
  const ids = selectedTempComptes.value
  if (ids.length === 0) {
    warning('Veuillez sélectionner un compte', 'Attention')
    return
  }
  const id = ids[0]
  tempCompteToEdit.value = tempCompteRows.value.find((u: any) => u.id === id) ?? null
  handleConfirmeSuppression()
}

const handleConfirmeSuppression = async () => {
  const tempCompte = tempCompteToEdit.value
  if (!tempCompte) return
  try {
    await deleteTempCompte.mutateAsync(tempCompte.id)
    success('Opération effectuée avec succès', 'Succès')
    tempCompteStore.setSelectedTempComptes([]) // nettoie la sélection
    tempCompteStore.selectTempCompte(null)
    tempComptes.refresh()
  } catch (err: any) {
    error(
      err?.response?.data?.message || err?.message || 'Erreur lors de la suppression.',
      'Erreur',
    )
  }
}

const handleActualise =()=>{
  tempComptes.refresh()
}
// ==================== MODALES ====================
const showModal = ref(false)
const titleModal = ref('')
const tempCompteToEdit = ref<TempCompte | null>(null)


const onRowClick = (row: any, index: number) => {
  console.log("TempComptes.onRowClick row: ", row)

   const ids = selectedTempComptes.value
  if (ids.length === 0) {
    warning('Veuillez sélectionner un compte', 'Attention')
    return
  }
   const id = ids[0]
  tempCompteToEdit.value = tempCompteRows.value.find((u: any) => u.id === id) ?? null
  tempCompteStore.selectTempCompte(tempCompteToEdit.value)
  emit('row-click', row as TempCompte)
}

// Debounce recherche
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans useTempCompte gère le reset + refetch automatiquement
  }, 300)
})

// ✅ AJOUT : watcher qui réagit au trigger du store
watch(
  () => tempCompteStore.refreshTrigger,
  () => {
    console.log('[TempComptes] Refresh déclenché depuis un composant enfant')
    tempComptes.refresh()
  }
)
</script>

<template>
  <TTable
    v-model:selected-keys="selectedTempComptes"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="tempCompteColumns"
    :rows="tempCompteRows"
    :loading="tableLoading"
    :density="tableDensity"
    height="h-full"
    width="w-full"
    title="Comptes Temporaires"
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
      <div class="flex justify-between" v-if="isAfficheSearch" >
        <input  
          v-model="tableSearch"
          type="text"
          placeholder="Rechercher…"
          class="h-8 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
        
      </div>
    </template>

    <template #caption="{ selectedCount, total }">
       <TAction
          :active-actualiser="total>0"
          :masque-impression="true"
          :active-supprimer="selectedCount>0"
          :masque-modifier="true"
          @nouveau="handleNouveau"
          @supprimer="handleSupprimer"
          @actualiser="handleActualise"
        
        /> 
    </template>

    <template #cell-solde="{ value }">
        <TDisplayDecimal :value="value"     /> 
    </template>
    <template #cell-compteType="{ value }">
         <span class="font-mono  text-xl uppercase" v-if="value">{{ value.libelle }}</span>
    </template>

    
    <template #cell-isEnNotreFaveur="{ value }">
        <IconeValider v-if="value"/><IconeNonValider v-else />
    </template>

  </TTable>
  <TModal v-model="showModal"  title="Choix du type de compte" >
    <TTempCompteForm  @success="onFormSuccess"/>
  </TModal>
 
</template>