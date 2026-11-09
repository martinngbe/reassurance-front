<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref,  watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

import TButton from '@/composants/forms/TButton.vue'
import { formatDecimal } from '@/utilitaire/number'
import TDisplayNumber from '@/composants/utilitaire/TDisplayNumber.vue'
import TModal from '@/composants/display/TModal.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import {  ECRAN_FACULTATIVE, MODULE_CESSION, useEcransStore } from '@/services/ecrans/ecrans.store.ts'
import { useBordereauStore } from '@/services/flux-financiers/bordereau/bordereau.store'
import type { Bordereau } from '@/services/flux-financiers/bordereau/bordereau'
import { useBordereaux } from '@/services/flux-financiers/bordereau/useBordereaux'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'
import TAction from '@/composants/utilitaire/TAction.vue'
import TBordereauForm from './TBordereauForm.vue'
import IconeValider from '@/composants/icone/IconeValider.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import TFicheBordereau from './ TFicheBordereau.vue'



const props = defineProps<{
  isAllBordereau?: boolean 
}>()
const { success, error, warning, info } = useToast()
const ecranStore = useEcransStore()
const borderauStore = useBordereauStore()
// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const emit = defineEmits<{ 
  (e: 'row-click',  borderau: any): void
}>()
const showModalFicheBordereau = ref(false)
const showModal = ref(false)
const showModalConfirmation = ref(false)
const quittanceStore = useQuittanceStore()
const currentQuittance = quittanceStore.currentQuittance
const isCession = ecranStore.currentModule ===MODULE_CESSION
//const isEcranFacultative = ecranStore.currentEcran ===ECRAN_FACULTATIVE
console.warn(" __________ Bordereaux.vue _________")
console.log(" ----- ecranStore.currentModule:",ecranStore.currentModule)
console.log(" ----- ecranStore.currentEcran:",ecranStore.currentEcran)
console.log(" ----- isCession:",isCession)
const titreFenetre = ref('BORDEREAU')
titreFenetre.value =currentQuittance?  "BORDEREAUX QUITTANCE N°"+ currentQuittance.numero : "BORDEREAUX"
const quittanceId = currentQuittance? currentQuittance.id : 0
const params = {quittanceId}
console.log(" ----- params:",params)
console.warn(" __________________")
const useBordereau = useBordereaux(params)

// ✅ Destructurer les mutations dont tu as besoin
const { bordereaux, updateBordereau, deleteBordereau } = useBordereau

type BordereauRow = Bordereau & { [key: string]: any }
const bordereauToEdit = ref<Bordereau | null | undefined>(null)

// ==================== COLONNES ====================
const borderauColumns = computed(()=>{
    const allColumns: TableColumn[] = [
                    { key: 'isAnnule',       label: 'Actif',  width: 80,   minWidth: 80 , resizable:true},
                   
                    { key: 'numero',       label: 'N°Bordereau',  width: 200,   minWidth: 80 , resizable:true},
                    { key: 'reference',    label: 'N° Référence',        width: 200,   minWidth: 80,  align: 'center' },
                    { key: 'periodeDebut',    label: 'Période début',   width: 200,  minWidth: 200, align: 'center' },
                    { key: 'periodeFin', label: 'Période fin',width: 200,  minWidth: 200,  align: 'center' },
                    { key: 'devise',       label: 'Devise',       width: 80,   minWidth: 80,   align:'center'},
                    { key: 'coursDevise',  label: 'Cours Devise', width: 150,  minWidth: 80,  align:'right' },
                   
                    { key: 'primeBrute',    label: 'Prime Brute',    width: 200,  minWidth: 200,  align:'right' },
                    { key: 'tauxCedante',    label: 'Taux Cédante %',    width: 100,  minWidth: 100,  align:'right' },  
                    { key: 'tauxAccepte',    label: 'Taux Accepté %',    width: 100,  minWidth: 100,  align:'right' },
                    { key: 'tauxCommission',    label: 'Taux Cie %',    width: 100,  minWidth: 100,  align:'right' },
                   
                    { key: 'primeCedee',    label: 'Prime Cédée',    width: 200,  minWidth: 200,  align:'right' },
                    { key: 'primeAcceptee', label: 'Prime Acceptée',    width: 200,  minWidth: 200,  align:'right' },

                    { key: 'primeNette',    label: 'Prime Nette',    width: 200,  minWidth: 200,  align:'right' },

                    { key: 'taxeSurPrime',  label: 'Taxe sur Prime %', width: 200,  minWidth: 200,  align:'right' }, 
                  
                    { key: 'taxeSurCommission',    label: 'Taxe sur Cie %',    width: 200,  minWidth: 200,  align:'right' },
                  
                  ]
  console.warn("---- BORDEREAU allColumns:",allColumns )
 
  return allColumns

})
             
