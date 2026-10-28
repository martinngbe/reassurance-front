<script setup lang="ts">
import TTab from '@/composants/tab/TTab.vue';
import TTabItem from '@/composants/tab/TTabItem.vue';
import TTabPanel from '@/composants/tab/TTabPanel.vue';
import { useTempQuittanceStore } from '@/services/quittances/temp-quittance/temp-quittance.store';
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store.ts';
import TFicheTempPolice from '@/web/polices/temp-police/ TFicheTempPolice.vue';
import TFicheTempQuittanceCapitaux from '@/web/quittances/temp-quittance/fiche/ TFicheTempQuittanceCapitaux.vue';
import TFicheTempQuittanceCourtage from '@/web/quittances/temp-quittance/fiche/ TFicheTempQuittanceCourtage.vue';
import TFicheTempQuittanceEmission from '@/web/quittances/temp-quittance/fiche/ TFicheTempQuittanceEmission.vue';
import TFicheTempQuittancePrimes from '@/web/quittances/temp-quittance/fiche/ TFicheTempQuittancePrimes.vue';
import TFicheTempQuittanceTaxesEtTaux from '@/web/quittances/temp-quittance/fiche/ TFicheTempQuittanceTaxesEtTaux.vue';
import { computed, ref } from 'vue';
import AffaireNouvelleValidationFinale from './AffaireNouvelleValidationFinale.vue';

const active = ref('police')
const tempPoliceStore = useTempPoliceStore()
const currentTempPolice = computed(()=> tempPoliceStore.currentTempPolice)


const tempQuittanceStore = useTempQuittanceStore()
const currentTempQuittance = computed(()=> tempQuittanceStore.currentTempQuittance)

</script>

<template>
 

   <TTab v-model="active" variant="underline" size="md">
      <TTabItem value="police"      label="Police"        />
      <TTabItem value="emission"    label="Emission"      />
      <TTabItem value="capitaux"    label="Capitaux"      />
      <TTabItem value="primes"      label="Primes"        />
      <TTabItem value="tauxTaxes"   label="Taux et Taxes" />
      <TTabItem value="courtage"    label="Courtage"      />
      <TTabItem value="validation"  label="Validation Finale"    />

      <template #panels>
        <TTabPanel value="police">
            <TFicheTempPolice
                v-if="currentTempPolice"
                :colums="3"
                :show-header="false"
                :police="currentTempPolice"
                />
        </TTabPanel>
        <TTabPanel value="emission">
              <TFicheTempQuittanceEmission
                v-if="currentTempQuittance"
                :colums="4"
                :show-header="false"
                :quittance="currentTempQuittance"
                />
        </TTabPanel>
        <TTabPanel value="capitaux">
              <TFicheTempQuittanceCapitaux
                v-if="currentTempQuittance"
                :colums="3"
                :show-header="false"
                :quittance="currentTempQuittance"
                />
        </TTabPanel>
        <TTabPanel value="primes">
          <TFicheTempQuittancePrimes
                v-if="currentTempQuittance"
                :colums="3"
                :show-header="false"
                :quittance="currentTempQuittance"
                />
        </TTabPanel>  
        <TTabPanel value="tauxTaxes">
            <TFicheTempQuittanceTaxesEtTaux
                v-if="currentTempQuittance"
                :colums="3"
                :show-header="false"
                :quittance="currentTempQuittance"
                />
        </TTabPanel>       
        <TTabPanel value="courtage">
              <TFicheTempQuittanceCourtage
                v-if="currentTempQuittance"
                :colums="3"
                :show-header="false"
                :quittance="currentTempQuittance"
                />
        </TTabPanel>        
        <TTabPanel value="validation">
              <AffaireNouvelleValidationFinale />
        </TTabPanel>

      </template>
    </TTab>




</template>