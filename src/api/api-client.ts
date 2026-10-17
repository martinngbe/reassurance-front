import { useToast } from '@/components/toast/useToast'
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token')
  //console.log("apiClient.interceptors.request token:",token)  
  if (token) {
    //config.headers.Authorization = `Bearer ${token}`
     // ✅ Utiliser .set() au lieu de l'assignation directe
    config.headers.set('Authorization', `Bearer ${token}`)
    // console.log("config:",config)
    // console.log("config.headers:",config.headers)
    // console.log("config.headers.Authorization:",config.headers.Authorization)
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
      const {info, error: showError } = useToast()

    // Détecte une coupure réseau pure (pas de réponse du serveur)
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      showError(
        'Impossible de contacter le serveur. Vérifiez votre connexion.',
        'Erreur réseau',
        { duration: 4000, closable: true } // Persistant = { duration: 0, closable: false }
      )
    } 
    // Détecte un timeout (serveur trop lent ou bloqué)
    else if (error.code === 'ECONNABORTED') {
      showError('Le serveur a mis trop de temps à répondre.', 'Timeout',{ duration: 4000, closable: true })
    }
    // Détecte une erreur serveur (500, 502, 503...)
    else if (error.response && error.response.status >= 500) {
      showError('status=500 : Le serveur rencontre des difficultés. Réessayez plus tard.', 'Erreur serveur',{ duration: 4000, closable: true })
    }





    const url = error.response?.config.url
    //console.log("url:",url)
    const dataResult = error.response?.data
    const isExisteLoginMessageErreur = url=="/auth/login" && dataResult && !dataResult.succes
    //console.log("isExisteLoginMessageErreur:",isExisteLoginMessageErreur)
    if(isExisteLoginMessageErreur)
     return Promise.resolve(error.response)
   
    if (error.response?.status === 401  ) {
    //  info("Connexion réinitialisée", "Information")
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)