<script setup lang="ts">
import { useAuthStore } from '@/auth/auth.store';
import TToolTip from '@/composants/display/TToolTip.vue';
import ThemePicker from '@/composants/theme/ThemePicker.vue';
import { useNetworkStatus } from '@/composants/toast/useNetworkStatus.ts';
import TIndicateurConnexion from '@/composants/utilitaire/TIndicateurConnexion.vue';
import { computed } from 'vue';
const { isOnline } = useNetworkStatus()
const authStore = useAuthStore()
const  currentUserAuth = computed(()=>authStore.currentUserAuth)  
</script>

<template >
    <div class="flex h-full  justify-between px-4 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <!-- Indicateur de connexion -->
      <TIndicateurConnexion :isOnline="isOnline" />
      <span>© 2026 A Free K Soft — Tous droits réservés</span>
      
    
      <div class="flex items-center gap-2.5">        
          <TToolTip content="Choisir la couleur primaire" position="bottom">
            <ThemePicker />
          </TToolTip>
      </div>
      <span class="hidden sm:inline">
        Connecté en tant que 
          <p v-if="currentUserAuth">{{ currentUserAuth.nom +' ' + currentUserAuth.prenoms}}</p>
          <p v-else>Admin Demo </p>
        
        
      </span>
    </div>
</template>