<script setup lang="ts">
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
  // La fonction asynchrone qui charge les données
  resolve?: (query: string, currentOptions: any[]) => Promise<{ options: any[], hasMore: boolean }>
  // Clés pour mapper vos objets API (ex: id et name)
  trackBy?: string
  labelBy?: string
}>(), {
  modelValue: null,
  placeholder: 'Sélectionner…',
  id: undefined,
  label: '',
  hint: '',
  error: '',
  trackBy: 'value',
  labelBy: 'label',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const fieldId = props.id ?? nextUid('t-async-select')

// Style de base pour correspondre à votre TSelect
const controlClass = computed<string[]>(() => [...controlBase(props.error !== ''), 'h-10', 'px-3'])

// Configuration des classes Tailwind pour le dropdown (Mode sombre basé sur votre capture)
const classes = {
  container: 'relative',
  singleLabel: 'flex items-center h-full text-sm text-neutral-900 dark:text-white',
  multipleLabel: 'flex items-center h-full text-sm text-neutral-900 dark:text-white',
  search: 'h-full px-3 text-sm bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none',
  placeholder: 'text-neutral-500 dark:text-neutral-400 text-sm h-full px-3 flex items-center',
  caret: 'w-4 h-4 text-neutral-400 ml-2',
  clear: 'text-neutral-400 hover:text-neutral-600 mr-2',
  clearIcon: 'w-4 h-4',
  // Le dropdown lui-même
  dropdown: 'absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-lg overflow-hidden',
  dropdownTop: 'rounded-t-lg',
  dropdownBottom: 'rounded-b-lg',
  // Les options
  option: 'px-3 py-2 text-sm text-neutral-900 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer',
  optionSelected: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
  optionDisabled: 'text-neutral-400 cursor-not-allowed',
  optionGroup: 'px-3 py-2 text-xs font-bold text-neutral-500 uppercase',
  // États vides et chargement
  noOptions: 'px-3 py-2 text-sm text-neutral-500 text-center',
  noResults: 'px-3 py-2 text-sm text-neutral-500 text-center',
  spinner: 'w-4 h-4 text-primary-500',
  footer: 'px-3 py-2 text-center border-t border-neutral-200 dark:border-neutral-700',
}
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
      <!-- 
        :resolve gère TOUT : la recherche, le debounce, le scroll infini et le chargement.
        Plus besoin de slots compliqués !
      -->
      <Multiselect
        :id="fieldId"
        :model-value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :classes="classes"
        :track-by="trackBy"
        :label="labelBy"
        :searchable="true"
        :resolve="resolve"
        @update:modelValue="emit('update:modelValue', $event)"
      />
      
      <!-- Flèche personnalisée pour matcher votre TSelect -->
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

<!-- Import du style de base de la librairie -->
<style src="@vueform/multiselect/themes/default.css"></style>