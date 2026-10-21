import { createApp } from 'vue'
import 'primeicons/primeicons.css';
import App from './App.vue'
import './assets/tailwind.css'
import './assets/css/custom-scrollbar.css'
import { useTheme } from './theme/useTheme'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { createPinia } from 'pinia';

useTheme() // applique la thème sauvegardée au démarrage
// createApp(App).mount('#app')
const app = createApp(App)
const pinia = createPinia() // ← 2. Créer l'instance Pinia
// ← 3. ENREGISTRER PINIA AVANT LE MOUNT (ordre important !)
app.use(pinia)

// Enregistrer le plugin Vue Query
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes avant de considérer les données comme "périmées"
        retry: 1, // Nombre de tentatives en cas d'erreur
        refetchOnWindowFocus: false, // Désactiver le refetch au focus (optionnel)
      },
    },
  },
})
// Ajouter les DevTools uniquement en développement
if (import.meta.env.DEV) {
  app.component('VueQueryDevtools', VueQueryDevtools)
}

app.mount('#app')
