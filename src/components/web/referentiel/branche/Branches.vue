<script setup lang="ts">

import TTable from '@/components/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/components/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TAction from '@/components/utilitaire/TAction.vue'
import TModal from '@/components/display/TModal.vue'
import TDemandeConfirmation from '@/components/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/components/toast/useToast.ts'
import { useBranches } from '@/referentiel/branche/useBranche.ts'
import type { Branche } from '@/referentiel/branche/branche.ts'
import TBrancheForm from './TBrancheForm.vue'

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

const { branches ,deleteBranche } = useBranches(params)
const { success, error, warning, info, add } = useToast()

// Type local pour satisfaire TTable (signature d'index)
type BrancheRow = Branche & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const brancheColumns: TableColumn[] = [ 
  { key: 'code',       label: 'Code',       width: '20%',  minWidth: 150 },
  { key: 'libelle',    label: 'Libellé',    width: '75%',  minWidth: 150 },
 
]
const emit = defineEmits<{ 
  (e: 'row-click',  branche: any): void
}>()

const totalItems = ref(0)
const totalPages = ref(0)

const brancheRows = computed(() => {
  const resultat  = branches.data.value
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
const tableLoading = computed(() => branches.isLoading.value || branches.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)
const isLigneSelectionnee = computed(()=> selectedBranches.value.length > 0)
const selectedBranches = ref<(string | number)[]>([])

function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}
// ==================== ACTIONS TAction ====================
// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const brancheToEdit = ref<Branche | null>(null)

const openCreate = () => {
  brancheToEdit.value = null
  titleModal.value = 'Nouvel branche'
  showModal.value = true
}

const openEdit = (branche: BrancheRow) => {
  brancheToEdit.value = branche
  titleModal.value = 'Modifier branche'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  brancheToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
  if (selectedBranches.value.length === 0) {
    info('Veuillez sélectionner un branche', 'Info')
    return
  }
  const brancheId = selectedBranches.value[0]
  const branche = brancheRows.value.find((u:any) => u.id === brancheId)
  if (branche) openEdit(branche)
}

const handleSupprimer = async () => {
  if (selectedBranches.value.length === 0) {
    warning('Veuillez sélectionner un branche',"Attention")
    return
  }
  const brancheId = selectedBranches.value[0]
  brancheToEdit.value = brancheRows.value.find((u:any) => u.id === brancheId)
  if (!brancheToEdit.value) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  const branche = brancheToEdit.value?? null
  if (!branche ) return
    try {
        await deleteBranche.mutateAsync(branche.id)
        showModalfirmation.value=false 
        success("Opération effectuée avec succès", 'Succès')
        selectedBranches.value = selectedBranches.value.filter(
          (id) => id !== branche.id,
        )
      } catch (err: any) {
        console.error('Erreur suppression:', err)
        const message =  err?.response?.data?.message ||
            err?.message ||
            'Une erreur est survenue lors de la suppression.'
        error(message,'Erreur')
       
      }
}
const onRowClick = ( row: any, index: number)=>{       
    emit('row-click',row as Branche)
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
    v-model:selected-keys="selectedBranches"

    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="brancheColumns"
    :rows="brancheRows"
    :loading="tableLoading"
    :density="tableDensity"
   
    height="h-full"
    width="w-full"
    title="Branches"
    row-key="id"
    striped

    @row-click="onRowClick"
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
    <template #cell-libelle="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
   
  
  </TTable>
    <!-- Modale du formulaire -->
  <TModal v-model="showModal" :title="titleModal" >
    <TBrancheForm    
      :branche="brancheToEdit"
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
              >Voulez-vous supprimer la branche <span class ="font-extrabold"
                  >{{ brancheToEdit?.code }}</span>
                </p>
              </template>
          </TDemandeConfirmation>   
      </TModal>
</template>
