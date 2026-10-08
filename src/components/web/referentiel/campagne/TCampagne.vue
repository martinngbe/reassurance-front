<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreSousModule from '@/components/utilitaire/TTitreSousModule.vue';
import Campagnes from './Campagnes.vue';


</script>

<template>
  <TLayoutModule
    topSize="35px"
    :show-left="false"
    :top-fixe="true"
    >
    <!-- <template #header>
      <TTitreSousModule libelle="Campagne"/>
    </template> -->

    <template #default>
          <Campagnes/>
    </template>

  </TLayoutModule>
</template>