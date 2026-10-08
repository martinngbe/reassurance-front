<script setup lang="ts">
import { computed } from 'vue'
import TFieldWrapper from './TFieldWrapper.vue'
import TRadio from './TRadio.vue'
import { nextUid } from '../../utilitaire/uid.ts'
import { normalizeOptions, type OptionValue, type OptionsInput } from './common'

const props = withDefaults(
  defineProps<{
    modelValue?: OptionValue | null
    options: OptionsInput
    label?: string
    hint?: string
    error?: string
    name?: string
    inline?: boolean
    required?: boolean
    disabled?: boolean
  }>(),
  {
    modelValue: null,
    label: '',
    hint: '',
    error: '',
    name: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: OptionValue): void
}>()

const groupName: string = props.name ?? nextUid('t-radio')
const normalized = computed(() => normalizeOptions(props.options))
</script>

<template>
  <TFieldWrapper :label="label" :hint="hint" :error="error" :required="required">
    <div role="radiogroup" :class="inline ? 'flex flex-wrap gap-x-6 gap-y-2.5' : 'space-y-2.5'">
      <TRadio
        v-for="o in normalized"
        :key="String(o.value)"
        :name="groupName"
        :value="o.value"
        :label="o.label"
        :disabled="disabled || o.disabled"
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </TFieldWrapper>
</template>
