<template>
  <div class="notifications-view">
    <!-- Header -->
    <div class="view-header">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
      <div class="header-actions">
        <button
          v-if="store.unreadCount > 0"
          @click="handleMarkAllRead"
          class="action-btn"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          Mark all as read
        </button>
        <button
          @click="handleDeleteAllRead"
          class="action-btn"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Delete read
        </button>
        <router-link
          to="/notifications/settings"
          class="action-btn"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Settings
        </router-link>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">Total</p>
          <p class="stat-value">{{ store.notifications.length }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">Unread</p>
          <p class="stat-value">{{ store.unreadCount }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">Read</p>
          <p class="stat-value">{{ store.readNotifications.length }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="tabs">
        <button
          @click="activeFilter = 'all'"
          class="tab"
          :class="{ active: activeFilter === 'all' }"
        >
          All
        </button>
        <button
          @click="activeFilter = 'unread'"
          class="tab"
          :class="{ active: activeFilter === 'unread' }"
        >
          Unread
        </button>
        <button
          @click="activeFilter = 'read'"
          class="tab"
          :class="{ active: activeFilter === 'read' }"
        >
          Read
        </button>
      </div>

      <select
        v-model="typeFilter"
        class="type-filter"
      >
        <option value="">All Types</option>
        <option value="task_assigned">Task Assigned</option>
        <option value="task_completed">Task Completed</option>
        <option value="task_commented">Comments</option>
        <option value="task_mentioned">Mentions</option>
        <option value="task_due_soon">Due Soon</option>
        <option value="project_invited">Project Invites</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="store.loading" class="loading-state">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="text-gray-600 dark:text-gray-400 mt-4">Loading notifications...</p>
    </div>

    <!-- Notifications List -->
    <div v-else-if="filteredNotifications.length > 0" class="notifications-container">
      <NotificationItem
        v-for="notification in filteredNotifications"
        :key="notification.id"
        :notification="notification"
        @click="handleNotificationClick(notification)"
        @mark-read="store.markAsRead(notification.id)"
        @mark-unread="store.markAsUnread(notification.id)"
        @delete="store.deleteNotification(notification.id)"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg class="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
      </svg>
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4">No notifications</h3>
      <p class="text-gray-500 dark:text-gray-400 mt-2">You're all caught up!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import NotificationItem from '@/components/notifications/NotificationItem.vue'
import type { Notification } from '@/types/notification'

const store = useNotificationStore()
const router = useRouter()

const activeFilter = ref<'all' | 'unread' | 'read'>('all')
const typeFilter = ref('')

// Computed
const filteredNotifications = computed(() => {
  let notifications = store.notifications

  // Filter by read status
  if (activeFilter.value === 'unread') {
    notifications = store.unreadNotifications
  } else if (activeFilter.value === 'read') {
    notifications = store.readNotifications
  }

  // Filter by type
  if (typeFilter.value) {
    notifications = notifications.filter(n => n.type === typeFilter.value)
  }

  return notifications
})

// Methods
const handleNotificationClick = async (notification: Notification) => {
  // Mark as read
  if (!notification.read_at) {
    await store.markAsRead(notification.id)
  }

  // Navigate to action URL if available
  if (notification.data.action_url) {
    router.push(notification.data.action_url)
  }
}

const handleMarkAllRead = async () => {
  if (confirm('Mark all notifications as read?')) {
    await store.markAllAsRead()
  }
}

const handleDeleteAllRead = async () => {
  if (confirm('Delete all read notifications? This cannot be undone.')) {
    await store.deleteAllRead()
  }
}

// Lifecycle
onMounted(() => {
  store.fetchNotifications()
})
</script>

<style scoped>
.notifications-view {
  @apply p-6 max-w-7xl mx-auto;
}

.view-header {
  @apply flex items-center justify-between mb-6;
}

.header-actions {
  @apply flex items-center gap-3;
}

.action-btn {
  @apply flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4 mb-6;
}

.stat-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4;
}

.stat-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center;
}

.stat-info {
  @apply flex-1;
}

.stat-label {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.filters-section {
  @apply flex items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700;
}

.tabs {
  @apply flex gap-2;
}

.tab {
  @apply px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors;
}

.tab.active {
  @apply bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400;
}

.type-filter {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white;
}

.loading-state {
  @apply flex flex-col items-center justify-center py-16;
}

.notifications-container {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}
</style>
