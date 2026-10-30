<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

import type { PaginationParams } from '@/type/pagination.ts'
import type { Police } from '@/services/polices/police/police'
import TButton from '@/composants/forms/TButton.vue'
import AffaireNouvelle from '@/web/module/ecrans/affaire-nouvelle/AffaireNouvelle.vue'
import TModal from '@/composants/display/TModal.vue'
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store'
import {  ECRAN_FACULTATIVE, ECRAN_TRAITE,  MODULE_ACCEPTATION,  MODULE_CESSION,  useEcransStore } from '@/services/ecrans/ecrans.store'
import IconeValider from '@/composants/icone/IconeValider.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import { usePolicesByAssure } from '@/services/polices/police/usePolicesByAssure'
import { usePoliceStore } from '@/services/polices/police/police.store'
import { useAssureStore } from '@/services/acteurs/assure/assure.store'
import TFichePolice from './ TFichePolice.vue'


const ecransStore = useEcransStore()
const currentEcran = computed(()=> ecransStore.currentEcran)
const isEcranTraite = computed(()=> currentEcran.value=== ECRAN_TRAITE)
const isEcranFacultative = computed(()=> currentEcran.value=== ECRAN_FACULTATIVE)
const isModuleCession = computed(()=> ecransStore.currentModule === MODULE_CESSION)
//const currenteModule = computed(()=> ecransStore.currenteModule)
// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })

const assureStore = useAssureStore()
const currentAssure = computed(()=> assureStore.currentAssure)

const emit = defineEmits<{ 
  (e: 'row-click',  police: any): void
}>()

// ✅ Corrigé
const params = computed<PaginationParams>(() => ({
  page: 1,
  limit: PAGE_SIZE,
  search: tableSearch.value.trim() || undefined,
  sortKey: sortState.value.key ?? undefined,
  sortDirection: sortState.value.direction as 'ASC' | 'DESC' | undefined,
}))
// ==================== API + CRUD ====================
// Ne pas destructurer polices
/*
const store =  isEcranFacultative.value ?
      //En FAC, on affiche toutes les polices du module (ACC ou CESS) 
      // pour l'assuré en cours sinon assureId=0 
      usePolicesByAssure(
          currentAssure.value? currentAssure.value.id : 0 ,
          isModuleCession.value ,params) :
      //En Traité, on affiche toutes les polices du module (ACC ou CESS)  dont assureId=null    
      usePolicesByAssure( "null" , isModuleCession.value ,params) ;
      */
const store = computed(()=>{
    console.log(" _________________________________________ ")
    console.warn(" Nous sommes dans le composant Polices.vue")
    console.log(" currentAssure.value:",currentAssure.value)
    console.log(" isModuleCession.value:",isModuleCession.value)
    console.log(" _________________________________________ ")
    console.log(" isEcranFacultative.value:",isEcranFacultative.value)
    console.log(" isEcranTraite.value:",isEcranTraite.value)
    console.log(" _________________________________________ ")
    console.log(" params.value:",params.value)
    if(isEcranFacultative.value){
      // lecture assureId
      const assureId =  currentAssure.value?.id || 0
      return  usePolicesByAssure(assureId ,isModuleCession.value ,params) 
    } 
    
    return  usePolicesByAssure("null" ,isModuleCession.value ,params)
   

})       
const { polices  } = store.value
type PoliceRow = Police & { [key: string]: any }
const tempPoliceStore = useTempPoliceStore()

const policeStore = usePoliceStore()
const isAffaireNouvelleExecutee = computed(()=> tempPoliceStore.isAffaireNouvelleExecutee )

