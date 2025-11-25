<template>
  <div class="settings-view container-fluid py-4">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <h2>
        <i class="bi bi-gear me-2"></i>
        Settings
      </h2>
      <p class="text-muted mb-0">Manage your application preferences</p>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <!-- General Settings -->
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-sliders me-2"></i>
              General Settings
            </h5>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Language</h6>
                <p class="text-muted mb-0">Choose your preferred language</p>
              </div>
              <select v-model="settings.language" class="form-select" style="width: 200px;">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Timezone</h6>
                <p class="text-muted mb-0">Set your local timezone</p>
              </div>
              <select v-model="settings.timezone" class="form-select" style="width: 200px;">
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
                <option value="IST">IST</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Date Format</h6>
                <p class="text-muted mb-0">Choose how dates are displayed</p>
              </div>
              <select v-model="settings.dateFormat" class="form-select" style="width: 200px;">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-bell me-2"></i>
              Notifications
            </h5>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Email Notifications</h6>
                <p class="text-muted mb-0">Receive email updates for activity</p>
              </div>
              <div class="form-check form-switch">
                <input
                  v-model="settings.emailNotifications"
                  class="form-check-input"
                  type="checkbox"
                  id="emailNotifications"
                />
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Task Assignments</h6>
                <p class="text-muted mb-0">Get notified when assigned to tasks</p>
              </div>
              <div class="form-check form-switch">
                <input
                  v-model="settings.taskAssignments"
                  class="form-check-input"
                  type="checkbox"
                  id="taskAssignments"
                />
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Task Due Dates</h6>
                <p class="text-muted mb-0">Reminders for upcoming deadlines</p>
              </div>
              <div class="form-check form-switch">
                <input
                  v-model="settings.taskDueDates"
                  class="form-check-input"
                  type="checkbox"
                  id="taskDueDates"
                />
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Comment Mentions</h6>
                <p class="text-muted mb-0">Notify when mentioned in comments</p>
              </div>
              <div class="form-check form-switch">
                <input
                  v-model="settings.commentMentions"
                  class="form-check-input"
                  type="checkbox"
                  id="commentMentions"
                />
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Weekly Digest</h6>
                <p class="text-muted mb-0">Receive a weekly summary email</p>
              </div>
              <div class="form-check form-switch">
                <input
                  v-model="settings.weeklyDigest"
                  class="form-check-input"
                  type="checkbox"
                  id="weeklyDigest"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Appearance -->
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-palette me-2"></i>
              Appearance
            </h5>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Theme</h6>
                <p class="text-muted mb-0">Choose your interface theme</p>
              </div>
              <select v-model="settings.theme" class="form-select" style="width: 200px;">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Compact Mode</h6>
                <p class="text-muted mb-0">Show more content with less spacing</p>
              </div>
              <div class="form-check form-switch">
                <input
                  v-model="settings.compactMode"
                  class="form-check-input"
                  type="checkbox"
                  id="compactMode"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Privacy & Security -->
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-shield-check me-2"></i>
              Privacy & Security
            </h5>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Show Online Status</h6>
                <p class="text-muted mb-0">Let others see when you're online</p>
              </div>
              <div class="form-check form-switch">
                <input
                  v-model="settings.onlineStatus"
                  class="form-check-input"
                  type="checkbox"
                  id="onlineStatus"
                />
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Two-Factor Authentication</h6>
                <p class="text-muted mb-0">Add an extra layer of security</p>
              </div>
              <button class="btn btn-sm btn-outline-primary" @click="show2FAMessage">
                Enable 2FA
              </button>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Active Sessions</h6>
                <p class="text-muted mb-0">Manage your logged-in devices</p>
              </div>
              <button class="btn btn-sm btn-outline-secondary" @click="showSessionsMessage">
                View Sessions
              </button>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="card border-danger mb-4">
          <div class="card-body">
            <h5 class="card-title text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Danger Zone
            </h5>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Export Data</h6>
                <p class="text-muted mb-0">Download all your account data</p>
              </div>
              <button class="btn btn-sm btn-outline-secondary" @click="exportData">
                Export Data
              </button>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h6>Delete Account</h6>
                <p class="text-muted mb-0">Permanently delete your account and all data</p>
              </div>
              <button class="btn btn-sm btn-danger" @click="deleteAccount">
                Delete Account
              </button>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div v-if="saveMessage" class="alert alert-success mb-3">
          <i class="bi bi-check-circle-fill me-2"></i>
          {{ saveMessage }}
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary" @click="saveSettings">
            <i class="bi bi-save me-2"></i>
            Save Changes
          </button>
          <button class="btn btn-secondary" @click="resetSettings">
            Reset
          </button>
        </div>
      </div>

      <!-- Info Sidebar -->
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">About</h5>
            <div class="info-item">
              <small class="text-muted">Application Version</small>
              <p>1.0.0</p>
            </div>
            <div class="info-item">
              <small class="text-muted">Last Updated</small>
              <p>October 2025</p>
            </div>
            <div class="info-item">
              <small class="text-muted">Support</small>
              <p>
                <a href="mailto:support@example.com">support@example.com</a>
              </p>
            </div>
          </div>
        </div>

        <div class="card mt-3">
          <div class="card-body">
            <h5 class="card-title">Need Help?</h5>
            <p class="text-muted">Check out our documentation and support resources</p>
            <a href="#" class="btn btn-sm btn-outline-primary w-100 mb-2">
              <i class="bi bi-book me-2"></i>
              Documentation
            </a>
            <a href="#" class="btn btn-sm btn-outline-primary w-100">
              <i class="bi bi-chat-left-text me-2"></i>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { updateSettings } from '@/api/profile'
