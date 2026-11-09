<script setup lang="ts">

import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/composants/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TModal from '@/composants/display/TModal.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import TAction from '@/composants/utilitaire/TAction.vue'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store.ts'
import TDisplayDecimal from '@/composants/utilitaire/TDisplayDecimal.vue'
import { useQueryClient } from '@tanstack/vue-query' // ✅ AJOUT
import type { CompteDetail } from '@/services/flux-financiers/comptes/compte-detail/compte-detail'
import { useCompteDetails } from '@/services/flux-financiers/comptes/compte-detail/useCompteDetail'
import { useCompteStore } from '@/services/flux-financiers/comptes/compte/compte.store'
import { useCompteDetailStore } from '@/services/flux-financiers/comptes/compte-detail/compte-detail.store'

const queryClient = useQueryClient() // ✅ AJOUT
const quittanceStore = useQuittanceStore()
const currentQuittance = quittanceStore.currentQuittance
const policeQuittance = currentQuittance?.police
const natureOffrePolice = policeQuittance?.natureOffre
const isProportionnelle = natureOffrePolice?.isProportionnelle?? false
console.log(' ________ ComptesDetaills ___________')
console.log(' currentQuittance:',currentQuittance)

const compteStore = useCompteStore()
const currentCompte = compteStore.currentCompte
//const compte = useComptes()


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
  compteId : currentCompte?  currentCompte.id : null,
  isProportionnelle : isProportionnelle ? true : null,
  isNonProportionnelle : isProportionnelle ? null : true,
}))
//const titreTableau = computed(()=>currentCompte? `Détail compte temporaire : ${currentCompte.id}` : `Détail compte temporaire`  )
const { compteDetails ,deleteCompteDetail } = useCompteDetails(params)
const { success, error , info } = useToast()
const emit = defineEmits<{
  success: [message: string]
 
}>()
// Type local pour satisfaire TTable (signature d'index)
type CompteDetailRow = CompteDetail & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const CompteDetailColumns: TableColumn[] = [ 
  { key: 'compteRubrique',       label: 'libelle',    width: '45%',  minWidth: 150 },
  { key: 'debit',             label: 'Débit',       width: '25%',  minWidth: 150 , align:'right'},
  { key: 'credit',            label: 'Crédit',      width: '25%',  minWidth: 150 , align:'right'},

]


const totalItems = ref(0)
const totalPages = ref(0)

const compteDetailRows = computed(() => {
  const resultat  =compteDetails.data.value
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
const tableLoading = computed(() => compteDetails.isLoading.value || compteDetails.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)

//const selectedCompteDetails = ref<(string | number)[]>([])
const compteDetailStore = useCompteDetailStore()
const selectedCompteDetails = computed({
  get: () => compteDetailStore.selectedComptesDetails,
  set: (value: (string | number)[]) => compteDetailStore.setSelectedComptesDetails(value) // ✅ le bon setter
})


const compteDetailId= ref<number |null| undefined>(undefined)
const isExisteDetailCompteId = computed(()=> compteDetailId.value? true : false)
const isLigneSelection = computed(()=> selectedCompteDetails.value.length>0)  
function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}

// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const compteDetailToEdit = ref<CompteDetailRow | null>(null)

const openCreate = () => {
  if(!currentCompte) return
  showModal.value = true
}

const openEdit = (compteDetail: CompteDetailRow) => {
  console.log('>>>>>> openEdit = (compteDetail)',compteDetail)
  compteDetailToEdit.value = compteDetail
  titleModal.value = 'Modifier '+compteDetail.libelle
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  compteDetailToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {  
  closeModal()
  compteStore.triggerRefresh()  // ✅ déclenche le refresh dans Comptes.vue
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
  console.log('>>>>>> handleModifier compteDetails.vue >>>>>>>>>>>>>>>>>>')
  console.log('selectedCompteDetails.value:',selectedCompteDetails.value)
  if (selectedCompteDetails.value.length === 0) {
    info('Veuillez sélectionner une Sous compte svp', 'Info')
    return
  }
  const CompteDetailId = selectedCompteDetails.value[0]
  console.log('CompteDetailId:',CompteDetailId)
   console.log('CompteDetailRows.value:',compteDetailRows.value)
  const CompteDetail = compteDetailRows.value.find((u:any) => u.compteRubriqueId === CompteDetailId)
  console.log('>>>>>> handleModifier compteDetails:',CompteDetail)
  if (CompteDetail) openEdit(CompteDetail)
}

const handleSupprimer = async () => {
  if (selectedCompteDetails.value.length === 0) {
    info('Veuillez sélectionner une Sous compte svp', 'Info')
    return
  }
  //const rubriqueCompteId = selectedCompteDetails.value[0] // 
  console.log(' ________  selectedCompteDetails.value:',selectedCompteDetails.value)
  //console.log('rubriqueCompteId:',rubriqueCompteId)
  console.log('compteDetailRows.value:',compteDetailRows.value)
  compteDetailToEdit.value = compteDetailRows.value.find((u:any) => u.compteDetailId === compteDetailId.value)
  console.log('compteDetailToEdit.value:',compteDetailToEdit.value)
  if (!compteDetailToEdit.value || !compteDetailToEdit.value.compteDetailId) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  console.log(' ______ handlConfirmeSuppression  ________')
  console.log('compteDetailToEdit.value:',compteDetailToEdit.value)


  const compteDetailId = compteDetailToEdit.value? compteDetailToEdit.value.compteDetailId: null
  if (!compteDetailId ) return
    try {
        const resultat = await deleteCompteDetail.mutateAsync(compteDetailId)
        console.log(' __________ handlConfirmeSuppression __________ ')
        console.log(' resultat:',resultat)
        showModalfirmation.value=false 
       
        success("Opération effectuée avec succès", 'Succès')
        compteStore.triggerRefresh()  // ✅ refresh du solde parent
 
        selectedCompteDetails.value = selectedCompteDetails.value.filter(
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
  compteDetailId.value = row.compteDetailId
  console.log('compteDetailId.value:',compteDetailId.value)
  console.log('isExisteDetailCompteId.value:',isExisteDetailCompteId.value)
  
}
const handleActualiser = ()=>{
  compteDetails.refetch()
}
// 🔑 Watcher qui réinitialise la sélection à chaque changement de compte

watch(
  () => currentCompte,
  (newVal, oldVal) => {
    if(oldVal && newVal)
        console.log(`compte changée : ${oldVal.id} → ${newVal.id}`)
    selectedCompteDetails.value = []
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
    v-model:selected-keys="selectedCompteDetails"
    row-key="compteRubriqueId"
    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="CompteDetailColumns"
    :rows="compteDetailRows"
    :loading="tableLoading"
    :density="tableDensity"
   
    height="h-full"
    width="w-full"
    title="Détail compte"
   
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
       <!--TAction
          :active-modifier="isLigneSelection"
          :active-supprimer="isLigneSelection && isExisteDetailCompteId"
          :active-actualiser="total>0"
         
          :masque-impression="true"
          :masque-nouveau="true"         
          @modifier="handleModifier"
          @supprimer="handleSupprimer"
          @actualiser="handleActualiser"
        
        /--> 
    </template>

   
   
    <template #cell-compteRubrique="{ value }">
      <span class="font-mono text-xl uppercase" v-if="value">
        {{ value.libelle }}
      </span>
    </template> 

    <template #cell-debit="{ value }">
      <TDisplayDecimal :value="value"  v-if="value" />
    </template>
    <template #cell-credit="{ value }">
      <TDisplayDecimal :value="value" v-if="value"/>
    </template>

  
  </TTable>

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
