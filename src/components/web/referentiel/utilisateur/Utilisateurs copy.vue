<script setup lang="ts">

// import TTable from '@/components/display/TTable.vue'
// import type { SortState, TableColumn, TableRow } from '@/components/forms/common'
// import { computed, ref, watch } from 'vue'
// import { PAGE_SIZE } from '@/utilitaire/utilitaire'
// import { useUtilisateurs } from '@/referentiel/utilisateur/useUtilisateur'
// import TBadge from '@/components/display/TBadge.vue'
// import TAction from '@/components/utilitaire/TAction.vue'
// import TModal from '@/components/display/TModal.vue'
// import type { FieldConfig } from '@/components/forms/generic-form/types-form'

// // ==================== PAGINATION ====================
// const page = ref(1)
// const pageSize = ref(PAGE_SIZE)

// // ==================== TTABLE ENRICHI ====================
// const tableDensity = ref<'sm' | 'md' | 'lg'>('md')
// const tableSearch = ref('')
// const selectedUtilisateurs = ref<(string | number)[]>([])
// const sortState = ref<SortState>({ key: null, direction: null })

// // ==================== API ====================
// const params = computed(() => ({
//   page: page.value,
//   limit: pageSize.value,
//   search: tableSearch.value.trim() || undefined,
//   sortKey: sortState.value.key ?? undefined,
//   sortDirection: sortState.value.direction ?? undefined,
// }))

// const { utilisateurs } = useUtilisateurs(params)

// // ==================== DONNÉES TABLE ====================
// const utilisateurColumns: TableColumn[] = [
//   { key: 'nom',       label: 'Nom',   width: '15%', minWidth: 150, sortable: true },
//   { key: 'prenoms',   label: 'Prénoms', width: '25%', minWidth: 150, sortable: true },
//   { key: 'email',     label: 'Email', width: '15%', minWidth: 150, sortable: true },
//   { key: 'isActive',  label: 'Actif', width: '5%', minWidth: 15, sortable: true },
  
// ]
// /* ---------- Schéma du formulaire ---------- */
// const utilisateurFields: FieldConfig[] = [
//   { key: 'nom',     label: 'Nom',    type: 'text', required: true , placeholder: 'nom'},
//   { key: 'prenoms', label: 'Prénom', type: 'text', required: true, placeholder: 'prénoms' },
//   { key: 'email',   label: 'Email',  type: 'email', required: true,
//     helpText: 'Utilisé pour la connexion' },
//   // {
//   //   key: 'role', label: 'Rôle', type: 'select', required: true,
//   //   options: [
//   //     { label: 'Admin',   value: 'admin'  },
//   //     { label: 'Éditeur', value: 'editor' },
//   //     { label: 'Lecteur', value: 'viewer' },
//   //   ],
//   // },
//   { key: 'isActive', label: 'Actif', type: 'checkbox', placeholder: 'Compte activé' },
// ];

// /* ---------- État ---------- */
// interface User {
//   id: number;
//   [key: string]: any;
// }
// const formMode = computed(() => isEditing.value ? 'edit' : 'create');

// /* ---------- CRUD ---------- */
// const emptyForm = () =>
//   Object.fromEntries(utilisateurFields.map(f => [f.key, f.type === 'checkbox' ? false : '']));
// const showForm   = ref(false);
// const isEditing  = ref(false);
// const editingId  = ref<number | null>(null);
// const formData   = ref<Record<string, any>>({});
// const loading    = ref(false);
// const openCreate = () => {
//   isEditing.value = false;
//   editingId.value = null;
//   formData.value  = emptyForm();
//   showForm.value  = true;
// };

// const openEdit = (user: User) => {
//   isEditing.value = true;
//   editingId.value = user.id;
//   formData.value  = { ...user };
//   showForm.value  = true;
// };




// const totalItems = ref(0)
// const totalPages = ref(0)

// const utilisateurRows = computed(() => {
//   const resultat  = utilisateurs.data.value
//   if(!resultat) return []
//   if(!resultat.success) return []
//   const pageInfo  = resultat.pageInfo
//   console.log( "resultat:",resultat)
//   console.log( "resultat.success:",resultat.success)
//   console.log( "pageInfo",pageInfo)
//   if(pageInfo){
//      totalItems.value = pageInfo.total
//      totalPages.value = pageInfo.totalPages
//       console.log(new Date(), "totalPageso:",totalPages.value)
//       console.log(new Date(), "totalItems:",totalItems.value)
//   }
//   return resultat.data;
// })


