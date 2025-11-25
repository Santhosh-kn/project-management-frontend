import client from './client'
import type { 
  Notification, 
  NotificationSettings,
  NotificationPreferences,
  NotificationStats
} from '@/types/notification'

export const notificationApi = {
  // Get all notifications
  getNotifications(params?: {
    unread_only?: boolean
    type?: string
    limit?: number
    page?: number
  }) {
    return client.get<{ data: Notification[]; meta?: any }>('/notifications', { params })
  },

  // Get a single notification
  getNotification(id: number) {
    return client.get<{ data: Notification }>(`/notifications/${id}`)
  },

  // Get unread count
  getUnreadCount() {
    return client.get<{ count: number }>('/notifications/unread-count')
  },

  // Get notification stats
  getStats() {
    return client.get<{ data: NotificationStats }>('/notifications/stats')
  },

  // Mark notification as read
  markAsRead(id: number) {
    return client.post(`/notifications/${id}/read`)
  },

  // Mark notification as unread
  markAsUnread(id: number) {
    return client.post(`/notifications/${id}/unread`)
  },

  // Mark all as read
  markAllAsRead() {
    return client.post('/notifications/mark-all-read')
  },

  // Delete notification
  deleteNotification(id: number) {
    return client.delete(`/notifications/${id}`)
  },

  // Delete all read notifications
  deleteAllRead() {
    return client.delete('/notifications/delete-all-read')
  },

  // Get notification settings
  getSettings() {
    return client.get<{ data: NotificationSettings }>('/notifications/settings')
  },

  // Update notification settings
  updateSettings(settings: Partial<NotificationSettings>) {
    return client.put<{ data: NotificationSettings }>('/notifications/settings', settings)
  },

  // Get notification preferences
  getPreferences() {
    return client.get<{ data: NotificationPreferences }>('/user/notification-preferences')
  },

  // Update notification preferences
  updatePreferences(preferences: Partial<NotificationPreferences>) {
    return client.put<{ data: NotificationPreferences }>('/user/notification-preferences', preferences)
  },

  // Request push notification permission
  requestPushPermission() {
    return client.post('/notifications/push/subscribe')
  },

  // Send test notification
  sendTestNotification() {
    return client.post('/notifications/test')
  }
}
