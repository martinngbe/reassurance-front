<script setup lang="ts">

import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/composants/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TModal from '@/composants/display/TModal.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import type { NatureOffre } from '@/services/referentiel/nature-offre/nanture-offre'
import { useNatureOffres } from '@/services/referentiel/nature-offre/useNatureOffre'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import IconeValider from '@/composants/icone/IconeValider.vue'
import TNatureOffreForm from './TNatureOffreForm.vue'
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

const { natureOffres ,deleteNatureOffre } = useNatureOffres(params)
const { success, error, warning, info, add } = useToast()

// Type local pour satisfaire TTable (signature d'index)
type NatureOffreRow = NatureOffre & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const natureOffreColumns: TableColumn[] = [ 
  { key: 'code',              label: 'Code',        width: '25%',  minWidth: 150 , sortable: true},
  { key: 'libelle',           label: 'Libellé',     width: '60%',  minWidth: 150 , sortable: true},
  { key: 'isProportionnelle', label: 'Propo.',      width: '5%',   minWidth: 150 , sortable: true},
  { key: 'isFacultative',     label: 'FAC',         width: '5%',   minWidth: 150 , sortable: true},
  { key: 'isFacObligatoire',  label: 'FACOB',       width: '5%',   minWidth: 150 , sortable: true},
 
]
const emit = defineEmits<{ 
  (e: 'row-click',  natureOffre: any): void
}>()

const totalItems = ref(0)
const totalPages = ref(0)

const natureOffreRows = computed(() => {
  const resultat  = natureOffres.data.value
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
const tableLoading = computed(() => natureOffres.isLoading.value || natureOffres.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)
const isLigneSelectionnee = computed(()=> selectedNatureOffres.value.length > 0)
const selectedNatureOffres = ref<(string | number)[]>([])

function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}
// ==================== ACTIONS TAction ====================
// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const natureOffreToEdit = ref<NatureOffre | null>(null)

const openCreate = () => {
  natureOffreToEdit.value = null
  titleModal.value = 'Nouvel natureOffre'
  showModal.value = true
}

const openEdit = (natureOffre: NatureOffreRow) => {
  natureOffreToEdit.value = natureOffre
  titleModal.value = 'Modifier natureOffre'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  natureOffreToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
  if (selectedNatureOffres.value.length === 0) {
    info('Veuillez sélectionner un natureOffre', 'Info')
    return
  }
  const natureOffreId = selectedNatureOffres.value[0]
  const natureOffre = natureOffreRows.value.find((u:any) => u.id === natureOffreId)
  if (natureOffre) openEdit(natureOffre)
}

const handleSupprimer = async () => {
  if (selectedNatureOffres.value.length === 0) {
    warning('Veuillez sélectionner un natureOffre',"Attention")
    return
  }
  const natureOffreId = selectedNatureOffres.value[0]
  natureOffreToEdit.value = natureOffreRows.value.find((u:any) => u.id === natureOffreId)
  if (!natureOffreToEdit.value) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  const natureOffre = natureOffreToEdit.value?? null
  if (!natureOffre ) return
    try {
        await deleteNatureOffre.mutateAsync(natureOffre.id)
        showModalfirmation.value=false 
        success("Opération effectuée avec succès", 'Succès')
        selectedNatureOffres.value = selectedNatureOffres.value.filter(
          (id) => id !== natureOffre.id,
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
    emit('row-click',row as NatureOffre)
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
    v-model:selected-keys="selectedNatureOffres"

    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="natureOffreColumns"
    :rows="natureOffreRows"
    :loading="tableLoading"
    :density="tableDensity"
   
    height="h-full"
    width="w-full"
    title="Nature Offre"
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
    <template #cell-isProportionnelle="{ value }">
       <IconeValider v-if="value"/>
       <IconeNonValider  v-else/>
    </template>   
    <template #cell-isFacultative="{ value }">
       <IconeValider v-if="value"/>
       <IconeNonValider  v-else/>
    </template>
      <template #cell-isFacObligatoire="{ value }">
       <IconeValider v-if="value"/>
       <IconeNonValider  v-else/>
    </template>    
  </TTable>
    <!-- Modale du formulaire -->
  <TModal v-model="showModal" :title="titleModal" >
    <TNatureOffreForm   
      :natureOffre="natureOffreToEdit"
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
              >Voulez-vous supprimer la natureOffre <span class ="font-extrabold"
                  >{{ natureOffreToEdit?.code }}</span>
                </p>
              </template>
          </TDemandeConfirmation>   
      </TModal>
</template>
