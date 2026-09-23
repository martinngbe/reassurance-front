import { createApp } from 'vue'
import 'primeicons/primeicons.css';
import App from './App.vue'
import './assets/tailwind.css'
import { useTheme } from './theme/useTheme'

useTheme() // applique la thème sauvegardée au démarrage
createApp(App).mount('#app')
