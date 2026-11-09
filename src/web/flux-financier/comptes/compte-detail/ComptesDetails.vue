<script setup lang="ts">

import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/composants/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TModal from '@/composants/display/TModal.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/composants/toast/useToast.ts'

import type { Branche } from '@/services/referentiel/branche/branche.ts'
import TAction from '@/composants/utilitaire/TAction.vue'
import { useCompteDetails } from '@/services/flux-financiers/comptes/compte-detail/useCompteDetail'
import type { CompteDetail } from '@/services/flux-financiers/comptes/compte-detail/compte-detail'

const props = withDefaults(
  defineProps<{
    branche?: Branche | null // filtrer par branche    
  }>(),
  { branche: null },
)

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
  brancheId : props.branche?  props.branche.id : null
}))
const titreTableau = computed(()=> props.branche? `Sous branche : ${props.branche.libelle}` : `Sous branche`  )
const { compteDetails ,deleteCompteDetail } = useCompteDetails(params)
const { success, error , info } = useToast()

// Type local pour satisfaire TTable (signature d'index)
type CompteDetailRow = CompteDetail & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const compteDetailColumns: TableColumn[] = [ 
  { key: 'branche',    label: 'Branche',    width: '15%',  minWidth: 150 , sortable:true , resizable:true},
  { key: 'code',       label: 'Code',       width: '25%',  minWidth: 150 , sortable:true , resizable:true},
  { key: 'libelle',    label: 'Libellé',    width: '60%',  minWidth: 150 , sortable:true , resizable:true}, 
]


const totalItems = ref(0)
const totalPages = ref(0)

const compteDetailRows = computed(() => {
  const resultat  = compteDetails.data.value
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

const selectedCompteDetails = ref<(string | number)[]>([])
const isLigneSelection = computed(()=> selectedCompteDetails.value.length>0)  

function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}

// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const compteDetailToEdit = ref<CompteDetail | null>(null)
/*
const openCreate = () => {
  if(!props.branche) return
  compteDetailToEdit.value = {
    brancheId : props.branche.id,
    code: "",
    libelle: ""
  } as CompteDetail
  titleModal.value = 'Nouvel Sous Branche'
  showModal.value = true
}
*/
const openEdit = (compteDetail: CompteDetailRow) => {
  console.log('>>>>>> openEdit = (compteDetail)',compteDetail)
  compteDetailToEdit.value = compteDetail
  titleModal.value = 'Modifier Sous Branche'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  compteDetailToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
}
//const handleNouveau = () => openCreate()
const handleModifier = () => {
 // console.log('>>>>>> handleModifier SOUS-BRANCHE >>>>>>>>>>>>>>>>>>')
  if (selectedCompteDetails.value.length === 0) {
    info('Veuillez sélectionner une Sous Branche svp', 'Info')
    return
  }
  const compteDetailId = selectedCompteDetails.value[0]
  const compteDetail = compteDetailRows.value.find((u:any) => u.id === compteDetailId)
 // console.log('>>>>>> handleModifier compteDetail:',compteDetail)
  if (compteDetail) openEdit(compteDetail)
}

const handleSupprimer = async () => {
  if (selectedCompteDetails.value.length === 0) {
    info('Veuillez sélectionner une Sous Branche svp', 'Info')
    return
  }
  const compteDetailId = selectedCompteDetails.value[0]
  compteDetailToEdit.value = compteDetailRows.value.find((u:any) => u.id === compteDetailId)
  if (!compteDetailToEdit.value) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  const compteDetail = compteDetailToEdit.value?? null
  if (!compteDetail ) return
    try {
        await deleteCompteDetail.mutateAsync(compteDetail.id)
        showModalfirmation.value=false 
        success("Opération effectuée avec succès", 'Succès')
        selectedCompteDetails.value = selectedCompteDetails.value.filter(
          (id) => id !== compteDetail.id,
        )
      } catch (err: any) {
        console.error('Erreur suppression:', err)
        const message =  err?.response?.data?.message ||
            err?.message ||
            'Une erreur est survenue lors de la suppression.'
        error(message,'Erreur')
       
      }
}

// 🔑 Watcher qui réinitialise la sélection à chaque changement de branche

watch(
  () => props.branche,
  (newVal, oldVal) => {
    if(oldVal && newVal)
        console.log(`Branche changée : ${oldVal.id} → ${newVal.id}`)
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

    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="compteDetailColumns"
    :rows="compteDetailRows"
    :loading="tableLoading"
    :density="tableDensity"
   
    height="h-full"
    width="w-full"
    :title="titreTableau"
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
          :active-modifier="isLigneSelection"
          :active-supprimer="isLigneSelection"
         
          :masque-impression="true"
        
          @modifier="handleModifier"
          @supprimer="handleSupprimer"
        
        /> 
    </template>

    <template #cell-branche="{ value }">
      <span class="font-mono  text-xl uppercase" v-if="value"
      >{{ (value as Branche).code }}</span>
    </template>
    <template #cell-code="{ value }">
      <span class="font-mono  text-xl uppercase">{{ value }}</span>
    </template>
    <template #cell-libelle="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
   
  
  </TTable>
    <!-- Modale du formulaire -->
  <!--TModal v-model="showModal" :title="titleModal" >
    <TCompteDetailForm  
      :compteDetail="compteDetailToEdit"
      @success="onFormSuccess"
      @cancel="closeModal"
    />
  </TModal-->
        <!-- Modale du formulaire -->
      <!--TModal v-model="showModalfirmation" 
          title="Demande de confirmation"           >
            <TDemandeConfirmation   
              @annuler="showModalfirmation=false"
              @confirmer="handlConfirmeSuppression"
            > 
              <template #message>
              <p class="text-xl text-neutral-800 dark:text-neutral-300 pb-4"
              >Voulez-vous supprimer la compteDetail <span class ="font-extrabold"
                  >{{ compteDetailToEdit?.code }}</span>
                </p>
              </template>
          </TDemandeConfirmation>   
      </TModal-->
</template>
