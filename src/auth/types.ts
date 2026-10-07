// lib/auth/types.ts
export interface LoginDto {
  email: string
  password: string
}
export interface LoginPayload {
  email: string
  password: string
  remember: boolean
}

export interface RegisterPayload {
  nom: string
  email: string
  password: string
  civilite?: 'mme' | 'm' | 'np'
  pays?: string
}

export interface AuthUser {
  id: number | string
  email: string
  nom: string
  role?: string
  avatar?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresIn?: number // en secondes
}

export interface AuthResponse {
  user: AuthUser
  tokens: AuthTokens
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export type AuthProvider = 'google' | 'github' | 'facebook'