<script setup lang="ts">

import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/composants/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TModal from '@/composants/display/TModal.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'
import type { NaturePlacement } from '@/services/referentiel/nature-placement/nature-placement'
import { useNaturePlacements } from '@/services/referentiel/nature-placement/useNaturePlacement'


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

const { naturePlacements ,deleteNaturePlacement } = useNaturePlacements(params)
const { success, error, warning, info, add } = useToast()

// Type local pour satisfaire TTable (signature d'index)
type NaturePlacementRow = NaturePlacement & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const naturePlacementColumns: TableColumn[] = [ 
  { key: 'code',              label: 'Code',        width: '25%',  minWidth: 150 , sortable: true},
  { key: 'libelle',           label: 'Libellé',     width: '75%',  minWidth: 150 , sortable: true},
 
]
const emit = defineEmits<{ 
  (e: 'row-click',  naturePlacement: any): void
}>()

const totalItems = ref(0)
const totalPages = ref(0)

const naturePlacementRows = computed(() => {
  const resultat  = naturePlacements.data.value
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
const tableLoading = computed(() => naturePlacements.isLoading.value || naturePlacements.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)
const isLigneSelectionnee = computed(()=> selectedNaturePlacements.value.length > 0)
const selectedNaturePlacements = ref<(string | number)[]>([])

function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}
// ==================== ACTIONS TAction ====================
// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const naturePlacementToEdit = ref<NaturePlacement | null>(null)

const openCreate = () => {
  naturePlacementToEdit.value = null
  titleModal.value = 'Nouvel naturePlacement'
  showModal.value = true
}

const openEdit = (naturePlacement: NaturePlacementRow) => {
  naturePlacementToEdit.value = naturePlacement
  titleModal.value = 'Modifier naturePlacement'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  naturePlacementToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
  if (selectedNaturePlacements.value.length === 0) {
    info('Veuillez sélectionner un naturePlacement', 'Info')
    return
  }
  const naturePlacementId = selectedNaturePlacements.value[0]
  const naturePlacement = naturePlacementRows.value.find((u:any) => u.id === naturePlacementId)
  if (naturePlacement) openEdit(naturePlacement)
}

const handleSupprimer = async () => {
  if (selectedNaturePlacements.value.length === 0) {
    warning('Veuillez sélectionner un naturePlacement',"Attention")
    return
  }
  const naturePlacementId = selectedNaturePlacements.value[0]
  naturePlacementToEdit.value = naturePlacementRows.value.find((u:any) => u.id === naturePlacementId)
  if (!naturePlacementToEdit.value) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  const naturePlacement = naturePlacementToEdit.value?? null
  if (!naturePlacement ) return
    try {
        await deleteNaturePlacement.mutateAsync(naturePlacement.id)
        showModalfirmation.value=false 
        success("Opération effectuée avec succès", 'Succès')
        selectedNaturePlacements.value = selectedNaturePlacements.value.filter(
          (id) => id !== naturePlacement.id,
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
    emit('row-click',row as NaturePlacement)
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
    v-model:selected-keys="selectedNaturePlacements"

    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="naturePlacementColumns"
    :rows="naturePlacementRows"
    :loading="tableLoading"
    :density="tableDensity"
   
    height="h-full"
    width="w-full"
    title="Nature Placement"
    row-key="id"
    striped

    @row-click="onRowClick"
    @row-double-click="handleModifier"
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
       <!--TAction
          :active-modifier="isLigneSelectionnee"
          :active-supprimer="isLigneSelectionnee"
          :masque-nouveau="true"
         
          :masque-impression="true"
          @nouveau="handleNouveau"
          @modifier="handleModifier"
          @supprimer="handleSupprimer"
        
        /--> 
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
    <TNaturePlacementForm  
      :naturePlacement="naturePlacementToEdit"
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
              >Voulez-vous supprimer la naturePlacement <span class ="font-extrabold"
                  >{{ naturePlacementToEdit?.code }}</span>
                </p>
              </template>
          </TDemandeConfirmation>   
      </TModal>
</template>