console.log("borderauColumns.value:",borderauColumns.value )
// ==================== DONNÉES TABLE ====================
// Accéder via store.bordereaux
const borderauRows = computed(() => bordereaux.items.value)
const tableLoading = computed(() => bordereaux.isLoading.value)
const loadingMore = computed(() => bordereaux.loadingMore.value)
const hasMore = computed(() => bordereaux.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => bordereaux.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)

//const selectedBordereaux = ref<(string | number)[]>([])
const selectedBordereaux = computed({
  get: () => borderauStore.selectedBordereaux,
  set: (value) => borderauStore.setSelectedBordereaux(value)
})
const isLigneSelectionnee = computed(() => selectedBordereaux.value? selectedBordereaux.value.length > 0 : false)
const titleModal = ref('')

// ==================== TRI ====================
function onSort(state: SortState): void {
  sortState.value = state
}

// ==================== INFINITE SCROLL ====================
async function handleLoadMore() { 
  if (loadingMore.value || !hasMore.value) return
  await bordereaux.loadMore()
}

// ==================== MODALES ====================
const onRowClick = ( row: any, index: number)=>{
    console.log(" --- Bordereaux.onRowClick  --- ")
    borderauStore.selectBordereau(row as Bordereau)       
    emit('row-click',row as Bordereau)
}
const onRowDoubleClick = ( row: any, index: number)=>{       
    //emit('row-click',row as Bordereau)
    showModalFicheBordereau.value=true
}
const closeModal = () => {
  showModal.value = false
  // ✅ Optionnel : effacer la sélection à la fermeture
  // borderauStore.clearSelection()
}

// ==================== HANDLERS CRUD ====================
const onFormSuccess = async (message: string) => {
  closeModal()
  success(message, 'Succès')
  // ✅ La borderau courante est déjà à jour via updateCurrentBordereau
  await bordereaux.refresh()
}
// ✅ APRÈS
const openEdit = (borderau: BordereauRow) => {
  console.log(' ___  Bordereaux.openEdit _____')
  // ✅ Sélectionner via le store
  borderauStore.selectBordereau(borderau as Bordereau)
  titleModal.value = 'Modifier borderau'
  showModal.value = true
}
const openCreate = () => {
  bordereauToEdit.value = null
  titleModal.value = 'Nouveau bordereau'
  showModal.value = true
}

const handleNouveau = () => openCreate()
const handleModifier = () => {
  if (selectedBordereaux.value.length === 0) {
    info('Veuillez sélectionner une borderau svp...', 'Info')
    return
  }
  console.log(" ---- Bordereaux.handleModifier ------")
  console.log(" selectedBordereaux.value:",selectedBordereaux.value)
  const borderauId = selectedBordereaux.value[0]
  const borderau = borderauRows.value.find((u: any) => u.id === borderauId)
  console.log(" borderauId:",borderauId)
  console.log(" borderau:",borderau)
 
  if (borderau) openEdit(borderau)
}

const handleSupprimer = () => {
  if (selectedBordereaux.value.length === 0) {
    warning('Veuillez sélectionner un bordereau', 'Attention')
    return
  }
  const bordereauId = selectedBordereaux.value[0]
  bordereauToEdit.value = borderauRows.value.find((u: any) => u.id === bordereauId) ?? null
  if (bordereauToEdit.value) showModalConfirmation.value = true
}

