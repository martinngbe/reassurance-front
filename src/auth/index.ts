// lib/auth/index.ts
export { useAuth } from './useAuth'
export { authService } from './auth.service'

export type {
  AuthUser,
  AuthState,
  AuthResponse,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  AuthProvider,
} from './types'

//export { authStore } from './auth.store'