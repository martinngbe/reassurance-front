<script setup lang="ts">
import { computed, ref } from 'vue'
import TFieldWrapper from './TFieldWrapper.vue'

const props = withDefaults(
  defineProps<{
    label?: string
    hint?: string
    error?: string
    accept?: string
    multiple?: boolean
    disabled?: boolean
  }>(),
  {
    label: '',
    hint: '',
    error: '',
    accept: undefined,
    multiple: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | File[] | null): void
}>()

const files = ref<File[]>([])

function onChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const list = Array.from(target.files ?? [])
  files.value = list
  emit('update:modelValue', props.multiple ? list : (list[0] ?? null))
}

const names = computed<string>(() => files.value.map((f) => f.name).join(', '))
</script>

<template>
  <TFieldWrapper :label="label" :hint="hint" :error="error">
    <label
      class="flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 transition"
      :class="[
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        error
          ? 'border-red-300'
          : 'border-neutral-300 hover:border-primary-400 hover:bg-primary-500/5',
      ]"
    >
      <svg class="h-5 w-5 shrink-0 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M10 2a1 1 0 0 1 .707.293l3 3a1 1 0 0 1-1.414 1.414L11 5.414V13a1 1 0 1 1-2 0V5.414L7.707 6.707a1 1 0 0 1-1.414-1.414l3-3A1 1 0 0 1 10 2ZM4 15a1 1 0 0 1 1 1v1h10v-1a1 1 0 1 1 2 0v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a1 1 0 0 1 1-1Z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="truncate text-sm" :class="names ? 'text-neutral-700' : 'text-neutral-400'">
        {{ names || 'Cliquer pour choisir un fichier…' }}
      </span>
      <input
        type="file"
        class="sr-only"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        @change="onChange"
      />
    </label>
  </TFieldWrapper>
</template>
