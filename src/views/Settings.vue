<template>
  <div class="settings-page">
    <div class="container-fluid">

      <!-- Page Header -->
      <div class="page-header mb-4">
        <h2 class="page-title">
          <i class="bi bi-gear me-2"></i>
          Settings
        </h2>
        <p class="text-muted">Manage your account and application preferences</p>
      </div>

      <!-- Settings Navigation Tabs -->
      <ul class="nav nav-tabs mb-4" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
            type="button"
          >
            <i class="bi bi-person me-2"></i>
            Profile
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'account' }"
            @click="activeTab = 'account'"
            type="button"
          >
            <i class="bi bi-shield-lock me-2"></i>
            Account & Security
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'notifications' }"
            @click="activeTab = 'notifications'"
            type="button"
          >
            <i class="bi bi-bell me-2"></i>
            Notifications
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'appearance' }"
            @click="activeTab = 'appearance'"
            type="button"
          >
            <i class="bi bi-palette me-2"></i>
            Appearance
          </button>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="tab-pane active">
          <div class="row">
            <div class="col-lg-8">
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="mb-0">Profile Information</h5>
                </div>
                <div class="card-body">
                  <form @submit.prevent="updateProfile">
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label for="name" class="form-label">Full Name</label>
                        <input
                          id="name"
                          v-model="profileForm.name"
                          type="text"
                          class="form-control"
                          required
                          minlength="2"
                          maxlength="100"
                        />
                      </div>
                      <div class="col-md-6">
                        <label for="email" class="form-label">Email Address</label>
                        <input
                          id="email"
                          v-model="profileForm.email"
                          type="email"
                          class="form-control"
                          required
                        />
                      </div>
                    </div>

                    <div class="mb-3">
                      <label for="bio" class="form-label">Bio</label>
                      <textarea
                        id="bio"
                        v-model="profileForm.bio"
                        class="form-control"
                        rows="4"
                        placeholder="Tell us about yourself..."
                        maxlength="500"
                      ></textarea>
                      <small class="form-text text-muted">
                        {{ (profileForm.bio || '').length }}/500 characters
                      </small>
                    </div>

                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label for="phone" class="form-label">Phone Number</label>
                        <input
                          id="phone"
                          v-model="profileForm.phone"
                          @input="(e) => profileForm.phone = filterPhoneInput(e.target.value)"
                          type="tel"
                          class="form-control"
                          placeholder="+1 (555) 000-0000"
                        />
                        <small class="form-text text-muted">
                          Format: digits, spaces, hyphens, parentheses, plus allowed (10-15 digits)
                        </small>
                      </div>
                      <div class="col-md-6">
                        <label for="location" class="form-label">Location</label>
                        <input
                          id="location"
                          v-model="profileForm.location"
                          type="text"
                          class="form-control"
                          placeholder="City, Country"
                          maxlength="100"
                        />
                      </div>
                    </div>

                    <div class="d-flex justify-content-end gap-2">
                      <button type="button" class="btn btn-secondary" @click="resetProfile" :disabled="isSubmitting">
                        Cancel
                      </button>
                      <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                        <i v-else class="bi bi-check-lg me-1"></i>
                        {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div class="col-lg-4">
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">Profile Picture</h5>
                </div>
                <div class="card-body text-center">
                  <div class="profile-avatar-large mb-3">
                    <i class="bi bi-person-circle"></i>
                  </div>
                  <button class="btn btn-outline-primary btn-sm" @click="handleAvatarUpload">
                    <i class="bi bi-upload me-1"></i>
                    Upload Photo
                  </button>
                  <p class="text-muted small mt-2 mb-0">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account & Security Tab -->
        <div v-if="activeTab === 'account'" class="tab-pane active">
          <div class="row">
            <div class="col-lg-8">
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="mb-0">Change Password</h5>
                </div>
                <div class="card-body">
                  <form @submit.prevent="changePassword">
                    <div class="mb-3">
                      <label for="current-password" class="form-label">Current Password</label>
                      <input
                        id="current-password"
                        v-model="passwordForm.currentPassword"
                        type="password"
                        class="form-control"
                        required
                      />
                    </div>

                    <div class="mb-3">
                      <label for="new-password" class="form-label">New Password</label>
                      <input
                        id="new-password"
                        v-model="passwordForm.newPassword"
                        type="password"
                        class="form-control"
                        required
                        minlength="8"
                      />
                      <div class="form-text">
                        Must be at least 8 characters with letters and numbers.
                      </div>
                    </div>

                    <div class="mb-3">
                      <label for="confirm-password" class="form-label">Confirm New Password</label>
                      <input
                        id="confirm-password"
                        v-model="passwordForm.confirmPassword"
                        type="password"
                        class="form-control"
                        required
                      />
                    </div>

                    <div class="d-flex justify-content-end gap-2">
                      <button type="button" class="btn btn-secondary" @click="resetPassword" :disabled="isSubmitting">
                        Cancel
                      </button>
                      <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                        {{ isSubmitting ? 'Updating...' : 'Update Password' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">Two-Factor Authentication</h5>
                  <span class="badge bg-secondary">Coming Soon</span>
                </div>
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="mb-1">Enable 2FA</h6>
                      <p class="text-muted small mb-0">
                        Add an extra layer of security to your account
                      </p>
                      <p class="text-info small mb-0 mt-2">
                        <i class="bi bi-info-circle me-1"></i>
                        Full 2FA implementation with TOTP support coming in future updates
                      </p>
                    </div>
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="enable-2fa"
                        v-model="twoFactorEnabled"
                        disabled
                        title="Feature coming soon"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications Tab -->
        <div v-if="activeTab === 'notifications'" class="tab-pane active">
          <div class="row">
            <div class="col-lg-8">
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="mb-0">Email Notifications</h5>
                </div>
                <div class="card-body">
                  <div class="notification-item">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Task Assignments</h6>
                        <p class="text-muted small mb-0">
                          Get notified when you're assigned to a task
                        </p>
                      </div>
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          role="switch"
                          v-model="notificationSettings.taskAssignments"
                          @change="saveNotificationSettings"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="notification-item">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Comments & Mentions</h6>
                        <p class="text-muted small mb-0">
                          Get notified when someone mentions you
                        </p>
                      </div>
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          role="switch"
                          v-model="notificationSettings.commentsMentions"
                          @change="saveNotificationSettings"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="notification-item">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Project Updates</h6>
                        <p class="text-muted small mb-0">
                          Get notified about project status changes
                        </p>
                      </div>
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          role="switch"
                          v-model="notificationSettings.projectUpdates"
                          @change="saveNotificationSettings"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="notification-item">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Due Date Reminders</h6>
                        <p class="text-muted small mb-0">
                          Get reminders for upcoming due dates
                        </p>
                      </div>
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          role="switch"
                          v-model="notificationSettings.dueDateReminders"
                          @change="saveNotificationSettings"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="notification-item border-0">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">Weekly Summary</h6>
                        <p class="text-muted small mb-0">
                          Receive a weekly summary of your activities
                        </p>
                      </div>
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          role="switch"
                          v-model="notificationSettings.weeklySummary"
                          @change="saveNotificationSettings"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Appearance Tab -->
        <div v-if="activeTab === 'appearance'" class="tab-pane active">
          <div class="row">
            <div class="col-lg-8">
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="mb-0">Theme Preferences</h5>
                </div>
                <div class="card-body">
                  <label class="form-label">Color Theme</label>
                  <div class="theme-options">
                    <div class="theme-option">
                      <input
                        type="radio"
                        class="btn-check"
                        name="theme"
                        id="theme-light"
                        value="light"
                        v-model="appearanceSettings.theme"
                        @change="saveAppearanceSettings"
                      />
                      <label class="btn btn-outline-primary" for="theme-light">
                        <i class="bi bi-sun me-2"></i>
                        Light
                      </label>
                    </div>
                    
                    <div class="theme-option">
                      <input
                        type="radio"
                        class="btn-check"
                        name="theme"
                        id="theme-dark"
                        value="dark"
                        v-model="appearanceSettings.theme"
                        @change="saveAppearanceSettings"
                      />
                      <label class="btn btn-outline-primary" for="theme-dark">
                        <i class="bi bi-moon me-2"></i>
                        Dark
                      </label>
                    </div>
                    
                    <div class="theme-option">
                      <input
                        type="radio"
                        class="btn-check"
                        name="theme"
                        id="theme-auto"
                        value="auto"
                        v-model="appearanceSettings.theme"
                        @change="saveAppearanceSettings"
                      />
                      <label class="btn btn-outline-primary" for="theme-auto">
                        <i class="bi bi-circle-half me-2"></i>
                        Auto
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">Display Options</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label for="language" class="form-label">
                      Language <span class="badge bg-secondary ms-2">Coming Soon</span>
                    </label>
                    <select 
                      id="language" 
                      class="form-select"
                      v-model="appearanceSettings.language"
                      disabled
                      title="Feature coming soon"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                    <small class="form-text text-muted">
                      Multi-language support will be available in future updates
                    </small>
                  </div>

                  <div class="mb-3">
                    <label for="timezone" class="form-label">
                      Timezone <span class="badge bg-secondary ms-2">Coming Soon</span>
                    </label>
                    <select 
                      id="timezone" 
                      class="form-select"
                      v-model="appearanceSettings.timezone"
                      disabled
                      title="Feature coming soon"
                    >
                      <option value="utc">UTC (Coordinated Universal Time)</option>
                      <option value="est">Eastern Time (US & Canada)</option>
                      <option value="pst">Pacific Time (US & Canada)</option>
                      <option value="gmt">GMT (London)</option>
                    </select>
                    <small class="form-text text-muted">
                      Timezone customization will be available in future updates
                    </small>
                  </div>

                  <div class="mb-0">
                    <label for="date-format" class="form-label">
                      Date Format <span class="badge bg-secondary ms-2">Coming Soon</span>
                    </label>
                    <select 
                      id="date-format" 
                      class="form-select"
                      v-model="appearanceSettings.dateFormat"
                      disabled
                      title="Feature coming soon"
                    >
                      <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                    <small class="form-text text-muted">
                      Date format customization will be available in future updates
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'
import { usePhoneInput } from '@/composables/usePhoneInput'
import { useNotification } from '@/composables/useNotification'
import { useTheme } from '@/composables/useTheme'

const authStore = useAuthStore()
const activeTab = ref('profile')
const isSubmitting = ref(false)
const { filterPhoneInput } = usePhoneInput()
const toast = useNotification()
const { applyTheme, loadTheme } = useTheme()

// Profile Form
const profileForm = ref({
  name: '',
  email: '',
  bio: '',
  phone: '',
  location: ''
})

// Password Form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Two-Factor Authentication
const twoFactorEnabled = ref(false)

// Notification Settings
const notificationSettings = ref({
  taskAssignments: true,
  commentsMentions: true,
  projectUpdates: true,
  dueDateReminders: true,
  weeklySummary: false
})

// Appearance Settings
const appearanceSettings = ref({
  theme: 'light',
  language: 'en',
  timezone: 'utc',
  dateFormat: 'mm/dd/yyyy'
})

// Load settings from localStorage
const loadSettings = () => {
  try {
    // Load profile
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      profileForm.value = JSON.parse(savedProfile)
    } else {
      // Initialize from auth store
      profileForm.value.name = authStore.user?.name || ''
      profileForm.value.email = authStore.user?.email || ''
    }

    // Load 2FA
    const saved2FA = localStorage.getItem('twoFactorEnabled')
    if (saved2FA) {
      twoFactorEnabled.value = JSON.parse(saved2FA)
    }

    // Load notifications
    const savedNotifications = localStorage.getItem('notificationSettings')
    if (savedNotifications) {
      notificationSettings.value = JSON.parse(savedNotifications)
    }

    // Load appearance
    const savedAppearance = localStorage.getItem('appearanceSettings')
    if (savedAppearance) {
      appearanceSettings.value = JSON.parse(savedAppearance)
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

// Update Profile
const updateProfile = async () => {
  if (isSubmitting.value) return
  
  // Validate name
  if (!profileForm.value.name || profileForm.value.name.trim().length < 2) {
    toast.error('Name must be at least 2 characters')
    return
  }
  
  if (profileForm.value.name.length > 100) {
    toast.error('Name must not exceed 100 characters')
    return
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(profileForm.value.email)) {
    toast.error('Invalid email format')
    return
  }
  
  // Validate phone if provided
  if (profileForm.value.phone) {
    const digitsOnly = profileForm.value.phone.replace(/\D/g, '')
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      toast.error('Phone number must contain 10-15 digits')
      return
    }
    
    // Check for invalid characters
    if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(profileForm.value.phone)) {
      toast.error('Invalid phone number format')
      return
    }
  }
  
  // Validate bio length
  if (profileForm.value.bio && profileForm.value.bio.length > 500) {
    toast.error('Bio must not exceed 500 characters')
    return
  }
  
  // Validate location length
  if (profileForm.value.location && profileForm.value.location.length > 100) {
    toast.error('Location must not exceed 100 characters')
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Call backend API
    const response = await authApi.updateProfile({
      name: profileForm.value.name.trim(),
      email: profileForm.value.email.trim(),
      bio: profileForm.value.bio?.trim() || null,
      phone: profileForm.value.phone?.trim() || null,
      location: profileForm.value.location?.trim() || null
    })
    
    // Update auth store with new user data
    if (response.data) {
      authStore.user = response.data
      // Also update in storage
      const storage = localStorage.getItem('rememberMe') ? localStorage : sessionStorage
      storage.setItem('user', JSON.stringify(response.data))
    }
    
    // Also save to localStorage for settings page
    localStorage.setItem('userProfile', JSON.stringify(profileForm.value))
    
    toast.success('Profile updated successfully!')
  } catch (error: any) {
    console.error('Profile update error:', error)
    toast.error(error.response?.data?.message || 'Failed to update profile')
  } finally {
    isSubmitting.value = false
  }
}

// Reset Profile
const resetProfile = () => {
  loadSettings()
  toast.info('Changes cancelled - form reset to saved values')
}

// Change Password
const changePassword = async () => {
  if (isSubmitting.value) return
  
  // Basic validation
  if (!passwordForm.value.currentPassword) {
    toast.error('Current password is required')
    return
  }
  
  if (!passwordForm.value.newPassword) {
    toast.error('New password is required')
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('Passwords do not match')
    return
  }

  if (passwordForm.value.newPassword.length < 8) {
    toast.error('Password must be at least 8 characters')
    return
  }

  isSubmitting.value = true
  
  try {
    await authApi.changePassword({
      current_password: passwordForm.value.currentPassword,
      new_password: passwordForm.value.newPassword,
      new_password_confirmation: passwordForm.value.confirmPassword
    })
    
    toast.success('Password changed successfully!')
    
    // Clear password form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error: any) {
    console.error('Password change error:', error)
    toast.error(error.response?.data?.message || 'Failed to change password')
  } finally {
    isSubmitting.value = false
  }
}

// Reset Password Form
const resetPassword = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

// Toggle 2FA
const toggle2FA = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // Save to localStorage
    localStorage.setItem('twoFactorEnabled', JSON.stringify(twoFactorEnabled.value))
    
    // Call backend API
    await authApi.updateSettings({
      two_factor_enabled: twoFactorEnabled.value
    })
    
    toast.success(
      twoFactorEnabled.value 
        ? 'Two-factor authentication enabled' 
        : 'Two-factor authentication disabled'
    )
  } catch (error: any) {
    console.error('2FA update error:', error)
    toast.error(error.response?.data?.message || 'Failed to update 2FA settings')
  } finally {
    isSubmitting.value = false
  }
}

// Save Notification Settings
const saveNotificationSettings = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings.value))
    
    // Call backend API
    await authApi.updateSettings({
      notifications: notificationSettings.value
    })
    
    toast.success('Notification preferences saved!')
  } catch (error: any) {
    console.error('Notification settings error:', error)
    toast.error(error.response?.data?.message || 'Failed to save notification settings')
  } finally {
    isSubmitting.value = false
  }
}

