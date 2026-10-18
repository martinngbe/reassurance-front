<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue';
import Campagnes from './Campagnes.vue';


</script>

<template>
  <TLayoutModule   
    :show-bottom="false"
    :show-top="false"
    :show-left="false"
    >

    <template #default>
          <Campagnes/>
    </template>

  </TLayoutModule>
</template>