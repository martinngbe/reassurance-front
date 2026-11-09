<script  setup lang="ts">
import TToolTip from '@/composants/display/TToolTip.vue';
import { computed } from 'vue';

const props = defineProps<{ 
  activeImpression?: boolean
  activeNouveau?: boolean
  activeModifier?: boolean
  activeSupprimer?: boolean
  activeActualiser?: boolean

  // /////////////////
  masqueImpression?: boolean
  masqueNouveau?: boolean
  masqueModifier?: boolean
  masqueSupprimer?: boolean
  masqueActualiser?: boolean

  // /////////////////
  contentImpression?: string
  contentNouveau?: string
  contentModifier?: string
  contentSupprimer?: string
  contentActualiser?: string
}>()
const emit = defineEmits<{
  (e: 'nouveau'): void
  (e: 'modifier'): void
  (e: 'supprimer'): void
  (e: 'imprimer'): void
  (e: 'actualiser') : void
}>()
 const nouveauContente = computed(()=> props.contentNouveau?? "Nouveau" )
</script>

<template>
  <div 
    class="flex flex-wrap gap-4 sm:gap-3 p-3 sm:p-4  transition-colors duration-300"
  >
    <TToolTip :content=nouveauContente position="bottom" v-if="!masqueNouveau">
           
        <i class="pi pi-plus pl-3 pr-3 cursor-pointer 
           transition-transform duration-200 hover:scale-225" 
            style="color: #02f75c;"
              @click="emit('nouveau')"
            >
            </i>
    </TToolTip>
      
    <TToolTip content="Modifier" position="bottom"  v-if="!masqueModifier">
            <i v-if="activeModifier" class="pi pi-pencil  pl-3 pr-3  
            cursor-pointer  transition-transform duration-200 hover:scale-225 text-blue-500"
             @click="emit('modifier')"
             />
          
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

    <TToolTip content="Actualiser" position="bottom"  v-if="!masqueActualiser">
        <i  v-if="activeActualiser" 
           class="pi pi-refresh pl-3 pr-3 cursor-pointer text-primary-600  dark:text-primary-400 transition-transform duration-200 hover:scale-225" 
           @click="emit('actualiser')"
        ></i>
        <i v-else class="pi pi-refresh  pl-3 pr-3  text-gray-500" ></i>
      </TToolTip> 
  </div>
</template>

