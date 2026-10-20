<script setup lang="ts">
import TTable from '@/composants/display/TTable.vue'
import type { SortState, TableColumn } from '@/composants/forms/common'
import { computed, ref, watch } from 'vue'
import { PAGE_SIZE } from '@/utilitaire/utilitaire'
import TAction from '@/composants/utilitaire/TAction.vue'
import TModal from '@/composants/display/TModal.vue'
import TDemandeConfirmation from '@/composants/utilitaire/TDemandeConfirmation.vue'

import type { PaginationParams } from '@/type/pagination.ts'
import { useContacts } from '@/services/acteurs/contact/useContact'
import { useToast } from '@/composants/toast/useToast'
import type { Contact } from '@/services/acteurs/contact/contact'
import TContactForm from './TContactForm.vue'
import type { Acteur } from '@/services/acteurs/acteur/acteur.ts'

// ==================== ÉTAT LOCAL ====================
const tableDensity = ref<'sm' | 'md' | 'lg'>('lg')
const tableSearch = ref('')
const sortState = ref<SortState>({ key: null, direction: null })
const props = withDefaults(
  defineProps<{
    acteur?: Acteur | null // filtrer par branche    
  }>(),
  { acteur: null },
)


// ✅ Corrigé
const params = computed<PaginationParams>(() => ({
  page: 1,
  limit: PAGE_SIZE,
  search: tableSearch.value.trim() || undefined,
  sortKey: sortState.value.key ?? undefined,
  sortDirection: sortState.value.direction as 'ASC' | 'DESC' | undefined,
  acteurId : props.acteur?  props.acteur.id : null
}))
// ==================== API + CRUD ====================
// Ne pas destructurer contacts
const store = useContacts(params)
const { contacts, createContact, updateContact, deleteContact } = store
//const { contacts, createContact, updateContact, deleteContact } = useContacts(params)
const { success, error, warning, info } = useToast()

console.warn(" -- Contacts.vue contacts:",contacts)

type ContactRow = Contact & { [key: string]: any }

// ==================== COLONNES ====================
const contactColumns: TableColumn[] = [
  { key: 'acteur',          label: 'Acteur',            width: 80, minWidth: 80 , sortable: true}, 
  { key: 'nom',             label: 'Nom',          width: 250, minWidth: 150 , sortable: true},
  { key: 'prenoms',         label: 'Prénoms',           width: 200, minWidth: 150 , sortable: true},
  { key: 'email',           label: 'EMail',  width: 450, minWidth: 150 , sortable: true},
  { key: 'telephone', label: 'N°Téléphone',width: 350, minWidth: 150 , sortable: true},

]


// ==================== DONNÉES TABLE ====================
// Accéder via store.contacts
const contactRows = computed(() => store.contacts.items.value)
const tableLoading = computed(() => store.contacts.isLoading.value)
const loadingMore = computed(() => store.contacts.loadingMore.value)
const hasMore = computed(() => store.contacts.hasMore.value)
// ✅ Correction ici : on utilise .value?.total
const totalItems = computed(() => contacts.pageInfo.value?.total ?? 0)

const titreTableau = computed(()=> props.acteur? `Contats : ${props.acteur.raisonSociale}` : `Contacts`  )

const isAfficheSearch = computed(() => tableSearch.value==""? totalItems.value > PAGE_SIZE : true)
const isLigneSelectionnee = computed(() => selectedContacts.value.length > 0)
const selectedContacts = ref<(string | number)[]>([])

// ==================== TRI ====================
function onSort(state: SortState): void {
  sortState.value = state
}

// ==================== INFINITE SCROLL ====================
async function handleLoadMore() {
  console.warn(" -- Contact.handleLoadMore -- ")
  console.log(" loadingMore.value:",loadingMore.value)
  console.log(" hasMore.value:",hasMore.value)
  if (loadingMore.value || !hasMore.value) return
  await contacts.loadMore()
}

