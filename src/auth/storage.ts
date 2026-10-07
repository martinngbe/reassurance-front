// lib/auth/storage.ts
import type { AuthUser } from './types'

const KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
  USER: 'auth_user',
} as const

/**
 * Couche de persistance pure — aucune dépendance.
 * Résout le bug TDZ car ce module n'importe rien d'autre.
 */
export const storage = {
  saveTokens(access: string, refresh?: string, remember = false): void {
    const s = remember ? localStorage : sessionStorage
    s.setItem(KEYS.ACCESS, access)
    if (refresh) s.setItem(KEYS.REFRESH, refresh)
  },

  saveUser(user: AuthUser, remember = false): void {
    const s = remember ? localStorage : sessionStorage
    s.setItem(KEYS.USER, JSON.stringify(user))
  },

  getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken:
        localStorage.getItem(KEYS.ACCESS) ?? sessionStorage.getItem(KEYS.ACCESS),
      refreshToken:
        localStorage.getItem(KEYS.REFRESH) ?? sessionStorage.getItem(KEYS.REFRESH),
    }
  },

  getUser(): AuthUser | null {
    const raw =
      localStorage.getItem(KEYS.USER) ?? sessionStorage.getItem(KEYS.USER)
    if (!raw) return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  },

  clear(): void {
    Object.values(KEYS).forEach((k) => {
      localStorage.removeItem(k)
      sessionStorage.removeItem(k)
    })
  },
}