<script setup lang="ts">
import { ref } from 'vue'
import TTab from '@/composants/tab/TTab.vue'
import TTabItem from '@/composants/tab/TTabItem.vue'
import TTabPanel from '@/composants/tab/TTabPanel.vue'

const active = ref('pmd')
</script>

<template>
  <div class="w-full">
    
    <TTab v-model="active" variant="underline" size="md">
      <TTabItem value="pmd"             label="Echéanciers PMD"  />
      <TTabItem value="compte"          label="Compte"  />
      <TTabItem value="placement"       label="Placement"     />
      <TTabItem value="note-de-credit"  label="Note Débit Crédit"      />
      <TTabItem value="sinistre"  label="Sinistre"      />

      <template #panels>
        <TTabPanel value="pmd">
          <p class="text-gray-600 dark:text-gray-300">
            Echeancier PMD
          </p>
        </TTabPanel>
        <TTabPanel value="compte">
          <p class="text-gray-600 dark:text-gray-300">
            Compte
          </p>
        </TTabPanel>
        <TTabPanel value="placement">
          <p class="text-gray-600 dark:text-gray-300">
            Placement
          </p>
        </TTabPanel>
        <TTabPanel value="note-de-credit">
          <p class="text-gray-600 dark:text-gray-300">
           Note Débit Crédit
          </p>
        </TTabPanel>
        <TTabPanel value="sinistre">
          <p class="text-gray-600 dark:text-gray-300">
             Sinistre
          </p>
        </TTabPanel>
      </template>
    </TTab>

  </div>
</template>