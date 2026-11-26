<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  blob: Blob | null
  filename?: string
}>()

const pdfUrl = ref<string | null>(null)

watch(() => props.blob, (newBlob) => {
  // Libérer l'ancienne URL pour éviter les fuites de mémoire
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value)
    pdfUrl.value = null
  }
  if (newBlob) {
    pdfUrl.value = URL.createObjectURL(newBlob)
  }
}, { immediate: true })

onBeforeUnmount(() => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value)
  }
})
</script>

<template>
  <div class="w-full h-[75vh] bg-neutral-100 rounded-lg overflow-hidden border border-neutral-300">
    <iframe 
      v-if="pdfUrl" 
      :src="pdfUrl" 
      class="w-full h-full"
      title="Aperçu PDF"
    />
    <div v-else class="flex items-center justify-center h-full text-neutral-500">
      Aucun document à afficher
    </div>
  </div>
</template>