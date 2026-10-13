<template>
  <TTable
    :columns="columns"
    :rows="roles"
    :loading="isLoading"
    :title="title"
    :selectable="editable"
    :height="height"
    density="md"
    hoverable
    striped
    caption-position="top"
    row-key="id"
    :selected-keys="selectedKeys"
    @update:selected-keys="selectedKeys = $event"
    @row-click="handleRowClick"
  >
    <!-- ================= CAPTION (barre d'outils) ================= -->
    <template #caption-extra>
      <div class="flex flex-wrap items-center gap-3">
        <!-- Recherche -->
        <div class="relative w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un rôle..."
            class="w-full pl-9 pr-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100"
          />
          <svg class="absolute left-2.5 top-2 h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Résumé -->
        <div v-if="!isLoading" class="flex items-center gap-2 text-xs">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            {{ assignedCount }} assigné{{ assignedCount > 1 ? 's' : '' }}
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
            <span class="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
            {{ pageInfo.total - assignedCount }} non assigné{{ pageInfo.total - assignedCount > 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Bouton enregistrer (mode édition) -->
        <button
          v-if="editable"
          @click.stop="save"
          :disabled="!hasChanges || isSaving"
          class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <svg v-if="isSaving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </template>

    <!-- ================= CAPTION BAS (pagination) ================= -->
    <template #caption>
      <div class="flex items-center justify-between w-full text-sm text-neutral-600 dark:text-neutral-300">
        <span>
          Page <span class="font-semibold">{{ pageInfo.page }}</span> / <span class="font-semibold">{{ pageInfo.totalPages }}</span>
          — <span class="font-semibold">{{ pageInfo.total }}</span> rôle{{ pageInfo.total > 1 ? 's' : '' }}
        </span>
        <div class="flex gap-2">
          <button
            @click="changePage(pageInfo.page - 1)"
            :disabled="pageInfo.page === 1"
            class="px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded-md text-xs font-medium bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← Précédent
          </button>
          <button
            @click="changePage(pageInfo.page + 1)"
            :disabled="pageInfo.page === pageInfo.totalPages"
            class="px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded-md text-xs font-medium bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Suivant →
          </button>
        </div>
      </div>
    </template>

    <!-- ================= CELLULE "Statut" (badge assigné) ================= -->
    <template #cell-assigned="{ row }">
      <span
        :class="[
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full',
          row.assigned
            ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
        ]"
      >
        <svg v-if="row.assigned" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        {{ row.assigned ? 'Assigné' : 'Non assigné' }}
      </span>
    </template>

    <!-- ================= CELLULE "Code" (gras) ================= -->
    <template #cell-code="{ row }">
      <span class="font-mono font-semibold text-primary-700 dark:text-primary-400">{{ row.code }}</span>
    </template>

    <!-- ================= CELLULE "Label" ================= -->
    <template #cell-label="{ row }">
      <span class="text-neutral-800 dark:text-neutral-100">{{ row.label }}</span>
    </template>

    <!-- ================= CELLULE "Description" ================= -->
    <template #cell-description="{ row }">
      <span class="text-neutral-500 dark:text-neutral-400 line-clamp-1" title="row.description">
        {{ row.description || '—' }}
      </span>
    </template>

    <!-- ================= ÉTAT VIDE ================= -->
    <template #empty>
      <div class="flex flex-col items-center gap-2 py-4 text-neutral-400">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Aucun rôle trouvé</span>
      </div>
    </template>
  </TTable>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { TableColumn } from '@/components/forms/common'; // ← adaptez le chemin
import { useRoles } from '@/referentiel/role/useRole';
import type { PaginationParams } from '@/type/pagination';
import TTable from '@/components/display/TTable.vue';
import { PAGE_SIZE } from '@/utilitaire/utilitaire';

// ─── Props ────────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    userId: number;
    editable?: boolean;
    title?: string;
    height?: string | number;
  }>(),
  {
    editable: false,
    title: 'Rôles de l’utilisateur',
    height: '500px',
  }
);

const emit = defineEmits<{
  (e: 'saved'): void;
}>();

// ─── État local ───────────────────────────────────────────
const searchQuery = ref('');
const currentPage = ref(1);
const limit = PAGE_SIZE;
const selectedKeys = ref<(string | number)[]>([]);
const initialIds = ref<Set<number>>(new Set());

const params = computed<PaginationParams>(() => ({
  page: currentPage.value,
  limit,
  search: searchQuery.value || undefined,
  sortKey: 'code',
  sortDirection: 'ASC',
}));

// ─── Colonnes ─────────────────────────────────────────────
const columns: TableColumn[] = [
  { key: 'code', label: 'Code', sortable: true, width: 160, fixed: 'left' },
  { key: 'label', label: 'Libellé', sortable: true, width: '35%' },
  { key: 'description', label: 'Description', width: '35%' },
  { key: 'assigned', label: 'Statut', width: 140, align: 'center' },
];

// ─── Composables existants ────────────────────────────────
const { rolesForUser, updateUserRoles } = useRoles();
const { data, isLoading } = rolesForUser(props.userId, params);
const { mutateAsync, isPending: isSaving } = updateUserRoles;

// ─── Données dérivées ─────────────────────────────────────
const roles = computed(() => data.value?.data ?? []);
const pageInfo = computed(
  () =>
    data.value?.pageInfo ?? {
      page: 1,
      totalPages: 1,
      total: 0,
      limit,
    }
);
const assignedCount = computed(() => roles.value.filter((r:any) => r.assigned).length);

// Initialise les IDs cochés dès la 1ère réponse
watch(
  () => data.value?.data,
  (newData) => {
    if (newData && initialIds.value.size === 0) {
      const ids = newData.filter((r:any) => r.assigned).map((r:any) => r.id);
      initialIds.value = new Set(ids);
      selectedKeys.value = [...ids];
    }
  },
  { immediate: true }
);

// Détecte les changements (mode édition)
const hasChanges = computed(() => {
  if (!props.editable) return false;
  const current = new Set(selectedKeys.value.map(Number));
  if (current.size !== initialIds.value.size) return true;
  for (const id of current) {
    if (!initialIds.value.has(id)) return true;
  }
  return false;
});

// ─── Actions ──────────────────────────────────────────────
const changePage = (p: number) => {
  if (p >= 1 && p <= pageInfo.value.totalPages) currentPage.value = p;
};

const handleRowClick = (row: any) => {
  // En mode édition, un clic sur la ligne bascule la sélection
  if (!props.editable) return;
  const id = row.id;
  const idx = selectedKeys.value.indexOf(id);
  if (idx === -1) selectedKeys.value = [...selectedKeys.value, id];
  else selectedKeys.value = selectedKeys.value.filter((k) => k !== id);
};

const save = async () => {
  try {
    await mutateAsync({
      userId: props.userId,
      roleIds: selectedKeys.value.map(Number),
    });
    initialIds.value = new Set(selectedKeys.value.map(Number));
    emit('saved');
  } catch (err) {
    console.error('Erreur lors de la sauvegarde des rôles', err);
  }
};

// Debounce sur la recherche
let searchTimeout: ReturnType<typeof setTimeout>;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
  }, 400);
});
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>