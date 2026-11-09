<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref,  watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

import { formatDecimal } from '@/utilitaire/number'
import TDisplayNumber from '@/composants/utilitaire/TDisplayNumber.vue'
import TModal from '@/composants/display/TModal.vue'
import { useToast } from '@/composants/toast/useToast.ts'
import {  ECRAN_FACULTATIVE, MODULE_CESSION, useEcransStore } from '@/services/ecrans/ecrans.store.ts'
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store'
import TAction from '@/composants/utilitaire/TAction.vue'
import TEcheancePmdForm from './TEcheancePmdForm.vue'
import IconeValider from '@/composants/icone/IconeValider.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'
import { useEcheancePmdStore } from '@/services/flux-financiers/echeance-pmd/echeance-pmd.store.ts'
import { useEcheancesPmd } from '@/services/flux-financiers/echeance-pmd/useEcheancesPmd.ts'
import type { EcheancePmd } from '@/services/flux-financiers/echeance-pmd/echeance-pmd.ts'
import TCumulIndicator from '@/composants/utilitaire/ TCumulIndicator.vue'
import TCumulBadge from '@/composants/utilitaire/TCumulBadge.vue'


//const titreFenetre = ref('échéances PMD')
const props = defineProps<{
  isAllEcheancePmd?: boolean 
}>()
const { success, error, warning, info } = useToast()
const ecranStore = useEcransStore()
const echeancePmdStore = useEcheancePmdStore()
// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const emit = defineEmits<{ 
  (e: 'row-click',  echeancePmd: any): void
}>()
const showModalFicheEcheancePmd = ref(false)
const showModal = ref(false)
const showModalConfirmation = ref(false)
const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=>quittanceStore.currentQuittance)
const titreFenetre = ref('ECHéANCE PMD')
titreFenetre.value =currentQuittance.value?  "ECHéANCES PMD QUITTANCE N°"+ currentQuittance.value.numero : "ECHéANCE PMD"

const isCession = ecranStore.currentModule ===MODULE_CESSION
const isEcranFacultative = ecranStore.currentEcran ===ECRAN_FACULTATIVE
console.warn(" __________ EcheancesPmd.vue _________")
console.log(" ----- ecranStore.currentModule:",ecranStore.currentModule)
console.log(" ----- ecranStore.currentEcran:",ecranStore.currentEcran)
console.log(" ----- isCession:",isCession)

//titreFenetre.value = isEcranEcheancePmd? "QUITTANCES FAC" : "QUITTANCES"
const quittanceId = quittanceStore.currentQuittance? quittanceStore.currentQuittance.id : 0
const params = {quittanceId}
console.log(" ----- params:",params)
console.warn(" __________________")
// ✅ Destructurer les mutations dont tu as besoin
const { echeancesPmd, updateEcheancePmd, deleteEcheancePmd } = useEcheancesPmd(params)

type EcheancePmdRow = EcheancePmd & { [key: string]: any }
const echeancePmdToEdit = ref<EcheancePmd | null | undefined>(null)

// //////////////////////////////////////////////////////////////
// ✅ INDICATEURS DE CUMUL
// //////////////////////////////////////////////////////////////
const maxEcheances = computed(() => (currentQuittance.value as any)?.nombreEcheancePmd ?? 0)
const maxPrime = computed(() => Number((currentQuittance.value as any)?.estimationPrime ?? 0))

const currentEcheancesCount = computed(() => echeancePmdRows.value.length)
const currentPrimeSum = computed(() => {
  return echeancePmdRows.value.reduce((sum, e) => sum + Number(e.prime || 0), 0)
})

