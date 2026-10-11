<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TTable from '@/components/display/TTable.vue'
import type { SortState, TableColumn } from '@/components/forms/common'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useUtilisateurs } from '@/referentiel/utilisateur/useUtilisateur'
import TBadge from '@/components/display/TBadge.vue'
import TAction from '@/components/utilitaire/TAction.vue'
import TModal from '@/components/display/TModal.vue'
import GenericCrudForm from '@/components/forms/generic-form/GenericCrudForm.vue'
import type { FieldConfig } from '@/components/forms/generic-form/types-form'
import type { Utilisateur } from '@/referentiel/utilisateur/utilisateur'
import type { TableRow } from '@/components/forms/common'

// ==================== PAGINATION ====================
const page = ref(1)
const pageSize = ref(PAGE_SIZE)

// ==================== TTABLE ENRICHI ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('md')
const tableSearch = ref('')
const selectedUtilisateurs = ref<(string | number)[]>([])
const sortState = ref<SortState>({ key: null, direction: null })

// ==================== API (Queries + Mutations) ====================
const params = computed(() => ({
  page: page.value,
  limit: pageSize.value,
  search: tableSearch.value.trim() || undefined,
  sortKey: sortState.value.key ?? undefined,
  sortDirection: sortState.value.direction ?? undefined,
}))

const {
  utilisateurs,
  createUtilisateur,
  updateUtilisateur,
  deleteUtilisateur,
} = useUtilisateurs(params)

// ==================== DONNÉES TABLE ====================
const utilisateurColumns: TableColumn[] = [
  { key: 'nom', label: 'Nom', width: '15%', minWidth: 150, sortable: true },
  { key: 'prenoms', label: 'Prénoms', width: '25%', minWidth: 150, sortable: true },
  { key: 'email', label: 'Email', width: '15%', minWidth: 150, sortable: true },
  { key: 'isActive', label: 'Actif', width: '5%', minWidth: 15, sortable: true },
]

// ==================== SCHÉMA DU FORMULAIRE ====================
const utilisateurFields: FieldConfig[] = [
  { key: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'Nom' },
  { key: 'prenoms', label: 'Prénoms', type: 'text', required: true, placeholder: 'Prénoms' },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    helpText: 'Utilisé pour la connexion',
  },
  { key: 'isActive', label: 'Actif', type: 'checkbox', placeholder: 'Compte activé' },
]

// ==================== ÉTAT ====================
const showForm = ref(false)
const showModal = ref(false)
const titleModal = ref('')
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const formData = ref<Record<string, any>>({})
const isSelectionLigne = ref(false)
const totalItems = ref(0)
const totalPages = ref(0)
const errorMessage = ref<string | null>(null)

const formMode = computed(() => (isEditing.value ? 'edit' : 'create'))

// Loading global : combine l'état des queries ET des mutations
const loading = computed(
  () =>
    createUtilisateur.isPending.value ||
    updateUtilisateur.isPending.value ||
    deleteUtilisateur.isPending.value,
)

// État de chargement exposé au TTable
const tableLoading = computed(
  () => utilisateurs.isLoading.value || utilisateurs.isFetching.value,
)
// Type qui étend Utilisateur pour satisfaire TableRow
type UtilisateurRow = Utilisateur & { [key: string]: any }
// ==================== DONNÉES TABLE COMPUTED ====================
const utilisateurRows = computed<UtilisateurRow[]>(() => {
  const resultat = utilisateurs.data.value
  if (!resultat) return []
  if (!resultat.success) return []

  const pageInfo = resultat.pageInfo
  if (pageInfo) {
    totalItems.value = pageInfo.total
    totalPages.value = pageInfo.totalPages
  }

  // Cast explicite vers UtilisateurRow[]
  return (resultat.data as UtilisateurRow[]) || []
})

// Récupère l'utilisateur en cours d'édition (utile pour le delete)
const currentEditingUser = computed(() => {
  if (!editingId.value) return null
  return utilisateurRows.value.find((u) => u.id === editingId.value) ?? null
})

// ==================== CRUD ====================
const emptyForm = () =>
  Object.fromEntries(
    utilisateurFields.map((f) => [f.key, f.type === 'checkbox' ? false : '']),
  )

const openCreate = () => {
  errorMessage.value = null
  isEditing.value = false
  editingId.value = null
  formData.value = { ...emptyForm(), isActive: true }
  showForm.value = true
  showModal.value = true
  titleModal.value = 'Nouvel utilisateur'
}

const openEdit = (user: Utilisateur) => {
  errorMessage.value = null
  isEditing.value = true
  editingId.value = user.id
  formData.value = { ...user }
  showForm.value = true
  showModal.value = true
  titleModal.value = 'Modifier utilisateur'
}

const closeModal = () => {
  showModal.value = false
  showForm.value = false
  errorMessage.value = null
}

