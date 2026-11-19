<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTab from '@/composants/tab/TTab.vue';
import TTabItem from '@/composants/tab/TTabItem.vue';
import TTabPanel from '@/composants/tab/TTabPanel.vue';
import { useConsultationStore, type ConsultationTab } from '@/services/ecrans/consultation.store';
import TActeurConsultation from '@/web/acteurs/acteur/TActeurConsultation.vue';
import TAssureConsultation from '@/web/acteurs/assure/TAssureConsultation.vue';
import TQuittanceConsultation from '@/web/quittances/quittance/TQuittanceConsultation.vue';
import { computed } from 'vue';

const store = useConsultationStore()

// v-model "branché" sur le store
const active = computed({
  get: () => store.currentConsultationTab,
  set: (val) => store.setActiveTab(val as ConsultationTab),
})
</script>

<template>
  <TLayoutModule
    :show-bottom="false"
    :show-top="false"
    :show-left="false"
    >
            <TTab v-model="active" variant="underline" size="md">
                    <TTabItem value="quittances" label="Quittances"     />
                    <TTabItem value="assures" label="Assurés"     />
                    <TTabItem value="cedantes"  label="Cédantes"  />
                    <!--TTabItem value="polices"  label="Polices"  /-->
                   
                    
                    <template #panels>
                          <TTabPanel value="assures">
                              <div class="w-full  h-[70vh]">
                                 <TAssureConsultation />
                                </div>
                          </TTabPanel>  
                          <TTabPanel value="cedantes">
                            <div class="w-full  h-[70vh]">
                              <TActeurConsultation />
                            </div>
                          </TTabPanel>
                          <!--TTabPanel value="polices">
                            <div class="w-full  h-[70vh]">
                              <TPoliceConsultation/>
                            </div>
                          </TTabPanel-->
                          <TTabPanel value="quittances">
                              <div class="w-full  h-[70vh]">
                                 <TQuittanceConsultation/>
                                </div>
                          </TTabPanel>
                            
                    </template>
            </TTab>
  </TLayoutModule>
</template>