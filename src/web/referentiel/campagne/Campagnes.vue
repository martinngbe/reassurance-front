<script setup lang="ts">

import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/composants/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import { useCampagnes } from '@/services/referentiel/campagne/useCampagne'
import TAction from '@/composants/utilitaire/TAction.vue'
import type { Campagne } from '@/services/referentiel/campagne/campagne'
import TModal from '@/composants/display/TModal.vue'
import TCampagneForm from './TCampagneForm.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import TBadge from '@/composants/display/TBadge.vue'

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

const { campagnes ,deleteCampagne } = useCampagnes(params)
const { success, error, warning, info, add } = useToast()

// Type local pour satisfaire TTable (signature d'index)
type CampagneRow = Campagne & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const campagneColumns: TableColumn[] = [ 
  { key: 'code',         label: 'Code',       width: '20%',  minWidth: 150 },
  { key: 'dateDebut',    label: 'Date début', width: '25%',  minWidth: 150 },
  { key: 'dateFin',      label: 'Date fin',   width: '25%', minWidth: 150},
  { key: 'isActif',      label: 'Actif',      width: '10%', align: 'center' },
]


const totalItems = ref(0)
const totalPages = ref(0)

const campagneRows = computed(() => {
  const resultat  = campagnes.data.value
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
const tableLoading = computed(() => campagnes.isLoading.value || campagnes.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)
const isLigneSelectionnee = computed(()=> selectedCampagnes.value.length > 0)
const selectedCampagnes = ref<(string | number)[]>([])

function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}
// ==================== ACTIONS TAction ====================
// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const campagneToEdit = ref<Campagne | null>(null)

const openCreate = () => {
  campagneToEdit.value = null
  titleModal.value = 'Nouvel campagne'
  showModal.value = true
}

const openEdit = (campagne: CampagneRow) => {
  campagneToEdit.value = campagne
  titleModal.value = 'Modifier campagne'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  campagneToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
  if (selectedCampagnes.value.length === 0) {
    alert('Veuillez sélectionner un campagne')
    return
  }
  const campagneId = selectedCampagnes.value[0]
  const campagne = campagneRows.value.find((u:any) => u.id === campagneId)
  if (campagne) openEdit(campagne)
}

const handleSupprimer = async () => {
  if (selectedCampagnes.value.length === 0) {
    alert('Veuillez sélectionner un campagne')
    return
  }
  const campagneId = selectedCampagnes.value[0]
  campagneToEdit.value = campagneRows.value.find((u:any) => u.id === campagneId)
  if (!campagneToEdit.value) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  const campagne = campagneToEdit.value?? null
  if (!campagne ) return
    try {
        await deleteCampagne.mutateAsync(campagne.id)
        showModalfirmation.value=false 
        success("Opération effectuée avec succès", 'Succès')
        selectedCampagnes.value = selectedCampagnes.value.filter(
          (id) => id !== campagne.id,
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
    v-model:selected-keys="selectedCampagnes"

    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="campagneColumns"
    :rows="campagneRows"
    :loading="tableLoading"
    :density="tableDensity"
   
    height="h-full"
    width="w-full"
    title="Campagnes"
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
    <TCampagneForm     
      :campagne="campagneToEdit"
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
              >Voulez-vous supprimer la campagne <span class ="font-extrabold"
                  >{{ campagneToEdit?.code }}</span>
                </p>
              </template>
          </TDemandeConfirmation>   
      </TModal>
</template>
