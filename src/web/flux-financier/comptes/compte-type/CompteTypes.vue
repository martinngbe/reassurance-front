<script setup lang="ts">

import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/composants/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TAction from '@/composants/utilitaire/TAction.vue'
import TModal from '@/composants/display/TModal.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import TCompteTypeForm from './TCompteTypeForm.vue'
import type { CompteType } from '@/services/flux-financiers/comptes/compte-type/compte-type.ts'
import { useCompteTypes } from '@/services/flux-financiers/comptes/compte-type/useCompteType.ts'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'

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
  sortDirection: sortState.value.direction as 'ASC' | 'DESC' | undefined,
}))

const { compteTypes ,deleteCompteType } = useCompteTypes(params)
const { success, error, warning, info, add } = useToast()

// Type local pour satisfaire TTable (signature d'index)
type CompteTypeRow = CompteType & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const compteTypeColumns: TableColumn[] = [ 
  { key: 'code',       label: 'Code',       width: '20%',  minWidth: 150 , sortable: true},
  { key: 'libelle',    label: 'Libellé',    width: '80%',  minWidth: 150 , sortable: true},
 
]
const emit = defineEmits<{ 
  (e: 'row-click',  compteType: any): void
}>()

const totalItems = ref(0)
const totalPages = ref(0)

const compteTypeRows = computed(() => {
  const resultat  = compteTypes.data.value
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
const tableLoading = computed(() => compteTypes.isLoading.value || compteTypes.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)
const isLigneSelectionnee = computed(()=> selectedCompteTypes.value.length > 0)
const selectedCompteTypes = ref<(string | number)[]>([])

function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}
// ==================== ACTIONS TAction ====================
// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const compteTypeToEdit = ref<CompteType | null>(null)

const openCreate = () => {
  compteTypeToEdit.value = null
  titleModal.value = 'Nouvel compteType'
  showModal.value = true
}

const openEdit = (compteType: CompteTypeRow) => {
  compteTypeToEdit.value = compteType
  titleModal.value = 'Modifier compteType'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  compteTypeToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
  if (selectedCompteTypes.value.length === 0) {
    info('Veuillez sélectionner un compteType', 'Info')
    return
  }
  const compteTypeId = selectedCompteTypes.value[0]
  const compteType = compteTypeRows.value.find((u:any) => u.id === compteTypeId)
  if (compteType) openEdit(compteType)
}

const handleSupprimer = async () => {
  if (selectedCompteTypes.value.length === 0) {
    warning('Veuillez sélectionner un compteType',"Attention")
    return
  }
  const compteTypeId = selectedCompteTypes.value[0]
  compteTypeToEdit.value = compteTypeRows.value.find((u:any) => u.id === compteTypeId)
  if (!compteTypeToEdit.value) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  const compteType = compteTypeToEdit.value?? null
  if (!compteType ) return
    try {
        await deleteCompteType.mutateAsync(compteType.id)
        showModalfirmation.value=false 
        success("Opération effectuée avec succès", 'Succès')
        selectedCompteTypes.value = selectedCompteTypes.value.filter(
          (id) => id !== compteType.id,
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
    emit('row-click',row as CompteType)
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
    v-model:selected-keys="selectedCompteTypes"

    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="compteTypeColumns"
    :rows="compteTypeRows"
    :loading="tableLoading"
    :density="tableDensity"
   
    height="h-full"
    width="w-full"
    title="Compte Types"
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
       <TTitreSousModule libelle="Table Système" />
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
    <TCompteTypeForm    
      :compteType="compteTypeToEdit"
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
              >Voulez-vous supprimer la compteType <span class ="font-extrabold"
                  >{{ compteTypeToEdit?.code }}</span>
                </p>
              </template>
          </TDemandeConfirmation>   
      </TModal>
</template>
