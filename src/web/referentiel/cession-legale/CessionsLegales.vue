<script setup lang="ts">

import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/composants/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TModal from '@/composants/display/TModal.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import TCessionLegaleForm from './TCessionLegaleForm.vue'
import TAction from '@/composants/utilitaire/TAction.vue'
import { MODULE_CESSION, MODULE_PARAMETRAGE, useEcransStore } from '@/services/ecrans/ecrans.store.ts'
import type { Acteur } from '@/services/acteurs/acteur/acteur.ts'
import type { CessionLegale } from '@/services/referentiel/cession-legale/cession-legale.ts'
import { useCessionLegales } from '@/services/referentiel/cession-legale/useCessionLegale.ts'

const ecranStore = useEcransStore()
const isCession = ecranStore.currentModule === MODULE_CESSION
const isModuleParametrage = ecranStore.currentModule === MODULE_PARAMETRAGE

const props = withDefaults(
  defineProps<{
    acteur?: Acteur | null // filtrer par acteur  
    masquerBoutonAction? : boolean  | null
  }>(),
  { acteur: null },
)
const emit = defineEmits<{ 
  (e: 'row-click',  cessionLegale: any): void
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
  brancheId : props.acteur?  props.acteur.id : null,
  isCession: isModuleParametrage? null : isCession
}))

console.warn(' __ SOUS-BRANCHE __ ')
console.log(' params:',params)

const titreTableau = computed(()=> props.acteur? `Cession légale : ${props.acteur.raisonSociale}` : `Acteur`  )
const { cessionLegales ,deleteCessionLegale } = useCessionLegales(params)
const { success, error , info } = useToast()

// Type local pour satisfaire TTable (signature d'index)
type CessionLegaleRow = CessionLegale & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const cessionLegaleColumns: TableColumn[] = [ 
  { key: 'taux',      label: 'Taux%',     width: '15%',  minWidth: 150 },
  { key: 'isFac',     label: 'FAC',       width: '15%',  minWidth: 150}, 
  { key: 'acteur',    label: 'Acteur',    width: '70%',  minWidth: 150 },
 
]


const totalItems = ref(0)
const totalPages = ref(0)

const cessionLegaleRows = computed(() => {
  const resultat  = cessionLegales.data.value
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
const tableLoading = computed(() => cessionLegales.isLoading.value || cessionLegales.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)

const selectedCessionLegales = ref<(string | number)[]>([])
const isLigneSelection = computed(()=> selectedCessionLegales.value.length>0)  

function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}

// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const cessionLegaleToEdit = ref<CessionLegale | null>(null)

const openCreate = () => {
  if(!props.acteur) return
  cessionLegaleToEdit.value = {
    acteurId : props.acteur.id,
    taux: 0,
    isFac: false
  } as CessionLegale
  titleModal.value =props.acteur? `${props.acteur.raisonSociale} Nouvelle cession légale`
   : 'Nouvelle cession légale'
  showModal.value = true
}

const openEdit = (cessionLegale: CessionLegaleRow) => {
  console.log('>>>>>> openEdit = (cessionLegale)',cessionLegale)
  cessionLegaleToEdit.value = cessionLegale
   titleModal.value =props.acteur? `${props.acteur.raisonSociale} Modifiez cession légale`:
   'Modifiez cession légale'
 
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  cessionLegaleToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
 // console.log('>>>>>> handleModifier SOUS-BRANCHE >>>>>>>>>>>>>>>>>>')
  if (selectedCessionLegales.value.length === 0) {
    info('Veuillez sélectionner une Sous Acteur svp', 'Info')
    return
  }
  const cessionLegaleId = selectedCessionLegales.value[0]
  const cessionLegale = cessionLegaleRows.value.find((u:any) => u.id === cessionLegaleId)
 // console.log('>>>>>> handleModifier cessionLegale:',cessionLegale)
  if (cessionLegale) openEdit(cessionLegale)
}

const handleSupprimer = async () => {
  if (selectedCessionLegales.value.length === 0) {
    info('Veuillez sélectionner une Sous Acteur svp', 'Info')
    return
  }
  const cessionLegaleId = selectedCessionLegales.value[0]
  cessionLegaleToEdit.value = cessionLegaleRows.value.find((u:any) => u.id === cessionLegaleId)
  if (!cessionLegaleToEdit.value) return
  showModalfirmation.value=true 
  
}

const handlConfirmeSuppression = async ()=>{
  const cessionLegale = cessionLegaleToEdit.value?? null
  if (!cessionLegale ) return
    try {
        await deleteCessionLegale.mutateAsync(cessionLegale.id)
        showModalfirmation.value=false 
        success("Opération effectuée avec succès", 'Succès')
        selectedCessionLegales.value = selectedCessionLegales.value.filter(
          (id) => id !== cessionLegale.id,
        )
      } catch (err: any) {
        console.error('Erreur suppression:', err)
        const message =  err?.response?.data?.message ||
            err?.message ||
            'Une erreur est survenue lors de la suppression.'
        error(message,'Erreur')
       
      }
}

// 🔑 Watcher qui réinitialise la sélection à chaque changement de acteur

watch(
  () => props.acteur,
  (newVal, oldVal) => {
    if(oldVal && newVal)
        console.log(`Acteur changée : ${oldVal.id} → ${newVal.id}`)
    selectedCessionLegales.value = []
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

const onRowClick = ( row: any, index: number)=>{       
    emit('row-click',row as CessionLegale)
}

</script>
<template>
  <TTable
    v-model:selected-keys="selectedCessionLegales"

    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="cessionLegaleColumns"
    :rows="cessionLegaleRows"
    :loading="tableLoading"
    :density="tableDensity"
   
    height="h-full"
    width="w-full"
    :title="titreTableau"
    row-key="id"
    striped
    @row-double-click="handleModifier"
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
       <TAction v-if="!props.masquerBoutonAction"
          :active-modifier="isLigneSelection"
          :active-supprimer="isLigneSelection"
          :active-nouveau="true"
          :masque-impression="true"
          @nouveau="handleNouveau"
          @modifier="handleModifier"
          @supprimer="handleSupprimer"
        
        /> 
    </template>

    <template #cell-acteur="{ value }">
      <span class="font-mono  text-xl uppercase" v-if="value"
      >{{ (value as Acteur).raisonSociale }}</span>
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
    <TCessionLegaleForm  
      :cessionLegale="cessionLegaleToEdit"
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
              >Voulez-vous supprimer la cessionLegale <span class ="font-extrabold"
                  >{{ cessionLegaleToEdit?.id }}</span>
                </p>
              </template>
          </TDemandeConfirmation>   
      </TModal>
</template>
