<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import { ref } from 'vue';
import TTab from '@/components/tab/TTab.vue';
import TTabItem from '@/components/tab/TTabItem.vue';
import TTabPanel from '@/components/tab/TTabPanel.vue';
import TAssuresPolicesQuittance from '@/components/web/assure/TAssuresPolicesQuittance.vue';
import TCedantesPolicesQuittance from '@/components/web/cedante/TCedantesPolicesQuittance.vue';
const active = ref('assures')


</script>

<template>
  <TLayoutModule
    :show-bottom="false"
    :show-top="false"
    :show-left="false"
    >
   

    <template #default>
          <TTab v-model="active" variant="underline" size="md">
                <TTabItem value="assures"  label="Assurés"  />
                <TTabItem value="cedantes" label="Cédantes"     />
                <TTabItem value="polices"  label="Polices"      />
                <TTabItem value="quittances"  label="Quittances"      />

                <template #panels>
                  <TTabPanel value="assures">                   
                    <TAssuresPolicesQuittance/>
                  </TTabPanel>
                  <TTabPanel value="cedantes">
                    <TCedantesPolicesQuittance/>
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