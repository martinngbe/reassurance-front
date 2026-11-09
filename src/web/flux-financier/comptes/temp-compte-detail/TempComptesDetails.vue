<script setup lang="ts">

import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/composants/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TModal from '@/composants/display/TModal.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import TAction from '@/composants/utilitaire/TAction.vue'
import { useTempCompteDetails } from '@/services/flux-financiers/comptes/temp-compte-detail/useTempCompteDetail'
import type { TempCompteDetail } from '@/services/flux-financiers/comptes/temp-compte-detail/temp-compte-detail'
import TTempCompteDetailForm from './TTempCompteDetailForm.vue'
import { useTempCompteStore } from '@/services/flux-financiers/comptes/temp-compte/temp-compte.store.ts'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store.ts'
import TDisplayDecimal from '@/composants/utilitaire/TDisplayDecimal.vue'
import { useTempCompteDetailStore } from '@/services/flux-financiers/comptes/temp-compte-detail/temp-compte-detail.store.ts'
import { useTempComptes } from '@/services/flux-financiers/comptes/temp-compte/useTempCompte.ts'
import { useQueryClient } from '@tanstack/vue-query' // ✅ AJOUT

const queryClient = useQueryClient() // ✅ AJOUT
const quittanceStore = useQuittanceStore()
const currentQuittance = quittanceStore.currentQuittance
const policeQuittance = currentQuittance?.police
const natureOffrePolice = policeQuittance?.natureOffre
const isProportionnelle = natureOffrePolice?.isProportionnelle?? false
console.log(' ________ TempComptesDetaills ___________')
console.log(' currentQuittance:',currentQuittance)

const tempCompteStore = useTempCompteStore()
const currentTempCompte = tempCompteStore.currentTempCompte
//const tempCompte = useTempComptes()


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
  compteId : currentTempCompte?  currentTempCompte.id : null,
  isProportionnelle : isProportionnelle ? true : null,
  isNonProportionnelle : isProportionnelle ? null : true,
}))
//const titreTableau = computed(()=>currentTempCompte? `Détail compte temporaire : ${currentTempCompte.id}` : `Détail compte temporaire`  )
const { tempCompteDetails ,deleteTempCompteDetail } = useTempCompteDetails(params)
const { success, error , info } = useToast()
const emit = defineEmits<{
  success: [message: string]
 
}>()
// Type local pour satisfaire TTable (signature d'index)
type TempCompteDetailRow = TempCompteDetail & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const TempCompteDetailColumns: TableColumn[] = [ 
  { key: 'libelle',           label: 'libelle',    width: '45%',  minWidth: 150 },
  { key: 'debit',             label: 'Débit',       width: '25%',  minWidth: 150 , align:'right'},
  { key: 'credit',            label: 'Crédit',      width: '25%',  minWidth: 150 , align:'right'},

]


const totalItems = ref(0)
const totalPages = ref(0)

