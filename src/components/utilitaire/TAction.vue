<script  setup lang="ts">
import TToolTip from '@/components/display/TToolTip.vue';



</script>

<template>
  <div 
    class="flex flex-wrap gap-4 sm:gap-3 p-3 sm:p-4  transition-colors duration-300"
  >
    <TToolTip content="Nouveau" position="bottom">
            <i class="pi pi-plus pl-3 pr-3 cursor-pointer" style="color: green;"></i>
    </TToolTip>
      
    <TToolTip content="Modifier" position="bottom">
            <i class="pi pi-pencil  pl-3 pr-3  cursor-pointer" style="color: blue;"></i>
    </TToolTip>
      <TToolTip content="Suppimer" position="bottom">
      <i class="pi pi-trash  pl-3 pr-3  cursor-pointer"  style="color: red;"></i>
    </TToolTip>
      <TToolTip content="Imprimer" position="bottom">
      <i class="pi pi-print  pl-3 pr-3  cursor-pointer"  style="color:  #708090;"></i>
    </TToolTip>  
   
  </div>
</template>

