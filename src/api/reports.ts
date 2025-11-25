import apiClient from './client'
import type { ApiResponse } from '@/types/api'

export interface ProjectProgress {
  project_id: number
  project_name: string
  total_tasks: number
  completion_percentage: number
  status_breakdown: {
    todo: number
    in_progress: number
    done: number
    blocked: number
  }
  priority_breakdown: {
    high: number
    medium: number
    low: number
  }
  overdue_tasks: number
}

export interface TeamMemberWorkload {
  user_id: number
  user_name: string
  user_email: string
  role: string
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  todo_tasks: number
  blocked_tasks: number
  completion_rate: number
}

export interface TeamWorkload {
  project_id: number
  project_name: string
  team_members: TeamMemberWorkload[]
}

export interface TrendDataPoint {
  date: string
  completed: number
  created: number
}

export interface CompletionTrends {
  project_id: number
  project_name: string
  date_range: {
    start: string
    end: string
    days: number
  }
  trends: TrendDataPoint[]
  summary: {
    total_completed: number
    total_created: number
    avg_completed_per_day: number
  }
}

export interface DashboardData {
  overview: {
    total_projects: number
    total_tasks: number
    completed_tasks: number
    in_progress_tasks: number
    overdue_tasks: number
  }
  my_tasks: {
    total: number
    completed: number
    in_progress: number
    overdue: number
  }
  projects_progress: Array<{
    project_id: number
    project_name: string
    total_tasks: number
    completed_tasks: number
    completion_percentage: number
  }>
}

/**
 * Get project progress report
 */
export const getProjectProgress = async (projectId: number): Promise<ProjectProgress> => {
  const response = await apiClient.get<ApiResponse<ProjectProgress>>(
    `/projects/${projectId}/reports/progress`
  )
  return response.data.data
}

/**
 * Get team workload report
 */
export const getTeamWorkload = async (projectId: number): Promise<TeamWorkload> => {
  const response = await apiClient.get<ApiResponse<TeamWorkload>>(
    `/projects/${projectId}/reports/workload`
  )
  return response.data.data
}

/**
 * Get completion trends
 */
export const getCompletionTrends = async (
  projectId: number,
  days: number = 30
): Promise<CompletionTrends> => {
  const response = await apiClient.get<ApiResponse<CompletionTrends>>(
    `/projects/${projectId}/reports/trends`,
    {
      params: { days }
    }
  )
  return response.data.data
}

/**
 * Get overall dashboard data
 */
export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await apiClient.get<ApiResponse<DashboardData>>('/reports/dashboard')
  return response.data.data
}
