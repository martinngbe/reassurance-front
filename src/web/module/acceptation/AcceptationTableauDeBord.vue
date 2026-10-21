<script setup lang="ts">
import TLayoutModule from '@/composants/layout/TLayoutModule.vue'
import TTitreSousModule from '@/composants/utilitaire/TTitreSousModule.vue';



</script>

<template>
  <TLayoutModule
    :showBottom=false
    :showTop=false
    :showLeft="false"
    >
     
  

  
    <template #default>
      <div class="flex-col m-2">
        <TTitreSousModule libelle="Tableau de bord"/> 
      </div>
      
    </template>

 

  </TLayoutModule>
</template>