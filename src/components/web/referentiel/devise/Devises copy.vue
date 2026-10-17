<!-- <script setup lang="ts">
import TTable from '@/components/display/TTable.vue'
import type { SortState, TableColumn } from '@/components/forms/common'
import { computed, ref } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TAction from '@/components/utilitaire/TAction.vue'
import TModal from '@/components/display/TModal.vue'
import TDemandeConfirmation from '@/components/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/components/toast/useToast.ts'
import { useDevises } from '@/referentiel/devise/useDevise.ts'
import type { Devise } from '@/referentiel/devise/devise.ts'
import TDeviseForm from './TDeviseForm.vue'

// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('md')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })

// ==================== PARAMÈTRES (Refs pour réactivité) ====================
const params = {
  page: ref(1),
  limit: ref(PAGE_SIZE),
  search: computed(() => tableSearch.value.trim() || undefined),
  sortKey: computed(() => sortState.value.key ?? undefined),
  sortOrder: computed(() => sortState.value.direction as 'ASC' | 'DESC' | undefined),
}

// ==================== API + CRUD ====================
const { devises, createDevise, updateDevise, deleteDevise } = useDevises(params)
const { success, error, warning, info } = useToast()

type DeviseRow = Devise & { [key: string]: any }

// ==================== COLONNES ====================
const deviseColumns: TableColumn[] = [
  { key: 'code', label: 'Code', width: '15%', minWidth: 150 },
  { key: 'libelle', label: 'Libellé', width: '65%', minWidth: 150 },
  { key: 'cours', label: 'Cours', width: '15%', minWidth: 150, align: 'right' },
]

// ==================== DONNÉES TABLE ====================
const deviseRows = computed(() => devises.items.value)
const tableLoading = computed(() => devises.isLoading.value)
const loadingMore = computed(() => devises.loadingMore.value)
const hasMore = computed(() => devises.hasMore.value)
const totalItems = computed(() => devises.pageInfo.value?.total ?? 0)

const isAfficheSearch = computed(() => totalItems.value > PAGE_SIZE)
const isLigneSelectionnee = computed(() => selectedDevises.value.length > 0)
const selectedDevises = ref<(string | number)[]>([])

// ==================== TRI ====================
function onSort(state: SortState): void {
  sortState.value = state
}

// ==================== INFINITE SCROLL ====================
async function handleLoadMore() {
  if (loadingMore.value || !hasMore.value) return
  await devises.loadMore()
}

// ==================== MODALES ====================
const showModal = ref(false)
const showModalConfirmation = ref(false)
const titleModal = ref('')
const deviseToEdit = ref<Devise | null>(null)

const openCreate = () => {
  deviseToEdit.value = null
  titleModal.value = 'Nouvelle devise'
  showModal.value = true
}

const openEdit = (devise: DeviseRow) => {
  deviseToEdit.value = devise
  titleModal.value = 'Modifier devise'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  deviseToEdit.value = null
}

// ==================== HANDLERS CRUD ====================
// Dans Devises.vue
const onFormSuccess = async (data: Partial<Devise>) => {
  try {
    if (deviseToEdit.value) {
      // UPDATE : les données sont déjà dans la liste via optimistic update du formulaire
      // On refresh pour synchroniser avec le serveur
      await updateDevise.mutateAsync({ id: deviseToEdit.value.id, data })
      success('Devise modifiée avec succès', 'Succès')
    } else {
      // CREATE
      await createDevise.mutateAsync(data as Devise)
      success('Devise créée avec succès', 'Succès')
    }
    closeModal()
  } catch (err: any) {
    error(
      err?.response?.data?.message || err?.message || 'Erreur lors de l\'enregistrement.',
      'Erreur',
    )
  }
}

const handleNouveau = () => openCreate()

const handleModifier = () => {
  if (selectedDevises.value.length === 0) {
    info('Veuillez sélectionner une devise', 'Info')
    return
  }
  const deviseId = selectedDevises.value[0]
  const devise = deviseRows.value.find((u: any) => u.id === deviseId)
  if (devise) openEdit(devise)
}

const handleSupprimer = () => {
  if (selectedDevises.value.length === 0) {
    warning('Veuillez sélectionner une devise', 'Attention')
    return
  }
  const deviseId = selectedDevises.value[0]
  deviseToEdit.value = deviseRows.value.find((u: any) => u.id === deviseId) ?? null
  if (deviseToEdit.value) showModalConfirmation.value = true
}

const handleConfirmeSuppression = async () => {
  const devise = deviseToEdit.value
  if (!devise) return
  try {
    await deleteDevise.mutateAsync(devise.id)
    showModalConfirmation.value = false
    success('Opération effectuée avec succès', 'Succès')
    selectedDevises.value = selectedDevises.value.filter((id) => id !== devise.id)
  } catch (err: any) {
    error(
      err?.response?.data?.message || err?.message || 'Erreur lors de la suppression.',
      'Erreur',
    )
  }
}
</script> -->
<!-- 
<template>
  <TTable
    v-model:selected-keys="selectedDevises"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="deviseColumns"
    :rows="deviseRows"
    :loading="tableLoading"
    :density="tableDensity"
    height="h-full"
    width="w-full"
    title="Devises"
    row-key="id"
    striped
    selectable
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

    <template #cell-code="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>

    <template #cell-libelle="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
  </TTable>

  <TModal v-model="showModal" :title="titleModal">
    <TDeviseForm
      :devise="deviseToEdit"
      :loading="createDevise.isPending.value || updateDevise.isPending.value"
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
          Voulez-vous supprimer la devise
          <span class="font-extrabold">{{ deviseToEdit?.code }}</span>
        </p>
      </template>
    </TDemandeConfirmation>
  </TModal>
</template> -->