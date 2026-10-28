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
import {  ECRAN_TRAITE,  MODULE_ACCEPTATION,  MODULE_CESSION,  useEcransStore } from '@/services/ecrans/ecrans.store'
import IconeValider from '@/composants/icone/IconeValider.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import { usePolicesByAssure } from '@/services/polices/police/usePolicesByAssure'
import type { Assure } from '@/services/acteurs/assure/assure'
import { usePoliceStore } from '@/services/polices/police/police.store'


const ecransStore = useEcransStore()
const currentEcran = computed(()=> ecransStore.currentEcran)
const isEcranTraite = computed(()=> currentEcran.value=== ECRAN_TRAITE)
const isModuleCession = computed(()=> ecransStore.currentModule === MODULE_CESSION)
//const currenteModule = computed(()=> ecransStore.currenteModule)
// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })

const props = defineProps<{
  currentAssure?: Assure | null | undefined
}>()


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
const store = props.currentAssure?
      usePolicesByAssure( props.currentAssure.id , isModuleCession.value ,params) :
      usePolicesByAssure( "null" , isModuleCession.value ,params) ; 
       
const { polices  } = store
type PoliceRow = Police & { [key: string]: any }
const tempPoliceStore = useTempPoliceStore()

const policeStore = usePoliceStore()
const isAffaireNouvelleExecutee = computed(()=> tempPoliceStore.isAffaireNouvelleExecutee )

// ==================== COLONNES ====================
const policeColumns: TableColumn[] = [
  { key: 'numero',                label: 'N°Police',    width: 20,   minWidth: 80 },
  { key: 'isCession',             label: 'Cess°',       width: 50,   minWidth: 80,  align: 'center' },
  { key: 'natureOffre',           label: 'Nature Offre',    width: 400,  minWidth: 200, },
  

  { key: 'isCouverte',            label: 'Couverte',    width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isResiliee',            label: 'Résiliée',    width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isSinistree',           label: 'Sinistrée',   width: 50,   minWidth: 80,  align: 'center' },
  
  { key: 'isReconductionTacite',  label: 'Tacite Recond.',   width: 100,  minWidth: 100, align: 'center' },
  { key: 'acteurCedante',         label: 'Cedante',          width: 500,  minWidth: 500, },
  { key: 'acteurCourtier',        label: 'Courtier',         width: 500,  minWidth: 500, },
  { key: 'assure',                label: 'Assure',           width: 500,  minWidth: 500,  },
  { key: 'sousBranche',           label: 'Sous Branche',     width: 500,  minWidth: 500,  },
  
]


// ==================== DONNÉES TABLE ====================
// Accéder via store.polices
const policeRows = computed(() => store.polices.items.value)
const tableLoading = computed(() => store.polices.isLoading.value)
const loadingMore = computed(() => store.polices.loadingMore.value)
const hasMore = computed(() => store.polices.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => polices.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
//const isLigneSelectionnee = computed(() => selectedPolices.value.length > 0)
const selectedPolices = ref<(string | number)[]>([])

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
const titleModal = ref( props.currentAssure?
 `AFFAIRE NOUVELLE : ${props.currentAssure.raisonSociale.toUpperCase()}` :
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
      <span class="font-mono  text-xl uppercase" >{{ value.code }}</span>
    </template>
    <template #cell-assure="{ value }">
      <span class="font-mono text-xl uppercase" v-if="value" >{{ value.raisonSociale }}</span>
    </template>
    <template #cell-sousBranche="{ value }">
      <span class="font-mono text-xl uppercase" >{{ value.libelle }}</span>
    </template>
    <template #cell-acteurCedante="{ value }">
      <span class="font-mono text-xl uppercase" >{{ value.raisonSociale }}</span>
    </template>
    <template #cell-acteurCourtier="{ value }">
      <span class="font-mono text-xl uppercase" >{{ value.raisonSociale }}</span>
    </template>    

    
    <template #cell-isReconductionTacite="{ value }">
        <IconeValider  v-if="value" /> <IconeNonValider  v-else="value" />
    </template>




  </TTable>

   <TModal v-model="showModal" 
      width="70%"  
      height="85%" 
      :title="titleModal" 
   >
      <AffaireNouvelle  />
  </TModal>
 
</template>