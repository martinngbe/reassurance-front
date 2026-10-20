<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TAction from '@/composants/utilitaire/TAction.vue'
import TModal from '@/composants/display/TModal.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'

import type { PaginationParams } from '@/type/pagination.ts'
import TActeurForm from './TActeurForm.vue'
import { useActeurs } from '@/services/acteurs/acteur/useActeur.ts'
import { useToast } from '@/composants/toast/useToast.ts'
import type { Acteur } from '@/services/acteurs/acteur/acteur.ts'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import IconeValider from '@/composants/icone/IconeValider.vue'

// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const emit = defineEmits<{ 
  (e: 'row-click',  acteur: any): void
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
// Ne pas destructurer acteurs
const store = useActeurs(params)
const { acteurs, createActeur, updateActeur, deleteActeur } = store
const { success, error, warning, info } = useToast()

console.warn(" -- Acteurs.vue acteurs:",acteurs)

type ActeurRow = Acteur & { [key: string]: any }

// ==================== COLONNES ====================
const acteurColumns: TableColumn[] = [
  { key: 'pays',                 label: 'Pays',       width: 80,   minWidth: 80 , sortable: true},
  { key: 'isReassureur',         label: 'Réass',      width: 80,   minWidth: 80,  align: 'center' , sortable: true},
  { key: 'isCourtier',           label: 'Courtier',   width: 100,  minWidth: 100, align: 'center' , sortable: true},
  { key: 'isCompagnieAssurance', label: 'Cie',        width: 80,   minWidth: 80,  align: 'center' , sortable: true},
  { key: 'numero',               label: 'Numéro',     width: 120,  minWidth: 120 , sortable: true},
  { key: 'sigle',                label: 'Sigle',      width: 250,  minWidth: 150 , sortable: true},
  { key: 'raisonSociale',        label: 'Raison sociale', width: 400, minWidth: 200 , sortable: true},
  { key: 'adresse',              label: 'Adresse',    width: 550,  minWidth: 150 },
  { key: 'telephone',            label: 'Téléphone',  width: 350,  minWidth: 120 },
  { key: 'siteweb',              label: 'Site Web',   width: 400,  minWidth: 400 },
]
// ==================== DONNÉES TABLE ====================
// Accéder via store.acteurs
const acteurRows = computed(() => store.acteurs.items.value)
const tableLoading = computed(() => store.acteurs.isLoading.value)
const loadingMore = computed(() => store.acteurs.loadingMore.value)
const hasMore = computed(() => store.acteurs.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => acteurs.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
const isLigneSelectionnee = computed(() => selectedActeurs.value.length > 0)
const selectedActeurs = ref<(string | number)[]>([])

// ==================== TRI ====================
function onSort(state: SortState): void {
  sortState.value = state
}

// ==================== INFINITE SCROLL ====================
async function handleLoadMore() {
 
  if (loadingMore.value || !hasMore.value) return
  await acteurs.loadMore()
}

// ==================== MODALES ====================
const showModal = ref(false)
const showModalConfirmation = ref(false)
const titleModal = ref('')
const acteurToEdit = ref<Acteur | null>(null)

const openCreate = () => {
  acteurToEdit.value = null
  titleModal.value = 'Nouvelle acteur'
  showModal.value = true
}

const openEdit = (acteur: ActeurRow) => {
  acteurToEdit.value = acteur
  titleModal.value = 'Modifier acteur'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  acteurToEdit.value = null
}

// ==================== HANDLERS CRUD ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
  acteurs.refresh()
}

const handleNouveau = () => openCreate()

const handleModifier = () => {
  if (selectedActeurs.value.length === 0) {
    info('Veuillez sélectionner une acteur', 'Info')
    return
  }
  const acteurId = selectedActeurs.value[0]
  const acteur = acteurRows.value.find((u: any) => u.id === acteurId)
  if (acteur) openEdit(acteur)
}

const handleSupprimer = () => {
  if (selectedActeurs.value.length === 0) {
    warning('Veuillez sélectionner une acteur', 'Attention')
    return
  }
  const acteurId = selectedActeurs.value[0]
  acteurToEdit.value = acteurRows.value.find((u: any) => u.id === acteurId) ?? null
  if (acteurToEdit.value) showModalConfirmation.value = true
}

const handleConfirmeSuppression = async () => {
  const acteur = acteurToEdit.value
  if (!acteur) return
  try {
    await deleteActeur.mutateAsync(acteur.id)
    showModalConfirmation.value = false
    success('Opération effectuée avec succès', 'Succès')
    selectedActeurs.value = selectedActeurs.value.filter((id) => id !== acteur.id)
  } catch (err: any) {
    error(
      err?.response?.data?.message || err?.message || 'Erreur lors de la suppression.',
      'Erreur',
    )
  }
}

const onRowClick = ( row: any, index: number)=>{       
    emit('row-click',row as Acteur)
}
// Debounce recherche
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans useActeur gère le reset + refetch automatiquement
  }, 300)
})
</script>

<template>
  <TTable
    v-model:selected-keys="selectedActeurs"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="acteurColumns"
    :rows="acteurRows"
    :loading="tableLoading"
    :density="tableDensity"
    height="h-full"
    width="w-full"
    title="Acteurs"
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
      <TAction
        :active-modifier="isLigneSelectionnee"
        :active-supprimer="isLigneSelectionnee"
        :masque-impression="true"
        @nouveau="handleNouveau"
        @modifier="handleModifier"
        @supprimer="handleSupprimer"
      />
    </template>
   <template #cell-pays="{ value }">
      <span class="font-mono text-xl" v-if="value">{{ value.code }}</span>
    </template>
    <template #cell-isReassureur="{ value }">
        <IconeValider v-if="value==true"/>
        <IconeNonValider v-else />
    </template>
    <template #cell-isCourtier="{ value }">
        <IconeValider v-if="value==true"/>
        <IconeNonValider v-else />
    </template>
    <template #cell-isCompagnieAssurance="{ value }">
        <IconeValider v-if="value==true"/>
        <IconeNonValider v-else />
    </template>

    <template #cell-numero="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>

    <template #cell-sigle="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
    <template #cell-raisonSociale="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
   <template #cell-adresse="{ value }">
      <span class="font-mono text-md uppercase">{{ value }}</span>
    </template>
 
       <template #cell-telephone="{ value }">
      <span class="font-mono text-md uppercase">{{ value }}</span>
    </template>
    <template #cell-siteweb="{ value }">
      <span class="font-mono text-md lowercase" v-if="value">{{ value }}</span>
    </template>
  

  </TTable>

  <TModal v-model="showModal" :title="titleModal">
    <TActeurForm
      :acteur="acteurToEdit"
      :loading="createActeur.isPending.value || updateActeur.isPending.value"
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
          Voulez-vous supprimer la acteur
          <span class="font-extrabold">{{ acteurToEdit?.raisonSociale }}</span>
        </p>
      </template>
    </TDemandeConfirmation>
  </TModal>
</template>