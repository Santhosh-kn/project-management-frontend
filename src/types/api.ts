// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  meta: {
    timestamp: string
    [key: string]: any
  }
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  message?: string
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    timestamp: string
  }
  links?: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
  meta: {
    timestamp: string
    error_code?: string
  }
}

// Query Parameters
export interface QueryParams {
  page?: number
  per_page?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  [key: string]: any
}
