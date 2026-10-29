<script setup lang="ts">

import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/composants/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TModal from '@/composants/display/TModal.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import type { CompteRubrique } from '@/services/flux-financiers/compte-rubrique/compte-rubrique.js'
import { useCompteRubriques } from '@/services/flux-financiers/compte-rubrique/useCompteRubrique'
import IconeValider from '@/composants/icone/IconeValider.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue'
import TCompteRubriqueForm from './TCompteRubriqueForm.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'

const props = withDefaults(
  defineProps<{
    compteRubrique?: CompteRubrique | null // filtrer par compteRubrique    
  }>(),
  { compteRubrique: null },
)
const emit = defineEmits<{ 
  (e: 'row-click',  row: CompteRubrique): void
}>()
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
  compteRubriqueId : props.compteRubrique?  props.compteRubrique.id : null
}))
const titreTableau = computed(()=> props.compteRubrique? ` compteRubrique : ${props.compteRubrique.libelle}` : ` compteRubrique`  )
const { compteRubriques ,deleteCompteRubrique } = useCompteRubriques(params)
const { success, error , info } = useToast()

// Type local pour satisfaire TTable (signature d'index)
type CompteRubriqueRow = CompteRubrique & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const compteRubriqueColumns: TableColumn[] = [ 
  { key: 'isProportionnel',       label: 'Proportionnel',        width: '15%',  minWidth: 150 , align:'center', sortable:true},
  { key: 'isNonProportionnel',    label: 'Non Proportionnel',    width: '15%',  minWidth: 150 , align:'center', sortable:true},
  { key: 'code',                  label: 'Code',                 width: '10%',  minWidth: 150 , sortable:true}, 
  { key: 'partie',                label: 'Partie',               width: '10%',  minWidth: 150 , sortable:true},
  { key: 'libelle',               label: 'Libellé',              width: '50%',  minWidth: 150 , sortable:true}, 


]


const totalItems = ref(0)
const totalPages = ref(0)

const compteRubriqueRows = computed(() => {
  const resultat  = compteRubriques.data.value
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
const tableLoading = computed(() => compteRubriques.isLoading.value || compteRubriques.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)

const selectedCompteRubriques = ref<(string | number)[]>([])
const isLigneSelection = computed(()=> selectedCompteRubriques.value.length>0)  

function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}

// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const compteRubriqueToEdit = ref<CompteRubrique | null>(null)

const openCreate = () => {
  if(!props.compteRubrique) return
  compteRubriqueToEdit.value = {
    id : props.compteRubrique.id,
    code: "",
    libelle: "",
    partie:"",
    isNonProportionnel:false,
    isProportionnel:false,
  } as CompteRubrique
  
  titleModal.value = 'Nouvel  CompteRubrique'
  showModal.value = true
}

const openEdit = (compteRubrique: CompteRubriqueRow) => {
  //console.log('>>>>>> openEdit = (compteRubrique)',compteRubrique)
  compteRubriqueToEdit.value = compteRubrique
  titleModal.value = 'Modifier  CompteRubrique'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  compteRubriqueToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
 // console.log('>>>>>> handleModifier SOUS-BRANCHE >>>>>>>>>>>>>>>>>>')
  if (selectedCompteRubriques.value.length === 0) {
    info('Veuillez sélectionner une  CompteRubrique svp', 'Info')
    return
  }
  const compteRubriqueId = selectedCompteRubriques.value[0]
  const compteRubrique = compteRubriqueRows.value.find((u:any) => u.id === compteRubriqueId)
 // console.log('>>>>>> handleModifier compteRubrique:',compteRubrique)
  if (compteRubrique) openEdit(compteRubrique)
}

const handleSupprimer = async () => {
  if (selectedCompteRubriques.value.length === 0) {
    info('Veuillez sélectionner une  CompteRubrique svp', 'Info')
    return
  }
  const compteRubriqueId = selectedCompteRubriques.value[0]
  compteRubriqueToEdit.value = compteRubriqueRows.value.find((u:any) => u.id === compteRubriqueId)
  if (!compteRubriqueToEdit.value) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  const compteRubrique = compteRubriqueToEdit.value?? null
  if (!compteRubrique ) return
    try {
        await deleteCompteRubrique.mutateAsync(compteRubrique.id)
        showModalfirmation.value=false 
        success("Opération effectuée avec succès", 'Succès')
        selectedCompteRubriques.value = selectedCompteRubriques.value.filter(
          (id) => id !== compteRubrique.id,
        )
      } catch (err: any) {
        console.error('Erreur suppression:', err)
        const message =  err?.response?.data?.message ||
            err?.message ||
            'Une erreur est survenue lors de la suppression.'
        error(message,'Erreur')
       
      }
}

// 🔑 Watcher qui réinitialise la sélection à chaque changement de compteRubrique

watch(
  () => props.compteRubrique,
  (newVal, oldVal) => {
    if(oldVal && newVal)
        console.log(`CompteRubrique changée : ${oldVal.id} → ${newVal.id}`)
    selectedCompteRubriques.value = []
  },
  {
    immediate: true,  // 👈 S'exécute aussi au montage initial
    // deep: true,     // 👈 Pour surveiller les changements profonds (objets)
  }
)
const onRowClick = ( row: any, index: number)=>{       
    emit('row-click',row as CompteRubrique)
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
    v-model:selected-keys="selectedCompteRubriques"

    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="compteRubriqueColumns"
    :rows="compteRubriqueRows"
    :loading="tableLoading"
    :density="tableDensity"
   
    height="h-full"
    width="w-full"
    :title="titreTableau"
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

    <template #cell-compteRubrique="{ value }">
      <span class="font-mono  text-xl uppercase" v-if="value"
      >{{ (value as CompteRubrique).code }}</span>
    </template>
    <template #cell-code="{ value }">
      <span class="font-mono  text-xl uppercase">{{ value }}</span>
    </template>
    <template #cell-libelle="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
   

    <template #cell-isProportionnel="{ value }">
       <IconeValider v-if="value"/><IconeNonValider v-else="value"/>
    </template>    
    <template #cell-isNonProportionnel="{ value }">
      <IconeValider v-if="value"/><IconeNonValider v-else="value"/>
    </template>
    <template #cell-partie="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>    
    
  </TTable>
    <!-- Modale du formulaire -->
  <TModal v-model="showModal" :title="titleModal" >
    <TCompteRubriqueForm 
      :compteRubrique="compteRubriqueToEdit"
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
              >Voulez-vous supprimer la compteRubrique <span class ="font-extrabold"
                  >{{ compteRubriqueToEdit?.code }}</span>
                </p>
              </template>
          </TDemandeConfirmation>   
      </TModal>
</template>
