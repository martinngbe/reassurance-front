import { ref, computed } from 'vue'
import { authService, type User, type LoginPayload } from './auth.service'

const user = ref<User | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useAuth() {
  const isAuthenticated = computed(() => !!authService.getToken())

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null
    try {
      const response = await authService.login(payload)
      user.value = response.user
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? 'Erreur de connexion'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await authService.logout()
    } finally {
      user.value = null
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!authService.getToken()) return
    try {
      user.value = await authService.me()
    } catch {
      authService.clearToken()
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    fetchUser,
  }
}