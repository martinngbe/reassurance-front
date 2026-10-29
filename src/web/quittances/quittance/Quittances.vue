<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

import type { PaginationParams } from '@/type/pagination.ts'
import TButton from '@/composants/forms/TButton.vue'
import { useQuittances } from '@/services/quittances/quittance/useQuittance'
import type { Quittance } from '@/services/quittances/quittance/quittance'
import { formatDecimal } from '@/utilitaire/number'
import TDisplayNumber from '@/composants/utilitaire/TDisplayNumber.vue'
import { useQuittancesByPolice } from '@/services/quittances/quittance/useQuittancesByPolice'
import { usePoliceStore } from '@/services/polices/police/police.store'
import IconeValider from '@/composants/icone/IconeValider.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import TModal from '@/composants/display/TModal.vue'
import QuittanceVentillee from './QuittanceVentillee.vue'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store.ts'
import TAction from '@/composants/utilitaire/TAction.vue'

const props = defineProps<{
  forAllConsultation?: boolean 
}>()
const policeStore = usePoliceStore()
const currentPolice = computed(()=> policeStore.currentPolice)
const quittanceStore = useQuittanceStore()
// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const emit = defineEmits<{ 
  (e: 'row-click',  quittance: any): void
}>()
const showModal = ref(false)

// ✅ Corrigé
const params = computed<PaginationParams>(() => ({
  page: 1,
  limit: PAGE_SIZE,
  search: tableSearch.value.trim() || undefined,
  sortKey: sortState.value.key ?? undefined,
  sortDirection: sortState.value.direction as 'ASC' | 'DESC' | undefined,
}))
// ==================== API + CRUD ====================
// Ne pas destructurer quittances
// Les quittances sont par defaut liées à une police
// Toute il peut y arriver que l'on souhaite faire une consultation générale
// de toutes les quittances
  const store = props.forAllConsultation? useQuittances(params):
      useQuittancesByPolice( 
       currentPolice.value? currentPolice.value.id : 0 ,params) ;
const { quittances } = store      
type QuittanceRow = Quittance & { [key: string]: any }

// ==================== COLONNES ====================
const quittanceColumns: TableColumn[] = [
  { key: 'mouvement',    label: 'Mvt',          width: 20,   minWidth: 80 },    
  { key: 'numero',       label: 'N°Quittance',  width: 20,   minWidth: 80 },
  { key: 'isCession',    label: 'Cess°',        width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isIard',       label: 'IARD',        width: 50,   minWidth: 80,  align: 'center' },
 
  { key: 'isSinistree',  label: 'Sinistrée',    width: 50,   minWidth: 80,  align: 'center' },
  { key: 'dateEffet',    label: 'Date Effet',   width: 200,  minWidth: 100, align: 'center' },
  { key: 'dateEcheance', label: 'Date Echéance',width: 200,  minWidth: 500,  align: 'center' },
  { key: 'devise',       label: 'Devise',       width: 80,  minWidth: 80,  },
  { key: 'coursDevise',  label: 'Cours Devise', width: 200,  minWidth: 80,  align:'right' },
  { key: 'capitaux',     label: 'Capitaux',     width: 200,  minWidth: 200, align:'right'  },
  { key: 'lci',          label: 'LCI',          width: 200,  minWidth: 200,  align:'right' },
  { key: 'smp',          label: 'SMP',          width: 200,  minWidth: 200,  align:'right' },
  
]

// ==================== DONNÉES TABLE ====================
// Accéder via store.quittances
const quittanceRows = computed(() => store.quittances.items.value)
const tableLoading = computed(() => store.quittances.isLoading.value)
const loadingMore = computed(() => store.quittances.loadingMore.value)
const hasMore = computed(() => store.quittances.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => quittances.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
const isLigneSelectionnee = computed(() => selectedQuittances.value.length > 0)
const selectedQuittances = ref<(string | number)[]>([])

// ==================== TRI ====================
function onSort(state: SortState): void {
  sortState.value = state
}

// ==================== INFINITE SCROLL ====================
async function handleLoadMore() { 
  if (loadingMore.value || !hasMore.value) return
  await quittances.loadMore()
}

// ==================== MODALES ====================
const onRowClick = ( row: any, index: number)=>{
    quittanceStore.selectQuittance(row as Quittance)       
    emit('row-click',row as Quittance)
}
const onRowDoubleClick = ( row: any, index: number)=>{       
    //emit('row-click',row as Quittance)
    showModal.value=true
}
// Debounce recherche
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans useQuittance gère le reset + refetch automatiquement
  }, 300)
})
</script>

