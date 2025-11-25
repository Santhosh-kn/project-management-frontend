import apiClient from './client'
import type { ApiResponse } from '@/types/models'

export interface Mention {
  id: number
  comment: {
    id: number
    content: string
    user: {
      id: number
      name: string
      email: string
    }
    commentable_type: string
    commentable_id: number
    commentable: {
      id: number
      title?: string
      name?: string
      type: string
      project_id?: number
    }
  }
  mentioned_by: {
    id: number
    name: string
    email: string
  }
  is_read: boolean
  created_at: string
}

export interface MentionsResponse {
  data: Mention[]
  meta: {
    total: number
    current_page: number
    per_page: number
    last_page: number
    unread_count: number
    timestamp: string
  }
}

export interface UnreadCountResponse {
  unread_count: number
}

/**
 * Get all mentions for authenticated user
 */
export const getMentions = async (params?: {
  page?: number
  per_page?: number
  unread_only?: boolean
}): Promise<MentionsResponse> => {
  const response = await apiClient.get<ApiResponse<MentionsResponse>>('/mentions', { params })
  return response.data.data
}

/**
 * Get unread mention count
 */
export const getUnreadMentionCount = async (): Promise<number> => {
  const response = await apiClient.get<ApiResponse<UnreadCountResponse>>('/mentions/unread-count')
  return response.data.data.unread_count
}

/**
 * Mark mentions as read
 */
export const markMentionsAsRead = async (mentionIds: number[]): Promise<void> => {
  await apiClient.post('/mentions/mark-as-read', { mention_ids: mentionIds })
}

/**
 * Mark all mentions as read
 */
export const markAllMentionsAsRead = async (): Promise<void> => {
  await apiClient.post('/mentions/mark-all-read')
}
