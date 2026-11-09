<script setup lang="ts">

import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn, TableRow } from '@/composants/forms/common'

import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TAction from '@/composants/utilitaire/TAction.vue'
import TModal from '@/composants/display/TModal.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import IconeValider from '@/composants/icone/IconeValider.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import { useComptes } from '@/services/flux-financiers/comptes/compte/useCompte'
import type { Compte } from '@/services/flux-financiers/comptes/compte/compte'
import TDisplayNumber from '@/composants/utilitaire/TDisplayNumber.vue'
import TTempCompte from '../temp-compte/TTempCompte.vue'
import TButton from '@/composants/forms/TButton.vue'
import { useCompteStore } from '@/services/flux-financiers/comptes/compte/compte.store.ts'
import { useTempCompteStore } from '@/services/flux-financiers/comptes/temp-compte/temp-compte.store.ts'
import { useTempComptes } from '@/services/flux-financiers/comptes/temp-compte/useTempCompte.ts'
import type { PaginationParams } from '@/type/pagination.ts'

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
  sortDirection: sortState.value.direction as 'ASC' | 'DESC' | undefined,
}))

const { comptes ,deleteCompte } = useComptes(params)
const compteStore = useCompteStore()
const { success, error, warning, info, add } = useToast()

// Type local pour satisfaire TTable (signature d'index)
type CompteRow = Compte & { [key: string]: any }

// ==================== DONNÉES TABLE ====================
const compteColumns: TableColumn[] = [ 
  { key: 'numero',           label: 'N° Compte',          width: '20%',  minWidth: 150 , sortable: true},
  { key: 'compteType',       label: 'Type',               width: '20%',  minWidth: 150 , sortable: true}, 
  { key: 'solde',            label: 'Solde',              width: '35%',  minWidth: 150 , sortable: true},
  { key: 'isEnNotreFaveur',  label: 'En Notre faveur',    width: '15%',  minWidth: 150 , sortable: true},
 
]
const emit = defineEmits<{ 
  (e: 'row-click',  compte: any): void
}>()

const totalItems = ref(0)
const totalPages = ref(0)

