<script setup lang="ts">

defineProps<{
  libelle: string
}>()

</script>   
 <template>

     <div class="m-2 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-neutral-100 dark:bg-slate-800  shadow-sm">
        <span class="text-primary-600 uppercase font-bold text-4xl dark:text-primary-400">{{ libelle }}</span>
      </div>

 </template>     
      
     