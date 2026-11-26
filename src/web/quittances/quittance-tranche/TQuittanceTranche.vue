<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue';

import {  ref } from 'vue';
import QuittanceTranches from './QuittanceTranches.vue';


const isPatientez = ref(false)
let searchTimeout: number | undefined
const actualiseFiche=()=>{
    isPatientez.value=true
    window.clearTimeout(searchTimeout)
    searchTimeout = window.setTimeout(() => {
            isPatientez.value=false
            //quittanceTrancheStore.clearSelection()
    }, 300)
}

</script>


<template>
  <TLayoutModule
    :show-bottom="false"
    :show-left="false"
    :show-top="false"
    >    
       
        <template #default>
              <QuittanceTranches @form-success="actualiseFiche" />
        </template>

  </TLayoutModule>

</template>