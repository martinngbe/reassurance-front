<script setup lang="ts">
import TAlert from '@/composants/display/TAlert.vue';
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue';


</script>

<template>
  <TLayoutModule
    :show-bottom="false"
    :show-left="false"
    :show-top="false"
    >
    

    <template #default>
            <div  class="flex w-full  p-24 h-full items-center justify-center">                 
                  <TAlert variant="info">
                      <p class="text-2xl font-bold">En Construction ...</p> 
                  </TAlert> 
            </div>
    </template>

  </TLayoutModule>
</template>