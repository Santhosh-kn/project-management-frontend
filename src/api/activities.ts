import apiClient from './client'
import type { ApiResponse } from '@/types/api'

export interface Activity {
  id: number
  description: string
  subject_type: string
  subject_id: number
  user: {
    id: number
    name: string
    email: string
  } | null
  properties: any
  created_at: string
}

/**
 * Get activity feed for authenticated user
 */
export const getActivities = async (page: number = 1): Promise<{ data: Activity[], meta: any }> => {
  const response = await apiClient.get<ApiResponse<Activity[]>>('/activities', {
    params: { page }
  })
  return {
    data: response.data.data,
    meta: response.data.meta
  }
}

/**
 * Get activities for a specific project
 */
export const getProjectActivities = async (projectId: number, page: number = 1): Promise<{ data: Activity[], meta: any }> => {
  const response = await apiClient.get<ApiResponse<Activity[]>>(`/projects/${projectId}/activities`, {
    params: { page }
  })
  return {
    data: response.data.data,
    meta: response.data.meta
  }
}

/**
 * Get activities for a specific task
 */
export const getTaskActivities = async (taskId: number, page: number = 1): Promise<{ data: Activity[], meta: any }> => {
  const response = await apiClient.get<ApiResponse<Activity[]>>(`/tasks/${taskId}/activities`, {
    params: { page }
  })
  return {
    data: response.data.data,
    meta: response.data.meta
  }
}
