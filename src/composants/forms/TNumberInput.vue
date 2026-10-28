<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TInput from './TInput.vue'
import { formatNumber, parseNumber, type FormatNumberOptions } from '../../utilitaire/number'
import { nextUid } from '../../utilitaire/uid'

type InputSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    id?: string
    label?: string
    placeholder?: string
    hint?: string
    error?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    size?: InputSize
    decimals?: number
    formatOptions?: FormatNumberOptions
    returnType?: 'string' | 'number'
    min?: number // 👈 NOUVEAU
    max?: number // 👈 NOUVEAU
  }>(),
  {
    modelValue: '', id: undefined, label: '', placeholder: '', hint: '', error: '',
    size: 'md', decimals: 0, returnType: 'number',
     min: undefined,
    max: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const fieldId = props.id ?? nextUid('t-number-input')
const focused = ref(false)

// Valeur brute affichée pendant l'édition, ex : "1234,5"
const draft = ref('')

const options = computed<FormatNumberOptions>(() => ({
  locale: 'fr-FR',
  maximumFractionDigits: props.decimals,
  minimumFractionDigits: props.decimals,
  ...props.formatOptions,
}))

/** Nombre -> texte éditable (séparateur français, sans milliers) */
function toEditable(value: string | number | null | undefined): string {
  const n = parseNumber(String(value ?? ''))  // ✅ Conversion explicite
  if (Number.isNaN(n)) return ''
  const fixed = n.toFixed(options.value.maximumFractionDigits ?? 0)
  return fixed.replace('.', ',')
}

// Initialisation + synchronisation EXTERNE uniquement (hors focus)
watch(
  () => props.modelValue,
  (v) => { if (!focused.value) draft.value = toEditable(v) },
  { immediate: true },
)

const displayValue = computed(() =>
  focused.value
    ? draft.value
    // ✅ On ajoute '?? ""' pour garantir qu'on envoie toujours une string ou un number
    : formatNumber(draft.value || (props.modelValue ?? ''), options.value),
)
/** Nettoie + tronque les décimales dès la frappe */
function sanitize(input: string): string {
  const decimals = options.value.maximumFractionDigits ?? 0

  let s = input.replace(/[\s\u00A0\u202F]/g, '').replace(/[^\d.,-]/g, '')
  s = (s.startsWith('-') ? '-' : '') + s.replace(/-/g, '')

  const hasComma = s.includes(',')
  const hasDot = s.includes('.')
  if (hasComma && hasDot) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.')
      ? s.replace(/\./g, '').replace(',', '.')
      : s.replace(/,/g, '')
  } else {
    s = s.replace(',', '.')
  }

  const trailing = /[.,]$/.test(input) && decimals > 0
  const [int = '', frac = ''] = s.split('.')

  if (decimals === 0) return (s.startsWith('-') ? '-' : '') + int.replace(/\D/g, '')

  const safeInt = int.replace(/\D/g, '')
  const safeFrac = frac.replace(/\D/g, '').slice(0, decimals)
  return `${s.startsWith('-') ? '-' : ''}${safeInt}${safeFrac || trailing ? '.' + safeFrac : ''}`
}

function onInput(raw: string): void {
  draft.value = sanitize(raw)
  publish()
}

function publish(): void {
  const n = parseNumber(draft.value)
  if (props.returnType === 'number') {
    emit('update:modelValue', Number.isNaN(n) ? '' : n)
  } else {
    emit('update:modelValue', draft.value)
  }
}

function onFocus(event: FocusEvent): void {
  focused.value = true
  draft.value = toEditable(props.modelValue) // retire les espaces de milliers
  emit('focus', event)
}
/*
function onBlur(event: FocusEvent): void {
  const n = parseNumber(draft.value)
  draft.value = Number.isNaN(n) ? '' : n.toFixed(options.value.maximumFractionDigits ?? 0)
  focused.value = false
  publish()
  emit('blur', event)
}
*/
function onBlur(event: FocusEvent): void {
  let n = parseNumber(draft.value)
  
  if (!Number.isNaN(n)) {
    // 👇 APPLICATION DE LA PLAGE (MIN / MAX)
    if (props.min !== undefined && n < props.min) {
      n = props.min
    }
    if (props.max !== undefined && n > props.max) {
      n = props.max
    }
    draft.value = n.toFixed(options.value.maximumFractionDigits ?? 0)
  } else {
    draft.value = ''
  }
  
  focused.value = false
  publish() // publish() va émettre la valeur déjà corrigée par le min/max
  emit('blur', event)
}
const rangeError = computed(() => {
  const n = parseNumber(draft.value)
  if (Number.isNaN(n)) return ''
  if (props.min !== undefined && n < props.min) {
    return `La valeur minimale est ${props.min}`
  }
  if (props.max !== undefined && n > props.max) {
    return `La valeur maximale est ${props.max}`
  }
  return ''
})
</script>

<template>
  <TInput
    :id="fieldId"
    :model-value="displayValue"
    type="text"
    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :error="error || rangeError"
    :required="required"
    :disabled="disabled"
    :readonly="readonly"
    :size="size"
    inputmode="decimal"
    @update:model-value="onInput"
    @focus="onFocus"
    @blur="onBlur"
  />
</template>