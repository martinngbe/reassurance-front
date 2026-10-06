// lib/api-client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Intercepteur de requête (ex: ajout du JWT)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') // Ou via un cookie HttpOnly
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Intercepteur de réponse (ex: gestion globale des 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers la login ou rafraîchir le token
    }
    return Promise.reject(error)
  }
)