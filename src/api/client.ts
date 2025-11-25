import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, ApiError } from '@/types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor - Add auth token and start loading
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Start loading (will be handled by global loader component)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-request-start'))
    }
    
    return config
  },
  (error) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-request-end'))
    }
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally and stop loading
apiClient.interceptors.response.use(
  (response) => {
    // Stop loading
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-request-end'))
    }
    return response
  },
  async (error: AxiosError<ApiError>) => {
    // Stop loading
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-request-end'))
    }
    
    if (error.response) {
      // Token expired or unauthorized
      if (error.response.status === 401) {
        // Try to refresh the token
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token')
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          
          const newToken = response.data.data.token
          
          // Update token
          if (localStorage.getItem('token')) {
            localStorage.setItem('token', newToken)
          } else {
            sessionStorage.setItem('token', newToken)
          }
          
          // Retry the original request with new token
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${newToken}`
            return apiClient.request(error.config)
          }
        } catch (refreshError) {
          // Refresh failed - logout user
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          sessionStorage.removeItem('token')
          sessionStorage.removeItem('user')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
export { API_BASE_URL }