<template>
  <TTable
    v-model:selected-keys="selectedQuittances"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="quittanceColumns"
    :rows="quittanceRows"
    :loading="tableLoading"
    :density="tableDensity"
    height="h-full"
    width="w-full"
    title="Quittances"
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
    @row-double-click="onRowDoubleClick"
    @load-more="handleLoadMore"
  >
    <template #caption-extra>
      <div class="flex justify-between" v-if="isAfficheSearch">
        <input
          v-model="tableSearch"
          type="text"
          placeholder="Rechercher…"
          class="h-8 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>
    </template>

    <template #caption>
        <p v-if="currentPolice && currentPolice.natureOffre" 
          class="text-sm  font-extrabold"
          >
            {{ currentPolice.natureOffre.libelle }}
          </p>
        <TButton  
            type="button"
            variant="soft" > 
              <span class="text-lg font-extrabold uppercase cursor-pointer">Avenant</span> 
        </TButton>
        <TAction
          :masque-nouveau="true"
          :masque-supprimer="true"
          :active-modifier="isLigneSelectionnee"
          :active-impression="isLigneSelectionnee"
        />

    </template>
   <template #cell-isCession="{  row }">       
               <IconeValider  v-if="row.police.isCession" />
               <IconeNonValider  v-else />
       
    </template>
   <template #cell-isIard="{  row }">       
               <IconeValider  v-if="row.police.isIard" />
               <IconeNonValider  v-else />
       
    </template>    
   <template #cell-isSinistree="{ value , row }">
        
               <!-- TAF Charger NB Sinsitre ou IsSinistree-->              
               <IconeNonValider  />
        
    </template>
    <template #cell-mouvement="{ value }">
      <span class="font-mono  uppercase" >{{ value.code }}</span>
    </template>
    <template #cell-dateEffet="{ value }">
      <span class="font-mono  uppercase" v-if="value">{{ value.code }}</span>
       <span class="font-mono  uppercase" v-else="value">TBA</span>
    </template>
    <template #cell-dateEcheance="{ value }">
      <span class="font-mono  uppercase" v-if="value">{{ value.code }}</span>
       <span class="font-mono  uppercase" v-else="value">TBA</span>
    </template>
    <template #cell-devise="{ value }">
      <span class="font-mono  uppercase" >{{ value.code }}</span>
    </template>   
    <template #cell-coursDevise="{ value }">      
       <span class="font-mono  uppercase" >{{formatDecimal(value,)  }}</span>
    </template>
    <template #cell-capitaux="{ value }">      
       <TDisplayNumber :value="value" />
    </template>
    <template #cell-lci="{ value }">      
       <TDisplayNumber :value="value" />
    </template>
    <template #cell-smp="{ value }">
        <TDisplayNumber :value="value" />
    </template>

  </TTable>

    <TModal v-model="showModal" 
      width="98%"  
      height="98%"
     
   >
           <template #header>
               <div class="flex gap-4 h-[1vh] w-full text-2xl">
                 <p>Police    <span class="font-extrabold">N°PAF-26-00004</span></p>
                 <p>Quittance <span class="font-extrabold">N°QAF-26-000425</span></p>
              </div>
          </template>
         
          <template #default>
                <QuittanceVentillee  />
          </template>
                  
          <template #footer>
               
            <TButton
                type="button"
                variant="solid" 
                size="2xl"
                @click="showModal=false"
              > 
                <span class="text-xl font-bold uppercase cursor-pointer">Ferme</span> 
              </TButton>
          </template>

  </TModal>

 
</template>