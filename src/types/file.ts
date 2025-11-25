export interface FileAttachment {
  id: number
  filename: string
  original_filename: string
  file_path: string
  file_url: string
  mime_type: string
  size: number
  attachable_type: string
  attachable_id: number
  uploaded_by: number
  version: number
  parent_id: number | null
  category_id: number | null
  created_at: string
  updated_at: string
  uploader?: {
    id: number
    name: string
    email: string
  }
  category?: FileCategory
  versions?: FileAttachment[]
  is_latest_version?: boolean
}

export interface FileCategory {
  id: number
  name: string
  color: string
  icon: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface FileVersion {
  id: number
  file_id: number
  version: number
  filename: string
  file_path: string
  file_url: string
  size: number
  uploaded_by: number
  changes_description: string | null
  created_at: string
  uploader?: {
    id: number
    name: string
  }
}

export interface FilePreview {
  id: number
  filename: string
  file_url: string
  mime_type: string
  size: number
  can_preview: boolean
  preview_url?: string
}

export interface UploadFileRequest {
  file: File
  attachable_type: string
  attachable_id: number
  category_id?: number
  description?: string
}

export interface UpdateFileRequest {
  filename?: string
  category_id?: number
  description?: string
}

export interface UploadVersionRequest {
  file: File
  changes_description?: string
}

export interface BulkFileOperation {
  file_ids: number[]
  operation: 'delete' | 'move' | 'categorize' | 'download'
  category_id?: number
  target_folder?: string
}

export interface FileStats {
  total_files: number
  total_size: number
  by_type: {
    [key: string]: {
      count: number
      size: number
    }
  }
  by_category: {
    [key: string]: {
      count: number
      size: number
    }
  }
}

export type FileType = 'image' | 'document' | 'video' | 'audio' | 'archive' | 'other'

export interface FileFilter {
  type?: FileType
  category_id?: number
  uploaded_by?: number
  date_from?: string
  date_to?: string
  search?: string
}
