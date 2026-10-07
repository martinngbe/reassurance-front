// // lib/auth/auth.store.ts
// import { computed, reactive, readonly } from 'vue'
// import { authService } from './auth.service'
// import type {
//   AuthState,
//   AuthUser,
//   LoginPayload,
//   RegisterPayload,
//   AuthProvider,
// } from './types'

// const state = reactive<AuthState>({
//   user: authService.getUser(),
//   accessToken: authService.getTokens().accessToken,
//   refreshToken: authService.getTokens().refreshToken,
//   isAuthenticated: !!authService.getTokens().accessToken,
//   isLoading: false,
//   error: null,
// })

// export const authStore = {
//   /* ---------- Getters réactifs ---------- */
//   state: readonly(state),
//   user: computed(() => state.user),
//   isAuthenticated: computed(() => state.isAuthenticated),
//   isLoading: computed(() => state.isLoading),
//   error: computed(() => state.error),

//   /* ---------- Actions ---------- */
//   async login(payload: LoginPayload): Promise<AuthUser> {
//     state.isLoading = true
//     state.error = null
//     try {
//       const response = await authService.login(payload)
//       state.user = response.user
//       state.accessToken = response.tokens.accessToken
//       state.refreshToken = response.tokens.refreshToken ?? null
//       state.isAuthenticated = true
//       return response.user
//     } catch (err: any) {
//       const message =
//         err?.response?.data?.message ??
//         err?.message ??
//         'Erreur de connexion.'
//       state.error = message
//       throw new Error(message)
//     } finally {
//       state.isLoading = false
//     }
//   },

//   async register(payload: RegisterPayload): Promise<AuthUser> {
//     state.isLoading = true
//     state.error = null
//     try {
//       const response = await authService.register(payload)
//       state.user = response.user
//       state.accessToken = response.tokens.accessToken
//       state.refreshToken = response.tokens.refreshToken ?? null
//       state.isAuthenticated = true
//       return response.user
//     } catch (err: any) {
//       state.error = err?.response?.data?.message ?? "Erreur lors de l'inscription."
//       throw err
//     } finally {
//       state.isLoading = false
//     }
//   },

//   async logout(): Promise<void> {
//     state.isLoading = true
//     try {
//       await authService.logout()
//     } finally {
//       state.user = null
//       state.accessToken = null
//       state.refreshToken = null
//       state.isAuthenticated = false
//       state.isLoading = false
//     }
//   },

//   async refreshSession(): Promise<void> {
//     try {
//       const accessToken = await authService.refreshToken()
//       state.accessToken = accessToken
//     } catch {
//       await this.logout()
//     }
//   },

//   async fetchCurrentUser(): Promise<void> {
//     if (!state.accessToken) return
//     try {
//       state.user = await authService.me()
//     } catch {
//       await this.logout()
//     }
//   },

//   // async socialLogin(provider: AuthProvider): Promise<void> {
//   //   const { url } = await authService.socialLogin(provider)
//   //   window.location.href = url
//   // },

//   // async handleSocialCallback(provider: AuthProvider, code: string): Promise<void> {
//   //   state.isLoading = true
//   //   state.error = null
//   //   try {
//   //     const response = await authService.socialCallback(provider, code)
//   //     state.user = response.user
//   //     state.accessToken = response.tokens.accessToken
//   //     state.refreshToken = response.tokens.refreshToken ?? null
//   //     state.isAuthenticated = true
//   //   } catch (err: any) {
//   //     state.error = err?.response?.data?.message ?? 'Erreur OAuth.'
//   //     throw err
//   //   } finally {
//   //     state.isLoading = false
//   //   }
//   // },

//   clearError(): void {
//     state.error = null
//   },
// }