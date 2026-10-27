<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

import type { PaginationParams } from '@/type/pagination.ts'
import { useTempPolices } from '@/services/temp-police/useTempPolice.ts'
import type { TempPolice } from '@/services/temp-police/temp-police.ts'
import IconeValider from '@/composants/icone/IconeValider.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import { useTempPoliceStore } from '@/services/temp-police/temp-police.store'

// ==================== ÉTAT LOCAL ====================
const tempPoloceStore = useTempPoliceStore()
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const emit = defineEmits<{ 
  (e: 'row-click',  tempPolice: any): void
  (e: 'success',message: string): void
  
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
// Ne pas destructurer tempPolices
const store = useTempPolices(params)
const { tempPolices } = store

type TempPoliceRow = TempPolice & { [key: string]: any }

// ==================== COLONNES ====================
const tempPoliceColumns: TableColumn[] = [
  //{ key: 'numero',                label: 'N°TempPolice',    width: 20,   minWidth: 80 },
  { key: 'isCession',             label: 'Cess°',           width: 50,   minWidth: 80,  align: 'center' },
  { key: 'natureOffre',           label: 'Nature Offre',    width: 150,  minWidth: 100, },

  { key: 'isReconductionTacite',  label: 'Tacite Recond.',   width: 100,  minWidth: 100, align: 'center' },
  
  { key: 'acteurCedante',         label: 'Cedante',          width: 500,  minWidth: 500, },
  { key: 'courtier',              label: 'Courtier',         width: 500,  minWidth: 500, },
  { key: 'assure',                label: 'Assure',           width: 500,  minWidth: 500,  },
  { key: 'sousBranche',           label: 'Sous Branche',     width: 500,  minWidth: 500,  },
  
]


// ==================== DONNÉES TABLE ====================
// Accéder via store.tempPolices
const tempPoliceRows = computed(() => store.tempPolices.items.value)
const tableLoading = computed(() => store.tempPolices.isLoading.value)
const loadingMore = computed(() => store.tempPolices.loadingMore.value)
const hasMore = computed(() => store.tempPolices.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => tempPolices.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
const selectedTempPolices = ref<(string | number)[]>([])

// ==================== TRI ====================
function onSort(state: SortState): void {
  sortState.value = state
}

// ==================== INFINITE SCROLL ====================
async function handleLoadMore() { 
  if (loadingMore.value || !hasMore.value) return
  await tempPolices.loadMore()
}

// ==================== MODALES ====================



const onRowClick = ( row: any, index: number)=>{ 
    tempPoloceStore.selectTempPolice(row as TempPolice)      
    emit('row-click',row as TempPolice)
    emit('success' ,'Historique des saisies')
}

// Debounce recherche
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans useTempPolice gère le reset + refetch automatiquement
  }, 300)
})
</script>

<template>
  <TTable
    v-model:selected-keys="selectedTempPolices"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="tempPoliceColumns"
    :rows="tempPoliceRows"
    :loading="tableLoading"
    :density="tableDensity"
    height="h-full"
    width="w-full"
    title="Historique saisie"
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
          </template>
          <template #cell-isCession="{ value }">
              <IconeValider v-if="value==true"/>
              <IconeNonValider v-else />
          </template>
          <template #cell-isReconductionTacite="{ value }">
              <IconeValider v-if="value==true"/>
              <IconeNonValider v-else />
          </template>
          <template #cell-natureOffre="{ value }">
              <span class="font-mono text-xl uppercase">{{ value.code }}</span>
          </template>
          <template #cell-assure="{ value }">
              <span class="font-mono text-xl uppercase" v-if="value">{{ value.raisonSociale }}</span>
          </template>
          <template #cell-sousBranche="{ value }">
              <span class="font-mono text-xl uppercase" v-if="value">{{ value.libelle }}</span>
          </template>
          <template #cell-acteurCedante="{ value }">
              <span class="font-mono text-xl uppercase" v-if="value">{{ value.raisonSociale }}</span>
          </template>
                 



  </TTable>

 
</template>