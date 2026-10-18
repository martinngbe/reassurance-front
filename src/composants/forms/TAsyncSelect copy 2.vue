<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Multiselect from '@vueform/multiselect'
import TFieldWrapper from './TFieldWrapper.vue'
import { nextUid } from '../../utilitaire/uid.ts'
import { controlBase } from './fieldStyles'
import { computed } from 'vue'

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
  trackBy: 'value',
  labelBy: 'label',
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
const multiselectRef = ref<InstanceType<typeof Multiselect> | null>(null)  // 🆕 Référence au composant

const classes = {
  container: 'relative',
  singleLabel: 'flex items-center h-full text-sm text-neutral-900 dark:text-white',
  multipleLabel: 'flex items-center h-full text-sm text-neutral-900 dark:text-white',
  search: 'h-full px-3 text-sm bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none',
  placeholder: 'text-neutral-500 dark:text-neutral-400 text-sm h-full px-3 flex items-center',
  caret: 'w-4 h-4 text-neutral-400 ml-2',
  clear: 'text-neutral-400 hover:text-neutral-600 mr-2',
  clearIcon: 'w-4 h-4',
  dropdown: 'absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-lg overflow-hidden',
  dropdownTop: 'rounded-t-lg',
  dropdownBottom: 'rounded-b-lg',
  option: 'px-3 py-2 text-sm text-neutral-900 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer',
  optionSelected: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
  optionDisabled: 'text-neutral-400 cursor-not-allowed',
  optionGroup: 'px-3 py-2 text-xs font-bold text-neutral-500 uppercase',
  noOptions: 'px-3 py-2 text-sm text-neutral-500 text-center',
  noResults: 'px-3 py-2 text-sm text-neutral-500 text-center',
  spinner: 'w-4 h-4 text-primary-500',
  footer: 'px-3 py-2 text-center border-t border-neutral-200 dark:border-neutral-700',
}

async function loadMoreOptions(reset = false) {
  if (!props.loadOptions || loading.value) return

  loading.value = true

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

    // Pré-sélection du premier élément
    if (props.autoSelectFirst && !hasLoaded.value && options.value.length > 0 && !props.modelValue) {
      emit('update:modelValue', options.value[0])
    }

    hasLoaded.value = true
    
    //  Fermer le dropdown après chargement initial
    if (multiselectRef.value && !hasLoaded.value) {
      multiselectRef.value.deactivate()
    }
  } catch (error) {
    console.error('Erreur de chargement:', error)
  } finally {
    loading.value = false
  }
}

function onSearch(query: string) {
  searchQuery.value = query
  loadMoreOptions(true)
}

function onScrollBottom() {
  if (hasMore.value && !loading.value) {
    loadMoreOptions(false)
  }
}

function onOpen() {
  if (!hasLoaded.value) {
    loadMoreOptions(true)
  }
}

function onChange(value: any) {
  emit('update:modelValue', value)
}

// Chargement automatique au montage
onMounted(async () => {
  if (props.loadOptions && !hasLoaded.value) {
    await loadMoreOptions(true)
  }
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
    <div class="relative">
      <Multiselect
        ref="multiselectRef"
        :id="fieldId"
        :model-value="modelValue"
        :options="options"
        :placeholder="placeholder"
        :disabled="disabled"
        :loading="loading"
        :classes="classes"
        :track-by="trackBy"
        :label="labelBy"
        :searchable="true"
        :can-clear="false"
        @search="onSearch"
        @open="onOpen"
        @scroll-bottom="onScrollBottom"
        @update:model-value="onChange"
      />
      <!-- Flèche personnalisée -->
      <svg
        class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  </TFieldWrapper>
</template>

<style src="@vueform/multiselect/themes/default.css"></style>