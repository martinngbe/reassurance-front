<script setup lang="ts">

defineProps<{
  libelle: string
}>()

</script>   
 <template>

     <div class="m-1 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-neutral-200 dark:bg-slate-800  shadow-sm">
        <span class="uppercase font-bold text-2xl text-primary-600 dark:text-primary-400">{{ libelle }}</span>
      </div>
  
 </template>     
      
     