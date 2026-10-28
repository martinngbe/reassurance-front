<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue';
import TTab from '@/composants/tab/TTab.vue';
import TTabItem from '@/composants/tab/TTabItem.vue';
import TTabPanel from '@/composants/tab/TTabPanel.vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import { computed, ref } from 'vue'
import TFicheQuittanceCapitaux from './fiche/ TFicheQuittanceCapitaux.vue';
import TFicheQuittanceCourtage from './fiche/ TFicheQuittanceCourtage.vue';
import TFicheQuittanceEmission from './fiche/ TFicheQuittanceEmission.vue';
import TFicheQuittancePrimes from './fiche/ TFicheQuittancePrimes.vue';
import TFicheQuittanceTaxesEtTaux from './fiche/ TFicheQuittanceTaxesEtTaux.vue';
import TFichePolice from '@/web/polices/police/ TFichePolice.vue';


const active = ref('accueil')
// lecture de la quittance en cours
const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=> quittanceStore.currentQuittance)
</script>


<template>
  <TLayoutModule
    :show-bottom="false"
    :show-left="false"
    leftSize="25%"
    :show-top="false"
    >
    

         <template #default>

                <TTab v-model="active" variant="underline" size="md">
                <TTabItem value="accueil"      label="Accueil"        />
                 <TTabItem value="placement"   label="Placement" />
                <TTabItem value="bordereau"    label="Bordereau"      />
                <TTabItem value="echeancePmd"    label="Echeance Pmd"      />
                <TTabItem value="compte"      label="Compte"        />
               
                <TTabItem value="sinistre"    label="Sinistre"      />
                <TTabItem value="noteDebitCredit"  label="Note Débit Crédit"    />
                <TTabItem value="reglement"  label="Règlemenet"    />

                <template #panels>
                    <TTabPanel value="accueil">
                       <div class="grid grid-cols-2 gap-3">
                            <div class="flex flex-col  gap-4">
                                <TFichePolice/>
                                <TFicheQuittanceEmission />
                            </div>
                            <div class="flex flex-col gap-4">
                                  <TFicheQuittanceCapitaux />                                
                                  <TFicheQuittancePrimes />
                                  <TFicheQuittanceTaxesEtTaux />
                                  <TFicheQuittanceCourtage />
                            </div>
                        </div>
                    </TTabPanel>
                    <TTabPanel value="bordereau">
                        
                    </TTabPanel>
                    <TTabPanel value="echeancePmd">
                        
                    </TTabPanel>
                    <TTabPanel value="compte">
                    
                    </TTabPanel>  
                    <TTabPanel value="placement">
                    
                    </TTabPanel>       
                    <TTabPanel value="sinistre">
                        
                    </TTabPanel>        
                    <TTabPanel value="noteDebitCredit">
                        
                    </TTabPanel>

                </template>
                </TTab>
           </template>

  </TLayoutModule>

</template>