import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token')
  console.log("apiClient.interceptors.request token:",token)  
  if (token) {
    //config.headers.Authorization = `Bearer ${token}`
     // ✅ Utiliser .set() au lieu de l'assignation directe
    config.headers.set('Authorization', `Bearer ${token}`)
    console.log("config:",config)
    console.log("config.headers:",config.headers)
    console.log("config.headers.Authorization:",config.headers.Authorization)
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)