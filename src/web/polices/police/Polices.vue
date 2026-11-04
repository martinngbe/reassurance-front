<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'

import type { PaginationParams } from '@/type/pagination.ts'
import type { Police } from '@/services/polices/police/police'
import TButton from '@/composants/forms/TButton.vue'
import TModal from '@/composants/display/TModal.vue'
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store'
import {  ECRAN_TRAITE,  MODULE_CESSION,  useEcransStore } from '@/services/ecrans/ecrans.store'
import IconeValider from '@/composants/icone/IconeValider.vue'
import IconeNonValider from '@/composants/icone/IconeNonValider.vue'
import { usePoliceStore } from '@/services/polices/police/police.store'
import TFichePolice from './ TFichePolice.vue'
import AffaireNouvelle from '@/web/module/ecrans/affaire-nouvelle/AffaireNouvelle.vue'
import { usePolices } from '@/services/polices/police/usePolice.ts'
import { useToast } from '@/composants/toast/useToast.ts'
import { useAssureStore } from '@/services/acteurs/assure/assure.store.ts'
import TAction from '@/composants/utilitaire/TAction.vue'
import TPoliceForm from './TPoliceForm.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'


const ecransStore = useEcransStore()
const currentEcran = computed(()=> ecransStore.currentEcran)
const isEcranTraite = computed(()=> currentEcran.value=== ECRAN_TRAITE)
//const isEcranFacultative = computed(()=> currentEcran.value=== ECRAN_FACULTATIVE)
const isModuleCession = computed(()=> ecransStore.currentModule === MODULE_CESSION)
//const currenteModule = computed(()=> ecransStore.currenteModule)
// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const { success, error, warning, info } = useToast()
const assureStore = useAssureStore()
const currentAssure = computed(()=> assureStore.currentAssure)
const showModalConfirmation = ref(false)
const emit = defineEmits<{ 
  (e: 'row-click',  police: any): void
}>()
const closeModal = () => {
  showModal.value = false
  //policeToEdit.value = null
}

// ==================== HANDLERS CRUD ====================
const onFormSuccess = async (message: string) => {
  closeModal()
  success(message, 'Succès')
  showModalModification.value = false
  
  // ✅ Rafraîchir la liste des polices
  await polices.refresh()
  
  // ✅ La police courante est déjà mise à jour via updateCurrentPolice
  // Pas besoin de clearSelection si on veut garder la police sélectionnée
}
// ✅ Corrigé
const params = computed<PaginationParams>(() => ({
  page: 1,
  limit: PAGE_SIZE,
  search: tableSearch.value.trim() || undefined,
  sortKey: sortState.value.key ?? undefined,
  sortDirection: sortState.value.direction as 'ASC' | 'DESC' | undefined,
}))
const  assureId = currentAssure.value?currentAssure.value.id : 0
const {polices , refresh: refreshPolices, updatePolice , deletePolice } =
 usePolices(isEcranTraite.value? null: assureId,isModuleCession.value ,params)

type PoliceRow = Police & { [key: string]: any }
const tempPoliceStore = useTempPoliceStore()

const policeStore = usePoliceStore()
const isAffaireNouvelleExecutee = computed(()=> tempPoliceStore.isAffaireNouvelleExecutee )

