import apiClient from './client'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { Task } from '@/types/models'

export interface TaskFilters {
  project_id?: number
  status?: string
  priority?: string
  assigned_to?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  per_page?: number
  due_date_from?: string
  due_date_to?: string
}

export interface CreateTaskData {
  project_id: number
  parent_id?: number
  title: string
  description?: string
  status?: 'todo' | 'in_progress' | 'review' | 'done'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  due_date?: string
  estimated_hours?: number
  assigned_to?: number
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}

export interface AssignTaskData {
  user_id: number
}

export interface UpdateStatusData {
  status: 'todo' | 'in_progress' | 'review' | 'done'
}

export interface UpdatePriorityData {
  priority: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Get all tasks with filters and pagination
 */
export const getTasks = async (filters?: TaskFilters): Promise<PaginatedResponse<Task>> => {
  const response = await apiClient.get<PaginatedResponse<Task>>('/tasks', {
    params: filters
  })
  return response.data
}

/**
 * Get a single task by ID
 */
export const getTask = async (id: number): Promise<ApiResponse<Task>> => {
  const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`)
  return response.data
}

/**
 * Create a new task
 */
export const createTask = async (data: CreateTaskData): Promise<ApiResponse<Task>> => {
  const response = await apiClient.post<ApiResponse<Task>>('/tasks', data)
  return response.data
}

/**
 * Update an existing task
 */
export const updateTask = async (id: number, data: UpdateTaskData): Promise<ApiResponse<Task>> => {
  const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data)
  return response.data
}

/**
 * Delete a task (soft delete)
 */
export const deleteTask = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`/tasks/${id}`)
  return response.data
}

/**
 * Assign task to a user
 */
export const assignTask = async (id: number, data: AssignTaskData): Promise<ApiResponse<Task>> => {
  const response = await apiClient.post<ApiResponse<Task>>(`/tasks/${id}/assign`, data)
  return response.data
}

/**
 * Update task status
 */
export const updateTaskStatus = async (id: number, data: UpdateStatusData): Promise<ApiResponse<Task>> => {
  const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}/status`, data)
  return response.data
}

/**
 * Update task priority
 */
export const updateTaskPriority = async (id: number, data: UpdatePriorityData): Promise<ApiResponse<Task>> => {
  const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}/priority`, data)
  return response.data
}

/**
 * Get task subtasks
 */
export const getTaskSubtasks = async (id: number): Promise<ApiResponse<Task[]>> => {
  const response = await apiClient.get<ApiResponse<Task[]>>(`/tasks/${id}/subtasks`)
  return response.data
}

/**
 * Create a subtask
 */
export const createSubtask = async (parentId: number, data: CreateTaskData): Promise<ApiResponse<Task>> => {
  const response = await apiClient.post<ApiResponse<Task>>(`/tasks/${parentId}/subtasks`, data)
  return response.data
}

/**
 * Get task comments
 */
export const getTaskComments = async (id: number): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>(`/tasks/${id}/comments`)
  return response.data
}

/**
 * Add comment to task
 */
export const addTaskComment = async (id: number, content: string): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<ApiResponse<any>>(`/tasks/${id}/comments`, { content })
  return response.data
}
