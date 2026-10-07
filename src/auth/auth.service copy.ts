// // lib/auth/auth.service.ts
// import { apiClient } from '../api/api-client' 
// import { storage } from './storage'
// import type {
//   AuthResponse,
//   LoginPayload,
//   RegisterPayload,
//   AuthUser,
//   AuthProvider,
// } from './types'

// export const authService = {
//   // Délègue tout à storage
//   saveTokens: storage.saveTokens,
//   saveUser: storage.saveUser,
//   getTokens: storage.getTokens,
//   getUser: storage.getUser,
//   clearStorage: storage.clear,

//   async login(payload: LoginPayload): Promise<AuthResponse> {
//     const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
//     this.saveTokens(data.tokens.accessToken, data.tokens.refreshToken, payload.remember)
//     this.saveUser(data.user, payload.remember)
//     return data
//   },

//   async register(payload: RegisterPayload): Promise<AuthResponse> {
//     const { data } = await apiClient.post<AuthResponse>('/auth/register', payload)
//     this.saveTokens(data.tokens.accessToken, data.tokens.refreshToken, true)
//     this.saveUser(data.user, true)
//     return data
//   },

//   async logout(): Promise<void> {
//     try {
//       await apiClient.post('/auth/logout')
//     } finally {
//       this.clearStorage()
//     }
//   },

//   async refreshToken(): Promise<string> {
//     const { refreshToken } = this.getTokens()
//     if (!refreshToken) throw new Error('No refresh token available')
//     const { data } = await apiClient.post<{ accessToken: string }>(
//       '/auth/refresh',
//       { refreshToken },
//     )
//     this.saveTokens(data.accessToken, refreshToken)
//     return data.accessToken
//   },

//   async me(): Promise<AuthUser> {
//     const { data } = await apiClient.get<AuthUser>('/auth/me')
//     this.saveUser(data)
//     return data
//   },

//   async forgotPassword(email: string): Promise<void> {
//     await apiClient.post('/auth/forgot-password', { email })
//   },

//   async resetPassword(token: string, password: string): Promise<void> {
//     await apiClient.post('/auth/reset-password', { token, password })
//   },

//   // async socialLogin(provider: AuthProvider): Promise<{ url: string }> {
//   //   const { data } = await apiClient.get<{ url: string }>(`/auth/${provider}/redirect`)
//   //   return data
//   // },

//   // async socialCallback(provider: AuthProvider, code: string): Promise<AuthResponse> {
//   //   const { data } = await apiClient.post<AuthResponse>(
//   //     `/auth/${provider}/callback`,
//   //     { code },
//   //   )
//   //   this.saveTokens(data.tokens.accessToken, data.tokens.refreshToken, true)
//   //   this.saveUser(data.user, true)
//   //   return data
//   // },
// }