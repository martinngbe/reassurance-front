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
import { useRegions } from '@/referentiel/region/useRegion.ts'
import type { Region } from '@/referentiel/region/region.ts'
import TRegionForm from './TRegionForm.vue'

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

const { regions ,deleteRegion } = useRegions(params)
const { success, error, warning, info, add } = useToast()

// Type local pour satisfaire TTable (signature d'index)
type RegionRow = Region & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const regionColumns: TableColumn[] = [ 
  { key: 'code',       label: 'Code',       width: '20%',  minWidth: 150 },
  { key: 'libelle',    label: 'Libellé',    width: '75%',  minWidth: 150 },
]


const totalItems = ref(0)
const totalPages = ref(0)

const regionRows = computed(() => {
  const resultat  = regions.data.value
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
const tableLoading = computed(() => regions.isLoading.value || regions.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)
const isLigneSelectionnee = computed(()=> selectedRegions.value.length > 0)
const selectedRegions = ref<(string | number)[]>([])

function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}
// ==================== ACTIONS TAction ====================
// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const regionToEdit = ref<Region | null>(null)

const openCreate = () => {
  regionToEdit.value = null
  titleModal.value = 'Nouvel region'
  showModal.value = true
}

const openEdit = (region: RegionRow) => {
  regionToEdit.value = region
  titleModal.value = 'Modifier region'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  regionToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
  if (selectedRegions.value.length === 0) {
    alert('Veuillez sélectionner un region')
    return
  }
  const regionId = selectedRegions.value[0]
  const region = regionRows.value.find((u:any) => u.id === regionId)
  if (region) openEdit(region)
}

const handleSupprimer = async () => {
  if (selectedRegions.value.length === 0) {
    alert('Veuillez sélectionner un region')
    return
  }
  const regionId = selectedRegions.value[0]
  regionToEdit.value = regionRows.value.find((u:any) => u.id === regionId)
  if (!regionToEdit.value) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  const region = regionToEdit.value?? null
  if (!region ) return
    try {
        await deleteRegion.mutateAsync(region.id)
        showModalfirmation.value=false 
        success("Opération effectuée avec succès", 'Succès')
        selectedRegions.value = selectedRegions.value.filter(
          (id) => id !== region.id,
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
    v-model:selected-keys="selectedRegions"
    
    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="regionColumns"
    :rows="regionRows"
    :loading="tableLoading"
    :density="tableDensity"
   
    height="h-full"
    width="w-full"
    title="Regions"
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
    <template #cell-libelle="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
   
  
  </TTable>
    <!-- Modale du formulaire -->
  <TModal v-model="showModal" :title="titleModal" >
    <TRegionForm    
      :region="regionToEdit"
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
              >Voulez-vous supprimer la region <span class ="font-extrabold"
                  >{{ regionToEdit?.code }}</span>
                </p>
              </template>
          </TDemandeConfirmation>   
      </TModal>
</template>
