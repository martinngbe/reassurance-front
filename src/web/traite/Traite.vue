<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue';
import TraiteMain from './TraiteMain.vue';
import TraiteFooter from './TraiteFooter.vue';


</script>

<template>
  <TLayoutModule
    bottomSize="50%"
    :show-left="false"
    :show-top="false"
    >
    <template #header>
     
    </template>

    <template #default>
          <div class="flex-col m-2 h-full w-full">
             <TTitreSousModule libelle="Traité"/>
             <TraiteMain /> 
          </div>

    </template>

    <template #footer>
      <TraiteFooter/>
    </template>

  </TLayoutModule>
</template>