// Save Appearance Settings
const saveAppearanceSettings = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // Apply theme immediately
    applyTheme(appearanceSettings.value.theme)
    
    // Save to localStorage
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings.value))
    
    // Call backend API
    await authApi.updateSettings({
      appearance: appearanceSettings.value
    })
    
    toast.success('Theme applied successfully!')
  } catch (error: any) {
    console.error('Appearance settings error:', error)
    toast.error(error.response?.data?.message || 'Failed to save appearance settings')
  } finally {
    isSubmitting.value = false
  }
}

// Handle Avatar Upload
const handleAvatarUpload = () => {
  toast.info('Avatar upload feature coming soon!')
}

// Lifecycle
onMounted(() => {
  loadSettings()
  loadTheme() // Load and apply saved theme
})
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 100px);
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.nav-tabs {
  border-bottom: 2px solid #e2e8f0;
}

.nav-tabs .nav-link {
  border: none;
  color: #64748b;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.nav-tabs .nav-link:hover {
  color: #0d6efd;
  border-bottom-color: #e2e8f0;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  border-bottom-color: #0d6efd;
  background: none;
}

.tab-pane {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-avatar-large {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: white;
}

.profile-avatar-large i {
  font-size: 4rem;
}

.notification-item {
  padding: 1.25rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.notification-item h6 {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9375rem;
}

.form-check-input {
  width: 3rem;
  height: 1.5rem;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.theme-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.theme-option {
  flex: 1;
  min-width: 150px;
}

.theme-option label {
  width: 100%;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-check:checked + .btn-outline-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

/* Card Styling */
.card {
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.card-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 1.25rem;
}

.card-header h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.card-body {
  padding: 1.25rem;
}

/* Alert Styling */
.alert {
  border-radius: 0.5rem;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.alert-success {
  background-color: #d1fae5;
  color: #065f46;
}

.alert-danger {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .nav-tabs .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .theme-option {
    flex: 100%;
  }
}
</style>
