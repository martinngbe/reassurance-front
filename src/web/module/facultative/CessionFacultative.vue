<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import { ref } from 'vue';
import TTab from '@/composants/tab/TTab.vue';
import TTabItem from '@/composants/tab/TTabItem.vue';
import TTabPanel from '@/composants/tab/TTabPanel.vue';
import TAssuresPolicesQuittance from '../../acteurs/assure/TAssuresPolicesQuittance.vue';
const active = ref('reassureurs')


</script>

<template>
  <TLayoutModule
    :show-bottom="false"
    :show-top="false"
    :show-left="false"
    >
   

    <template #default>
          <TTab v-model="active" variant="underline" size="md">
                <TTabItem value="reassureurs"  label="Réassureurs"  />
                <TTabItem value="polices"  label="Polices"      />
                <TTabItem value="quittances"  label="Quittances"      />

                <template #panels>
                  <TTabPanel value="reassureurs">                   
                    <TAssuresPolicesQuittance/>
                  </TTabPanel>
                 
                  <TTabPanel value="polices">
                    <p class="text-gray-600 dark:text-gray-300">
                      Formulaire de paramètres.
                    </p>
                  </TTabPanel>
                  <TTabPanel value="quittances">
                    <p class="text-gray-600 dark:text-gray-300">
                      Formulaire de paramètres.
                    </p>
                  </TTabPanel>

                </template>
          </TTab>
    </template>


  </TLayoutModule>
</template>