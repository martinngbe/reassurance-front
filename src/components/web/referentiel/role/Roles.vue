<script setup lang="ts">
import TBadge from '@/components/display/TBadge.vue'
import TTable from '@/components/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/components/forms/common'
import TAction from '@/components/utilitaire/TAction.vue'
import { computed, ref, watch } from 'vue'
import { useRoles } from '@/referentiel/role/useRole'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import type { IPageInfo, IResponse } from '@/type/pagination'

// ==================== PAGINATION ====================
const page = ref(1)
const pageSize = ref(PAGE_SIZE)

// ==================== TTABLE ENRICHI ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('md')
const tableSearch = ref('')
const selectedRoles = ref<(string | number)[]>([])
const sortState = ref<SortState>({ key: null, direction: null })

// ==================== API ====================
const params = computed(() => ({
  page: page.value,
  limit: pageSize.value,
  search: tableSearch.value.trim() || undefined,
  sortKey: sortState.value.key ?? undefined,
  sortDirection: sortState.value.direction ?? undefined,
}))

const { roles } = useRoles(params)

// ==================== DONNÉES TABLE ====================
const roleColumns: TableColumn[] = [
  { key: 'code',  label: 'Code', width: '20%', minWidth: 150, sortable: true },
  { key: 'label', label: 'Libellé', width: '75%', minWidth: 150, sortable: true },
  
]

const totalItems = ref(0)
const totalPages = ref(0)

const roleRows = computed(() => {
  const resultat  = roles.data.value
  if(!resultat) return []
  if(!resultat.success) return []
  const pageInfo  = resultat.pageInfo
  console.log( "resultat:",resultat)
  console.log( "resultat.success:",resultat.success)
  console.log( "pageInfo",pageInfo)
  if(pageInfo){
     totalItems.value = pageInfo.total
     totalPages.value = pageInfo.totalPages
      console.log(new Date(), "totalPageso:",totalPages.value)
      console.log(new Date(), "totalItems:",totalItems.value)
  }
  return resultat.data;
})
// État de chargement exposé au TTable
const tableLoading = computed(() => roles.isLoading.value || roles.isFetching.value)


// ==================== HANDLERS ====================
function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}

// Reset page quand la recherche change (avec debounce idéalement)
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    page.value = 1
  }, 300)
})
const isSelectionLigne =ref(false)
const selection = ( row:any, index:number)=>{
    //console.log("selection de ligne:",row , " index:",index)
    isSelectionLigne.value = row !== null && row !== undefined
}


</script>
<template>
  <TTable
    v-model:selected-keys="selectedRoles"
    :columns="roleColumns"
    :rows="roleRows"
    :loading="tableLoading"
    :density="tableDensity"
    empty-message="Aucun profile"
    height="h-full"
    width="w-full"
    title="Profils"
    row-key="id"
    striped
    @sort="onSort"
    @row-click="selection"
  >
    <template #caption-extra>
      <div class="flex justify-between">
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
      <div class="flex items-center gap-2">
        <!-- <TAction 
        :modifier-visible="isSelectionLigne" 
        :supprimer-visible="isSelectionLigne"
        :impression-visible="totalItems>0"
        /> -->
        <TTitreModule libelle="données système"/> 
       
      </div>
    </template>

    <template #cell-code="{ value }">
      <span class="font-mono  text-xl uppercase">{{ value }}</span>
    </template>
    <template #cell-label="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
  

    <template #empty>
      <p class="py-4 text-center text-sm text-neutral-500">
        Aucun profile trouvé
      </p>
    </template>

    <!-- Pagination en footer (si TTable expose un slot footer) -->
    <!-- <template #footer>
      <div class="flex items-center justify-between px-4 py-3 text-sm">
        <span class="text-neutral-500">
          {{ totalItems }} résultat(s) — page {{ page }} / {{ totalPages || 1 }}
        </span>
        <div class="flex gap-2">
          <TButton size="sm" variant="outline" :disabled="page <= 1" @click="prevPage">
            Précédent
          </TButton>
          <TButton size="sm" variant="outline" :disabled="page >= totalPages" @click="nextPage">
            Suivant
          </TButton>
        </div>
      </div>
    </template> -->
  </TTable>
</template>
