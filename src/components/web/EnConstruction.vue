<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreSousModule from '@/components/utilitaire/TTitreSousModule.vue';


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