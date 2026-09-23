<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreSousModule from '@/components/utilitaire/TTitreSousModule.vue';
import FacultativeFooter from './FacultativeFooter.vue';
import FacultativeMain from './FacultativeMain.vue';



</script>

<template>
  <TLayoutModule
    bottomSize="50%"
    :show-left="false"
    :show-top="false"
    >
   

    <template #default>
          <div class="flex-col m-2 h-full w-full">
             <TTitreSousModule libelle="Facultative"/>
             <FacultativeMain /> 
          </div>

    </template>

    <template #footer>
      <FacultativeFooter/>
    </template>

  </TLayoutModule>
</template>