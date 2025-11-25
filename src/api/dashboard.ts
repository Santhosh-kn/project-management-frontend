import apiClient from './client'
import type { ApiResponse } from '@/types/api'

export interface DashboardStats {
  total_projects: number
  active_projects: number
  total_tasks: number
  my_tasks: number
  completed_tasks: number
  pending_tasks: number
  overdue_tasks: number
  tasks_by_status: {
    todo: number
    in_progress: number
    review: number
    done: number
  }
  tasks_by_priority: {
    low: number
    medium: number
    high: number
    critical: number
  }
}

export interface RecentProject {
  id: number
  name: string
  slug: string
  status: string
  priority: string
  owner: {
    id: number
    name: string
    email: string
  }
  members_count: number
  created_at: string
  updated_at: string
}

export interface RecentTask {
  id: number
  project_id: number
  project_name: string
  title: string
  status: string
  priority: string
  due_date: string | null
  assigned_to: {
    id: number
    name: string
    email: string
  } | null
  created_by: {
    id: number
    name: string
    email: string
  }
  created_at: string
  updated_at: string
}

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats')
  return response.data.data
}

/**
 * Get recent projects
 */
export const getRecentProjects = async (): Promise<RecentProject[]> => {
  const response = await apiClient.get<ApiResponse<RecentProject[]>>('/dashboard/recent-projects')
  return response.data.data
}

/**
 * Get recent tasks
 */
export const getRecentTasks = async (): Promise<RecentTask[]> => {
  const response = await apiClient.get<ApiResponse<RecentTask[]>>('/dashboard/recent-tasks')
  return response.data.data
}
