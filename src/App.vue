<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useTheme } from './theme/useTheme'
import type {
  CheckboxModel,
  Option,
  OptionValue,
  TableColumn,
  TableRow,
  SortState,
  ZoneConfig,
} from './components/forms/common'

// ==================== THÈME ====================
import ThemePicker from './components/theme/ThemePicker.vue'
import ThemeModeToggle from './components/theme/ThemeModeToggle.vue'
import ToggleTheme from './components/theme/ToggleTheme.vue'

// ==================== LAYOUT ====================
import TLayout from './components/layout/TLayout.vue'

// ==================== FORMULAIRE (Phase A) ====================
import TButton from './components/forms/TButton.vue'
import TInput from './components/forms/TInput.vue'
import TTextarea from './components/forms/TTextarea.vue'
import TSelect from './components/forms/TSelect.vue'
import TCheckbox from './components/forms/TCheckbox.vue'
import TRadioGroup from './components/forms/TRadioGroup.vue'
import TSwitch from './components/forms/TSwitch.vue'
import TFileInput from './components/forms/TFileInput.vue'

// ==================== AFFICHAGE (Phase B + C) ====================
import TBadge from './components/display/TBadge.vue'
import TCard from './components/display/TCard.vue'
import TAlert from './components/display/TAlert.vue'
import TTable from './components/display/TTable.vue'
import TModal from './components/display/TModal.vue'
import TToolTip from './components/display/TToolTip.vue'

const { theme } = useTheme()

// ==================== LAYOUT ZONES ====================
const headerVisible = ref(true)
const leftVisible = ref(true)
const rightVisible = ref(true)
const footerVisible = ref(true)

const headerZone: ZoneConfig = { size: '60px', minSize: '48px' }
const leftZone: ZoneConfig = { size: '20%', minSize: '180px' }
const rightZone: ZoneConfig = { size: '250px', fixed: true }
const footerZone: ZoneConfig = { size: '40px', minSize: '36px' }

// ==================== FORMULAIRE ====================
interface SignupForm {
  nom: string
  email: string
  password: string
  pays: string | number | null
  message: string
  civilite: OptionValue | null
  centreInterets: OptionValue[]
  newsletter: boolean
  cv: File | File[] | null
}

const form = reactive<SignupForm>({
  nom: '',
  email: '',
  password: '',
  pays: null,
  message: '',
  civilite: 'mme',
  centreInterets: [],
  newsletter: true,
  cv: null,
})

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

// ==================== OPTIONS ====================
const pays: Array<Option<string>> = [
  { value: 'fr', label: 'France' },
  { value: 'be', label: 'Belgique' },
  { value: 'ch', label: 'Suisse' },
  { value: 'ca', label: 'Canada' },
  { value: 'ma', label: 'Maroc' },
  { value: 'sn', label: 'Sénégal' },
]
const civilites: Array<Option<string>> = [
  { value: 'mme', label: 'Madame' },
  { value: 'm', label: 'Monsieur' },
  { value: 'np', label: 'Ne se prononce pas' },
]
const interets: Array<Option<string>> = [
  { value: 'dev', label: 'Développement' },
  { value: 'design', label: 'Design' },
  { value: 'data', label: 'Data / IA' },
  { value: 'devops', label: 'DevOps' },
]

