import apiClient from './client'

export interface UpdateProfileData {
  name: string
  email: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface UserSettings {
  language?: string
  timezone?: string
  date_format?: string
  email_notifications?: boolean
  task_assignments?: boolean
  task_due_dates?: boolean
  comment_mentions?: boolean
  weekly_digest?: boolean
  theme?: string
  compact_mode?: boolean
  online_status?: boolean
}

/**
 * Update user profile (name, email)
 */
export const updateProfile = async (data: UpdateProfileData) => {
  const response = await apiClient.put('/auth/profile', data)
  return response.data
}

/**
 * Change user password
 */
export const changePassword = async (data: ChangePasswordData) => {
  const response = await apiClient.post('/auth/change-password', data)
  return response.data
}

/**
 * Update user settings/preferences
 */
export const updateSettings = async (settings: UserSettings) => {
  const response = await apiClient.put('/auth/settings', settings)
  return response.data
}
