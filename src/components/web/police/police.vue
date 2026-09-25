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
const selectedUser = ref<TableRow | null>(null)

// ==================== TTABLE ENRICHI ====================
const tableLoading = ref(false)
const tableDensity = ref<'sm' | 'md' | 'lg'>('md')
const tableSearch = ref('')
const selectedUsers = ref<(string | number)[]>([])
const sortState = ref<SortState>({ key: null, direction: null })


// ==================== DONNÉES TABLE ====================
const polceColumns: TableColumn[] = [
  { key: 'id',          label: 'ID',           width: 60, sortable: true ,fixed:"left"},
  { key: 'numero',      label: 'Numero',       width: 300,sortable: true , resizable: true, minWidth: 150 },
  { key: 'sousBranche',       label: 'Sous Branche',     width: 200,sortable: true, resizable: true },
  
]

const polceRows: TableRow[] = [
  { id: 1, numero: 'P-026-001', sousBranche: 'awa@exemple.fr' },
  { id: 2, numero: 'P-026-018', sousBranche: 'karim@exemple.fr', },
  { id: 3, numero: 'P-026-077', sousBranche: 'lea@exemple.fr',},

]

// ==================== COMPUTED ====================
const filteredAndSortedRows = computed(() => {
  let result = [...polceRows]
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
function openUser(row : TableRow){
  console.log(row)
}

</script>

<template>
    
   
        <TTable
            v-model:selected-keys="selectedUsers"
            :columns="polceColumns"
            :rows="filteredAndSortedRows"
            :loading="tableLoading"
            :density="tableDensity"
            emptyMessage="Aucune Police"
            height="h-full"
            width="w-full"
            title="Police"
            !selectable
            row-key="id"
            striped
            @sort="onSort"
        >
                <!-- <template #caption-extra="{ selectedCount }">
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
                </template> -->
                <template #caption="{ selectedCount, total }">
                    <div class="flex items-center gap-2">
                             <TAction  />
                            <!-- <TBadge v-if="selectedCount" color="primary" variant="soft">
                                {{ selectedCount }} / {{ total }}
                            </TBadge>
                            <TButton size="sm" variant="outline" @click="simulateTableLoad">Charger</TButton> -->
                    </div>
                </template>
                <template #cell-numero="{ row }">
                    <TToolTip :content="`Email : ${row.email}`" position="right" theme="soft">
                        <span class="cursor-help border-b border-dashed border-primary-400">
                            {{ row.numero }}
                        </span>
                    </TToolTip>
                </template>
                <template #cell-sousBranche="{ value }">
                    <TToolTip
                    :content="String(value) === 'actif' ? 'Utilisateur connecté' : 'Déconnecté'"
                    theme="dark"
                    >
                    <TBadge :color="String(value) === 'actif' ? 'success' : 'neutral'" dot>
                        {{ value }}
                    </TBadge>
                    </TToolTip>
                </template>
                
        </TTable>
    
</template>
