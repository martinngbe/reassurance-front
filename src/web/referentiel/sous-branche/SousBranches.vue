<script setup lang="ts">

import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/composants/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TModal from '@/composants/display/TModal.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import type { SousBranche } from '@/services/referentiel/sous-branche/sous-branche'
import { useSousBranches } from '@/services/referentiel/sous-branche/useSousBranche'
import TSousBrancheForm from './TSousBrancheForm.vue'
import type { Branche } from '@/services/referentiel/branche/branche.ts'
import TAction from '@/composants/utilitaire/TAction.vue'

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
const { sousBranches ,deleteSousBranche } = useSousBranches(params)
const { success, error , info } = useToast()

// Type local pour satisfaire TTable (signature d'index)
type SousBrancheRow = SousBranche & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const sousBrancheColumns: TableColumn[] = [ 
  { key: 'branche',    label: 'Branche',    width: '15',  minWidth: 150 },
  { key: 'code',       label: 'Code',       width: '20%',  minWidth: 150 },
  { key: 'libelle',    label: 'Libellé',    width: '65%',  minWidth: 150 }, 
]


const totalItems = ref(0)
const totalPages = ref(0)

const sousBrancheRows = computed(() => {
  const resultat  = sousBranches.data.value
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
const tableLoading = computed(() => sousBranches.isLoading.value || sousBranches.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)

const selectedSousBranches = ref<(string | number)[]>([])
const isLigneSelection = computed(()=> selectedSousBranches.value.length>0)  

function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}

// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const sousBrancheToEdit = ref<SousBranche | null>(null)

const openCreate = () => {
  if(!props.branche) return
  sousBrancheToEdit.value = {
    brancheId : props.branche.id,
    code: "",
    libelle: ""
  } as SousBranche
  titleModal.value = 'Nouvel Sous Branche'
  showModal.value = true
}

const openEdit = (sousBranche: SousBrancheRow) => {
  console.log('>>>>>> openEdit = (sousBranche)',sousBranche)
  sousBrancheToEdit.value = sousBranche
  titleModal.value = 'Modifier Sous Branche'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  sousBrancheToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
 // console.log('>>>>>> handleModifier SOUS-BRANCHE >>>>>>>>>>>>>>>>>>')
  if (selectedSousBranches.value.length === 0) {
    info('Veuillez sélectionner une Sous Branche svp', 'Info')
    return
  }
  const sousBrancheId = selectedSousBranches.value[0]
  const sousBranche = sousBrancheRows.value.find((u:any) => u.id === sousBrancheId)
 // console.log('>>>>>> handleModifier sousBranche:',sousBranche)
  if (sousBranche) openEdit(sousBranche)
}

const handleSupprimer = async () => {
  if (selectedSousBranches.value.length === 0) {
    info('Veuillez sélectionner une Sous Branche svp', 'Info')
    return
  }
  const sousBrancheId = selectedSousBranches.value[0]
  sousBrancheToEdit.value = sousBrancheRows.value.find((u:any) => u.id === sousBrancheId)
  if (!sousBrancheToEdit.value) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  const sousBranche = sousBrancheToEdit.value?? null
  if (!sousBranche ) return
    try {
        await deleteSousBranche.mutateAsync(sousBranche.id)
        showModalfirmation.value=false 
        success("Opération effectuée avec succès", 'Succès')
        selectedSousBranches.value = selectedSousBranches.value.filter(
          (id) => id !== sousBranche.id,
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
    selectedSousBranches.value = []
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
    v-model:selected-keys="selectedSousBranches"

    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="sousBrancheColumns"
    :rows="sousBrancheRows"
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
          @nouveau="handleNouveau"
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
  <TModal v-model="showModal" :title="titleModal" >
    <TSousBrancheForm  
      :sousBranche="sousBrancheToEdit"
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
              >Voulez-vous supprimer la sousBranche <span class ="font-extrabold"
                  >{{ sousBrancheToEdit?.code }}</span>
                </p>
              </template>
          </TDemandeConfirmation>   
      </TModal>
</template>
