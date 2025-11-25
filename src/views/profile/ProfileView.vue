<template>
  <div class="profile-view container-fluid py-4">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <h2>
        <i class="bi bi-person me-2"></i>
        My Profile
      </h2>
      <p class="text-muted mb-0">Manage your personal information</p>
    </div>

    <!-- Profile Card -->
    <div class="row">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body">
            <div class="text-center mb-4">
              <div class="profile-avatar-large">
                <i class="bi bi-person-circle"></i>
              </div>
              <h4 class="mt-3">{{ authStore.userName }}</h4>
              <p class="text-muted">{{ authStore.userEmail }}</p>
              <span class="badge bg-primary">{{ authStore.user?.role || 'User' }}</span>
            </div>

            <hr class="my-4" />

            <form @submit.prevent="handleUpdateProfile">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Full Name</label>
                  <input
                    v-model="formData.name"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email Address</label>
                  <input
                    v-model="formData.email"
                    type="email"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-12">
                  <label class="form-label">Role</label>
                  <input
                    :value="authStore.user?.role || 'User'"
                    type="text"
                    class="form-control"
                    disabled
                  />
                  <small class="text-muted">Contact your administrator to change your role</small>
                </div>
              </div>

              <div v-if="successMessage" class="alert alert-success mt-3">
                <i class="bi bi-check-circle-fill me-2"></i>
                {{ successMessage }}
              </div>

              <div v-if="errorMessage" class="alert alert-danger mt-3">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{ errorMessage }}
              </div>

              <div class="mt-4">
                <button type="submit" class="btn btn-primary" :disabled="updating">
                  <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-save me-2"></i>
                  {{ updating ? 'Updating...' : 'Update Profile' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Change Password Card -->
        <div class="card mt-4">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-lock me-2"></i>
              Change Password
            </h5>
            <p class="text-muted">Update your password to keep your account secure</p>

            <form @submit.prevent="handleChangePassword">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Current Password</label>
                  <input
                    v-model="passwordData.current_password"
                    type="password"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">New Password</label>
                  <input
                    v-model="passwordData.new_password"
                    type="password"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Confirm New Password</label>
                  <input
                    v-model="passwordData.confirm_password"
                    type="password"
                    class="form-control"
                    required
                  />
                </div>
              </div>

              <div v-if="passwordSuccess" class="alert alert-success mt-3">
                <i class="bi bi-check-circle-fill me-2"></i>
                {{ passwordSuccess }}
              </div>

              <div v-if="passwordError" class="alert alert-danger mt-3">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{ passwordError }}
              </div>

              <div class="mt-4">
                <button type="submit" class="btn btn-primary" :disabled="changingPassword">
                  <span v-if="changingPassword" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-key me-2"></i>
                  {{ changingPassword ? 'Changing...' : 'Change Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Account Info Sidebar -->
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Account Information</h5>
            <div class="info-item">
              <small class="text-muted">Member Since</small>
              <p>{{ formatDate(authStore.user?.created_at) }}</p>
            </div>
            <div class="info-item">
              <small class="text-muted">Last Updated</small>
              <p>{{ formatDate(authStore.user?.updated_at) }}</p>
            </div>
            <div class="info-item">
              <small class="text-muted">Account Status</small>
              <p>
                <span class="badge bg-success">Active</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { updateProfile, changePassword } from '@/api/profile'
import type { UpdateProfileData, ChangePasswordData } from '@/api/profile'

const authStore = useAuthStore()

// State
const updating = ref(false)
const changingPassword = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const passwordSuccess = ref<string | null>(null)
const passwordError = ref<string | null>(null)

const formData = reactive({
  name: '',
  email: ''
})

const passwordData = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

// Methods
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleUpdateProfile = async () => {
  updating.value = true
  successMessage.value = null
  errorMessage.value = null

  try {
    const profileData: UpdateProfileData = {
      name: formData.name,
      email: formData.email
    }
    
    const response = await updateProfile(profileData)
    
    // Update auth store with new data
    if (response.data?.user) {
      authStore.user = response.data.user
    }
    
    successMessage.value = 'Profile updated successfully!'
    
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to update profile'
  } finally {
    updating.value = false
  }
}

const handleChangePassword = async () => {
  if (passwordData.new_password !== passwordData.confirm_password) {
    passwordError.value = 'New passwords do not match'
    return
  }

  changingPassword.value = true
  passwordSuccess.value = null
  passwordError.value = null

  try {
    const passwordChangeData: ChangePasswordData = {
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
      new_password_confirmation: passwordData.confirm_password
    }
    
    await changePassword(passwordChangeData)
    passwordSuccess.value = 'Password changed successfully!'
    
    // Clear form
    passwordData.current_password = ''
    passwordData.new_password = ''
    passwordData.confirm_password = ''
    
    setTimeout(() => {
      passwordSuccess.value = null
    }, 3000)
  } catch (error: any) {
    passwordError.value = error.response?.data?.message || 'Failed to change password'
  } finally {
    changingPassword.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (authStore.user) {
    formData.name = authStore.user.name
    formData.email = authStore.user.email
  }
})
</script>

<style scoped>
.profile-view {
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
}

.page-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.profile-avatar-large {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  color: #3B82F6;
  font-size: 120px;
  line-height: 1;
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
  margin-bottom: 1rem;
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

.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
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