// ==================== COLONNES ====================
const policeColumns: TableColumn[] = [
  { key: 'numero',                label: 'N°Police',    width: 200,   minWidth: 80 },
  { key: 'isCession',             label: 'Cess°',       width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isFac',                 label: 'FAC',         width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isProportionnelle',     label: 'Propor.',     width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isReconductionTacite',  label: 'Tacite Recond.',   width: 50,  minWidth: 200, align: 'center' },
  
  { key: 'isIard',                label: 'IARD',        width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isCouverte',            label: 'Couverte',    width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isAnnulee',             label: 'Annullée',    width: 50,   minWidth: 80,  align: 'center' },
  { key: 'isSinistree',           label: 'Sinistrée',   width: 50,   minWidth: 80,  align: 'center' },
  { key: 'natureOffre',           label: 'Nature Offre',width: 400,  minWidth: 200, },
 

 { key: 'acteurCedante',         label: 'Cedante',          width: 500,  minWidth: 500, },
  { key: 'acteurCourtier',        label: 'Courtier',         width: 500,  minWidth: 500, },
  { key: 'assure',                label: 'Assure',           width: 500,  minWidth: 500,  },
  { key: 'sousBranche',           label: 'Sous Branche',     width: 500,  minWidth: 500,  },
  
]


// ==================== DONNÉES TABLE ====================
// Accéder via policesStore.polices
const policeRows = computed(() => polices.items.value)
const tableLoading = computed(() => polices.isLoading.value)
const loadingMore = computed(() => polices.loadingMore.value)
const hasMore = computed(() => polices.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => polices.pageInfo.value?.total ?? 0)


const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
const isLigneSelectionnee = computed(() => selectedPolices.value.length > 0)
//const selectedPolices = ref<(string | number)[]>([])
// ✅ REMPLACER le ref local par un computed lié au policesStore
const selectedPolices = computed({
  get: () => policeStore.selectedPolices,
  set: (value) => policeStore.setSelectedPolices(value)
})
// ==================== TRI ====================
function onSort(state: SortState): void {
  sortState.value = state
}

// ==================== INFINITE SCROLL ====================
async function handleLoadMore() { 
  if (loadingMore.value || !hasMore.value) return
  await polices.loadMore()
}

// ==================== MODALES ====================
const showModal = ref(false)
const showModalModification = ref(false)

const showModalPolice = ref(false)
const titleModal = ref( currentAssure.value?
 `AFFAIRE NOUVELLE : ${currentAssure.value.raisonSociale.toUpperCase()}` :
 'AFFAIRE NOUVELLE')
const policeToEdit = computed(()=>policeStore.currentPolice ) //ref<Police | null | undefined>(null)
const onRowClick = ( row: any, index: number)=>{ 
   policeStore.setCurrentPolice(row as Police)      
   emit('row-click',row as Police)
}
const openAffaireNouvelle =()=>{  
  showModal.value=true
  tempPoliceStore.setTempPoliceIsAffaireNouvelleExecutee(false)
}
const openEdit = (police: PoliceRow) => {
  // ✅ Sélectionner via le store (plus besoin de policeToEdit)
  policeStore.selectPolice(police as Police)
  titleModal.value = 'Modifier police'
  showModalModification.value = true
}
const handleSupprimer = async () => {
  console.log("----- Polices.handleSupprimer ------")
  console.log("selectedPolices.value.length:",selectedPolices.value.length)
  if (selectedPolices.value.length === 0) {
    warning('Veuillez sélectionner un domaineActivite',"Attention")
    return
  }
  
  const policeId = selectedPolices.value[0]
  console.log("Polices.handleSupprimer policeId:",policeId)
  //policeToEdit.value = policeRows.value.find((u:any) => u.id === policeId)
  // console.log("policeToEdit.value:",policeToEdit.value)
  //if (!policeToEdit.value) return
  showModalConfirmation.value=true 
  
}
const closeModalModification = () => {
  showModalModification.value = false
  //policeToEdit.value = null
}
const handleModifier = () => {
  if (selectedPolices.value.length === 0) {
    info('Veuillez sélectionner une police', 'Info')
    return
  }
  const policeId = selectedPolices.value[0]
  const police = policeRows.value.find((u: any) => u.id === policeId)
  if (police) openEdit(police)
}
const handleConfirmeSuppression = async () => {
  const police = policeToEdit.value
  if (!police) return
  try {
    await deletePolice.mutateAsync(police.id)
    showModalConfirmation.value = false
    success('Opération effectuée avec succès', 'Succès')
    selectedPolices.value = selectedPolices.value.filter((id) => id !== police.id)
    polices.refresh()
  } catch (err: any) {
    error(
      err?.response?.data?.message || err?.message || 'Erreur lors de la suppression.',
      'Erreur',
    )
  }
}
const openFichePolice =()=>{  
  showModalPolice.value=true
}
const onActualisation =()=>{ 
  console.log(" -- Polices.onActualisation -- ") 
  polices.refresh() 
}
watch(
  isAffaireNouvelleExecutee,
  (newValue) => {
     console.warn("isAffaireNouvelleExecutee newValue:",newValue)
     if (newValue) {
      showModal.value=false
      polices.refresh()      
     } 
  },
  { immediate: true }
)

// Debounce recherche
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans usePolice gère le reset + refetch automatiquement
  }, 300)
})
</script>