// ==================== MODALES ====================
const showModal = ref(false)
const showModalConfirmation = ref(false)
const titleModal = ref('')
const contactToEdit = ref<Contact | null>(null)

const openCreate = () => {
  contactToEdit.value = null
  titleModal.value = 'Nouveau Contact'
  showModal.value = true

    if(!props.acteur) return
    contactToEdit.value = {
      acteurId : props.acteur.id,
      nom: "",
      prenoms: ""
    } as Contact
    titleModal.value = 'Nouvau Contact'
    showModal.value = true
}

const openEdit = (contact: ContactRow) => {
  contactToEdit.value = contact
  titleModal.value = 'Modifier Contact'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  contactToEdit.value = null
}

// ==================== HANDLERS CRUD ====================
const onFormSuccess = (message: string) => {
  closeModal()
  success(message, 'Succès')
  contacts.refresh()
}

const handleNouveau = () => openCreate()

const handleModifier = () => {
  if (selectedContacts.value.length === 0) {
    info('Veuillez sélectionner une contact', 'Info')
    return
  }
  const contactId = selectedContacts.value[0]
  const contact = contactRows.value.find((u: any) => u.id === contactId)
  if (contact) openEdit(contact)
}

const handleSupprimer = () => {
  if (selectedContacts.value.length === 0) {
    warning('Veuillez sélectionner un contact', 'Attention')
    return
  }
  const contactId = selectedContacts.value[0]
  contactToEdit.value = contactRows.value.find((u: any) => u.id === contactId) ?? null
  if (contactToEdit.value) showModalConfirmation.value = true
}

const handleConfirmeSuppression = async () => {
  const contact = contactToEdit.value
  if (!contact) return
  try {
    await deleteContact.mutateAsync(contact.id)
    showModalConfirmation.value = false
    success('Opération effectuée avec succès', 'Succès')
    selectedContacts.value = selectedContacts.value.filter((id) => id !== contact.id)
  } catch (err: any) {
    error(
      err?.response?.data?.message || err?.message || 'Erreur lors de la suppression.',
      'Erreur',
    )
  }
}

// Debounce recherche
let searchTimeout: number | undefined
watch(tableSearch, () => {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    // Le watchKeys dans useContact gère le reset + refetch automatiquement
  }, 300)
})
</script>

<template>
  <TTable
    v-model:selected-keys="selectedContacts"
    :show-index="true"
    index-label="N°"
    :index-width="60"
    :columns="contactColumns"
    :rows="contactRows"
    :loading="tableLoading"
    :density="tableDensity"
    height="h-full"
    width="w-full"
    :title="titreTableau"
    row-key="id"
    striped
    !selectable
    @sort="onSort"
    :infinite-scroll="true"
    :has-more="hasMore"
    :loading-more="loadingMore"
    :scroll-threshold="200"
    end-message="— Fin des données —"
    :show-end-message="true"
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
        :active-modifier="isLigneSelectionnee"
        :active-supprimer="isLigneSelectionnee"
        :masque-impression="true"
        @nouveau="handleNouveau"
        @modifier="handleModifier"
        @supprimer="handleSupprimer"
      />
    </template>

    
     <template #cell-acteur="{ value }">
      <span class="font-mono text-xl uppercase" v-if="value" >{{ value.code }}</span>
    </template>
    <template #cell-nom="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
    <template #cell-prenoms="{ value }">
      <span class="font-mono text-xl uppercase" >{{ value }}</span>
    </template>
    <template #cell-email="{ value }">
      <span class="font-mono text-md lowercase" >{{ value }}</span>
    </template>
    <template #cell-telephone="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
   

  </TTable>

  <TModal v-model="showModal" :title="titleModal">
    <TContactForm
      :contact="contactToEdit"
      :loading="createContact.isPending.value || updateContact.isPending.value"
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
          Voulez-vous supprimer la contact
          <span class="font-extrabold">{{ contactToEdit?.nom + " " + contactToEdit?.prenoms}}</span>
        </p>
      </template>
    </TDemandeConfirmation>
  </TModal>
</template>