const compteRows = computed(() => {
  const resultat  = comptes.data.value
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
const tableLoading = computed(() => comptes.isLoading.value || comptes.isFetching.value)
const isAfficheSearch = computed(() => totalItems.value> PAGE_SIZE)
const isLigneSelectionnee = computed(()=> selectedComptes.value.length > 0)
//const selectedComptes = ref<(string | number)[]>([])

// ✅ REMPLACER le ref local par un computed lié au store
const selectedComptes = computed({
  get: () => compteStore.selectedComptes,
  set: (value) => compteStore.setSelectedComptes(value)
})
function onSort(state: SortState): void {
  sortState.value = state
  page.value = 1 // reset page au tri
}
// ==================== ACTIONS TAction ====================
// ==================== MODALE ====================
const showModal = ref(false)
const showModalfirmation= ref(false)
const titleModal = ref('')
const compteToEdit = ref<Compte | null>(null)

const openCreate = () => {
  compteToEdit.value = null
  titleModal.value = 'Nouveau compte : processus ...'
  showModal.value = true
}

const openEdit = (compte: CompteRow) => {
  compteToEdit.value = compte
  titleModal.value = 'Modifier compte'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  compteToEdit.value = null
}
// ==================== HANDLERS ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
}
const handleNouveau = () => openCreate()
const handleModifier = () => {
  if (selectedComptes.value.length === 0) {
    info('Veuillez sélectionner un compte', 'Info')
    return
  }
  const compteId = selectedComptes.value[0]
  const compte = compteRows.value.find((u:any) => u.id === compteId)
  if (compte) openEdit(compte)
}

const handleSupprimer = async () => {
  if (selectedComptes.value.length === 0) {
    warning('Veuillez sélectionner un compte',"Attention")
    return
  }
  const compteId = selectedComptes.value[0]
  compteToEdit.value = compteRows.value.find((u:any) => u.id === compteId)
  if (!compteToEdit.value) return
  showModalfirmation.value=true 
  
}
////////////////  
const tempCompteStore = useTempCompteStore()
const currentTempCompte = computed(()=> tempCompteStore.currentTempCompte)
//const paramsCompte = computed<PaginationParams>(() => ({}))
const { transfererCompte } = useTempComptes()

const handleTransfertTempCompteVersCompte = async () => {
  if (!currentTempCompte.value) {
    info("Il n'y a aucun compte à transférer ...", "Information")
    return
  }

  try {
    // ✅ Utiliser .mutateAsync() pour pouvoir faire un await
    const resultat = await transfererCompte.mutateAsync(currentTempCompte.value.id)
    console.log("Transfert réussi :", resultat)
    showModal.value = false
     success("Transfert réussi : ...", "Success")
  } catch (error) {
    console.error("Erreur lors du transfert :", error)
    // Gérer l'erreur (ex: afficher un toast d'erreur)
  }
}
const handlConfirmeSuppression = async ()=>{
  const compte = compteToEdit.value?? null
  if (!compte ) return
    try {
        await deleteCompte.mutateAsync(compte.id)
        showModalfirmation.value=false 
        success("Opération effectuée avec succès", 'Succès')
        selectedComptes.value = selectedComptes.value.filter(
          (id) => id !== compte.id,
        )
      } catch (err: any) {
        console.error('Erreur suppression:', err)
        const message =  err?.response?.data?.message ||
            err?.message ||
            'Une erreur est survenue lors de la suppression.'
        error(message,'Erreur')
       
      }
}
const onRowClick = ( row: any, index: number)=>{       
    emit('row-click',row as Compte)
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
    v-model:selected-keys="selectedComptes"

    :show-index="true"
    index-label="N°"
    :index-width="60"

    :columns="compteColumns"
    :rows="compteRows"
    :loading="tableLoading"
    :density="tableDensity"
   
    height="h-full"
    width="w-full"
    title="Comptes"
    row-key="id"
    striped

    @row-click="onRowClick"
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
       <TAction
          :active-actualiser="total>0"
          :active-impression="total>0"
          :active-supprimer="selectedCount>0"
          :masque-modifier="true"
          content-nouveau="Saisissez un nouveau compte ...."
          @nouveau="handleNouveau"
          @supprimer="handleSupprimer"
        
        /> 
    </template>

    <template #cell-numero="{ value }">
      <span class="font-mono  text-xl uppercase">{{ value }}</span>
    </template>
    <template #cell-compteType="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>

   <template #cell-solde="{ value }">
      <span class="font-mono text-xl uppercase"><TDisplayNumber :value="value" />></span>
    </template>
    <template #cell-isEnNotreFaveur="{ value }">
      <IconeValider v-if="value" /><IconeNonValider v-else/>
    </template>   
   
  
  </TTable>
  <TModal v-model="showModal" width="85%" height="85%" :title="titleModal">
    <TTempCompte />
    <template #footer>
      <div class="flex justify-center gap-4">
          <TButton variant="soft" size="2xl" @click="showModal=false">
                Annuler
          </TButton>
          <TButton variant="solid" size="2xl" @click="handleTransfertTempCompteVersCompte">
                Valider
          </TButton>
      </div>
    </template>
  </TModal>

          <!-- Modale du formulaire -->
        <TModal v-model="showModalfirmation" 
            title="Demande de confirmation"           >
              <TDemandeConfirmation   
                @annuler="showModalfirmation=false"
                @confirmer="handlConfirmeSuppression"
              > 
                <template #message>
                <p class="text-xl text-neutral-800 dark:text-neutral-300 pb-4"
                >Voulez-vous supprimer la compte <span class ="font-extrabold"
                    >{{ compteToEdit?.numero }}</span>
                  </p>
                </template>
            </TDemandeConfirmation>   
        </TModal>
</template>
