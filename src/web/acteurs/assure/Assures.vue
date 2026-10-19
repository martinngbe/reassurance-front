<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TAction from '@/composants/utilitaire/TAction.vue'
import TModal from '@/composants/display/TModal.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'

import type { PaginationParams } from '@/type/pagination.ts'
import { useAssures } from '@/services/acteurs/assure/useAssure'
import { useToast } from '@/composants/toast/useToast'
import type { Assure } from '@/services/acteurs/assure/assure'
import TAssureForm from './TAssureForm.vue'

// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('md')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })


// ✅ Corrigé
const params = computed<PaginationParams>(() => ({
  page: 1,
  limit: PAGE_SIZE,
  search: tableSearch.value.trim() || undefined,
  sortKey: sortState.value.key ?? undefined,
  sortOrder: sortState.value.direction as 'ASC' | 'DESC' | undefined,
}))
// ==================== API + CRUD ====================
// Ne pas destructurer assures
const store = useAssures(params)
const { assures, createAssure, updateAssure, deleteAssure } = store
//const { assures, createAssure, updateAssure, deleteAssure } = useAssures(params)
const { success, error, warning, info } = useToast()

console.warn(" -- Assures.vue assures:",assures)

type AssureRow = Assure & { [key: string]: any }

// ==================== COLONNES ====================
const assureColumns: TableColumn[] = [
  { key: 'pays',          label: 'Pays',     width: '5%', minWidth: 150 }, 
  { key: 'numero',        label: 'Numéro',  width: '10%', minWidth: 150 },
  { key: 'sigle',         label: 'Sigle',   width: '15%', minWidth: 150 },
  { key: 'raisonSociale', label: 'Raison sociale', width: '50%', minWidth: 150 },
  { key: 'domaineActivite', label: 'Domaine activité', width: '20%', minWidth: 150 },
]

// ==================== DONNÉES TABLE ====================
// Accéder via store.assures
const assureRows = computed(() => store.assures.items.value)
const tableLoading = computed(() => store.assures.isLoading.value)
const loadingMore = computed(() => store.assures.loadingMore.value)
const hasMore = computed(() => store.assures.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => assures.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
const isLigneSelectionnee = computed(() => selectedAssures.value.length > 0)
const selectedAssures = ref<(string | number)[]>([])

// ==================== TRI ====================
function onSort(state: SortState): void {
  sortState.value = state
}

// ==================== INFINITE SCROLL ====================
async function handleLoadMore() {
  console.warn(" -- Assure.handleLoadMore -- ")
  console.log(" loadingMore.value:",loadingMore.value)
  console.log(" hasMore.value:",hasMore.value)
  if (loadingMore.value || !hasMore.value) return
  await assures.loadMore()
}

// ==================== MODALES ====================
const showModal = ref(false)
const showModalConfirmation = ref(false)
const titleModal = ref('')
const assureToEdit = ref<Assure | null>(null)

const openCreate = () => {
  assureToEdit.value = null
  titleModal.value = 'Nouveau assuré'
  showModal.value = true
}

const openEdit = (assure: AssureRow) => {
  assureToEdit.value = assure
  titleModal.value = 'Modifier assuré'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  assureToEdit.value = null
}

// ==================== HANDLERS CRUD ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
  assures.refresh()
}

const handleNouveau = () => openCreate()

const handleModifier = () => {
  if (selectedAssures.value.length === 0) {
    info('Veuillez sélectionner une assure', 'Info')
    return
  }
  const assureId = selectedAssures.value[0]
  const assure = assureRows.value.find((u: any) => u.id === assureId)
  if (assure) openEdit(assure)
}

const handleSupprimer = () => {
  if (selectedAssures.value.length === 0) {
    warning('Veuillez sélectionner une assure', 'Attention')
    return
  }
  const assureId = selectedAssures.value[0]
  assureToEdit.value = assureRows.value.find((u: any) => u.id === assureId) ?? null
  if (assureToEdit.value) showModalConfirmation.value = true
}

const handleConfirmeSuppression = async () => {
  const assure = assureToEdit.value
  if (!assure) return
  try {
    await deleteAssure.mutateAsync(assure.id)
    showModalConfirmation.value = false
    success('Opération effectuée avec succès', 'Succès')
    selectedAssures.value = selectedAssures.value.filter((id) => id !== assure.id)
  } catch (err: any) {
    error(
      err?.response?.data?.message || err?.message || 'Erreur lors de la suppression.',
      'Erreur',
    )
  }
}

// Debounce recherche
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans useAssure gère le reset + refetch automatiquement
  }, 300)
})
</script>

<template>
  <TTable
    v-model:selected-keys="selectedAssures"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="assureColumns"
    :rows="assureRows"
    :loading="tableLoading"
    :density="tableDensity"
    height="h-full"
    width="w-full"
    title="Assures"
    row-key="id"
    striped
    !selectable
    @sort="onSort"
    :infinite-scroll="true"
    :has-more="hasMore"
    :loading-more="loadingMore"
    :scroll-threshold="200"
    end-message="— Fin des données —"
    :show-end-message="true"
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
      <TAction
        :active-modifier="isLigneSelectionnee"
        :active-supprimer="isLigneSelectionnee"
        :masque-impression="true"
        @nouveau="handleNouveau"
        @modifier="handleModifier"
        @supprimer="handleSupprimer"
      />
    </template>

    

    <template #cell-numero="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
    <template #cell-pays="{ value }">
      <span class="font-mono text-xl uppercase">{{ value.code }}</span>
    </template>
    <template #cell-domaineActivite="{ value }">
      <span class="font-mono text-md uppercase">{{ value.libelle }}</span>
    </template>
    <template #cell-sigle="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
    <template #cell-raisonSociale="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>

  </TTable>

  <TModal v-model="showModal" :title="titleModal">
    <TAssureForm
      :assure="assureToEdit"
      :loading="createAssure.isPending.value || updateAssure.isPending.value"
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
          Voulez-vous supprimer la assure
          <span class="font-extrabold">{{ assureToEdit?.raisonSociale }}</span>
        </p>
      </template>
    </TDemandeConfirmation>
  </TModal>
</template>