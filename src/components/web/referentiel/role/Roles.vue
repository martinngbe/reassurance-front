<script setup lang="ts">

import TTable from '@/components/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/components/forms/common'

import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import { useRoles } from '@/referentiel/role/useRole'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TTitreModule from '@/components/utilitaire/TTitreModule.vue'

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
  if(pageInfo){
     totalItems.value = pageInfo.total
     totalPages.value = pageInfo.totalPages
  }
  return resultat.data;
})
// État de chargement exposé au TTable
const tableLoading = computed(() => roles.isLoading.value || roles.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)
// ✨ Initialisation avec l'ID de la 1ère ligne
//const firstLigneSelected = ref<(string | number )>(roleRows.value[0]?.id?? 0  )
//const selectedRoles = ref<(string | number)[]>([firstLigneSelected.value])
const selectedRoles = ref<(string | number)[]>([])
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


</script>
<template>
  <TTable
    v-model:selected-keys="selectedRoles"

    :show-index="true"
    index-label="N°"
    :index-width="60"
        
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
      <div class="flex items-center gap-2">       
        <p class="text-sm text-primary-300 "> Données système</p>       
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
