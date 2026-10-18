<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    label?: string
    description?: string
    disabled?: boolean
  }>(),
  {
    modelValue: false,
    label: '',
    description: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function toggle(): void {
  if (!props.disabled) emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div
    class="flex items-center justify-between gap-4"
    :class="disabled ? 'opacity-60' : 'cursor-pointer'"
  >
    <span v-if="label || description" class="select-none" @click="toggle">
      <span v-if="label" class="block text-sm font-medium text-neutral-700 dark:text-neutral-200">{{
        label
      }}</span>
      <span v-if="description" class="block text-xs text-neutral-400">{{ description }}</span>
    </span>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed"
      :class="modelValue ? 'bg-primary-500' : 'bg-neutral-300'"
      @click="toggle"
    >
      <span
        class="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
        :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
      />
    </button>
  </div>
</template>
