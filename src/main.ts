import { createApp } from 'vue'
import 'primeicons/primeicons.css';
import App from './App.vue'
import './assets/tailwind.css'
import { useTheme } from './theme/useTheme'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

useTheme() // applique la thème sauvegardée au démarrage
// createApp(App).mount('#app')
const app = createApp(App)

// Enregistre le plugin globalement
//app.use(VueQueryPlugin)


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
