import apiClient from './client'
import type { ApiResponse } from '@/types/api'
import type { Comment } from '@/types/models'

export interface CreateCommentData {
  content: string
}

export interface UpdateCommentData {
  content: string
}

/**
 * Get all comments for a specific task
 */
export const getTaskComments = async (taskId: number): Promise<Comment[]> => {
  const response = await apiClient.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`)
  return response.data.data
}

/**
 * Create a new comment for a task
 */
export const createComment = async (taskId: number, data: CreateCommentData): Promise<Comment> => {
  const response = await apiClient.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, data)
  return response.data.data
}

/**
 * Update an existing comment
 */
export const updateComment = async (commentId: number, data: UpdateCommentData): Promise<Comment> => {
  const response = await apiClient.put<ApiResponse<Comment>>(`/comments/${commentId}`, data)
  return response.data.data
}

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: number): Promise<void> => {
  await apiClient.delete(`/comments/${commentId}`)
}

/**
 * Get a single comment by ID
 */
export const getComment = async (commentId: number): Promise<Comment> => {
  const response = await apiClient.get<ApiResponse<Comment>>(`/comments/${commentId}`)
  return response.data.data
}
