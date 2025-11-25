import apiClient from './client'
import type { ApiResponse } from '@/types/api'

export interface TaskDependency {
  id: number
  task_id: number
  depends_on_task_id: number
  dependency_type: 'blocks' | 'blocked_by' | 'related_to'
  depends_on_task: {
    id: number
    title: string
    status: string
    priority: string
    due_date: string | null
    assigned_to: {
      id: number
      name: string
      email: string
    } | null
  }
  created_by: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}

export interface DependencyTree {
  id: number
  title: string
  status: string
  priority: string
  due_date: string | null
  assigned_to: {
    id: number
    name: string
  } | null
  dependencies: Array<{
    dependency_id: number
    dependency_type: string
    node: DependencyTree
  }>
  circular?: boolean
}

export interface CreateDependencyData {
  depends_on_task_id: number
  dependency_type: 'blocks' | 'blocked_by' | 'related_to'
}

/**
 * Get all dependencies for a task
 */
export const getTaskDependencies = async (taskId: number): Promise<TaskDependency[]> => {
  const response = await apiClient.get<ApiResponse<TaskDependency[]>>(`/tasks/${taskId}/dependencies`)
  return response.data.data
}

/**
 * Create a new dependency
 */
export const createDependency = async (
  taskId: number,
  data: CreateDependencyData
): Promise<TaskDependency> => {
  const response = await apiClient.post<ApiResponse<TaskDependency>>(
    `/tasks/${taskId}/dependencies`,
    data
  )
  return response.data.data
}

/**
 * Delete a dependency
 */
export const deleteDependency = async (dependencyId: number): Promise<void> => {
  await apiClient.delete(`/dependencies/${dependencyId}`)
}

/**
 * Get dependency tree for visualization
 */
export const getDependencyTree = async (taskId: number): Promise<DependencyTree> => {
  const response = await apiClient.get<ApiResponse<DependencyTree>>(
    `/tasks/${taskId}/dependency-tree`
  )
  return response.data.data
}

/**
 * Get tasks that depend on this task (reverse dependencies)
 */
export const getTaskDependents = async (taskId: number): Promise<TaskDependency[]> => {
  const response = await apiClient.get<ApiResponse<TaskDependency[]>>(`/tasks/${taskId}/dependents`)
  return response.data.data
}