// ==================== HANDLERS TAction ====================
const handleNouveau = () => {
  openCreate()
}

const handleModifier = () => {
  if (selectedUtilisateurs.value.length === 0) {
    alert('Veuillez sélectionner un utilisateur')
    return
  }
  const userId = selectedUtilisateurs.value[0]
  const user = utilisateurRows.value.find((u) => u.id === userId)
  if (user) openEdit(user)
}

const handleSupprimer = () => {
  if (selectedUtilisateurs.value.length === 0) {
    alert('Veuillez sélectionner un utilisateur')
    return
  }
  const userId = selectedUtilisateurs.value[0]
  const user = utilisateurRows.value.find((u) => u.id === userId)
  if (user) handleDelete(user)
}

const handleImprimer = () => {
  // TODO: Implémenter la logique d'impression
  console.log('--- handleImprimer')
}

// ==================== SAUVEGARDE (Create / Update) ====================
const handleSave = async (data: Record<string, any>) => {
  errorMessage.value = null

  try {
    if (isEditing.value && editingId.value) {
      // UPDATE
      await updateUtilisateur.mutateAsync({
        id: editingId.value,
        data: {
          nom: data.nom,
          prenoms: data.prenoms,
          email: data.email,
        },
      })
    } else {
      // CREATE
      await createUtilisateur.mutateAsync({
        nom: data.nom,
        prenoms: data.prenoms,
        email: data.email,
      })
    }

    // Succès → fermeture
    closeModal()
  } catch (err: any) {
    console.error('Erreur lors de la sauvegarde:', err)
    errorMessage.value =
      err?.response?.data?.message ||
      err?.message ||
      'Une erreur est survenue lors de la sauvegarde.'
  }
}

// ==================== SUPPRESSION ====================
const handleDelete = async (user: Utilisateur) => {
  if (!confirm(`Supprimer ${user.nom} ${user.prenoms} ?`)) return

  try {
    await deleteUtilisateur.mutateAsync(user.id)
    // Réinitialise la sélection si l'utilisateur supprimé était sélectionné
    selectedUtilisateurs.value = selectedUtilisateurs.value.filter(
      (id) => id !== user.id,
    )
  } catch (err: any) {
    console.error('Erreur lors de la suppression:', err)
    alert(
      err?.response?.data?.message ||
        err?.message ||
        'Une erreur est survenue lors de la suppression.',
    )
  }
}

// ==================== HANDLERS TTable ====================
function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1
}

const selection = (row: any, index: number) => {
  console.log('selection de ligne: ', row, ' index: ', index)
  isSelectionLigne.value = row !== null && row !== undefined
}

// Reset page quand la recherche change (avec debounce)
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    page.value = 1
  }, 300)
})
</script>

<template>
  <TTable
    v-model:selected-keys="selectedUtilisateurs"
    :columns="utilisateurColumns"
    :rows="utilisateurRows"
    :loading="tableLoading"
    :density="tableDensity"
    empty-message="Aucun utilisateur"
    height="h-full"
    width="w-full"
    title="Utilisateurs"
    row-key="id"
    striped
    @sort="onSort"
    @row-click="selection"
  >
    <template #caption-extra>
      <div class="flex justify-between" v-if="totalItems > PAGE_SIZE">
        <input
          v-model="tableSearch"
          type="text"
          placeholder="Rechercher…"
          class="h-8 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>
    </template>

    <template #caption="{ selectedCount, total }">
      <div class="flex items-center gap-2">
        <TAction
          :modifier-visible="isSelectionLigne"
          :supprimer-visible="isSelectionLigne"
          :impression-visible="totalItems > 0"
          @nouveau="handleNouveau"
          @modifier="handleModifier"
          @supprimer="handleSupprimer"
          @imprimer="handleImprimer"
        />
      </div>
    </template>

    <template #cell-nom="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>

    <template #cell-prenoms="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>

    <template #cell-email="{ value }">
      <span class="font-mono text-xl lowercase">{{ value }}</span>
    </template>

    <template #cell-isActive="{ value }">
      <TBadge v-if="value" color="success" dot>actif</TBadge>
      <TBadge v-else color="neutral" dot>inactif</TBadge>
    </template>

    <template #empty>
      <p class="py-4 text-center text-sm text-neutral-500">
        Aucun utilisateur trouvé
      </p>
    </template>
  </TTable>

  <!-- Modale du formulaire CRUD -->
  <TModal v-model="showModal" :title="titleModal">
    <!-- Message d'erreur global -->
    <div
      v-if="errorMessage"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
    >
      {{ errorMessage }}
    </div>

    <GenericCrudForm
      v-model="formData"
      :fields="utilisateurFields"
      :mode="formMode"
      :show-delete="isEditing"
      :loading="loading"
      :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
      @submit="handleSave"
      @delete="currentEditingUser && handleDelete(currentEditingUser)"
      @cancel="closeModal"
    />
  </TModal>
</template>