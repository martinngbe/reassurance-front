<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue';


</script>

<template>
  <TLayoutModule
    topSize="55px"
    :show-left="false"
    >
    <template #header>
     <TTitreSousModule libelle="En Construction"/>
    </template>

    <template #default>
          

    </template>

  </TLayoutModule>
</template>