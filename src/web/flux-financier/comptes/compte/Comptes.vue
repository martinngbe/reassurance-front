<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

import type { PaginationParams } from '@/type/pagination.ts'
import TModal from '@/composants/display/TModal.vue'
import { useComptes } from '@/services/flux-financiers/comptes/compte/useCompte'
import type { Compte } from '@/services/flux-financiers/comptes/compte/compte'
//import TCompteForm from './TCompteForm.vue'
import TAction from '@/composants/utilitaire/TAction.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import { useCompteStore } from '@/services/flux-financiers/comptes/compte/compte.store.ts'
import TDisplayDecimal from '@/composants/utilitaire/TDisplayDecimal.vue'
import IconeValider from '@/composants/icone/IconeValider.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import TTempCompteForm from '../temp-compte/TTempCompteForm.vue'
import TTempCompte from '../temp-compte/TTempCompte.vue'
import TButton from '@/composants/forms/TButton.vue'
import { useTempCompteStore } from '@/services/flux-financiers/comptes/temp-compte/temp-compte.store.ts'
import { useTempComptes } from '@/services/flux-financiers/comptes/temp-compte/useTempCompte.ts'

// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const emit = defineEmits<{ 
  (e: 'row-click',  compte: any): void
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
// Ne pas destructurer comptes
const compteStore = useCompteStore()
const currentCompte = compteStore.currentCompte
const store = useComptes({})
const { comptes , deleteCompte } = store

type CompteRow = Compte & { [key: string]: any }

// ==================== COLONNES ====================

const compteColumns: TableColumn[] = [ 
  //{ key: 'numero',           label: 'N° Compte',          width: '20%',  minWidth: 150 , sortable: true},
  { key: 'solde',            label: 'Solde',              width: '35%',  minWidth: 150 , align:'right' },  
  { key: 'compteType',       label: 'Type',               width: '35%',  minWidth: 150 , }, 
  { key: 'isEnNotreFaveur',  label: 'En Notre faveur',    width: '30%',  minWidth: 150 , align:'center' },
 
]

// ==================== DONNÉES TABLE ====================
// Accéder via store.comptes
const compteRows = computed(() => store.comptes.items.value)
const tableLoading = computed(() => store.comptes.isLoading.value)
const loadingMore = computed(() => store.comptes.loadingMore.value)
const hasMore = computed(() => store.comptes.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => comptes.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
const isLigneSelectionnee = computed(() => selectedComptes.value.length > 0)


// Le store doit exposer un tableau d'IDs (ex: number[] ou string[])
const selectedComptes = computed({
  get: () => compteStore.selectedComptes,
  set: (value: (string | number)[]) => compteStore.setSelectedComptes(value) // ✅ le bon setter
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
  comptes.refresh()
}
const handleNouveau = () => openCreate()
// ==================== INFINITE SCROLL ====================
async function handleLoadMore() { 
  if (loadingMore.value || !hasMore.value) return
  await comptes.loadMore()
}

const handleSupprimer = () => {
  const ids = selectedComptes.value
  if (ids.length === 0) {
    warning('Veuillez sélectionner un compte', 'Attention')
    return
  }
  const id = ids[0]
  compteToEdit.value = compteRows.value.find((u: any) => u.id === id) ?? null
  handleConfirmeSuppression()
}

const handleConfirmeSuppression = async () => {
  const compte = compteToEdit.value
  if (!compte) return
  try {
    await deleteCompte.mutateAsync(compte.id)
    success('Opération effectuée avec succès', 'Succès')
    compteStore.setSelectedComptes([]) // nettoie la sélection
    compteStore.selectCompte(null)
    comptes.refresh()
  } catch (err: any) {
    error(
      err?.response?.data?.message || err?.message || 'Erreur lors de la suppression.',
      'Erreur',
    )
  }
}

const handleActualise =()=>{
  comptes.refresh()
}
// ==================== MODALES ====================
const showModal = ref(false)
const titleModal = ref('')
const compteToEdit = ref<Compte | null>(null)


const onRowClick = (row: any, index: number) => {
  console.log("Comptes.onRowClick row: ", row)

   const ids = selectedComptes.value
  if (ids.length === 0) {
    warning('Veuillez sélectionner un compte', 'Attention')
    return
  }
   const id = ids[0]
  compteToEdit.value = compteRows.value.find((u: any) => u.id === id) ?? null
  compteStore.selectCompte(compteToEdit.value)
  emit('row-click', row as Compte)
}
const tempCompteStore = useTempCompteStore()
const currentTempCompte = computed(()=>tempCompteStore.currentTempCompte)
const { transfererCompte } = useTempComptes()

const handleTransfertTempCompteVersCompte = async () => {
  if (!currentTempCompte.value) {
    info("Il n'y a aucun compte à transférer ...", "Information")
    return
  }

  try {
    // ✅ Utiliser .mutateAsync() pour pouvoir faire un await
    const resultat = await transfererCompte.mutateAsync(currentTempCompte.value.id)
    console.log("Transfert réussi :", resultat)
    showModal.value = false
  } catch (error) {
    console.error("Erreur lors du transfert :", error)
    // Gérer l'erreur (ex: afficher un toast d'erreur)
  }
}

// Debounce recherche
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans useCompte gère le reset + refetch automatiquement
  }, 300)
})

// ✅ AJOUT : watcher qui réagit au trigger du store
watch(
  () => compteStore.refreshTrigger,
  () => {
    console.log('[Comptes] Refresh déclenché depuis un composant enfant')
    comptes.refresh()
  }
)
</script>

<template>
  <TTable
    v-model:selected-keys="selectedComptes"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="compteColumns"
    :rows="compteRows"
    :loading="tableLoading"
    :density="tableDensity"
    height="h-full"
    width="w-full"
    title="Comptes oraires"
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
  <TModal v-model="showModal" width="85%" height="85%"  title="Process de création de compte ....." >
   
    <template #default>
            <TTempCompte  @success="onFormSuccess"/>
    </template>
    <template #footer>
            <div class="flex justify-center gap-5">
                  <TButton variant="soft"  width="xl"
                   @click="showModal=false">
                        
                         <p class="text-md font-bold uppercase">Annuller</p>  
                  </TButton>
                  <TButton variant="solid" width="xl"
                  @click="handleTransfertTempCompteVersCompte">
                      <p class="text-md font-bold uppercase">Validation finale</p>  
                  </TButton>
            </div>
    </template>
  </TModal>
 
</template>