import { apiClient } from '../api/api-client'
import type { LoginDto } from './types'

export interface User {
  id: number | string
  email: string
  nom: string
  role?: string
}

export interface LoginPayload {
  email: string
  password: string
  remember: boolean
}

export interface AuthResponse {
  user: User
  accessToken: string
}

const STORAGE_KEY = 'auth_token'

export const authService = {
 
  async login(payload: LoginPayload): Promise<any> {
    const loginPayload:LoginDto ={email: payload.email , password:payload.password}
    const { data } = await apiClient.post<any>('/auth/login', loginPayload)
    console.log("AuthService.login data:",data)
    if(data.accessToken){
      this.saveToken(data.accessToken, payload.remember)
    }else{
      this.clearToken()
    }
    return data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
    this.clearToken()
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },

  saveToken(token: string, remember = false): void {
    console.log("saveToken token:",token)
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(STORAGE_KEY, token)
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
  },

  clearToken(): void {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  },
}