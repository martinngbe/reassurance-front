<script setup lang="ts">
import TToolTip from '../display/TToolTip.vue';
import ThemePicker from '../theme/ThemePicker.vue';


</script>

<template >
    <div class="flex h-full items-center justify-between px-4 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <span>© 2026 A Free K Soft — Tous droits réservés</span>
      <div class="flex items-center gap-2.5">        
          <TToolTip content="Choisir la couleur primaire" position="bottom">
            <ThemePicker />
          </TToolTip>
      </div>
      <span class="hidden sm:inline">
        Connecté en tant que <strong class="text-slate-700 dark:text-slate-300">Admin Demo</strong>
      </span>
    </div>
</template>