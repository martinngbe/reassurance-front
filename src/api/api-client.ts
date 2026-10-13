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
    console.log("<<<<<<< error.response:",error.response)
    console.log("<<<<<<< error.response.config:",error.response.config)
    console.log("<<<<<<< error.response.config.url:",error.response.config.url)
    console.log("<<<<<<< error.response.data:",error.response.data)
    const url = error.response?.config.url
    console.log("url:",url)
    const dataResult = error.response?.data
    const isExisteLoginMessageErreur = url=="/auth/login" && dataResult && !dataResult.succes
    console.log("isExisteLoginMessageErreur:",isExisteLoginMessageErreur)
    if(isExisteLoginMessageErreur)
      return Promise.resolve(error.response)

    if (error.response?.status === 401  ) {
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)