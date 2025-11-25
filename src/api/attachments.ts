import apiClient from './client'
import type { ApiResponse } from '@/types/api'
import type { Attachment } from '@/types/models'

/**
 * Get all attachments for a specific task
 */
export const getTaskAttachments = async (taskId: number): Promise<Attachment[]> => {
  const response = await apiClient.get<ApiResponse<Attachment[]>>(`/tasks/${taskId}/attachments`)
  return response.data.data
}

/**
 * Upload a file to a task
 */
export const uploadTaskAttachment = async (
  taskId: number,
  file: File,
  onUploadProgress?: (progressEvent: any) => void
): Promise<Attachment> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<ApiResponse<Attachment>>(
    `/tasks/${taskId}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }
  )

  return response.data.data
}

/**
 * Download an attachment
 */
export const downloadAttachment = async (attachmentId: number): Promise<Blob> => {
  const response = await apiClient.get(`/attachments/${attachmentId}/download`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Delete an attachment
 */
export const deleteAttachment = async (attachmentId: number): Promise<void> => {
  await apiClient.delete(`/attachments/${attachmentId}`)
}

/**
 * Get attachment details
 */
export const getAttachment = async (attachmentId: number): Promise<Attachment> => {
  const response = await apiClient.get<ApiResponse<Attachment>>(`/attachments/${attachmentId}`)
  return response.data.data
}

/**
 * Get all attachments for a project
 */
export const getProjectAttachments = async (projectId: number): Promise<Attachment[]> => {
  const response = await apiClient.get<ApiResponse<Attachment[]>>(`/projects/${projectId}/attachments`)
  return response.data.data
}

/**
 * Upload a file to a project
 */
export const uploadProjectAttachment = async (
  projectId: number,
  file: File,
  onUploadProgress?: (progressEvent: any) => void
): Promise<Attachment> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<ApiResponse<Attachment>>(
    `/projects/${projectId}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }
  )

  return response.data.data
}

/**
 * Get preview URL for an attachment
 */
export const getPreviewUrl = (attachmentId: number): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  return `${baseUrl}/attachments/${attachmentId}/preview`
}

/**
 * Check if file can be previewed
 */
export const canPreview = (mimeType: string): boolean => {
  const previewableMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
  ]
  return previewableMimes.includes(mimeType)
}