// ==================== COLONNES ====================
const policeColumns: TableColumn[] = [
  { key: 'numero',                label: 'N°Police',    width: 200,   minWidth: 80 },
  { key: 'isCession',             label: 'Cess°',       width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isFac',                 label: 'FAC',         width: 50,   minWidth: 80,  align: 'center' },
 
  { key: 'isIard',                label: 'IARD',        width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isCouverte',            label: 'Couverte',    width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isAnnulee',             label: 'Annullée',    width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isSinistree',           label: 'Sinistrée',   width: 50,   minWidth: 80,  align: 'center' },
  { key: 'natureOffre',           label: 'Nature Offre',width: 400,  minWidth: 200, },
 

  { key: 'isReconductionTacite',  label: 'Tacite Recond.',   width: 200,  minWidth: 200, align: 'center' },
  { key: 'acteurCedante',         label: 'Cedante',          width: 500,  minWidth: 500, },
  { key: 'acteurCourtier',        label: 'Courtier',         width: 500,  minWidth: 500, },
  { key: 'assure',                label: 'Assure',           width: 500,  minWidth: 500,  },
  { key: 'sousBranche',           label: 'Sous Branche',     width: 500,  minWidth: 500,  },
  
]


// ==================== DONNÉES TABLE ====================
// Accéder via store.polices
const policeRows = computed(() => store.value.polices.items.value)
const tableLoading = computed(() => store.value.polices.isLoading.value)
const loadingMore = computed(() => store.value.polices.loadingMore.value)
const hasMore = computed(() => store.value.polices.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => polices.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
//const isLigneSelectionnee = computed(() => selectedPolices.value.length > 0)
//const selectedPolices = ref<(string | number)[]>([])
// ✅ REMPLACER le ref local par un computed lié au store
const selectedPolices = computed({
  get: () => policeStore.selectedPolices,
  set: (value) => policeStore.setSelectedPolices(value)
})
// ==================== TRI ====================
function onSort(state: SortState): void {
  sortState.value = state
}

// ==================== INFINITE SCROLL ====================
async function handleLoadMore() { 
  if (loadingMore.value || !hasMore.value) return
  await polices.loadMore()
}

// ==================== MODALES ====================
const showModal = ref(false)
const showModalPolice = ref(false)
const titleModal = ref( currentAssure.value?
 `AFFAIRE NOUVELLE : ${currentAssure.value.raisonSociale.toUpperCase()}` :
 'AFFAIRE NOUVELLE')
//const policeToEdit = ref<Police | null>(null)
const onRowClick = ( row: any, index: number)=>{ 
   policeStore.setCurrentPolice(row as Police)      
    emit('row-click',row as Police)
}
const openAffaireNouvelle =()=>{  
  showModal.value=true
  tempPoliceStore.setTempPoliceIsAffaireNouvelleExecutee(false)
}

const openFichePolice =()=>{  
  showModalPolice.value=true
}

watch(
  isAffaireNouvelleExecutee,
  (newValue) => {
     console.warn("isAffaireNouvelleExecutee newValue:",newValue)
     if (newValue) {
      showModal.value=false
      polices.refresh()      
     } 
  },
  { immediate: true }
)
// Debounce recherche
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans usePolice gère le reset + refetch automatiquement
  }, 300)
})
</script>

<template>
  <TTable
    v-model:selected-keys="selectedPolices"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="policeColumns"
    :rows="policeRows"
    :loading="tableLoading"
    :density="tableDensity"
    height="h-full"
    width="w-full"
    title="Polices"
    row-key="id"
    striped
    !selectable
    
    :infinite-scroll="true"
    :has-more="hasMore"
    :loading-more="loadingMore"
    :scroll-threshold="200"
    end-message="— Fin des données —"
    :show-end-message="true"
    
    @sort="onSort"
    @row-click="onRowClick"
    @row-double-click="openFichePolice"
    @load-more="handleLoadMore"
  >
    <template #caption-extra>
      <div class="flex justify-between" v-if="isAfficheSearch" >
        <input  
          v-model="tableSearch"
          type="text"
          placeholder="Rechercher…"
          class="h-8 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>
    </template>

    <template #caption>
          <p v-if="currentAssure" 
          class="text-sm"
          >
            {{ currentAssure.raisonSociale }}
          </p>
          <TButton 
                v-if ="currentAssure || isEcranTraite" 
                type="button"
                variant="soft" 
                @click="openAffaireNouvelle"           
                > 
                        <span class="text-lg font-bold uppercase cursor-pointer">Affaire Nouvelle</span> 
            </TButton>
    </template>
    <template #cell-natureOffre="{ value }">
      <span class="font-mono   uppercase" >{{ value.code }}</span>
    </template>
    <template #cell-assure="{ value }">
      <span class="font-mono  uppercase" v-if="value" >{{ value.raisonSociale }}</span>
    </template>
    <template #cell-sousBranche="{ value }">
      <span class="font-mono  uppercase" >{{ value.libelle }}</span>
    </template>
    <template #cell-acteurCedante="{ value }">
      <span class="font-mono  uppercase" >{{ value.raisonSociale }}</span>
    </template>
    <template #cell-acteurCourtier="{ value }">
      <span class="font-mono  uppercase" v-if="value">{{ value.raisonSociale }}</span>
    </template>    

    
    <template #cell-isReconductionTacite="{ value }">
        <IconeValider  v-if="value" /> <IconeNonValider  v-else="value" />
    </template>

    <template #cell-isCession="{ value }">
        <IconeValider  v-if="value" /> <IconeNonValider  v-else="value" />
    </template>
    <template #cell-isIard="{ value }">
        <IconeValider  v-if="value" /> <IconeNonValider  v-else="value" />
    </template>
    <template #cell-isCouverte="{ value }">
        <IconeValider  v-if="!value" /> <IconeNonValider  v-else="value" />
    </template>
    <template #cell-isAnnulee="{ value }">
        <IconeValider  v-if="value" /> <IconeNonValider  v-else="value" />
    </template>
    <template #cell-isSinistree="{ value }">
        <IconeValider  v-if="value" /> <IconeNonValider  v-else="value" />
    </template>
    <template #cell-isFac="{ value }">
        <IconeValider  v-if="value" /> <IconeNonValider  v-else="value" />
    </template>

  </TTable>

   <TModal v-model="showModal" 
      width="70%"  
      height="20%" 
      :title="titleModal" 
   >
      <AffaireNouvelle  />
  </TModal>
 

   <TModal v-model="showModalPolice" 
      width="50%"  
      height="98%"
   >
          
         
          <template #default>
                <!--QuittanceVentillee  /-->
                <TFichePolice/>
          </template>
                  
         

  </TModal>


</template>