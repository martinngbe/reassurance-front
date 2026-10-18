<script setup lang="ts">
import TBadge from '@/composants/display/TBadge.vue'
import TTable from '@/composants/display/TTable.vue'
import TToolTip from '@/composants/display/TToolTip.vue'
import type { SortState, TableColumn, TableRow } from '@/composants/forms/common'
import TButton from '@/composants/forms/TButton.vue'
import TAction from '@/composants/utilitaire/TAction.vue'
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
const userColumns: TableColumn[] = [
  { key: 'id',          label: 'ID',        width: 60, sortable: true ,fixed:"left"},
  { key: 'nom',         label: 'Nom',       width: 300,sortable: true , resizable: true, minWidth: 150 },
  { key: 'email',       label: 'Email',     width: 200,sortable: true, resizable: true },
  { key: 'role',        label: 'Rôle',      width: 100, sortable: true },
  { key: 'statut',      label: 'Statut',     width: 110, align: 'center', sortable: true },
  { key: 'actions',     label: '', align: 'right', width: 100 },
]

const userRows: TableRow[] = [
  { id: 1, nom: 'Awa Diop', email: 'awa@exemple.fr', role: 'Designer', statut: 'actif' },
  { id: 2, nom: 'Karim Benali', email: 'karim@exemple.fr', role: 'Développeur', statut: 'inactif' },
  { id: 3, nom: 'Léa Martin', email: 'lea@exemple.fr', role: 'Cheffe de projet', statut: 'actif' },
  { id: 4, nom: 'Youssef El Amrani', email: 'youssef@exemple.fr', role: 'DevOps', statut: 'actif' },
  {
    id: 5,
    nom: 'Sophie Laurent',
    email: 'sophie@exemple.fr',
    role: 'Data Scientist',
    statut: 'actif',
  },
  {
    id: 6,
    nom: 'Moussa Traoré',
    email: 'moussa@exemple.fr',
    role: 'Développeur',
    statut: 'inactif',
  },
  { id: 7, nom: 'Emma Dubois', email: 'emma@exemple.fr', role: 'Designer', statut: 'actif' },
  { id: 8, nom: 'Omar Hassan', email: 'omar@exemple.fr', role: 'Chef de projet', statut: 'actif' },

]

// ==================== COMPUTED ====================
const filteredAndSortedRows = computed(() => {
  let result = [...userRows]
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
            :columns="userColumns"
            :rows="filteredAndSortedRows"
            :loading="tableLoading"
            :density="tableDensity"
            emptyMessage="Aucun assuré"
            height="h-full"
            width="w-full"
            title="Cedantes"
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
                            <TButton size="sm" variant="outline" @click="simulateTableLoad">Charger</TButton>
                    </div>
                </template>
                <template #cell-nom="{ row }">
                    <TToolTip :content="`Email : ${row.email}`" position="right" theme="soft">
                        <span class="cursor-help border-b border-dashed border-primary-400">
                            {{ row.nom }}
                        </span>
                    </TToolTip>
                </template>
                <template #cell-statut="{ value }">
                    <TToolTip
                    :content="String(value) === 'actif' ? 'Utilisateur connecté' : 'Déconnecté'"
                    theme="dark"
                    >
                    <TBadge :color="String(value) === 'actif' ? 'success' : 'neutral'" dot>
                        {{ value }}
                    </TBadge>
                    </TToolTip>
                </template>
                <template #cell-actions="{ row }">
                    <TToolTip content="Voir les détails" position="left">
                     <TButton size="sm" variant="ghost" @click.stop="openUser(row)">Voir</TButton> 
                    </TToolTip>
                </template>
                <template #empty>
                    <p class="py-4 text-center text-sm text-neutral-500">Aucun utilisateur trouvé</p>
                </template>
        </TTable>
    
</template>
