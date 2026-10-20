<script setup lang="ts">

import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TModal from '@/composants/display/TModal.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import TPaysForm from './TPaysForm.vue'
import TAction from '@/composants/utilitaire/TAction.vue'
import type { Pays } from '@/services/referentiel/pays/pays'
import { useLesPays } from '@/services/referentiel/pays/usePays.ts'
import type { Region } from '@/services/referentiel/region/region.ts'

const props = withDefaults(
  defineProps<{
    region?: Region | null // filtrer par region    
  }>(),
  { region: null },
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
  regionId : props.region?  props.region.id : null
}))
console.log(">>>>>> ListePays params.value:",params.value)
const titreTableau = computed(()=> props.region? `Region : ${props.region.libelle}` : `Region`  )
const { listePays ,deletePays } = useLesPays(params)
const { success, error , info } = useToast()

// Type local pour satisfaire TTable (signature d'index)
type PaysRow = Pays & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const paysColumns: TableColumn[] = [ 
  { key: 'code',       label: 'Code',       width: '10%',  minWidth: 150 , sortable: true},
  { key: 'libelle',    label: 'Libellé',    width: '70%',  minWidth: 150 , sortable: true}, 
  { key: 'region',     label: 'Region',      width: '20%',  minWidth: 150 },
 
]


const totalItems = ref(0)
const totalPages = ref(0)

const paysRows = computed(() => {
  const resultat  = listePays.data.value
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
const tableLoading = computed(() => listePays.isLoading.value || listePays.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)

const selectedListePays = ref<(string | number)[]>([])
const isLigneSelection = computed(()=> selectedListePays.value.length>0)  

function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}

// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const paysToEdit = ref<Pays | null>(null)

const openCreate = () => {
  if(!props.region) return
  paysToEdit.value = {
    regionId : props.region.id,
    indicatif:"",
    code: "",
    libelle: ""
  } as Pays
  titleModal.value = 'Nouveau Pays'
  showModal.value = true
}

const openEdit = (pays: PaysRow) => {
  console.log('>>>>>> openEdit = (pays)',pays)
  paysToEdit.value = pays
  titleModal.value = 'Modifier Pays'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  paysToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
   console.log('>>>>>> handleModifier PAYS >>>>>>>>>>>>>>>>>>')
  if (selectedListePays.value.length === 0) {
    info('Veuillez sélectionner une Sous Branche svp', 'Info')
    return
  }
  const paysId = selectedListePays.value[0]
  const pays = paysRows.value.find((u:any) => u.id === paysId)
  console.log('>>>>>> handleModifier pays:',pays)
  if (pays) openEdit(pays)
}

const handleSupprimer = async () => {
  if (selectedListePays.value.length === 0) {
    info('Veuillez sélectionner une Sous Branche svp', 'Info')
    return
  }
  const paysId = selectedListePays.value[0]
  paysToEdit.value = paysRows.value.find((u:any) => u.id === paysId)
  if (!paysToEdit.value) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  const pays = paysToEdit.value?? null
  if (!pays ) return
    try {
        await deletePays.mutateAsync(pays.id)
        showModalfirmation.value=false 
        success("Opération effectuée avec succès", 'Succès')
        selectedListePays.value = selectedListePays.value.filter(
          (id) => id !== pays.id,
        )
      } catch (err: any) {
        console.error('Erreur suppression:', err)
        const message =  err?.response?.data?.message ||
            err?.message ||
            'Une erreur est survenue lors de la suppression.'
        error(message,'Erreur')
       
      }
}

// 🔑 Watcher qui réinitialise la sélection à chaque changement de region

watch(
  () => props.region,
  (newVal, oldVal) => {
    if(oldVal && newVal)
        console.log(`Region changée : ${oldVal.id} → ${newVal.id}`)
    selectedListePays.value = []
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
    v-model:selected-keys="selectedListePays"

    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="paysColumns"
    :rows="paysRows"
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

    <template #cell-region="{ value }">
      <span class="font-mono  text-xl uppercase" v-if="value"
      >{{ (value as Region).libelle }}</span>
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
    <TPaysForm  
      :pays="paysToEdit"
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
              >Voulez-vous supprimer la pays <span class ="font-extrabold"
                  >{{ paysToEdit?.code }}</span>
                </p>
              </template>
          </TDemandeConfirmation>   
      </TModal>
</template>