const handleConfirmeSuppression = async () => {
  const bordereau = bordereauToEdit.value
  if (!bordereau) return
  try {
    await deleteBordereau.mutateAsync(bordereau.id)
    showModalConfirmation.value = false
    success('Opération effectuée avec succès', 'Succès')
    selectedBordereaux.value = selectedBordereaux.value.filter((id) => id !== bordereau.id)
  } catch (err: any) {
    error(
      err?.response?.data?.message || err?.message || 'Erreur lors de la suppression.',
      'Erreur',
    )
  }
}
const handelActualise=()=>{
  bordereaux.refresh()
}
// Debounce recherche
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans useBordereau gère le reset + refetch automatiquement
  }, 300)
})
</script>

<template>
  <TTable
    v-model:selected-keys="selectedBordereaux"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="borderauColumns"
    :rows="borderauRows"
    :loading="tableLoading"
    :density="tableDensity"
    height="h-full"
    width="w-full"
    :title="titreFenetre"
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
    @row-double-click="onRowDoubleClick"
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
        <TAction 
          :active-nouveau="true"
          content-nouveau="Générer manuellement"
          :active-modifier="isLigneSelectionnee"
          :active-supprimer="isLigneSelectionnee"
          :active-impression="isLigneSelectionnee"
          :active-actualiser="totalItems>0"
          @supprimer="handleSupprimer"
          @modifier="handleModifier"
          @nouveau="handleNouveau"
          @actualiser="handelActualise"
        />

    </template>
    <template #cell-isAnnule="{ value }">
      <IconeValider v-if="!value"/><IconeNonValider v-else/>
    </template>  
    <template #cell-periodeDebut="{ value }">
      <span class="font-mono  uppercase" v-if="value">{{ value }}</span>
       <span class="font-mono  uppercase" v-else>TBA</span>
    </template>
    <template #cell-periodeFin="{ value }">
      <span class="font-mono  uppercase" v-if="value">{{ value }}</span>
       <span class="font-mono  uppercase" v-else>TBA</span>
    </template>
    <template #cell-devise="{ value }">
      <span class="font-mono  uppercase" >{{ value.code }}</span>
    </template>   
    <template #cell-coursDevise="{ value }">      
       <span class="font-mono  uppercase" >{{formatDecimal(value,)  }}</span>
    </template>
    <template #cell-primeBrute="{ value }">
        <TDisplayNumber :value="value" />
    </template>
     <template #cell-primeNette="{ value }">
        <TDisplayNumber :value="value" />
    </template>

   <template #cell-primeCedee="{ value }">
        <TDisplayNumber :value="value" />
    </template>
     <template #cell-primeAcceptee="{ value }">
        <TDisplayNumber :value="value" />
    </template>


      <template #cell-taxeSurPrime="{ value }">
        <TDisplayNumber :value="value" />
    </template>
         <template #cell-tauxCedante="{ value }">
        <TDisplayNumber :value="value" />
    </template>
         <template #cell-tauxAccepte="{ value }">
        <TDisplayNumber :value="value" />
    </template> 
  
    <template #cell-tauxCession="{ value }">
        <TDisplayNumber :value="value" />
    </template>
    <template #cell-tauxCommission="{ value }">
        <TDisplayNumber :value="value" />
    </template> 
         
    <template #cell-taxeSurCommission="{ value }">
        <TDisplayNumber :value="value" />
    </template> 
         <template #cell-taxeSurCommissionFixe="{ value }">
        <TDisplayNumber :value="value" />
    </template>
 




  </TTable>

  <TModal v-model="showModalFicheBordereau" width="50%" >
          <template #default>
                <TFicheBordereau />
          </template>
  </TModal>
  <TModal v-model="showModal" :title="titleModal"
    width="60%" >
    <TBordereauForm
      :loading="updateBordereau.isPending.value"
      @success="onFormSuccess"
      @cancel="closeModal"
    />
  </TModal>
  <TModal v-model="showModalConfirmation" title="Demande de confirmation">
    <TDemandeConfirmation
      @annuler="showModalConfirmation = false"
      @confirmer="handleConfirmeSuppression"
    >
      <template #message>
        <p class="text-xl text-neutral-800 dark:text-neutral-300 pb-4">
          Voulez-vous supprimer le bordereau N°
          <span class="font-extrabold">{{ bordereauToEdit?.numero }}</span>
        </p>
      </template>
    </TDemandeConfirmation>
  </TModal>


 
</template>