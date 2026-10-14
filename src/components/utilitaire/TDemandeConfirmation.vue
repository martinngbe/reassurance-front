<script setup lang="ts">
import TButton from '../forms/TButton.vue';

const props = withDefaults(defineProps<{
  message?: string
  labelAnnuler?: string
  labelConfirmer?: string
}>(), {
  message: 'Demande de confirmation',
  labelAnnuler: 'Annuler',
  labelConfirmer: 'Confirmer',
})

const emit = defineEmits<{
  (e: 'annuler'): void
  (e: 'confirmer'): void
}>()

function onAnnuler() {
  emit('annuler')
}

function onConfirmer() {
  emit('confirmer')
}
</script>

<template>
  <div class="flex flex-col items-center gap-2 py-4 text-neutral-400">
    <!-- Zone du message -->
    <div class="w-full text-center">
      <slot name="message">
        <span>{{ props.message }}</span>
      </slot>
    </div>

    <!-- Zone des boutons d'action -->
    <div class="flex w-full gap-4 justify-between">
      <slot name="actions">
        <TButton
          width="w-46"
          variant="soft"
          @click="onAnnuler"
        >
          {{ props.labelAnnuler }}
        </TButton>
        <TButton
          width="w-46"
          variant="solid"
          @click="onConfirmer"
        >
          {{ props.labelConfirmer }}
        </TButton>
      </slot>
    </div>
  </div>
</template>