import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Intercepte toutes les requêtes commençant par /api
      '/api': {
        // Adapte le port si ton NestJS n'écoute pas sur le 3000
        // Si api.reaas.local est déjà un reverse proxy (Nginx/Traefik) sur le port 80/443, mets juste 'http://api.reaas.local'
        target: 'http://reass.local', 
        changeOrigin: true,
        secure: false, // Mettre à true si tu utilises du HTTPS en local
        ws: true, // Important : active le proxy pour les WebSockets (si tu utilises Socket.io avec NestJS)
        
        // Décommente la ligne ci-dessous si ton backend NestJS n'a PAS de préfixe global '/api'
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      }
    }
  }
})



