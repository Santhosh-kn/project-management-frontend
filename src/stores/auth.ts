import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { User, LoginCredentials, RegisterData } from '@/types/models'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(
    localStorage.getItem('token') || sessionStorage.getItem('token')
  )
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Getters
  // Always check storage to ensure we have the latest token state
  const isAuthenticated = computed(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (storedToken && !token.value) {
      token.value = storedToken // Sync the ref if it's out of sync
    }
    return !!storedToken
  })
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager' || user.value?.role === 'admin')
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')

  // Actions
  async function login(credentials: LoginCredentials, rememberMe: boolean = false) {
    try {
      loading.value = true
      error.value = null
      
      const response = await authApi.login(credentials)
      
      // Store token and user - backend returns response.data.token and response.data.user
      token.value = response.data.token
      user.value = response.data.user
      
      if (rememberMe) {
        // Store in localStorage if remember me is checked
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('rememberMe', 'true')
      } else {
        // Store in sessionStorage if remember me is not checked
        sessionStorage.setItem('token', response.data.token)
        sessionStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.removeItem('rememberMe')
      }
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterData) {
    try {
      loading.value = true
      error.value = null
      
      const response = await authApi.register(data)
      
      // Store token and user
      token.value = response.data.token
      user.value = response.data.user
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      loading.value = true
      await authApi.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear everything
      user.value = null
      token.value = null
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('rememberMe')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      
      loading.value = false
      
      // Return true to indicate successful logout
      return true
    }
  }

  async function fetchUser() {
    try {
      loading.value = true
      const response = await authApi.me()
      user.value = response.data.user
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch user'
      throw err
    } finally {
      loading.value = false
    }
  }

  function initializeAuth() {
    // Try to load user from localStorage or sessionStorage
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (err) {
        console.error('Failed to parse stored user:', err)
      }
    }
  }

  // Initialize on store creation
  initializeAuth()

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    isManager,
    userName,
    userEmail,
    // Actions
    login,
    register,
    logout,
    fetchUser,
    initializeAuth,
  }
})
