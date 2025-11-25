export interface Notification {
  id: number
  type: string
  notifiable_type: string
  notifiable_id: number
  data: NotificationData
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationData {
  title: string
  message: string
  icon?: string
  action_url?: string
  action_text?: string
  actor?: {
    id: number
    name: string
    avatar?: string
  }
  context?: {
    project_id?: number
    project_name?: string
    task_id?: number
    task_title?: string
    comment_id?: number
  }
}

export type NotificationType = 
  | 'task_assigned'
  | 'task_completed'
  | 'task_commented'
  | 'task_mentioned'
  | 'task_due_soon'
  | 'task_overdue'
  | 'project_invited'
  | 'project_updated'
  | 'time_entry_approved'
  | 'file_uploaded'

export interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  task_assigned: boolean
  task_completed: boolean
  task_commented: boolean
  task_mentioned: boolean
  task_due_soon: boolean
  project_updates: boolean
  digest_frequency: 'realtime' | 'daily' | 'weekly' | 'never'
  quiet_hours_enabled: boolean
  quiet_hours_start: string // "22:00"
  quiet_hours_end: string // "08:00"
}

export interface NotificationPreferences {
  channels: {
    email: boolean
    push: boolean
    in_app: boolean
  }
  events: {
    [key: string]: boolean
  }
  digest: {
    enabled: boolean
    frequency: 'daily' | 'weekly'
    time: string
  }
}

export interface CreateNotificationRequest {
  type: NotificationType
  notifiable_id: number
  notifiable_type: string
  data: NotificationData
}

export interface NotificationStats {
  total: number
  unread: number
  read: number
  today: number
  this_week: number
}