// // État de chargement exposé au TTable
// const tableLoading = computed(() => utilisateurs.isLoading.value || utilisateurs.isFetching.value)
// // ==================== HANDLERS ====================
// function onSort(state: SortState): void {
//   sortState.value = state
//   page.value = 1 // reset page au tri
// }

// // Reset page quand la recherche change (avec debounce idéalement)
// let searchTimeout: number | undefined
// watch(tableSearch, () => {
//   window.clearTimeout(searchTimeout)
//   searchTimeout = window.setTimeout(() => {
//     page.value = 1
//   }, 300)
// })
// const showModal = ref(false)
// const titleModal = ref("")
// const isSelectionLigne =ref(false)
// const selection = ( row:any, index:number)=>{
//     console.log("selection de ligne:",row , " index:",index)
//     isSelectionLigne.value = row !== null && row !== undefined
// }
// // const handleNouveau = ()=>{
// //   console.log(" --- handleNouveau")
// //   showModal.value=true
// //   titleModal.value="Nouveau"
// // }
// // const handleModifier = ()=>{
// //   console.log(" --- handleModifier")
// //   showModal.value=true
// //   titleModal.value="Modifier"
// // }
// // const handleSupprimer = ()=>{
// //   console.log(" --- handleSupprimer")
// //   showModal.value=true
// //   titleModal.value="Supprimer"
// // }
// // const handleImprimer = ()=>{
// //   console.log(" --- handleImprimer")
// //   showModal.value=true
// //   titleModal.value="Imprimer"
// // }
// const handleSave = async (data: Record<string, any>) => {
//   loading.value = true;
//   await new Promise(r => setTimeout(r, 800));

//   if (isEditing.value && editingId.value) {
//     const idx = utilisateurs.value.findIndex(u => u.id === editingId.value);
//     if (idx !== -1) utilisateurs.value[idx] = { ...data, id: editingId.value };
//   } else {
//     const newId = Math.max(0, ...utilisateurs.value.map(u => u.id)) + 1;
//     utilisateurs.value.push({ ...data, id: newId });
//   }

//   loading.value = false;
//   showForm.value = false;
// };
// const handleDelete = async (user: User) => {
//   if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) return;
//   loading.value = true;
//   await new Promise(r => setTimeout(r, 500));
//   utilisateurs.value = utilisateurs.value.filter(u => u.id !== user.id);
//   loading.value = false;
// };

</script>
<!-- <template>
  <TTable
    v-model:selected-keys="selectedUtilisateurs"
    :columns="utilisateurColumns"
    :rows="utilisateurRows"
    :loading="tableLoading"
    :density="tableDensity"
    empty-message="Aucun profile"
    height="h-full"
    width="w-full"
    title="Utilisateurs"
    row-key="id"
    striped
    @sort="onSort"
    @row-click="selection"
  >
    <template #caption-extra>
      <div class="flex justify-between" v-if="totalItems>PAGE_SIZE">
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
        <TAction
        :modifier-visible="isSelectionLigne" 
        :supprimer-visible="isSelectionLigne"
        :impression-visible="totalItems>0"
        @nouveau="handleNouveau"
        @modifier="handleModifier"
        @supprimer="handleSupprimer"
        @imprimer="handleImprimer"
        />
      </div>
    </template>

    <template #cell-nom="{ value }">
      <span class="font-mono  text-xl uppercase">{{ value }}</span>
    </template>
    <template #cell-prenoms="{ value }">
      <span class="font-mono text-xl uppercase">{{ value }}</span>
    </template>
    <template #cell-email="{ value }">
      <span class="font-mono text-xl lowercase">{{ value }}</span>
    </template>  
    <template #cell-isActive="{ value }">
      <TBadge v-if="value" color="success" dot>
                        actif
      </TBadge>
      <TBadge v-else color="neutral" dot>
                        inactif
      </TBadge>
    </template> 
    
    <template #empty>
      <p class="py-4 text-center text-sm text-neutral-500">
        Aucun profile trouvé
      </p>
    </template>

    
  </TTable>

  <TModal v-model="showModal" :title="titleModal">
           <GenericCrudForm
                v-model="formData"
                :fields="utilisateurFields"
                :mode="formMode"
                :show-delete="isEditing"
                :loading="loading"
                :submit-label="isEditing ? 'Mettre à jour' : 'Créer'"
                @submit="handleSave"
                @delete="handleDelete(formData)"
                @cancel="showForm = false"
              />
  </TModal>
</template> -->
