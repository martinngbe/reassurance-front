<script setup lang="ts">

import TTable from '@/components/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/components/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TAction from '@/components/utilitaire/TAction.vue'
import TModal from '@/components/display/TModal.vue'
import TDemandeConfirmation from '@/components/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/components/toast/useToast.ts'
import TBadge from '@/components/display/TBadge.vue'
import type { DomaineActivite } from '@/referentiel/domaine-activite/domaine-activite'
import { useDomaineActivites } from '@/referentiel/domaine-activite/useDomaineActivite'
import TDomaineActiviteForm from './TDomaineActiviteForm.vue'

// ==================== PAGINATION ====================
const page = ref(1)
const pageSize = ref(PAGE_SIZE)

// ==================== TTABLE ENRICHI ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('md')
const tableSearch = ref('')

const sortState = ref<SortState>({ key: null, direction: null })

// ==================== API ====================
const params = computed(() => ({
  page: page.value,
  limit: pageSize.value,
  search: tableSearch.value.trim() || undefined,
  sortKey: sortState.value.key ?? undefined,
  sortDirection: sortState.value.direction ?? undefined,
}))

const { domaineActivites ,deleteDomaineActivite } = useDomaineActivites(params)
const { success, error, warning, info, add } = useToast()

// Type local pour satisfaire TTable (signature d'index)
type DomaineActiviteRow = DomaineActivite & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const domaineActiviteColumns: TableColumn[] = [ 
  { key: 'code',         label: 'Code',       width: '20%',  minWidth: 150 },
  { key: 'libelle',    label: 'Libellét', width: '75%',  minWidth: 150 },
 
]


const totalItems = ref(0)
const totalPages = ref(0)

const domaineActiviteRows = computed(() => {
  const resultat  = domaineActivites.data.value
  if(!resultat) return []
  if(!resultat.success) return []
  const pageInfo  = resultat.pageInfo
  if(pageInfo){
     totalItems.value = pageInfo.total
     totalPages.value = pageInfo.totalPages
  }
  return resultat.data;
})
// État de chargement exposé au TTable
const tableLoading = computed(() => domaineActivites.isLoading.value || domaineActivites.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)
const isLigneSelectionnee = computed(()=> selectedDomaineActivites.value.length > 0)
const selectedDomaineActivites = ref<(string | number)[]>([])

function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}
// ==================== ACTIONS TAction ====================
// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const domaineActiviteToEdit = ref<DomaineActivite | null>(null)

const openCreate = () => {
  domaineActiviteToEdit.value = null
  titleModal.value = 'Nouveau domaine activite'
  showModal.value = true
}

const openEdit = (domaineActivite: DomaineActiviteRow) => {
  domaineActiviteToEdit.value = domaineActivite
  titleModal.value = 'Modifier domaineActivite'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  domaineActiviteToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
  if (selectedDomaineActivites.value.length === 0) {
    alert('Veuillez sélectionner un domaineActivite')
    return
  }
  const domaineActiviteId = selectedDomaineActivites.value[0]
  const domaineActivite = domaineActiviteRows.value.find((u:any) => u.id === domaineActiviteId)
  if (domaineActivite) openEdit(domaineActivite)
}

const handleSupprimer = async () => {
  if (selectedDomaineActivites.value.length === 0) {
    alert('Veuillez sélectionner un domaineActivite')
    return
  }
  const domaineActiviteId = selectedDomaineActivites.value[0]
  domaineActiviteToEdit.value = domaineActiviteRows.value.find((u:any) => u.id === domaineActiviteId)
  if (!domaineActiviteToEdit.value) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  const domaineActivite = domaineActiviteToEdit.value?? null
  if (!domaineActivite ) return
    try {
        await deleteDomaineActivite.mutateAsync(domaineActivite.id)
        showModalfirmation.value=false 
        success("Opération effectuée avec succès", 'Succès')
        selectedDomaineActivites.value = selectedDomaineActivites.value.filter(
          (id) => id !== domaineActivite.id,
        )
      } catch (err: any) {
        console.error('Erreur suppression:', err)
        const message =  err?.response?.data?.message ||
            err?.message ||
            'Une erreur est survenue lors de la suppression.'
        error(message,'Erreur')
       
      }
}

// Reset page quand la recherche change (avec debounce idéalement)
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
    v-model:selected-keys="selectedDomaineActivites"

    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="domaineActiviteColumns"
    :rows="domaineActiviteRows"
    :loading="tableLoading"
    :density="tableDensity"
   
    height="h-full"
    width="w-full"
    title="DomaineActivites"
    row-key="id"
    striped
    @sort="onSort"
    
  >
    <template #caption-extra>
      <div class="flex justify-between" v-if="isAfficheSearch">
        <input
          v-model="tableSearch"
          type="text"
          placeholder="Rechercher…"
          class="h-8 rounded-lg border border-neutral-300
                 bg-white px-3 text-sm outline-none
                 focus:border-primary-500 focus:ring-2
                 focus:ring-primary-500/20
                 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>
    </template>

    <template #caption="{ selectedCount, total }">
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
      <span class="font-mono  text-xl uppercase">{{ value }}</span>
    </template>
    <template #cell-label="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
    <template #cell-isActif="{ value }">
        <TBadge v-if="value" color="success" dot>actif</TBadge>
        <TBadge v-else color="neutral" dot>inactif</TBadge>
      </template>
  
  </TTable>
    <!-- Modale du formulaire -->
  <TModal v-model="showModal" :title="titleModal" >
    <TDomaineActiviteForm   
      :domaineActivite="domaineActiviteToEdit"
      @success="onFormSuccess"
      @cancel="closeModal"
    />
  </TModal>
        <!-- Modale du formulaire -->
      <TModal v-model="showModalfirmation" 
          title="Demande de confirmation"           >
            <TDemandeConfirmation   
              @annuler="showModalfirmation=false"
              @confirmer="handlConfirmeSuppression"
            > 
              <template #message>
              <p class="text-xl text-neutral-800 dark:text-neutral-300 pb-4"
              >Voulez-vous supprimer la domaineActivite <span class ="font-extrabold"
                  >{{ domaineActiviteToEdit?.code }}</span>
                </p>
              </template>
          </TDemandeConfirmation>   
      </TModal>
</template>