// ==================== DONNÉES TABLE ====================
const userColumns: TableColumn[] = [
  { key: 'id', label: 'ID', width: 60, sortable: true },
  { key: 'nom', label: 'Nom', sortable: true, resizable: true, minWidth: 150 },
  { key: 'email', label: 'Email', sortable: true, resizable: true },
  { key: 'role', label: 'Rôle', width: 140, sortable: true },
  { key: 'statut', label: 'Statut', width: 110, align: 'center', sortable: true },
  { key: 'actions', label: '', align: 'right', width: 100 },
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

const emailError = computed<string>(() =>
  form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Adresse e-mail invalide.' : '',
)
const nomError = computed<string>(() =>
  submitted.value && !form.nom.trim() ? 'Le nom est requis.' : '',
)

// ==================== MENU LATÉRAL ====================
const menuItems = [
  { key: 'dashboard', label: 'Tableau de bord', icon: '📊' },
  { key: 'users', label: 'Utilisateurs', icon: '👥' },
  { key: 'forms', label: 'Formulaires', icon: '📝' },
  { key: 'display', label: 'Affichage', icon: '🎨' },
  { key: 'tooltips', label: 'Tooltips', icon: '💬' },
  { key: 'settings', label: 'Paramètres', icon: '⚙️' },
]
const activeMenu = ref('forms')

// ==================== PUBLICITÉ ====================
const ads = [
  { title: 'Nouveau !', text: 'Découvrez nos composants Premium', color: 'primary' },
  { title: 'Promo -30%', text: 'Sur la formation Vue 3 avancée', color: 'success' },
  { title: 'Newsletter', text: 'Recevez les dernières news', color: 'info' },
]

// ==================== FONCTIONS ====================
function onInteretsChange(value: CheckboxModel): void {
  if (Array.isArray(value)) form.centreInterets = value
}
function openUser(row: TableRow): void {
  selectedUser.value = row
  modalOpen.value = true
}
function onSubmit(): void {
  submitted.value = true
}
function reset(): void {
  Object.assign(form, {
    nom: '',
    email: '',
    password: '',
    pays: null,
    message: '',
    civilite: 'mme',
    centreInterets: [],
    newsletter: true,
    cv: null,
  })
  submitted.value = false
}
function simulate(): void {
  loadingDemo.value = true
  window.setTimeout(() => {
    loadingDemo.value = false
  }, 1500)
}
function simulateTableLoad(): void {
  tableLoading.value = true
  window.setTimeout(() => {
    tableLoading.value = false
  }, 1200)
}
function onSort(state: SortState): void {
  sortState.value = state
}
</script>

<template>
  <!-- ✨ LAYOUT PRINCIPAL avec 4 zones -->
  <TLayout
    :header="headerZone"
    :left="leftZone"
    :right="rightZone"
    :footer="footerZone"
    v-model:header-visible="headerVisible"
    v-model:left-visible="leftVisible"
    v-model:right-visible="rightVisible"
    v-model:footer-visible="footerVisible"
  >
    <!-- ============ HEADER ============ -->
    <template #header>
      <div class="flex h-full w-full items-center justify-between px-4">
        <div class="flex items-center gap-3">
          <TToolTip content="Design System UI-Kit" position="bottom" theme="primary">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white shadow-sm"
            >
              <span class="text-sm font-bold">UI</span>
            </div>
          </TToolTip>
          <div>
            <h1 class="text-base font-bold text-neutral-800 dark:text-neutral-100">
              Design System — ui-kit
            </h1>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Vue 3 · TypeScript · Tailwind CSS · thème dynamique
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <TToolTip content="Choisir la couleur primaire" position="bottom">
            <ThemePicker />
          </TToolTip>
          <TToolTip content="Changer le thème" position="bottom">
            <ToggleTheme />
          </TToolTip>
          <ThemeModeToggle />
        </div>
      </div>
    </template>

    <!-- ============ LEFT (Menu) ============ -->
    <template #left>
      <nav class="space-y-1">
        <p class="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Navigation
        </p>
        <button
          v-for="item in menuItems"
          :key="item.key"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
          :class="
            activeMenu === item.key
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800'
          "
          @click="activeMenu = item.key"
        >
          <span class="text-base">{{ item.icon }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </button>
      </nav>

      <div
        class="mt-6 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <p class="text-xs font-semibold text-neutral-500">Thème actif</p>
        <div class="mt-2 flex items-center gap-2">
          <span
            class="h-6 w-6 rounded-full ring-2 ring-neutral-300"
            :style="{ backgroundColor: theme.primary }"
          />
          <code class="text-xs text-neutral-600 dark:text-neutral-300">{{ theme.primary }}</code>
        </div>
      </div>

      <div
        class="mt-4 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <p class="text-xs font-semibold text-neutral-500">Visibilité des zones</p>
        <div class="mt-2 space-y-1.5">
          <label class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
            <input v-model="headerVisible" type="checkbox" class="accent-primary-500" />
            <span>Header</span>
          </label>
          <label class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
            <input v-model="leftVisible" type="checkbox" class="accent-primary-500" />
            <span>Menu gauche</span>
          </label>
          <label class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
            <input v-model="rightVisible" type="checkbox" class="accent-primary-500" />
            <span>Pub droite</span>
          </label>
          <label class="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
            <input v-model="footerVisible" type="checkbox" class="accent-primary-500" />
            <span>Footer</span>
          </label>
        </div>
      </div>
    </template>

    <!-- ============ MAIN (Zone principale) ============ -->
    <div class="mx-auto max-w-6xl space-y-6">
      <!-- ===== Phase A — Formulaire ===== -->
      <TCard>
        <template #header>
          <h2 class="text-lg font-semibold text-primary-600 dark:text-primary-400">
            Phase A — Créer un compte
          </h2>
        </template>
        <form class="space-y-5" @submit.prevent="onSubmit">
          <div class="grid gap-5 sm:grid-cols-2">
            <TInput
              v-model="form.nom"
              label="Nom complet"
              placeholder="Jean Dupont"
              required
              :error="nomError"
            >
              <template #prefix>
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"
                  />
                </svg>
              </template>
            </TInput>
            <TInput
              v-model="form.email"
              type="email"
              label="E-mail"
              placeholder="jean@exemple.fr"
              :error="emailError"
              hint="Utilisé pour la connexion."
            />
          </div>
          <TInput
            v-model="form.password"
            :type="showPwd ? 'text' : 'password'"
            label="Mot de passe"
            hint="8 caractères minimum."
          >
            <template #suffix>
              <button
                type="button"
                class="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-300"
                @click="showPwd = !showPwd"
              >
                {{ showPwd ? 'Masquer' : 'Voir' }}
              </button>
            </template>
          </TInput>
          <TSelect
            v-model="form.pays"
            label="Pays"
            :options="pays"
            placeholder="Choisir un pays…"
          />
          <TTextarea
            v-model="form.message"
            label="Message"
            placeholder="Écrivez ici…"
            :rows="4"
            hint="500 caractères maximum."
          />
          <TRadioGroup v-model="form.civilite" label="Civilité" :options="civilites" inline />
          <div>
            <p class="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Centres d'intérêt
            </p>
            <div class="grid gap-2.5 sm:grid-cols-2">
              <TCheckbox
                v-for="i in interets"
                :key="i.value"
                :model-value="form.centreInterets"
                :value="i.value"
                :label="i.label"
                @update:model-value="onInteretsChange"
              />
            </div>
          </div>
          <TSwitch
            v-model="form.newsletter"
            label="Recevoir la newsletter"
            description="Un e-mail par mois, pas plus."
          />
          <TFileInput v-model="form.cv" label="CV (PDF)" accept=".pdf,.docx" hint="2 Mo maximum." />
          <div
            class="flex flex-wrap gap-3 border-t border-neutral-200 pt-5 dark:border-neutral-800"
          >
            <TButton type="submit">Créer le compte</TButton>
            <TButton variant="outline" @click="reset">Réinitialiser</TButton>
          </div>
          <TAlert v-if="submitted" variant="success" title="Formulaire soumis" closable>
            Couleur primaire actuelle : {{ theme.primary }}
          </TAlert>
        </form>
      </TCard>

      <!-- ===== Phase B — Affichage ===== -->
      <TCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-semibold text-primary-600 dark:text-primary-400">
              Phase B — Affichage
            </h2>
            <div class="flex flex-wrap gap-2">
              <TBadge color="primary">Primary</TBadge>
              <TBadge color="success" dot>Actif</TBadge>
              <TBadge color="warning" variant="soft">Bêta</TBadge>
              <TBadge color="danger" variant="outline">Erreur</TBadge>
              <TBadge color="info" size="sm">Info</TBadge>
            </div>
          </div>
        </template>
        <div class="space-y-4">
          <TAlert variant="primary" title="Thème dynamique" closable>
            Tous les composants ci-dessous suivent la couleur primaire sélectionnée.
          </TAlert>
          <TAlert variant="success" title="Succès">Compte créé avec succès.</TAlert>
          <TAlert variant="warning" closable>Attention : cette action est irréversible.</TAlert>

          <!-- ✨ TTable enrichi -->
          <TTable
            v-model:selected-keys="selectedUsers"
            :columns="userColumns"
            :rows="filteredAndSortedRows"
            :loading="tableLoading"
            :density="tableDensity"
            height="400px"
            title="Gestion des utilisateurs"
            selectable
            row-key="id"
            striped
            @sort="onSort"
          >
            <template #caption-extra="{ selectedCount }">
              <div class="flex items-center gap-3">
                <input
                  v-model="tableSearch"
                  type="text"
                  placeholder="Rechercher…"
                  class="h-8 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
                <select
                  v-model="tableDensity"
                  class="h-8 rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                >
                  <option value="sm">Dense</option>
                  <option value="md">Normal</option>
                  <option value="lg">Aéré</option>
                </select>
              </div>
            </template>
            <template #caption="{ selectedCount, total }">
              <div class="flex items-center gap-2">
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
        </div>
        <template #footer>
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-400 dark:text-neutral-500">
              {{ filteredAndSortedRows.length }} utilisateur(s)
            </span>
            <TButton variant="outline" size="sm" @click="modalOpen = true"
              >Ouvrir la modale</TButton
            >
          </div>
        </template>
      </TCard>

      <!-- ===== Phase C — ToolTips ===== -->
      <TCard>
        <template #header>
          <h2 class="text-lg font-semibold text-primary-600 dark:text-primary-400">
            Phase C — ToolTips
          </h2>
        </template>
        <div class="space-y-6">
          <!-- Positions -->
          <div>
            <p class="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Positions (auto-flip si pas d'espace)
            </p>
            <div class="flex flex-wrap items-center gap-3">
              <TToolTip content="Tooltip en haut" position="top">
                <TButton variant="outline" size="sm">Top</TButton>
              </TToolTip>
              <TToolTip content="Tooltip en bas" position="bottom">
                <TButton variant="outline" size="sm">Bottom</TButton>
              </TToolTip>
              <TToolTip content="Tooltip à gauche" position="left">
                <TButton variant="outline" size="sm">Left</TButton>
              </TToolTip>
              <TToolTip content="Tooltip à droite" position="right">
                <TButton variant="outline" size="sm">Right</TButton>
              </TToolTip>
            </div>
          </div>

          <!-- Thèmes -->
          <div>
            <p class="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Thèmes (dynamique selon la couleur primaire)
            </p>
            <div class="flex flex-wrap items-center gap-3">
              <TToolTip content="Thème sombre" theme="dark">
                <TBadge color="neutral">Dark</TBadge>
              </TToolTip>
              <TToolTip content="Thème clair" theme="light">
                <TBadge color="neutral" variant="outline">Light</TBadge>
              </TToolTip>
              <TToolTip content="Thème primaire (dynamique !)" theme="primary">
                <TBadge color="primary">Primary</TBadge>
              </TToolTip>
              <TToolTip content="Thème soft (pastel)" theme="soft">
                <TBadge color="primary" variant="soft">Soft</TBadge>
              </TToolTip>
            </div>
          </div>

          <!-- Triggers -->
          <div>
            <p class="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Déclencheurs
            </p>
            <div class="flex flex-wrap items-center gap-3">
              <TToolTip content="Apparaît au survol" trigger="hover">
                <TButton variant="outline" size="sm">Hover</TButton>
              </TToolTip>
              <TToolTip content="Apparaît au clic" trigger="click">
                <TButton variant="outline" size="sm">Click</TButton>
              </TToolTip>
              <TToolTip content="Apparaît au focus (Tab)" trigger="focus">
                <TInput placeholder="Focus ici" class="w-40" />
              </TToolTip>
            </div>
          </div>

          <!-- Contenu riche -->
          <div>
            <p class="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Contenu riche (slot #content)
            </p>
            <div class="flex flex-wrap items-center gap-3">
              <TToolTip theme="light" position="bottom">
                <TButton variant="outline" size="sm">Infos utilisateur</TButton>
                <template #content>
                  <div class="flex items-center gap-2">
                    <div
                      class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white"
                    >
                      AD
                    </div>
                    <div>
                      <p class="font-semibold">Awa Diop</p>
                      <p class="text-[10px] opacity-75">Designer · Actif</p>
                    </div>
                  </div>
                </template>
              </TToolTip>

              <TToolTip theme="primary" position="top">
                <TButton variant="outline" size="sm">Avec badge</TButton>
                <template #content>
                  <div class="flex items-center gap-2">
                    <span>🎉</span>
                    <span>Nouvelle version disponible !</span>
                    <TBadge color="warning" size="sm" variant="soft">v2.0</TBadge>
                  </div>
                </template>
              </TToolTip>
            </div>
          </div>
        </div>
      </TCard>
    </div>

    <!-- ============ RIGHT (Publicité — zone fixe) ============ -->
    <template #right>
      <div class="space-y-3">
        <p class="px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Publicité
        </p>
        <div
          v-for="(ad, i) in ads"
          :key="i"
          class="rounded-xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900/50"
        >
          <TBadge :color="ad.color" size="sm" variant="soft" class="mb-2">
            {{ ad.title }}
          </TBadge>
          <p class="text-sm text-neutral-700 dark:text-neutral-200">{{ ad.text }}</p>
          <TButton size="sm" variant="link" class="mt-2">En savoir plus →</TButton>
        </div>

        <div
          class="mt-4 rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 p-4 text-center dark:border-primary-700 dark:bg-primary-950/30"
        >
          <p class="text-xs font-semibold text-primary-600 dark:text-primary-400">
            Espace sponsorisé
          </p>
          <p class="mt-1 text-[10px] text-neutral-500">Votre pub ici</p>
        </div>
      </div>
    </template>

    <!-- ============ FOOTER ============ -->
    <template #footer>
      <div
        class="flex h-full w-full items-center justify-between px-4 text-xs text-neutral-500 dark:text-neutral-400"
      >
        <span>© 2026 Design System · Tous droits réservés</span>
        <div class="flex items-center gap-4">
          <TToolTip content="Documentation du design system" position="top">
            <a href="#" class="hover:text-primary-600">Documentation</a>
          </TToolTip>
          <TToolTip content="Code source sur GitHub" position="top">
            <a href="#" class="hover:text-primary-600">GitHub</a>
          </TToolTip>
          <span>v1.0.0</span>
        </div>
      </div>
    </template>
  </TLayout>

  <!-- ===== Modale (hors layout, toujours accessible) ===== -->
  <TModal v-model="modalOpen" title="Détail de l'utilisateur" size="md">
    <div v-if="selectedUser" class="space-y-2">
      <p><span class="font-medium">Nom :</span> {{ selectedUser.nom }}</p>
      <p><span class="font-medium">Email :</span> {{ selectedUser.email }}</p>
      <p><span class="font-medium">Rôle :</span> {{ selectedUser.role }}</p>
      <p class="flex items-center gap-2">
        <span class="font-medium">Statut :</span>
        <TBadge :color="String(selectedUser.statut) === 'actif' ? 'success' : 'neutral'" dot>
          {{ selectedUser.statut }}
        </TBadge>
      </p>
    </div>
    <p v-else>Contenu de démonstration de la modale.</p>
    <template #footer>
      <TButton variant="ghost" @click="modalOpen = false">Annuler</TButton>
      <TButton @click="modalOpen = false">Confirmer</TButton>
    </template>
  </TModal>
</template>