// ==================== COLONNES ====================
const echeancePmdColumns = computed(()=>{
    const allColumns: TableColumn[] = [
                    { key: 'isAnnule',       label: 'Actif',  width: '5%',   minWidth: 80},
                   
                    { key: 'numeroTranche', label: 'N°Tranche',       width: '5%',   minWidth: 80 ,  align: 'center'},
                    { key: 'periode',       label: 'Période',         width: '20%',   minWidth: 80,  align: 'center' },
                   
                    { key: 'dateEcheance',  label: 'Date Echéance',   width: '20%',  minWidth: 100,  align:'center' },
                    { key: 'prime',         label: 'Prime',           width: '10%',  minWidth: 100,  align:'right' },  
                    { key: 'coursDevise',   label: 'Cours Devise',    width: '10%',  minWidth: 80,  align:'right' },
                    { key: 'devise',        label: 'Devise',          width: '30%',   minWidth: 80,   align:'center'},
                   
                  ]
  console.warn("---- ECHEANCES PMD allColumns:",allColumns )
 
  return allColumns

})
             
console.log("echeancePmdColumns.value:",echeancePmdColumns.value )
// ==================== DONNÉES TABLE ====================
// Accéder via store.echeancesPmd
const echeancePmdRows = computed(() => echeancesPmd.items.value)
const tableLoading = computed(() => echeancesPmd.isLoading.value)
const loadingMore = computed(() => echeancesPmd.loadingMore.value)
const hasMore = computed(() => echeancesPmd.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => echeancesPmd.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
const isLigneSelectionnee = computed(() => selectedEcheancesPmd.value?
 selectedEcheancesPmd.value.length > 0 : false)
//const selectedEcheancesPmd = ref<(string | number)[]>([])
const selectedEcheancesPmd = computed({
  get: () => echeancePmdStore.selectedEcheancesPmd,
  set: (value) => echeancePmdStore.setSelectedEcheancesPmd(value)
})

const titleModal = ref('')

// ==================== TRI ====================
function onSort(state: SortState): void {
  sortState.value = state
}

// ==================== INFINITE SCROLL ====================
async function handleLoadMore() { 
  if (loadingMore.value || !hasMore.value) return
  await echeancesPmd.loadMore()
}

// ==================== MODALES ====================
const onRowClick = ( row: any, index: number)=>{
    console.log(" --- EcheancesPmd.onRowClick  --- ")
    echeancePmdStore.selectEcheancePmd(row as EcheancePmd)       
    emit('row-click',row as EcheancePmd)
}
const onRowDoubleClick = ( row: any, index: number)=>{       
    //emit('row-click',row as EcheancePmd)
    showModalFicheEcheancePmd.value=true
}
const closeModal = () => {
  showModal.value = false
  // ✅ Optionnel : effacer la sélection à la fermeture
  // echeancePmdStore.clearSelection()
}

// ==================== HANDLERS CRUD ====================
const onFormSuccess = async (message: string) => {
  closeModal()
  success(message, 'Succès')
  // ✅ La echeancePmd courante est déjà à jour via updateCurrentEcheancePmd
  await echeancesPmd.refresh()
}

const openEdit = (echeancePmd: EcheancePmdRow) => {
  console.log(' ___  EcheancesPmd.openEdit _____')
  // ✅ Sélectionner via le store
  echeancePmdStore.selectEcheancePmd(echeancePmd as EcheancePmd)
  // ✅ Mettre à jour la prop pour le formulaire
  echeancePmdToEdit.value = echeancePmd as EcheancePmd
  titleModal.value = 'Modifier Echéance PMD'
  showModal.value = true
}

const openCreate = () => {
  // ✅ Réinitialiser la sélection
  echeancePmdToEdit.value = null
  echeancePmdStore.clearSelection()
  titleModal.value = 'Nouvelle Échéance PMD'
  showModal.value = true
  console.log(' ----- openCreate :', echeancePmdToEdit.value)
}

const handleNouveau = () => openCreate()
const handleModifier = () => {
  if (selectedEcheancesPmd.value.length === 0) {
    info('Veuillez sélectionner une echeancePmd svp...', 'Info')
    return
  }
  console.log(" ---- EcheancesPmd.handleModifier ------")
  console.log(" selectedEcheancesPmd.value:",selectedEcheancesPmd.value)
  const echeancePmdId = selectedEcheancesPmd.value[0]
  const echeancePmd = echeancePmdRows.value.find((u: any) => u.id === echeancePmdId)
  console.log(" echeancePmdId:",echeancePmdId)
  console.log(" echeancePmd:",echeancePmd)
 
  if (echeancePmd) openEdit(echeancePmd)
}

const handleSupprimer = () => {
  if (selectedEcheancesPmd.value.length === 0) {
    warning('Veuillez sélectionner un echeancePmd', 'Attention')
    return
  }
  const echeancePmdId = selectedEcheancesPmd.value[0]
  echeancePmdToEdit.value = echeancePmdRows.value.find((u: any) => u.id === echeancePmdId) ?? null
  if (echeancePmdToEdit.value) showModalConfirmation.value = true
}

const handleConfirmeSuppression = async () => {
  const echeancePmd = echeancePmdToEdit.value
  if (!echeancePmd) return
  try {
    await deleteEcheancePmd.mutateAsync(echeancePmd.id)
    showModalConfirmation.value = false
    success('Opération effectuée avec succès', 'Succès')
    selectedEcheancesPmd.value = selectedEcheancesPmd.value.filter((id) => id !== echeancePmd.id)
  } catch (err: any) {
    error(
      err?.response?.data?.message || err?.message || 'Erreur lors de la suppression.',
      'Erreur',
    )
  }
}
const handelActualise=()=>{
  echeancesPmd.refresh()
}
// Debounce recherche
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans useEcheancePmd gère le reset + refetch automatiquement
  }, 300)
})
</script>

