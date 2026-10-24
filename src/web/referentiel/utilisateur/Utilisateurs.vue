<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useUtilisateurs } from '@/services/referentiel/utilisateur/useUtilisateur'
import TBadge from '@/composants/display/TBadge.vue'
import TAction from '@/composants/utilitaire/TAction.vue'
import TModal from '@/composants/display/TModal.vue'
import type { Utilisateur } from '@/services/referentiel/utilisateur/utilisateur'
import TUtilisateurForm from './TUtilisateurForm.vue'


// Type local pour satisfaire TTable (signature d'index)
type UtilisateurRow = Utilisateur & { [key: string]: any }

// ==================== PAGINATION & TRI ====================
const page = ref(1)
const pageSize = ref(PAGE_SIZE)
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const tableDensity = ref<'sm' | 'md' | 'lg'>('md')


// ==================== API ====================
const params = computed(() => ({
  page: page.value,
  limit: pageSize.value,
  search: tableSearch.value.trim() || undefined,
  sortKey: sortState.value.key ?? undefined,
  sortDirection: sortState.value.direction as 'ASC' | 'DESC' | undefined,
}))
const { utilisateurs, deleteUtilisateur } = useUtilisateurs(params)


// ==================== COLONNES TABLE ====================
const utilisateurColumns: TableColumn[] = [
  { key: 'nom',     label: 'Nom',     width: '15%', minWidth: 150, sortable: true },
  { key: 'prenoms', label: 'Prénoms', width: '25%', minWidth: 150, sortable: true },
  { key: 'email',   label: 'Email',   width: '15%', minWidth: 150, sortable: true },
  { key: 'isActive',label: 'Actif',   width: '5%',   minWidth: 15, sortable: true },
]

// ==================== DONNÉES TABLE ====================
const totalItems = ref(0)
const totalPages = ref(0)
// initialisation des données utilisateurRows
const utilisateurRows = computed<UtilisateurRow[]>(() => {
  const resultat = utilisateurs.data.value
  console.log("utilisateurs.data.value:",resultat)
  if (!resultat?.success) return []

  const pageInfo = resultat.pageInfo
  if (pageInfo) {
    totalItems.value = pageInfo.total
    totalPages.value = pageInfo.totalPages
  }

  return (resultat.data as UtilisateurRow[]) || []
})
// ✨ Initialisation avec l'ID de la 1ère ligne
const firstLigneSelected = ref<(number | string )>(utilisateurRows.value[0]?.id?? 0  )
// ==================== SÉLECTION ====================
// la liste des utilisateurs séléctionnés
// cette variable se charge dynamiquementpar v-model:selected-keys="selectedUtilisateurs"   
const selectedUtilisateurs = ref<(number | string)[]>([firstLigneSelected.value])

const tableLoading = computed(
  () => utilisateurs.isLoading.value || utilisateurs.isFetching.value,
)

// ==================== MODALE ====================
const showModal = ref(false)
const titleModal = ref('')
const utilisateurToEdit = ref<Utilisateur | null>(null)

const emit = defineEmits<{
  (e: 'select-row', utilisateurId: number): void
}>()

const openCreate = () => {
  utilisateurToEdit.value = null
  titleModal.value = 'Nouvel utilisateur'
  showModal.value = true
}

const openEdit = (user: UtilisateurRow) => {
  utilisateurToEdit.value = user
  titleModal.value = 'Modifier utilisateur'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  utilisateurToEdit.value = null
}

const onFormSuccess = (message: string) => {
  closeModal()
  // Optionnel : afficher un toast de succès
  console.log(message)
}
const isLigneSelectionnee = computed(()=> selectedUtilisateurs.value.length>0)
// ==================== ACTIONS TAction ====================
const onSelectRow =(row: UtilisateurRow, index: number)=>{
  emit("select-row", row.id)
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
  console.warn("----------handleModifier---------------------")
  console.info("selectedUtilisateurs.value:",selectedUtilisateurs.value)
  if (selectedUtilisateurs.value.length === 0) {
    alert('Veuillez sélectionner un utilisateur')
    return
  }
  const userId = selectedUtilisateurs.value[0]
  console.info("userId:",userId)
  const user = utilisateurRows.value.find((u) => u.id === userId)
  console.info("user:",user)
  console.warn("----------handleModifier---------------------")
  if (user) openEdit(user)
}
const handleSupprimer = async () => {
  if (selectedUtilisateurs.value.length === 0) {
    alert('Veuillez sélectionner un utilisateur')
    return
  }
  const userId = selectedUtilisateurs.value[0]
  const user = utilisateurRows.value.find((u) => u.id === userId)
  if (!user) return

  if (!confirm(`Supprimer ${user.nom} ${user.prenoms} ?`)) return

  try {
    await deleteUtilisateur.mutateAsync(user.id)
    selectedUtilisateurs.value = selectedUtilisateurs.value.filter(
      (id) => id !== user.id,
    )
  } catch (err: any) {
    console.error('Erreur suppression:', err)
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



// Reset page à la recherche (debounce)
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
    @row-click="onSelectRow"  
    
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

    <template #caption>
      <div class="flex items-center gap-2">
        <TAction
         
          :active-modifier="isLigneSelectionnee"        
          :masque-impression="true"
          :masque-supprimer="true"
          @nouveau="handleNouveau"
          @modifier="handleModifier"
          
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

  <!-- Modale du formulaire -->
  <TModal v-model="showModal" :title="titleModal">
    <TUtilisateurForm
      :utilisateur="utilisateurToEdit"
      @success="onFormSuccess"
      @cancel="closeModal"
    />
  </TModal>
</template>