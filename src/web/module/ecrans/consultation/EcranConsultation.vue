<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTab from '@/composants/tab/TTab.vue';
import TTabItem from '@/composants/tab/TTabItem.vue';
import TTabPanel from '@/composants/tab/TTabPanel.vue';
import TPoliceConsultation from '@/web/polices/police/TPoliceConsultation.vue';
import TQuittanceConsultation from '@/web/quittances/quittance/TQuittanceConsultation.vue';
import { ref } from 'vue';
const active = ref('polices')


</script>

<template>
  <TLayoutModule
    :show-bottom="false"
    :show-top="false"
    :show-left="false"
    >
            <TTab v-model="active" variant="underline" size="md">
                    <TTabItem value="polices"  label="Polices"  />
                    <TTabItem value="quittances" label="Quittances"     />
                    <template #panels>
                          <TTabPanel value="polices">
                            <div class="w-full  h-[70vh]">
                              <TPoliceConsultation/>
                            </div>
                          </TTabPanel>
                          <TTabPanel value="quittances">
                              <div class="w-full  h-[70vh]">
                                 <TQuittanceConsultation/>
                                </div>
                          </TTabPanel>
                    </template>
            </TTab>
  </TLayoutModule>
</template>