<template>

   


  <TTable
    v-model:selected-keys="selectedEcheancesPmd"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="echeancePmdColumns"
    :rows="echeancePmdRows"
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
      <!-- ✅ Ligne du caption : TAction + Badges -->
      <div class="flex items-center justify-between gap-3">
        <!-- Actions (gauche) -->
        <TAction
          :active-nouveau="true"
          content-nouveau="Générer manuellement"
          :active-modifier="isLigneSelectionnee"
          :active-supprimer="isLigneSelectionnee"
          :active-impression="isLigneSelectionnee"
          :active-actualiser="totalItems > 0"
          @supprimer="handleSupprimer"
          @modifier="handleModifier"
          @nouveau="handleNouveau"
          @actualiser="handelActualise"
        />

        <!-- ✅ Badges de cumul (droite) -->
        <div class="flex items-center gap-2">
          <TCumulBadge
            label="Échéances"
            :current="currentEcheancesCount"
            :max="maxEcheances"
            :precision="0"
          />
          <TCumulBadge
            label="Primes"
            :current="currentPrimeSum"
            :max="maxPrime"
            :precision="2"
          />
        </div>
      </div>
    </template>

   
    <template #cell-isAnnule="{ value }">
      <IconeValider v-if="!value"/><IconeNonValider v-else/>
    </template>  
    <template #cell-numeroTranche="{ value }">
      <span class="font-mono  uppercase" >{{ value }}</span>
    </template>
    <template #cell-periode="{ value }">
      <span class="font-mono  uppercase" >{{ value }}</span>
    </template>
    <template #cell-devise="{ value }">
      <span class="font-mono  uppercase" >{{ value.code }}</span>
    </template>   
    <template #cell-coursDevise="{ value }">      
       <TDisplayNumber :value="value" />
    </template>
    <template #cell-dateEcheance="{ value }">
        {{ value }}
    </template>
    <template #cell-prime="{ value }">
        <TDisplayNumber :value="value" />
    </template>
     
    
  




  </TTable>

  <TModal v-model="showModalFicheEcheancePmd" width="50%" >
          <template #default>
                <!--TFicheEcheancePm /-->
          </template>
  </TModal>
  <TModal v-model="showModal" :title="titleModal" >
    <TEcheancePmdForm
      :loading="updateEcheancePmd.isPending.value"
      :echeance-pmd-to-edit="echeancePmdToEdit"
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
          Voulez-vous supprimer le echeancePmd N°
          <span class="font-extrabold">{{ echeancePmdToEdit?.periode }}</span>
        </p>
      </template>
    </TDemandeConfirmation>
  </TModal>


 
</template>