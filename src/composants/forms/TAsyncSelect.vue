<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import TFieldWrapper from './TFieldWrapper.vue'
import { nextUid } from '../../utilitaire/uid.ts'
import TModal from '../display/TModal.vue';
import TButton from './TButton.vue';

const props = withDefaults(defineProps<{
  modelValue?: any
  placeholder?: string
  id?: string
  label?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  loadOptions?: (query: string, page: number) => Promise<{ options: any[], hasMore: boolean }>
  trackBy?: string
  labelBy?: string
  autoSelectFirst?: boolean
}>(), {
  modelValue: null,
  placeholder: 'Sélectionner…',
  id: undefined,
  label: '',
  hint: '',
  error: '',
  trackBy: 'id',
  labelBy: 'libelle',
  autoSelectFirst: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const fieldId = props.id ?? nextUid('t-async-select')
const options = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(false)
const currentPage = ref(1)
const searchQuery = ref('')
const hasLoaded = ref(false)
const isModalOpen = ref(false)
const selectedOption = ref<any>(props.modelValue)
const modalLoading = ref(false)

// Charger les données
async function loadOptions(reset = false) {
  if (!props.loadOptions || modalLoading.value) return

  modalLoading.value = true

  if (reset) {
    currentPage.value = 1
    options.value = []
    hasMore.value = false
  }

  try {
    const result = await props.loadOptions(searchQuery.value, currentPage.value)
    options.value = reset ? result.options : [...options.value, ...result.options]
    hasMore.value = result.hasMore
    currentPage.value++
  } catch (error) {
    console.error('Erreur de chargement:', error)
  } finally {
    modalLoading.value = false
  }
}

// Ouvrir le modal
function openModal() {
  if (props.disabled) return
  isModalOpen.value = true
  searchQuery.value = ''
  loadOptions(true)
}

// Fermer le modal
function closeModal() {
  isModalOpen.value = false
}

// Sélectionner une option
function selectOption(option: any) {
  selectedOption.value = option
  emit('update:modelValue', option)
  closeModal()
}

// Charger plus d'options au scroll
function onScroll(event: Event) {
  const target = event.target as HTMLElement
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
    if (hasMore.value && !modalLoading.value) {
      loadOptions(false)
    }
  }
}

// Recherche
function onSearch(event: Event) {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  loadOptions(true)
}

// Obtenir le libellé de la valeur sélectionnée
function getSelectedLabel(): string {
  if (!props.modelValue) return ''
  if (typeof props.modelValue === 'object' && props.modelValue[props.labelBy]) {
    return props.modelValue[props.labelBy]
  }
  return ''
}

// Chargement initial si autoSelectFirst
onMounted(async () => {
  if (props.autoSelectFirst && props.loadOptions && !hasLoaded.value) {
    loading.value = true
    try {
      const result = await props.loadOptions('', 1)
      if (result.options.length > 0 && !props.modelValue) {
        emit('update:modelValue', result.options[0])
      }
      hasLoaded.value = true
    } catch (error) {
      console.error('Erreur de chargement initial:', error)
    } finally {
      loading.value = false
    }
  }
})

// Watcher pour mettre à jour selectedOption quand modelValue change
watch(() => props.modelValue, (newVal) => {
  selectedOption.value = newVal
})
</script>

<template>
  <TFieldWrapper
    :label="label"
    :hint="hint"
    :error="error"
    :required="required"
    :html-for="fieldId"
  >
    <!-- Bouton qui ouvre le modal -->
    <button
      :id="fieldId"
      type="button"
      @click="openModal"
      :disabled="disabled"
      class="w-full flex items-center justify-between px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span :class="getSelectedLabel() ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'">
        {{ getSelectedLabel() || placeholder }}
      </span>
      <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Modal de sélection -->
    <TModal
      :model-value="isModalOpen"
      @update:model-value="isModalOpen = $event"
      :title="`Sélectionner ${label}`"
      size="md"
    >
      <!-- Recherche -->
      <div class="mb-4">
        <input
          type="text"
          :placeholder="`Rechercher ${label.toLowerCase()}...`"
          @input="onSearch"
          class="w-full px-4 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <!-- Liste avec scroll infini -->
      <div
        class="max-h-80 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg"
        @scroll="onScroll"
      >
        <div v-if="modalLoading && options.length === 0" class="p-4 text-center text-neutral-500">
          Chargement...
        </div>

        <div v-else-if="options.length === 0" class="p-4 text-center text-neutral-500">
          Aucun résultat trouvé
        </div>

        <div
          v-for="option in options"
          :key="option[trackBy]"
          @click="selectOption(option)"
          class="px-4 py-3 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border-b border-neutral-100 dark:border-neutral-700 last:border-b-0"
          :class="{
            'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400': modelValue && modelValue[trackBy] === option[trackBy]
          }"
        >
          {{ option[labelBy] }}
        </div>

        <!-- Indicateur de chargement en bas -->
        <div v-if="modalLoading && options.length > 0" class="p-3 text-center text-sm text-neutral-500">
          Chargement de plus d'éléments...
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 mt-4">
        <TButton
          type="button"
          variant="soft"
          @click="closeModal"
        >
          Annuler
        </TButton>
      </div>
    </TModal>
  </TFieldWrapper>
</template>