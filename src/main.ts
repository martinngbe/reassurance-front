import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import { useTheme } from './theme/useTheme'

useTheme() // applique la thème sauvegardée au démarrage
createApp(App).mount('#app')
