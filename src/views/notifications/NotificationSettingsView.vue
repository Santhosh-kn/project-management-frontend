<template>
  <div class="notification-settings-view">
    <div class="view-header">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Manage how you receive notifications</p>
      </div>
      <router-link
        to="/notifications"
        class="back-btn"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back to Notifications
      </router-link>
    </div>

    <NotificationSettings />
  </div>
</template>

<script setup lang="ts">
import NotificationSettings from '@/components/notifications/NotificationSettings.vue'
</script>

<style scoped>
.notification-settings-view {
  @apply max-w-7xl mx-auto;
}

.view-header {
  @apply flex items-start justify-between mb-6;
}

.back-btn {
  @apply flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors;
}
</style>
