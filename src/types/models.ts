// User and Authentication Types
export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'manager' | 'member' | 'guest'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  user: User
  token: string  // Backend returns single 'token' field
}

// Project Types
export interface Project {
  id: number
  name: string
  slug: string
  description?: string
  status: 'draft' | 'active' | 'on_hold' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  start_date?: string
  end_date?: string
  budget?: number
  color?: string
  is_public: boolean
  owner: User
  members_count?: number
  tasks_count?: number
  created_at: string
  updated_at: string
}

// Task Types
export interface Task {
  id: number
  project_id: number
  project_name?: string
  parent_id?: number
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  order: number
  assigned_to?: User
  created_by: User
  subtasks_count?: number
  created_at: string
  updated_at: string
}

// Tag Types
export interface Tag {
  id: number
  name: string
  color: string
  tasks_count?: number
  projects_count?: number
  created_at: string
  updated_at: string
}

// Comment Types
export interface Comment {
  id: number
  content: string
  user: User
  commentable_type: string
  commentable_id: number
  created_at: string
  updated_at: string
}

// Attachment Types
export interface Attachment {
  id: number
  filename: string
  mime_type: string
  size: number
  formatted_size: string
  is_image: boolean
  is_document: boolean
  url: string
  download_url: string
  uploaded_by: User
  created_at: string
  updated_at: string
}

// Project Member Types
export interface ProjectMember {
  id: number
  user_id: number
  project_id: number
  role: 'owner' | 'manager' | 'member' | 'viewer'
  user?: User
  joined_at?: string
  created_at: string
  updated_at: string
}

// Dashboard Types
export interface DashboardStats {
  total_projects: number
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  overdue_tasks: number
  total_members: number
}
