<template>
  <div class="notification-settings">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="settings-container">
      <!-- Notification Channels -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Notification Channels</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Choose how you want to receive notifications</p>
        </div>

        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h4 class="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
            </div>
            <toggle-switch
              v-model="settings.email_notifications"
              @update:model-value="saveSettings"
            />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4 class="font-medium text-gray-900 dark:text-white">Push Notifications</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Get browser push notifications</p>
            </div>
            <toggle-switch
              v-model="settings.push_notifications"
              @update:model-value="handlePushToggle"
            />
          </div>
        </div>
      </div>

      <!-- Event Types -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Event Notifications</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Choose which events trigger notifications</p>
        </div>

        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h4 class="font-medium text-gray-900 dark:text-white">Task Assignments</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">When you're assigned to a task</p>
            </div>
            <toggle-switch
              v-model="settings.task_assigned"
              @update:model-value="saveSettings"
            />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4 class="font-medium text-gray-900 dark:text-white">Task Completed</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">When a task you're watching is completed</p>
            </div>
            <toggle-switch
              v-model="settings.task_completed"
              @update:model-value="saveSettings"
            />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4 class="font-medium text-gray-900 dark:text-white">Comments</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">When someone comments on your tasks</p>
            </div>
            <toggle-switch
              v-model="settings.task_commented"
              @update:model-value="saveSettings"
            />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4 class="font-medium text-gray-900 dark:text-white">Mentions</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">When someone mentions you</p>
            </div>
            <toggle-switch
              v-model="settings.task_mentioned"
              @update:model-value="saveSettings"
            />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4 class="font-medium text-gray-900 dark:text-white">Due Date Reminders</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Reminders for upcoming due dates</p>
            </div>
            <toggle-switch
              v-model="settings.task_due_soon"
              @update:model-value="saveSettings"
            />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4 class="font-medium text-gray-900 dark:text-white">Project Updates</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Updates about projects you're part of</p>
            </div>
            <toggle-switch
              v-model="settings.project_updates"
              @update:model-value="saveSettings"
            />
          </div>
        </div>
      </div>

      <!-- Email Digest -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Email Digest</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Get a summary of notifications via email</p>
        </div>

        <div class="settings-list">
          <div class="setting-item">
            <label class="setting-info">
              <span class="font-medium text-gray-900 dark:text-white">Digest Frequency</span>
            </label>
            <select
              v-model="settings.digest_frequency"
              @change="saveSettings"
              class="digest-select"
            >
              <option value="realtime">Real-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Quiet Hours -->
      <div class="settings-section">
        <div class="section-header">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Quiet Hours</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Pause notifications during specific hours</p>
        </div>

        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h4 class="font-medium text-gray-900 dark:text-white">Enable Quiet Hours</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Don't disturb during these hours</p>
            </div>
            <toggle-switch
              v-model="settings.quiet_hours_enabled"
              @update:model-value="saveSettings"
            />
          </div>

          <div v-if="settings.quiet_hours_enabled" class="time-range-setting">
            <div class="time-input-group">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
              <input
                v-model="settings.quiet_hours_start"
                type="time"
                @change="saveSettings"
                class="time-input"
              />
            </div>
            <div class="time-input-group">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
              <input
                v-model="settings.quiet_hours_end"
                type="time"
                @change="saveSettings"
                class="time-input"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Test Notification -->
      <div class="settings-section">
        <button
          @click="sendTestNotification"
          :disabled="testLoading"
          class="test-btn"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          {{ testLoading ? 'Sending...' : 'Send Test Notification' }}
        </button>
      </div>

      <!-- Success Message -->
      <transition name="fade">
        <div v-if="showSuccess" class="success-message">
          <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="text-sm text-green-600 dark:text-green-400">Settings saved successfully!</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { notificationApi } from '@/api/notifications'
import ToggleSwitch from './ToggleSwitch.vue'
import type { NotificationSettings } from '@/types/notification'

const store = useNotificationStore()
const loading = ref(true)
const testLoading = ref(false)
const showSuccess = ref(false)

const settings = ref<NotificationSettings>({
  email_notifications: true,
  push_notifications: false,
  task_assigned: true,
  task_completed: true,
  task_commented: true,
  task_mentioned: true,
  task_due_soon: true,
  project_updates: true,
  digest_frequency: 'daily',
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00'
})

const loadSettings = async () => {
  loading.value = true
  try {
    await store.fetchSettings()
    if (store.settings) {
      settings.value = { ...store.settings }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  try {
    await store.updateSettings(settings.value)
    
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

const handlePushToggle = async (enabled: boolean) => {
  if (enabled) {
    const granted = await store.requestPushPermission()
    if (!granted) {
      settings.value.push_notifications = false
    }
  }
  await saveSettings()
}

const sendTestNotification = async () => {
  testLoading.value = true
  try {
    await notificationApi.sendTestNotification()
    alert('Test notification sent! Check your notifications.')
  } catch (error) {
    console.error('Failed to send test notification:', error)
    alert('Failed to send test notification')
  } finally {
    testLoading.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.notification-settings {
  @apply p-6 max-w-4xl mx-auto;
}

.loading-state {
  @apply flex justify-center items-center py-16;
}

.settings-container {
  @apply space-y-6;
}

.settings-section {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6;
}

.section-header {
  @apply mb-6;
}

.settings-list {
  @apply space-y-4;
}

.setting-item {
  @apply flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-0;
}

.setting-info {
  @apply flex-1;
}

.digest-select {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white;
}

.time-range-setting {
  @apply flex gap-4 mt-4 pl-4;
}

.time-input-group {
  @apply flex-1 space-y-1;
}

.time-input {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white;
}

.test-btn {
  @apply flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.success-message {
  @apply flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
