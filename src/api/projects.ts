import apiClient from './client'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { Project } from '@/types/models'

export interface ProjectFilters {
  status?: string
  priority?: string
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface CreateProjectData {
  name: string
  description?: string
  status: 'draft' | 'active' | 'on_hold' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  start_date?: string
  end_date?: string
  budget?: number
  color?: string
  is_public?: boolean
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

/**
 * Get all projects with filters and pagination
 */
export const getProjects = async (filters?: ProjectFilters): Promise<PaginatedResponse<Project>> => {
  const response = await apiClient.get<PaginatedResponse<Project>>('/projects', {
    params: filters
  })
  return response.data
}

/**
 * Get a single project by ID
 */
export const getProject = async (id: number): Promise<ApiResponse<Project>> => {
  const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`)
  return response.data
}

/**
 * Create a new project
 */
export const createProject = async (data: CreateProjectData): Promise<ApiResponse<Project>> => {
  const response = await apiClient.post<ApiResponse<Project>>('/projects', data)
  return response.data
}

/**
 * Update an existing project
 */
export const updateProject = async (id: number, data: UpdateProjectData): Promise<ApiResponse<Project>> => {
  const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data)
  return response.data
}

/**
 * Delete a project (soft delete)
 */
export const deleteProject = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`/projects/${id}`)
  return response.data
}

/**
 * Archive a project
 */
export const archiveProject = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(`/projects/${id}/archive`)
  return response.data
}

/**
 * Unarchive a project
 */
export const unarchiveProject = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(`/projects/${id}/unarchive`)
  return response.data
}

/**
 * Get project tasks
 */
export const getProjectTasks = async (id: number, page = 1): Promise<PaginatedResponse<any>> => {
  const response = await apiClient.get<PaginatedResponse<any>>(`/projects/${id}/tasks`, {
    params: { page }
  })
  return response.data
}

/**
 * Get project members
 */
export const getProjectMembers = async (id: number): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>(`/projects/${id}/members`)
  return response.data
}

/**
 * Add a member to project
 */
export const addProjectMember = async (id: number, userId: number, role: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(`/projects/${id}/members`, {
    user_id: userId,
    role
  })
  return response.data
}

/**
 * Update member role in project
 */
export const updateMemberRole = async (projectId: number, userId: number, role: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.put<ApiResponse<null>>(`/projects/${projectId}/members/${userId}`, {
    role
  })
  return response.data
}

/**
 * Remove a member from project
 */
export const removeProjectMember = async (id: number, userId: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`/projects/${id}/members/${userId}`)
  return response.data
}
