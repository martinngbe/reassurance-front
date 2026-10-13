<script setup lang="ts">
import { computed } from 'vue';
import type { FieldConfig } from './types-form';
import TInput from '../TInput.vue';
import TLigneHorizontale from '@/components/utilitaire/TLigneHorizontale.vue';
import TButton from '../TButton.vue';
import TToggle from '../TToggle.vue';

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
      class="flex flex-col gap-1 bg-red"
    >
              <!-- Label -->
              <!-- <label
                :for="field.key"
                class="text-sm font-semibold  text-neutral-800  dark:text-neutral-400"
              >
                {{ field.label }}
                <span v-if="field.required" class="text-red-500 ml-0.5 ">*</span>
              </label> -->

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
        <!--
            modelValue?: string
            type?: InputType
            id?: string
            label?: string
            placeholder?: string
            hint?: string
            error?: string
            required?: boolean
            disabled?: boolean
            readonly?: boolean   

        -->
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

              <!-- Checkbox -->
              <!-- <label
                v-else-if="field.type === 'checkbox'"
                class="inline-flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  :id="field.key"
                  type="checkbox"
                  :checked="modelValue[field.key]"
                  :disabled="isDisabled(field)"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600
                        focus:ring-blue-500 disabled:opacity-50"
                  @change="onCheckboxChange(field.key, $event)"
                />
                <span class="text-sm text-gray-600">{{ field.placeholder }}</span>
              </label> -->
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
              <!-- Help text -->
              <p
                v-if="field.helpText"
                class="text-xs text-gray-400 mt-0.5"
              >
                {{ field.helpText }}
              </p>
    </div>

    <!-- ====== Actions ====== -->
     <TLigneHorizontale/>
    <div
      v-if="mode !== 'view'"
      class="flex items-center justify-end gap-3 pt-4"
    >   
          <TButton 
              type="button" 
              variant="soft" 
              :loading="loading"
              :disabled="loading"
              width="w-46"  @click="emit('cancel')">  
              Annuler
            </TButton>
          <TButton 
            type="submit" 
           
            width="w-46"
            :loading="loading"
            :disabled="loading"
            > {{ submitLabel }}</TButton>
         
           <!-- <button
            type="button"
           
            class="px-4 py-2 text-sm font-medium rounded-lg
                  text-gray-700 bg-white border border-gray-300
                  hover:bg-gray-50 transition-colors"
            :disabled="loading"
            @click="emit('cancel')"
          >
            Annuler
          </button> -->
         
          <!-- <button
            v-if="showDelete && mode === 'edit'"
            type="button"
            class="px-4 py-2 text-sm font-medium rounded-lg
                  text-white bg-red-600 hover:bg-red-700
                  transition-colors"
            :disabled="loading"
            @click="emit('delete')"
          >
            🗑 Supprimer
          </button> -->

          <!-- <button
            type="submit"
            class="px-4 py-2 text-sm font-medium rounded-lg
                  text-white bg-blue-600 hover:bg-blue-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors flex items-center gap-2"
            :disabled="loading"
          >
           
            <svg
              v-if="loading"
              class="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            {{ submitLabel }}
          </button>  -->
         
    </div>
  </form>
</template>