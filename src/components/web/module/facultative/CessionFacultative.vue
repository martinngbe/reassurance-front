<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import { ref } from 'vue';
import TTab from '@/components/tab/TTab.vue';
import TTabItem from '@/components/tab/TTabItem.vue';
import TTabPanel from '@/components/tab/TTabPanel.vue';
import TAssuresPolicesQuittance from '@/components/web/assure/TAssuresPolicesQuittance.vue';
//import TCedantesPolicesQuittance from '../cedante/TCedantesPolicesQuittance.vue';
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