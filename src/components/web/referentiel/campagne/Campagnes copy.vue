<script setup lang="ts">
import TBadge from '@/components/display/TBadge.vue'
import TTable from '@/components/display/TTable.vue'
import TToolTip from '@/components/display/TToolTip.vue'
import type { SortState, TableColumn, TableRow } from '@/components/forms/common'
import TButton from '@/components/forms/TButton.vue'
import TAction from '@/components/utilitaire/TAction.vue'
import { computed,  ref } from 'vue'


const submitted = ref(false)
const showPwd = ref(false)
const loadingDemo = ref(false)
const modalOpen = ref(false)
const selectedCampagne = ref<TableRow | null>(null)

// ==================== TTABLE ENRICHI ====================
const tableLoading = ref(false)
const tableDensity = ref<'sm' | 'md' | 'lg'>('md')
const tableSearch = ref('')
const selectedCampagnes = ref<(string | number)[]>([])
const sortState = ref<SortState>({ key: null, direction: null })


// ==================== DONNÉES TABLE ====================
const campagneColumns: TableColumn[] = [
  //{ key: 'id',          label: 'ID',        width: 60, sortable: true ,fixed:"left"},
  { key: 'code',         label: 'Code',       width: 300,  minWidth: 150 },
  { key: 'dateDebut',    label: 'Date début', width: 200,  minWidth: 150 },
  { key: 'dateFin',      label: 'Date fin',   width: 200, minWidth: 150},
  { key: 'isActif',      label: 'Actif',      width: 110, align: 'center' },
]

const campagneRows: TableRow[] = []

// ==================== COMPUTED ====================
const filteredAndSortedRows = computed(() => {
  let result = [...campagneRows]
  if (tableSearch.value.trim()) {
    const q = tableSearch.value.toLowerCase()
    result = result.filter(
      (r) =>
        String(r.nom).toLowerCase().includes(q) ||
        String(r.email).toLowerCase().includes(q) ||
        String(r.role).toLowerCase().includes(q),
    )
  }
  if (sortState.value.key && sortState.value.direction) {
    const key = sortState.value.key as keyof TableRow
    const dir = sortState.value.direction === 'asc' ? 1 : -1
    result.sort((a, b) => {
      const va = a[key],
        vb = b[key]
      if (va == null && vb == null) return 0
      if (va == null) return 1 * dir
      if (vb == null) return -1 * dir
      if (va < vb) return -1 * dir
      if (va > vb) return 1 * dir
      return 0
    })
  }
  return result
})




function simulateTableLoad(): void {
  tableLoading.value = true
  window.setTimeout(() => {
    tableLoading.value = false
  }, 1200)
}
function onSort(state: SortState): void {
  sortState.value = state
}
function openCampagne(row : TableRow){
  console.log(row)
}

</script>

<template>
    
   
        <TTable
            v-model:selected-keys="selectedCampagnes"
            :columns="campagneColumns"
            :rows="filteredAndSortedRows"
            :loading="tableLoading"
            :density="tableDensity"
            emptyMessage="Aucune campagne"
            height="h-full"
            width="w-full"
            title="Campagne"
            !selectable
            row-key="id"
            striped
            @sort="onSort"
        >
                <template #caption-extra="{ selectedCount }">
                    <div class="flex  justify-between ">
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
                             <TAction  />
                            <TBadge v-if="selectedCount" color="primary" variant="soft">
                                {{ selectedCount }} / {{ total }}
                            </TBadge>
                            <!-- <TButton size="sm" variant="outline" @click="simulateTableLoad">Charger</TButton> -->
                    </div>
                </template>
                <template #cell-code="{ row }">
                    <TToolTip :content="`Email : ${row.email}`" position="right" theme="soft">
                        <span class="cursor-help border-b border-dashed border-primary-400">
                            {{ row.code }}
                        </span>
                    </TToolTip>
                </template>
                <template #cell-isActif="{ value }">
                   
                    <TBadge :color="String(value) === 'actif' ? 'success' : 'neutral'" dot>
                        {{ value }}
                    </TBadge>
                  
                </template>
                <!-- <template #cell-actions="{ row }">
                    <TToolTip content="Voir les détails" position="left">
                     <TButton size="sm" variant="ghost" @click.stop="openCampagne(row)">Voir</TButton> 
                    </TToolTip>
                </template> -->
                <!-- <template #empty>
                    <p class="py-4 text-center text-sm text-neutral-500">Aucun utilisateur trouvé</p>
                </template> -->
        </TTable>
    
</template>
