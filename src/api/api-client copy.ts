// // lib/api-client.ts
// import { authService } from '@/auth'
// import axios from 'axios'

// export const apiClient = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   timeout: 15_000,
// })

// // Injecte le token sur chaque requête
// apiClient.interceptors.request.use((config) => {
//   const token =
//     localStorage.getItem('access_token') ??
//     sessionStorage.getItem('access_token')
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

// // Gestion globale des erreurs + refresh token sur 401
// let isRefreshing = false
// let failedQueue: Array<{
//   resolve: (value?: unknown) => void
//   reject: (reason?: unknown) => void
// }> = []

// const processQueue = (error: unknown | null, token: string | null = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) prom.reject(error)
//     else prom.resolve(token)
//   })
//   failedQueue = []
// }

// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject })
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`
//             return apiClient(originalRequest)
//           })
//           .catch((err) => Promise.reject(err))
//       }

//       originalRequest._retry = true
//       isRefreshing = true

//       try {
//         const { authService } = await import('../auth/auth.service')
//         const newToken = await authService.refreshToken()
//         processQueue(null, newToken)
//         originalRequest.headers.Authorization = `Bearer ${newToken}`
//         return apiClient(originalRequest)
//       } catch (refreshError) {
//         processQueue(refreshError, null)
//         authService.clearStorage()
//         window.location.href = '/login'
//         return Promise.reject(refreshError)
//       } finally {
//         isRefreshing = false
//       }
//     }

//     return Promise.reject(error)
//   },
// )