const tempCompteDetailRows = computed(() => {
  const resultat  =tempCompteDetails.data.value
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
const tableLoading = computed(() => tempCompteDetails.isLoading.value || tempCompteDetails.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)

//const selectedTempCompteDetails = ref<(string | number)[]>([])
const tempCompteDetailStore = useTempCompteDetailStore()
const selectedTempCompteDetails = computed({
  get: () => tempCompteDetailStore.selectedTempComptesDetails,
  set: (value: (string | number)[]) => tempCompteDetailStore.setSelectedTempComptesDetails(value) // ✅ le bon setter
})


const tempCompteDetailId= ref<number |null| undefined>(undefined)
const isExisteTempDetailCompteId = computed(()=> tempCompteDetailId.value? true : false)
const isLigneSelection = computed(()=> selectedTempCompteDetails.value.length>0)  
function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}

// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const tempCompteDetailToEdit = ref<TempCompteDetailRow | null>(null)

const openCreate = () => {
  if(!currentTempCompte) return
  showModal.value = true
}

const openEdit = (tempCompteDetail: TempCompteDetailRow) => {
  console.log('>>>>>> openEdit = (tempCompteDetail)',tempCompteDetail)
  tempCompteDetailToEdit.value = tempCompteDetail
  titleModal.value = 'Modifier '+tempCompteDetail.libelle
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  tempCompteDetailToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {  
  closeModal()
  tempCompteStore.triggerRefresh()  // ✅ déclenche le refresh dans TempComptes.vue
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
  console.log('>>>>>> handleModifier tempCompteDetails.vue >>>>>>>>>>>>>>>>>>')
  console.log('selectedTempCompteDetails.value:',selectedTempCompteDetails.value)
  if (selectedTempCompteDetails.value.length === 0) {
    info('Veuillez sélectionner une Sous tempCompte svp', 'Info')
    return
  }
  const TempCompteDetailId = selectedTempCompteDetails.value[0]
  console.log('TempCompteDetailId:',TempCompteDetailId)
   console.log('TempCompteDetailRows.value:',tempCompteDetailRows.value)
  const TempCompteDetail = tempCompteDetailRows.value.find((u:any) => u.compteRubriqueId === TempCompteDetailId)
  console.log('>>>>>> handleModifier tempCompteDetails:',TempCompteDetail)
  if (TempCompteDetail) openEdit(TempCompteDetail)
}

const handleSupprimer = async () => {
  if (selectedTempCompteDetails.value.length === 0) {
    info('Veuillez sélectionner une Sous tempCompte svp', 'Info')
    return
  }
  //const rubriqueCompteId = selectedTempCompteDetails.value[0] // 
  console.log(' ________  selectedTempCompteDetails.value:',selectedTempCompteDetails.value)
  //console.log('rubriqueCompteId:',rubriqueCompteId)
  console.log('tempCompteDetailRows.value:',tempCompteDetailRows.value)
  tempCompteDetailToEdit.value = tempCompteDetailRows.value.find((u:any) => u.compteDetailId === tempCompteDetailId.value)
  console.log('tempCompteDetailToEdit.value:',tempCompteDetailToEdit.value)
  if (!tempCompteDetailToEdit.value || !tempCompteDetailToEdit.value.compteDetailId) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  console.log(' ______ handlConfirmeSuppression  ________')
  console.log('tempCompteDetailToEdit.value:',tempCompteDetailToEdit.value)


  const compteDetailId = tempCompteDetailToEdit.value? tempCompteDetailToEdit.value.compteDetailId: null
  if (!compteDetailId ) return
    try {
        const resultat = await deleteTempCompteDetail.mutateAsync(compteDetailId)
        console.log(' __________ handlConfirmeSuppression __________ ')
        console.log(' resultat:',resultat)
        showModalfirmation.value=false 
       
        success("Opération effectuée avec succès", 'Succès')
        tempCompteStore.triggerRefresh()  // ✅ refresh du solde parent
 
        selectedTempCompteDetails.value = selectedTempCompteDetails.value.filter(
          (id) => id !== compteDetailId,
        )
      } catch (err: any) {
        console.error('Erreur suppression:', err)
        const message =  err?.response?.data?.message ||
            err?.message ||
            'Une erreur est survenue lors de la suppression.'
        error(message,'Erreur')
       
      }
}
const handelRowClick = (row: any , index: number)=>{
  console.log(' _______________________________________')
  console.log(' ______  handelRowClick  row:',row)
  tempCompteDetailId.value = row.compteDetailId
  console.log('tempCompteDetailId.value:',tempCompteDetailId.value)
  console.log('isExisteTempDetailCompteId.value:',isExisteTempDetailCompteId.value)
  
}
const handleActualiser = ()=>{
  tempCompteDetails.refetch()
}
// 🔑 Watcher qui réinitialise la sélection à chaque changement de tempCompte

watch(
  () => currentTempCompte,
  (newVal, oldVal) => {
    if(oldVal && newVal)
        console.log(`tempCompte changée : ${oldVal.id} → ${newVal.id}`)
    selectedTempCompteDetails.value = []
  },
  {
    immediate: true,  // 👈 S'exécute aussi au montage initial
    // deep: true,     // 👈 Pour surveiller les changements profonds (objets)
  }
)

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
    v-model:selected-keys="selectedTempCompteDetails"
    row-key="compteRubriqueId"
    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="TempCompteDetailColumns"
    :rows="tempCompteDetailRows"
    :loading="tableLoading"
    :density="tableDensity"
   
    height="h-full"
    width="w-full"
    title="Détail compte temporaire"
   
    striped

    @sort="onSort"
    @row-double-click="handleModifier"
    @row-click="handelRowClick"
    
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
          :active-modifier="isLigneSelection"
          :active-supprimer="isLigneSelection && isExisteTempDetailCompteId"
          :active-actualiser="total>0"
         
          :masque-impression="true"
          :masque-nouveau="true"         
          @modifier="handleModifier"
          @supprimer="handleSupprimer"
          @actualiser="handleActualiser"
        
        /> 
    </template>

   
   
    <template #cell-libelle="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template> 

    <template #cell-debit="{ value }">
      <TDisplayDecimal :value="value"  v-if="value" />
    </template>
    <template #cell-credit="{ value }">
      <TDisplayDecimal :value="value" v-if="value"/>
    </template>

  
  </TTable>
    <!-- Modale du formulaire -->
  <TModal v-model="showModal" :title="titleModal" >

    <TTempCompteDetailForm 
    :temp-compte-detail="tempCompteDetailToEdit"    
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
              <p class="text-xl text-neutral-800 dark:text-neutral-300 pb-4">
                  Voulez-vous supprimer l'information        
              </p>
              </template>
          </TDemandeConfirmation>   
      </TModal>
</template>