import type { UserSettings } from '@/api/profile'

const authStore = useAuthStore()

const saveMessage = ref<string | null>(null)

const settings = reactive({
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  emailNotifications: true,
  taskAssignments: true,
  taskDueDates: true,
  commentMentions: true,
  weeklyDigest: false,
  theme: 'light',
  compactMode: false,
  onlineStatus: true
})

const saveSettings = async () => {
  try {
    const userSettings: UserSettings = {
      language: settings.language,
      timezone: settings.timezone,
      date_format: settings.dateFormat,
      email_notifications: settings.emailNotifications,
      task_assignments: settings.taskAssignments,
      task_due_dates: settings.taskDueDates,
      comment_mentions: settings.commentMentions,
      weekly_digest: settings.weeklyDigest,
      theme: settings.theme,
      compact_mode: settings.compactMode,
      online_status: settings.onlineStatus
    }
    
    await updateSettings(userSettings)
    saveMessage.value = 'Settings saved successfully!'
    
    // Also save to localStorage for quick access
    localStorage.setItem('userSettings', JSON.stringify(settings))
    
    setTimeout(() => {
      saveMessage.value = null
    }, 3000)
  } catch (error: any) {
    saveMessage.value = 'Failed to save settings: ' + (error.response?.data?.message || error.message)
  }
}

const resetSettings = () => {
  if (confirm('Reset all settings to default?')) {
    Object.assign(settings, {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      emailNotifications: true,
      taskAssignments: true,
      taskDueDates: true,
      commentMentions: true,
      weeklyDigest: false,
      theme: 'light',
      compactMode: false,
      onlineStatus: true
    })
    localStorage.removeItem('userSettings')
  }
}

const show2FAMessage = () => {
  alert('Two-Factor Authentication setup coming soon!')
}

const showSessionsMessage = () => {
  alert('Active sessions management coming soon!')
}

const exportData = () => {
  alert('Data export feature coming soon!')
}

const deleteAccount = () => {
  if (confirm('Are you ABSOLUTELY sure? This action cannot be undone!')) {
    alert('Account deletion feature coming soon!')
  }
}
</script>

<style scoped>
.settings-view {
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
}

.page-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.card {
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h6 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.setting-info p {
  font-size: 0.875rem;
  margin: 0;
}

.form-check-input {
  width: 3rem;
  height: 1.5rem;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.info-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item small {
  display: block;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.info-item p {
  margin: 0;
  font-weight: 500;
  color: #374151;
}

.btn-primary {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.btn-primary:hover {
  background-color: #2563EB;
  border-color: #2563EB;
}
</style>
