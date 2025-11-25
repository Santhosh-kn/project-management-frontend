import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationApi } from '@/api/notifications'
import type { Notification, NotificationSettings } from '@/types/notification'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const settings = ref<NotificationSettings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read_at)
  )

  const readNotifications = computed(() => 
    notifications.value.filter(n => n.read_at)
  )

  const hasUnread = computed(() => unreadCount.value > 0)

  // Actions
  const fetchNotifications = async (unreadOnly = false) => {
    loading.value = true
    error.value = null
    try {
      const response = await notificationApi.getNotifications({
        unread_only: unreadOnly,
        limit: 50
      })
      notifications.value = response.data.data
      await fetchUnreadCount()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch notifications'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount()
      unreadCount.value = response.data.count
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id)
      
      const notification = notifications.value.find(n => n.id === id)
      if (notification) {
        notification.read_at = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to mark as read'
      throw err
    }
  }

  const markAsUnread = async (id: number) => {
    try {
      await notificationApi.markAsUnread(id)
      
      const notification = notifications.value.find(n => n.id === id)
      if (notification) {
        notification.read_at = null
        unreadCount.value += 1
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to mark as unread'
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      
      notifications.value.forEach(n => {
        if (!n.read_at) {
          n.read_at = new Date().toISOString()
        }
      })
      unreadCount.value = 0
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to mark all as read'
      throw err
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      await notificationApi.deleteNotification(id)
      
      const index = notifications.value.findIndex(n => n.id === id)
      if (index > -1) {
        const notification = notifications.value[index]
        if (!notification.read_at) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete notification'
      throw err
    }
  }

  const deleteAllRead = async () => {
    try {
      await notificationApi.deleteAllRead()
      notifications.value = notifications.value.filter(n => !n.read_at)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete read notifications'
      throw err
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await notificationApi.getSettings()
      settings.value = response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch settings'
      throw err
    }
  }

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const response = await notificationApi.updateSettings(newSettings)
      settings.value = response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update settings'
      throw err
    }
  }

  const addNotification = (notification: Notification) => {
    // Add to the beginning of the list
    notifications.value.unshift(notification)
    
    // Increment unread count if notification is unread
    if (!notification.read_at) {
      unreadCount.value += 1
    }
    
    // Show toast/alert for new notification
    showNotificationToast(notification)
  }

  const showNotificationToast = (notification: Notification) => {
    // This will be implemented with a toast component
    // For now, just log
    console.log('New notification:', notification)
  }

  // Request push notification permission
  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications')
      return false
    }

    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      await notificationApi.requestPushPermission()
      return true
    }
    
    return false
  }

  return {
    // State
    notifications,
    unreadCount,
    settings,
    loading,
    error,
    
    // Computed
    unreadNotifications,
    readNotifications,
    hasUnread,
    
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    fetchSettings,
    updateSettings,
    addNotification,
    requestPushPermission
  }
})
