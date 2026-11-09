<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue';
import { useQuittanceStore } from '@/services/quittances/quittance/quittance.store';
import { computed, ref } from 'vue'
import TFicheQuittance from './fiche/ TFicheQuittance.vue';
import TFichePolice from '@/web/polices/police/ TFichePolice.vue';
import TTab from '@/composants/tab/TTab.vue';
import TTabItem from '@/composants/tab/TTabItem.vue';
import Bordereaux from '@/web/flux-financier/bordereau/Bordereaux.vue';
import TTabPanel from '@/composants/tab/TTabPanel.vue';
import QuittancePlacements from '../quittance-placement/QuittancePlacements.vue';
import EcheancesPmd from '@/web/flux-financier/echeance-pmd/EcheancesPmd.vue';
import Comptes from '@/web/flux-financier/comptes/compte/Comptes.vue';



const active = ref('bordereau')
const quittanceStore = useQuittanceStore()
const currentQuittance = computed(()=>quittanceStore.currentQuittance)
const policeQuittance = computed(()=>currentQuittance.value?.police)
const natureOffre = computed(()=>policeQuittance.value?.natureOffre)
const isFacultative = computed(()=> natureOffre.value?.isFacultative)
const isProportionnelle = computed(()=> natureOffre.value?.isProportionnelle)
const isEdp = computed(()=> natureOffre.value?.isEdp)

console.log(' __________________ TQuittanceVueSynoptique ____________________ ')
console.log(' policeQuittance   :',policeQuittance.value)
console.log(' natureOffre       : ',natureOffre.value)
console.log(' isFacultative     : ',isFacultative.value)
console.log(' isProportionnelle : ',isProportionnelle.value)
</script>


<template>
  <TLayoutModule
    :show-bottom="false"   
    leftSize="35%"
    :show-top="false"
    >
          <template #left>
                <div class="flex flex-col gap-2">
                        <TFichePolice />
                        <TFicheQuittance />
                </div>

          </template>  

           <template #default>
                <TTab v-model="active" variant="underline" size="md">
                            <!--TTabItem value="accueil"      label="Accueil"    /-->
                            <TTabItem value="bordereau"    label="Bordereau"  v-if="isFacultative"/>
                            <TTabItem value="placement"    label="Placement" />
                        
                            <TTabItem value="echeancePmd"  label="Echeance Pmd" v-if="!isProportionnelle" />
                            <TTabItem value="compte"       label="Compte"      v-if="!isFacultative"  />
                        
                            <TTabItem value="sinistre"      label="Sinistre"      />
                            <TTabItem value="noteDebitCredit"  label="Note Débit Crédit"    />
                            <TTabItem value="reglement"     label="Règlemenet"    />

                            <template #panels>
                                            <TTabPanel value="accueil">
                                           
                                            </TTabPanel>
                                            <TTabPanel value="bordereau" v-if="isFacultative">
                                                <Bordereaux />
                                            </TTabPanel>
                                            <TTabPanel value="echeancePmd" v-if="!isProportionnelle">
                                                <EcheancesPmd />
                                            </TTabPanel>
                                            <TTabPanel value="compte"  v-if="!isFacultative">
                                                    <Comptes/>
                                            </TTabPanel>  
                                            <TTabPanel value="placement">
                                                <QuittancePlacements />
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