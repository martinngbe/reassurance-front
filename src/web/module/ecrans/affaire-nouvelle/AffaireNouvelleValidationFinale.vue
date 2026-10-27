<script setup lang="ts">
import TAlert from '@/composants/display/TAlert.vue';
import TButton from '@/composants/forms/TButton.vue';
import { usePolices } from '@/services/police/usePolice';
import { useTempQuittanceStore } from '@/services/quittances/temp-quittance/temp-quittance.store';
import { useTempPoliceStore } from '@/services/temp-police/temp-police.store';
import type { PaginationParams } from '@/type/pagination';
import { computed, ref } from 'vue';


const tempPoliceStore = useTempPoliceStore()
const currentTempPolice = computed(()=> tempPoliceStore.currentTempPolice)
const tempQuittanceStore = useTempQuittanceStore()
const currentTempQuittance = computed(()=> tempQuittanceStore.currentTempQuittance)

const isValidationFinaleOk = computed(()=>currentTempPolice.value && currentTempQuittance.value)


const params = computed<PaginationParams>(() => ({}))
const { transfererPolice } = usePolices(params)

const executeValidationFinale = async ()=>{
   // executeAffaireNouvelle()
  if(!currentTempPolice.value) return
  try {
    console.log(" ------------  TRANSFERE DE DONNEES TEMP_POLICE ------")
    const police = await transfererPolice.mutateAsync(currentTempPolice.value.id)
    console.log(" police:",police)
  } catch (err) {
    // Le backend renvoie 400 si la police n'a pas d'assuré, 404 si introuvable
    console.error('Transfert impossible', err)
  }

}

</script>

<template>
 
<div v-if="isValidationFinaleOk" class="flex w-full  p-24 h-full items-center justify-center">
  <TButton 
    type="button"
    variant="solid" 
    size="2xl"
    @click="executeValidationFinale"
  > 
    <span class="text-xl font-bold uppercase cursor-pointer">VALIDATION FINALE</span> 
  </TButton>  
</div>

 
  <div class="w-full" v-else>
        <TAlert  variant="warning">
            <p class="text-xl"  v-if="!currentTempPolice">
              Saisissez d'abord la police svp ...
            </p >
             <p class="text-xl"  v-if="!currentTempQuittance">
              Saisissez l'affaire svp ...
            </p >
           
        </TAlert>
    </div>



</template>