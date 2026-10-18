<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, useId } from 'vue'

// ==================== TYPES ====================
export type TextAreaSize = 'sm' | 'md' | 'lg'
export type TextAreaVariant = 'default' | 'soft' | 'outline'

// ==================== PROPS ====================
const props = withDefaults(
  defineProps<{
    modelValue?: string
    type?: 'text' | 'textarea' // pour compatibilité avec GenericCrudForm
    id?: string
    label?: string
    placeholder?: string
    hint?: string
    error?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    rows?: number
    maxlength?: number
    minlength?: number
    autoResize?: boolean
    size?: TextAreaSize
    variant?: TextAreaVariant
    showCounter?: boolean
  }>(),
  {
    modelValue: '',
    type: 'textarea',
    placeholder: '',
    hint: '',
    error: '',
    required: false,
    disabled: false,
    readonly: false,
    rows: 3,
    autoResize: false,
    size: 'md',
    variant: 'default',
    showCounter: false,
  },
)

// ==================== EMITS ====================
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'input': [event: Event]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>()

// ==================== ÉTAT ====================
const autoId = useId()
const textareaId = computed(() => props.id ?? autoId)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isFocused = ref(false)

// ==================== HELPERS ====================
const length = computed(() => (props.modelValue ?? '').length)
const hasError = computed(() => !!props.error)
const hasHint = computed(() => !!props.hint || props.showCounter)

const sizeClasses = computed(() => ({
  sm: 'text-xs px-2.5 py-1.5 min-h-[60px]',
  md: 'text-sm px-3 py-2 min-h-[80px]',
  lg: 'text-base px-4 py-2.5 min-h-[120px]',
}[props.size]))

const variantClasses = computed(() => {
  const base = [
    'w-full rounded-lg border transition-all duration-150',
    'focus:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-60',
    'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
  ]

  if (hasError.value) {
    return [
      ...base,
      'border-red-500 dark:border-red-500',
      'focus:ring-2 focus:ring-red-500/20 focus:border-red-500',
      'bg-red-50/30 dark:bg-red-950/20',
    ]
  }

  switch (props.variant) {
    case 'soft':
      return [
        ...base,
        'border-transparent bg-neutral-100 dark:bg-neutral-800',
        'hover:bg-neutral-200 dark:hover:bg-neutral-700',
        'focus:bg-white dark:focus:bg-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
      ]
    case 'outline':
      return [
        ...base,
        'border-2 border-neutral-300 dark:border-neutral-700',
        'hover:border-neutral-400 dark:hover:border-neutral-600',
        'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
      ]
    default:
      return [
        ...base,
        'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900',
        'hover:border-neutral-400 dark:hover:border-neutral-600',
        'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
      ]
  }
})

// ==================== AUTO-RESIZE ====================
const autoResizeHandler = () => {
  if (!props.autoResize || !textareaRef.value) return
  const el = textareaRef.value
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

watch(() => props.modelValue, () => {
  if (props.autoResize) nextTick(autoResizeHandler)
})

onMounted(() => {
  if (props.autoResize) nextTick(autoResizeHandler)
})

// ==================== HANDLERS ====================
const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  emit('input', event)
  if (props.autoResize) nextTick(autoResizeHandler)
}

const onFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const onBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

// ==================== EXPOSE ====================
defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
  ref: textareaRef,
})
</script>

<template>
  <div class="flex flex-col gap-1">
    <!-- Label -->
    <label
      v-if="label"
      :for="textareaId"
      class="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
      :class="{ 'cursor-not-allowed opacity-60': disabled }"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 dark:text-red-400 ml-0.5">*</span>
    </label>

    <!-- Wrapper pour positionner le compteur -->
    <div class="relative ">
      <textarea
        :id="textareaId"
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        :maxlength="maxlength"
        :minlength="minlength"
        :aria-invalid="hasError"
        :aria-describedby="hasHint ? `${textareaId}-hint` : undefined"
        :class="[
          variantClasses,
          sizeClasses,
          'resize-y',
          autoResize && 'resize-none overflow-hidden',
        ]"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />

      <!-- Compteur de caractères -->
      <span
        v-if="showCounter || maxlength"
        :id="`${textareaId}-counter`"
        class="absolute bottom-2 right-2 text-xs text-neutral-400 dark:text-neutral-500 pointer-events-none select-none"
        :class="{
          'text-red-500 dark:text-red-400 font-medium': maxlength && length > maxlength,
          'text-amber-500 dark:text-amber-400': maxlength && length > maxlength * 0.9 && length <= maxlength,
        }"
      >
        {{ length }}<span v-if="maxlength"> / {{ maxlength }}</span>
      </span>
    </div>

    <!-- Hint / Error -->
    <div
      v-if="hasHint || hasError"
      :id="`${textareaId}-hint`"
      class="flex items-center gap-1 text-xs"
      :class="hasError
        ? 'text-red-600 dark:text-red-400'
        : 'text-neutral-500 dark:text-neutral-400'"
    >
      <svg
        v-if="hasError"
        class="h-3.5 w-3.5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ hasError ? error : hint }}</span>
    </div>
  </div>
</template>