<template>
  <TTable
    v-model:selected-keys="selectedPolices"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="policeColumns"
    :rows="policeRows"
    :loading="tableLoading"
    :density="tableDensity"
    height="h-full"
    width="w-full"
    title="Polices"
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
    @row-double-click="openFichePolice"
    @load-more="handleLoadMore"
  >
    <template #caption-extra>
      <div class="flex justify-between" v-if="isAfficheSearch" >
        <input  
          v-model="tableSearch"
          type="text"
          placeholder="Rechercher…"
          class="h-8 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>
    </template>

    <template #caption>
          <p v-if="currentAssure" 
          class="text-sm"
          >
            {{ currentAssure.raisonSociale }}
          </p>
          <TButton 
                v-if ="currentAssure || isEcranTraite" 
                type="button"
                variant="soft" 
                @click="openAffaireNouvelle"           
                > 
                        <span class="text-lg font-bold uppercase cursor-pointer">Affaire Nouvelle</span> 
            </TButton>
             <TAction
                  :active-modifier="isLigneSelectionnee"
                  :active-supprimer="isLigneSelectionnee" 
                  :active-actualiser="true"              
                  :masque-impression="true"
                  :masque-nouveau="true"
                  @modifier="handleModifier"
                  @supprimer="handleSupprimer"
                  @actualiser="onActualisation"
                
                />
    </template>
    <template #cell-natureOffre="{ value }">
      <span class="font-mono   uppercase" >{{ value.code }}</span>
    </template>
    <template #cell-assure="{ value }">
      <span class="font-mono  uppercase" v-if="value" >{{ value?.raisonSociale }}</span>
    </template>
    <template #cell-sousBranche="{ value }">
      <span class="font-mono  uppercase" >{{ value.libelle }}</span>
    </template>
    <template #cell-acteurCedante="{ value }">
      <span class="font-mono  uppercase"  v-if="value">{{ value.raisonSociale }}</span>
    </template>
    <template #cell-acteurCourtier="{ value }">
      <span class="font-mono  uppercase" v-if="value">{{ value.raisonSociale }}</span>
    </template>    

    <template #cell-isProportionnelle="{ value , row }" >
        <IconeValider  v-if="row && row.natureOffre && row.natureOffre.isProportionnelle" />
         <IconeNonValider  v-else="value" />
        
    </template>
    <template #cell-isReconductionTacite="{ value }">
        <IconeValider  v-if="value" /> <IconeNonValider  v-else="value" />
    </template>

    <template #cell-isCession="{ value }">
        <IconeValider  v-if="value" /> <IconeNonValider  v-else="value" />
    </template>
    <template #cell-isIard="{ value }">
        <IconeValider  v-if="value" /> <IconeNonValider  v-else="value" />
    </template>
    <template #cell-isCouverte="{ value }">
        <IconeValider  v-if="!value" /> <IconeNonValider  v-else="value" />
    </template>
    <template #cell-isAnnulee="{ value }">
        <IconeValider  v-if="value" /> <IconeNonValider  v-else="value" />
    </template>
    <template #cell-isSinistree="{ value }">
        <IconeValider  v-if="value" /> <IconeNonValider  v-else="value" />
    </template>
    <template #cell-isFac="{ value }">
        <IconeValider  v-if="value" /> <IconeNonValider  v-else="value" />
    </template>

  </TTable>

   <TModal v-model="showModal" 
      width="70%"  
      height="98%" 
      :title="titleModal" 
   >
      <template #header>
                <p>{{ titleModal }}</p>
      </template>
      <template #default>
                <AffaireNouvelle  />
      </template>
  </TModal>
 

   <TModal v-model="showModalPolice" width="50%" >
          <template #default>
                <TFichePolice/>
          </template>
  </TModal>

  <TModal v-model="showModalModification" :title="titleModal" width="40%">
        <template #header>
            <p v-if="policeToEdit && policeToEdit.assure">
               <span>Modification police N°:</span> 
               <span class="text-md font-extrabold pr-4">{{  policeToEdit.assure.numero }}</span>
               <span>{{ policeToEdit.assure.raisonSociale  }}</span>
            </p>
        </template>
        <template #default>
            <TPoliceForm
              :police="policeToEdit"
              :loading="updatePolice.isPending.value"
              @success="onFormSuccess"
              @cancel="closeModalModification"
            />
        </template>

  </TModal>
    <TModal v-model="showModalConfirmation" title="Demande de confirmation">
    <TDemandeConfirmation
      @annuler="showModalConfirmation = false"
      @confirmer="handleConfirmeSuppression"
    >
      <template #message>
        <p class="text-xl text-neutral-800 dark:text-neutral-300 pb-4">
          Voulez-vous supprimer la police
          <span class="font-extrabold">{{ policeToEdit?.numero }}</span>
        </p>
      </template>
    </TDemandeConfirmation>
  </TModal>

</template>