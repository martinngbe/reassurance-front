<script setup lang="ts">
import { computed } from 'vue';
import type { FieldConfig } from './types-form';
import TInput from '../TInput.vue';
import TLigneHorizontale from '@/components/utilitaire/TLigneHorizontale.vue';
import TButton from '../TButton.vue';
import TToggle from '../TToggle.vue';
import TCalendar from '../TCalendar.vue';

const props = withDefaults(defineProps<{
  modelValue: Record<string, any>;
  fields: FieldConfig[];
  mode?: 'create' | 'edit' | 'view';
  submitLabel?: string;
  showDelete?: boolean;
  loading?: boolean;
}>(), {
  mode: 'create',
  submitLabel: 'Enregistrer',
  showDelete: false,
  loading: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>];
  'submit': [value: Record<string, any>];
  'cancel': [];
  'delete': [];
}>();

/* ---------- helpers ---------- */
const updateField = (key: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
};

const onInput = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.type === 'number' ? Number(target.value) : target.value;
  updateField(key, value);
};

const onCheckboxChange = (key: string, event: Event) => {
  updateField(key, (event.target as HTMLInputElement).checked);
};

const isDisabled = (field: FieldConfig) =>
  props.mode === 'view' || field.disabled || props.loading;

/* ---------- Helpers de conversion de dates pour le calendrier ---------- */

/** Convertit une valeur (string ISO, Date, null) en Date ou null */
const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

/** Convertit une Date en string ISO (ou garde la Date selon config) */
const fromCalendarValue = (
  value: Date | { start: Date | null; end: Date | null } | null,
  outputFormat: 'iso' | 'date' = 'iso',
): any => {
  if (!value) return null;

  if (value instanceof Date) {
    return outputFormat === 'iso' ? value.toISOString() : value;
  }

  // Mode range
  return {
    start: value.start
      ? outputFormat === 'iso'
        ? value.start.toISOString()
        : value.start
      : null,
    end: value.end
      ? outputFormat === 'iso'
        ? value.end.toISOString()
        : value.end
      : null,
  };
};

/** Handler pour la mise à jour depuis le calendrier */
const onCalendarUpdate = (key: string, value: any, outputFormat: 'iso' | 'date') => {
  updateField(key, fromCalendarValue(value, outputFormat));
};

const inputClasses = computed(() => [
  'w-full rounded-lg border px-3 py-2 text-sm',
  'transition-colors duration-150',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
  'border-gray-300 placeholder-gray-400',
]);
</script>

<template>
  <form
    @submit.prevent="emit('submit', modelValue)"
    class="space-y-5"
  >
    <!-- ====== Champs dynamiques ====== -->
    <div
      v-for="field in fields"
      :key="field.key"
      class="flex flex-col gap-1"
    >
      <!-- Text / Email / Password / Number / Date -->
      <TInput
        v-if="['text','email','password','number','date'].includes(field.type)"
        :id="field.key"
        :type="field.type"
        :modelValue="modelValue[field.key]"
        :label="field.label"
        :placeholder="field.placeholder"
        :required="field.required"
        :disabled="isDisabled(field)"
        @input="onInput(field.key, $event)"
      />

      <!-- Textarea -->
      <textarea
        v-else-if="field.type === 'textarea'"
        :id="field.key"
        :value="modelValue[field.key]"
        :placeholder="field.placeholder"
        :required="field.required"
        :disabled="isDisabled(field)"
        rows="3"
        :class="[...inputClasses, 'resize-y']"
        @input="onInput(field.key, $event)"
      />

      <!-- Select -->
      <select
        v-else-if="field.type === 'select'"
        :id="field.key"
        :value="modelValue[field.key]"
        :required="field.required"
        :disabled="isDisabled(field)"
        :class="inputClasses"
        @change="onInput(field.key, $event)"
      >
        <option value="" disabled>
          {{ field.placeholder || '— Choisir —' }}
        </option>
        <option
          v-for="opt in field.options"
          :key="String(opt.value)"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <!-- Toggle (checkbox moderne) -->
      <TToggle
        v-else-if="field.type === 'checkbox'"
        :id="field.key"
        :model-value="!!modelValue[field.key]"
        :label="field.placeholder || field.label"
        :disabled="isDisabled(field)"
        variant="switch"
        size="md"
        color="primary"
        @update:model-value="(v) => updateField(field.key, v)"
      />

      <!-- 🆕 Calendar -->
      <div
        v-else-if="field.type === 'calendar'"
        class="flex flex-col gap-2"
      >
        <label
          v-if="field.label"
          :for="field.key"
          class="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
        >
          {{ field.label }}
          <span v-if="field.required" class="text-red-500 ml-0.5">*</span>
        </label>

        <TCalendar
          :id="field.key"
          :model-value="toDate(modelValue[field.key])"
          :selection-mode="field.calendarOptions?.selectionMode ?? 'single'"
          :locale="field.calendarOptions?.locale ?? 'fr-FR'"
          :first-day-of-week="field.calendarOptions?.firstDayOfWeek ?? 1"
          :min-date="toDate(field.calendarOptions?.minDate)"
          :max-date="toDate(field.calendarOptions?.maxDate)"
          :disabled-dates="field.calendarOptions?.disabledDates"
          :highlighted-dates="field.calendarOptions?.highlightedDates"
          :size="field.calendarOptions?.size ?? 'md'"
          :variant="field.calendarOptions?.variant ?? 'default'"
          :show-outside-days="field.calendarOptions?.showOutsideDays ?? true"
          :disabled="isDisabled(field)"
          @update:model-value="(v) =>
            onCalendarUpdate(
              field.key,
              v,
              field.calendarOptions?.outputFormat ?? 'iso'
            )"
        />
      </div>

      <!-- Help text -->
      <p
        v-if="field.helpText"
        class="text-xs text-gray-400 mt-0.5"
      >
        {{ field.helpText }}
      </p>
    </div>

    <!-- ====== Actions ====== -->
    <TLigneHorizontale />
    <div
      v-if="mode !== 'view'"
      class="flex items-center justify-end gap-3 pt-4"
    >
      <TButton
        type="button"
        variant="soft"
        :loading="loading"
        :disabled="loading"
        width="w-46"
        @click="emit('cancel')"
      >
        Annuler
      </TButton>
      <TButton
        type="submit"
        width="w-46"
        :loading="loading"
        :disabled="loading"
      >
        {{ submitLabel }}
      </TButton>
    </div>
  </form>
</template>