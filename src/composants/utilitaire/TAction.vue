<script  setup lang="ts">
import TToolTip from '@/composants/display/TToolTip.vue';

defineProps<{ 
  activeImpression?: boolean
  activeNouveau?: boolean
  activeModifier?: boolean
  activeSupprimer?: boolean

  // /////////////////
  masqueImpression?: boolean
  masqueNouveau?: boolean
  masqueModifier?: boolean
  masqueSupprimer?: boolean
}>()
const emit = defineEmits<{
  (e: 'nouveau'): void
  (e: 'modifier'): void
  (e: 'supprimer'): void
  (e: 'imprimer'): void
}>()

</script>

<template>
  <div 
    class="flex flex-wrap gap-4 sm:gap-3 p-3 sm:p-4  transition-colors duration-300"
  >
    <TToolTip content="Nouveau" position="bottom" v-if="!masqueNouveau">
           
        <i class="pi pi-plus pl-3 pr-3 cursor-pointer 
           transition-transform duration-200 hover:scale-225" 
            style="color: #02f75c;"
              @click="emit('nouveau')"
            >
            </i>
    </TToolTip>
      
    <TToolTip content="Modifier" position="bottom"  v-if="!masqueModifier">
            <i v-if="activeModifier" class="pi pi-pencil  pl-3 pr-3  
            cursor-pointer  transition-transform duration-200 hover:scale-225" style="color: blue;"
             @click="emit('modifier')"
             >

            </i>
            <i v-else class="pi pi-pencil  pl-3 pr-3 " style="color: gray;"></i>
    </TToolTip>
      <TToolTip content="Suppimer" position="bottom"  v-if="!masqueSupprimer">
          <i v-if="activeSupprimer" class="pi pi-trash  pl-3 pr-3  
          cursor-pointer  transition-transform duration-200 hover:scale-225"  style="color: red ;"
           @click="emit('supprimer')"
          ></i>
          <i v-else class="pi pi-trash  pl-3 pr-3 "  style="color: gray;"></i>
      </TToolTip>
      <TToolTip content="Imprimer" position="bottom"  v-if="!masqueImpression">
        <i  v-if="activeImpression" 
           class="pi pi-print pl-3 pr-3 cursor-pointer transition-transform duration-200 hover:scale-225" 
           @click="emit('imprimer')"
        ></i>
        <i v-else class="pi pi-print  pl-3 pr-3  "  style="color: gray;"></i>
      </TToolTip>  
   
  </div>
</template>

