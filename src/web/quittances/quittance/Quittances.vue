<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TModal from '@/composants/display/TModal.vue'

import type { PaginationParams } from '@/type/pagination.ts'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import IconeValider from '@/composants/icone/IconeValider.vue'
import { useToast } from '@/composants/toast/useToast'
import TButton from '@/composants/forms/TButton.vue'
import { useQuittances } from '@/services/quittances/quittance/useQuittance'
import type { Quittance } from '@/services/quittances/quittance/quittance'

// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const emit = defineEmits<{ 
  (e: 'row-click',  quittance: any): void
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
// Ne pas destructurer quittances
const store = useQuittances(params)
const { quittances } = store
const { success, error, warning, info } = useToast()

//console.warn(" -- Quittances.vue quittances:",quittances)

type QuittanceRow = Quittance & { [key: string]: any }

// ==================== COLONNES ====================
const quittanceColumns: TableColumn[] = [
  { key: 'mouvement',    label: 'Mvt',          width: 20,   minWidth: 80 },    
  { key: 'numero',       label: 'N°Quittance',  width: 20,   minWidth: 80 },
  { key: 'isCession',    label: 'Cess°',        width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isSinistree',  label: 'Sinistrée',    width: 50,   minWidth: 80,  align: 'center' },
  { key: 'dateEffet',    label: 'Date Effet',   width: 200,  minWidth: 100, align: 'center' },
  { key: 'dateEcheance', label: 'Date Echéance',width: 200,  minWidth: 500,  },
  { key: 'devise',       label: 'Devise',       width: 80,  minWidth: 80,  },
  { key: 'coursDevise',  label: 'Cours Devise', width: 200,  minWidth: 80,  },
  { key: 'capitaux',     label: 'Capitaux',     width: 500,  minWidth: 500,  },
  { key: 'lci',          label: 'LCI',          width: 500,  minWidth: 500,  },
  { key: 'smp',          label: 'SMP',          width: 500,  minWidth: 500,  },
  
]
/* 

  dateEcheance?: string;
  coursDevise: number;
  avisEcheance?: number; 

  capitaux: number; 
  limiteCapitauxImpliques: number;
  ici: number;
  smp: number;
  limite: number;
  retention: number;
  conservation: number;
  capacite: number;
  estimationPrime: number;
  tauxCedante: number;
  tauxAccepte: number;
  tauxCommission: number;
  taxeSurCommission: number;
  primeBrute: number;
  primeNette: number;
  taxeSurPrime: number;
  nombreEcheancePmd: number;
  sinistreAuComptant?: number;
  avisSinistre?: number;
  aliment?: number;
  isAnnule?: boolean;
*/

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
const showModal = ref(false)
const showModalConfirmation = ref(false)
const titleModal = ref('')
const quittanceToEdit = ref<Quittance | null>(null)

const openCreate = () => {
  quittanceToEdit.value = null
  titleModal.value = 'Nouvelle quittance'
  showModal.value = true
}

const openEdit = (quittance: QuittanceRow) => {
  quittanceToEdit.value = quittance
  titleModal.value = 'Modifier quittance'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  quittanceToEdit.value = null
}

// ==================== HANDLERS CRUD ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
  quittances.refresh()
}

const handleNouveau = () => openCreate()





const onRowClick = ( row: any, index: number)=>{       
    emit('row-click',row as Quittance)
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
        <TButton  
            type="button"
            variant="soft" > 
              <span class="text-lg font-bold uppercase cursor-pointer">Avenant</span> 
        </TButton>

    </template>
  
  </TTable>

 

 
</template>