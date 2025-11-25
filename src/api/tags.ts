import apiClient from './client'
import type { ApiResponse } from '@/types/api'

export interface Tag {
  id: number
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface CreateTagData {
  name: string
  color: string
}

export interface UpdateTagData {
  name?: string
  color?: string
}

/**
 * Get all tags
 */
export const getTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get<ApiResponse<Tag[]>>('/tags')
  return response.data.data
}

/**
 * Get single tag
 */
export const getTag = async (id: number): Promise<Tag> => {
  const response = await apiClient.get<ApiResponse<Tag>>(`/tags/${id}`)
  return response.data.data
}

/**
 * Create a new tag
 */
export const createTag = async (data: CreateTagData): Promise<Tag> => {
  const response = await apiClient.post<ApiResponse<Tag>>('/tags', data)
  return response.data.data
}

/**
 * Update a tag
 */
export const updateTag = async (id: number, data: UpdateTagData): Promise<Tag> => {
  const response = await apiClient.put<ApiResponse<Tag>>(`/tags/${id}`, data)
  return response.data.data
}

/**
 * Delete a tag
 */
export const deleteTag = async (id: number): Promise<void> => {
  await apiClient.delete(`/tags/${id}`)
}
