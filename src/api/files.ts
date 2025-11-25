import client from './client'
import type {
  FileAttachment,
  FileCategory,
  FileVersion,
  FilePreview,
  UploadFileRequest,
  UpdateFileRequest,
  UploadVersionRequest,
  BulkFileOperation,
  FileStats,
  FileFilter
} from '@/types/file'

export const fileApi = {
  // File CRUD
  getFiles(params?: FileFilter) {
    return client.get<{ data: FileAttachment[] }>('/files', { params })
  },

  getFile(id: number) {
    return client.get<{ data: FileAttachment }>(`/files/${id}`)
  },

  uploadFile(data: FormData) {
    return client.post<{ data: FileAttachment }>('/files', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  updateFile(id: number, data: UpdateFileRequest) {
    return client.put<{ data: FileAttachment }>(`/files/${id}`, data)
  },

  deleteFile(id: number) {
    return client.delete(`/files/${id}`)
  },

  downloadFile(id: number) {
    return client.get(`/files/${id}/download`, {
      responseType: 'blob'
    })
  },

  // File Preview
  getFilePreview(id: number) {
    return client.get<{ data: FilePreview }>(`/files/${id}/preview`)
  },

  // File Versions
  getFileVersions(fileId: number) {
    return client.get<{ data: FileVersion[] }>(`/files/${fileId}/versions`)
  },

  uploadNewVersion(fileId: number, data: FormData) {
    return client.post<{ data: FileAttachment }>(`/files/${fileId}/versions`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  restoreVersion(fileId: number, versionId: number) {
    return client.post<{ data: FileAttachment }>(`/files/${fileId}/versions/${versionId}/restore`)
  },

  deleteVersion(fileId: number, versionId: number) {
    return client.delete(`/files/${fileId}/versions/${versionId}`)
  },

  // File Categories
  getCategories() {
    return client.get<{ data: FileCategory[] }>('/file-categories')
  },

  getCategory(id: number) {
    return client.get<{ data: FileCategory }>(`/file-categories/${id}`)
  },

  createCategory(data: Partial<FileCategory>) {
    return client.post<{ data: FileCategory }>('/file-categories', data)
  },

  updateCategory(id: number, data: Partial<FileCategory>) {
    return client.put<{ data: FileCategory }>(`/file-categories/${id}`, data)
  },

  deleteCategory(id: number) {
    return client.delete(`/file-categories/${id}`)
  },

  // Bulk Operations
  bulkOperation(operation: BulkFileOperation) {
    return client.post('/files/bulk', operation)
  },

  bulkDelete(fileIds: number[]) {
    return client.post('/files/bulk-delete', { file_ids: fileIds })
  },

  bulkDownload(fileIds: number[]) {
    return client.post('/files/bulk-download', { file_ids: fileIds }, {
      responseType: 'blob'
    })
  },

  bulkCategorize(fileIds: number[], categoryId: number) {
    return client.post('/files/bulk-categorize', {
      file_ids: fileIds,
      category_id: categoryId
    })
  },

  bulkMove(fileIds: number[], targetId: number, targetType: string) {
    return client.post('/files/bulk-move', {
      file_ids: fileIds,
      target_id: targetId,
      target_type: targetType
    })
  },

  // File Statistics
  getStats(params?: { project_id?: number; task_id?: number }) {
    return client.get<{ data: FileStats }>('/files/stats', { params })
  },

  // Search Files
  searchFiles(query: string, params?: FileFilter) {
    return client.get<{ data: FileAttachment[] }>('/files/search', {
      params: { q: query, ...params }
    })
  }
}
