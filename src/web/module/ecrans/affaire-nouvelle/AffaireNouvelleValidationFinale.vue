<script setup lang="ts">
import TAlert from '@/composants/display/TAlert.vue';
import TButton from '@/composants/forms/TButton.vue';
import { usePolices } from '@/services/polices/police/usePolice';
import { useTempQuittanceStore } from '@/services/quittances/temp-quittance/temp-quittance.store';
import { useTempPoliceStore } from '@/services/polices/temp-police/temp-police.store';
import type { PaginationParams } from '@/type/pagination';
import { computed, ref } from 'vue';
import { useTempPolices } from '@/services/polices/temp-police/useTempPolice';
import TPatientez from '@/composants/utilitaire/TPatientez.vue';
import { useToast } from '@/composants/toast/useToast';

const { success, error } = useToast()

const tempPoliceStore = useTempPoliceStore()
const currentTempPolice = computed(()=> tempPoliceStore.currentTempPolice)
const tempQuittanceStore = useTempQuittanceStore()
const currentTempQuittance = computed(()=> tempQuittanceStore.currentTempQuittance)

const isValidationFinaleOk = computed(()=>currentTempPolice.value && currentTempQuittance.value)


const params = computed<PaginationParams>(() => ({}))
const { transfererPolice } = useTempPolices(params)
const showPatientez = ref(false)
const executeValidationFinale = async ()=>{
  
  if(!currentTempPolice.value) return
  try {
    showPatientez.value=true
    console.log(" ------------  TRANSFERE DE DONNEES TEMP_POLICE ------")
    const police = await transfererPolice.mutateAsync(currentTempPolice.value.id)
    console.log(" police:",police)
   
    if(police && !police.success && police.message){
      error(police.message)
       showPatientez.value=false
      return
    }
    success("Opération effectuée avec succès",)
     showPatientez.value=false
    
  } catch (err) {
     showPatientez.value=false
      error(err as string)
    // Le backend renvoie 400 si la police n'a pas d'assuré, 404 si introuvable
    console.error('Transfert impossible', err)
  }

}

</script>

<template>
 
<div v-if="isValidationFinaleOk" class="flex w-full  p-24 h-full items-center justify-center">
  <TPatientez  v-if="showPatientez"/>
  <TButton v-else
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