import apiClient from './client'
import type { ApiResponse } from '@/types/api'
import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types/models'

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  // Register
  register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  // Logout
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },

  // Get current user
  me: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  // Refresh token
  refresh: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },

  // Update profile
  updateProfile: async (data: { name?: string; email?: string; bio?: string; phone?: string; location?: string }): Promise<ApiResponse<User>> => {
    const response = await apiClient.put('/auth/profile', data)
    return response.data
  },

  // Change password
  changePassword: async (data: { current_password: string; new_password: string; new_password_confirmation: string }): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/change-password', data)
    return response.data
  },

  // Update settings
  updateSettings: async (data: any): Promise<ApiResponse<null>> => {
    const response = await apiClient.put('/auth/settings', data)
    return response.data
  },
}
