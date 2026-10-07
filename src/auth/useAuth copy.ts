// // lib/auth/useAuth.ts
// import { authStore } from './auth.store'
// import type { LoginPayload, RegisterPayload, AuthProvider } from './types'

// /**
//  * Composable principal d'authentification.
//  * Usage :
//  *   const { login, user, isAuthenticated } = useAuth()
//  */
// export function useAuth() {
//   return {
//     // État réactif
//     user: authStore.user,
//     isAuthenticated: authStore.isAuthenticated,
//     isLoading: authStore.isLoading,
//     error: authStore.error,

//     // Actions
//     login: (payload: LoginPayload) => authStore.login(payload),
//     register: (payload: RegisterPayload) => authStore.register(payload),
//     logout: () => authStore.logout(),
//     refreshSession: () => authStore.refreshSession(),
//     fetchCurrentUser: () => authStore.fetchCurrentUser(),
//     forgotPassword: (email: string) =>
//       import('./auth.service').then((m) => m.authService.forgotPassword(email)),
//     socialLogin: (provider: AuthProvider) => authStore.socialLogin(provider),
//     clearError: () => authStore.clearError(),
//   }
// }