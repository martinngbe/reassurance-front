<!-- UserRoles.vue -->
<script setup lang="ts">
import TTable from '@/components/display/TTable.vue'
import type { SortState, TableColumn } from '@/components/forms/common'
import { computed, ref, watch } from 'vue'
import { useRoles } from '@/referentiel/role/useRole'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

// ==================== PROPS ====================
const props = defineProps<{
  userId: number
}>()

const emit = defineEmits<{
  (e: 'saved', roleIds: number[]): void
}>()

// ==================== PAGINATION ====================
const page = ref(1)
const pageSize = ref(PAGE_SIZE)

// ==================== TTABLE ====================
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

const { rolesForUser, updateUserRoles } = useRoles()

const { data, isLoading, isFetching } = rolesForUser(
  computed(() => props.userId),
  params,
)

// ==================== COLONNES ====================
const roleColumns: TableColumn[] = [
  { key: 'code', label: 'Code', width: '20%', minWidth: 150, sortable: true },
  { key: 'label', label: 'Libellé', width: '60%', minWidth: 150, sortable: true },
  { key: 'assigned', label: 'Attribué', width: '20%', minWidth: 120, sortable: false },
]

// ==================== DONNÉES ====================
const totalItems = ref(0)
const totalPages = ref(0)

const roleRows = computed(() => {
  const resultat = data.value as any
  if (!resultat) return []
  if (!resultat.success) return []
  const pageInfo = resultat.pageInfo
  if (pageInfo) {
    totalItems.value = pageInfo.total
    totalPages.value = pageInfo.totalPages
  }
  return resultat.data
})

const tableLoading = computed(() => isLoading.value || isFetching.value)
const isAfficheSearch = computed(() => totalItems.value > PAGE_SIZE)

// ✅ Synchroniser la sélection avec les rôles attribués
watch(
  roleRows,
  (rows) => {
    selectedRoles.value = rows
      .filter((r: any) => r.assigned)
      .map((r: any) => r.id)
  },
  { immediate: true },
)

// ==================== HANDLERS ====================
function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1
}

let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    page.value = 1
  }, 300)
})

// ✅ Sauvegarder les rôles sélectionnés
async function handleSave() {
  const roleIds = selectedRoles.value.map((id) => Number(id))
  await updateUserRoles.mutateAsync({
    userId: props.userId,
    roleIds,
  })
  emit('saved', roleIds)
}

defineExpose({ handleSave })
</script>

<template>
  <TTable
    v-model:selected-keys="selectedRoles"
    :columns="roleColumns"
    :rows="roleRows"
    :loading="tableLoading"
    :density="tableDensity"
    empty-message="Aucun rôle"
    height="h-full"
    width="w-full"
    title="Rôles de l'utilisateur"
    row-key="id"
    striped
    selectable
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

    <template #caption>
      <div class="flex items-center gap-2">
        <TTitreModule libelle="rôles utilisateur" />
        <span class="text-sm text-neutral-500">
          {{ selectedRoles.length }} sélectionné(s)
        </span>
      </div>
    </template>

    <template #cell-code="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>

    <template #cell-label="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>

    <!-- ✅ Colonne "assigned" avec badge visuel -->
    <template #cell-assigned="{ row }">
      <span
        v-if="row.assigned"
        class="inline-flex items-center gap-1 rounded-full
               bg-green-100 px-2 py-1 text-xs font-semibold text-green-700
               dark:bg-green-900/30 dark:text-green-400"
      >
        <i class="pi pi-check text-xs"></i>
        Attribué
      </span>
      <span
        v-else
        class="inline-flex items-center gap-1 rounded-full
               bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-500
               dark:bg-neutral-800 dark:text-neutral-400"
      >
        <i class="pi pi-minus text-xs"></i>
        Non attribué
      </span>
    </template>

    <template #empty>
      <p class="py-4 text-center text-sm text-neutral-500">
        Aucun rôle trouvé
      </p>
    </template>
  </TTable>
</template>