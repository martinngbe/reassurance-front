<script setup lang="ts">
import TLayoutModule from '@/components/layout/TLayoutModule.vue'
import TTitreSousModule from '@/components/utilitaire/TTitreSousModule.vue';



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