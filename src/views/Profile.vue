<template>
  <div class="profile-page">
    <div class="container-fluid">
      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>
        {{ successMessage }}
        <button type="button" class="btn-close" @click="successMessage = ''" aria-label="Close"></button>
      </div>

      <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ errorMessage }}
        <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
      </div>

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="row">
          <!-- Left Side - Profile Info -->
          <div class="col-lg-8">
            <div class="profile-info-card">
              <div class="d-flex align-items-start gap-4">
                <!-- Avatar -->
                <div class="profile-avatar">
                  <i class="bi bi-person-circle"></i>
                  <div class="avatar-badge" :class="statusClass">
                    <i class="bi bi-circle-fill"></i>
                  </div>
                </div>

                <!-- User Info -->
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h1 class="profile-name">{{ user?.name || 'User Name' }}</h1>
                      <p class="profile-email mb-2">
                        <i class="bi bi-envelope me-2"></i>
                        {{ user?.email || 'user@example.com' }}
                      </p>
                      <div class="profile-meta">
                        <span class="badge bg-primary me-2">
                          <i class="bi bi-shield-check me-1"></i>
                          {{ userRoleName }}
                        </span>
                        <span class="text-muted">
                          <i class="bi bi-calendar-check me-1"></i>
                          Joined {{ formatDate(user?.created_at) }}
                        </span>
                      </div>
                    </div>
                    <router-link to="/settings" class="btn btn-outline-primary">
                      <i class="bi bi-pencil me-2"></i>
                      Edit Profile
                    </router-link>
                  </div>

                  <!-- Bio Section -->
                  <div v-if="profileData.bio" class="profile-bio">
                    <h6 class="bio-title">
                      <i class="bi bi-person-lines-fill me-2"></i>
                      About
                    </h6>
                    <p class="bio-text">{{ profileData.bio }}</p>
                  </div>

                  <!-- Contact Info -->
                  <div class="contact-info">
                    <div v-if="profileData.phone" class="contact-item">
                      <i class="bi bi-telephone-fill"></i>
                      <span>{{ profileData.phone }}</span>
                    </div>
                    <div v-if="profileData.location" class="contact-item">
                      <i class="bi bi-geo-alt-fill"></i>
                      <span>{{ profileData.location }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side - Stats -->
          <div class="col-lg-4">
            <div class="stats-card">
              <h6 class="stats-title">Activity Overview</h6>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-icon bg-primary">
                    <i class="bi bi-list-task"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ stats.totalTasks }}</div>
                    <div class="stat-label">Total Tasks</div>
                  </div>
                </div>

                <div class="stat-item">
                  <div class="stat-icon bg-success">
                    <i class="bi bi-check-circle"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ stats.completedTasks }}</div>
                    <div class="stat-label">Completed</div>
                  </div>
                </div>

                <div class="stat-item">
                  <div class="stat-icon bg-warning">
                    <i class="bi bi-clock-history"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ stats.pendingTasks }}</div>
                    <div class="stat-label">In Progress</div>
                  </div>
                </div>

                <div class="stat-item">
                  <div class="stat-icon bg-info">
                    <i class="bi bi-folder"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ stats.projects }}</div>
                    <div class="stat-label">Projects</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Details Tabs -->
      <div class="profile-content">
        <ul class="nav nav-tabs mb-4" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'details' }"
              @click="activeTab = 'details'"
              type="button"
            >
              <i class="bi bi-person-badge me-2"></i>
              Details
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'activity' }"
              @click="activeTab = 'activity'"
              type="button"
            >
              <i class="bi bi-activity me-2"></i>
              Activity
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'security' }"
              @click="activeTab = 'security'"
              type="button"
            >
              <i class="bi bi-shield-lock me-2"></i>
              Security
            </button>
          </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Details Tab -->
          <div v-if="activeTab === 'details'" class="tab-pane active">
            <div class="row">
              <div class="col-lg-8">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">Profile Information</h5>
                  </div>
                  <div class="card-body">
                    <div class="info-grid">
                      <div class="info-item">
                        <label>Full Name</label>
                        <div class="info-value">{{ profileData.name || 'Not set' }}</div>
                      </div>

                      <div class="info-item">
                        <label>Email Address</label>
                        <div class="info-value">{{ profileData.email || 'Not set' }}</div>
                      </div>

                      <div class="info-item">
                        <label>Phone Number</label>
                        <div class="info-value">{{ profileData.phone || 'Not set' }}</div>
                      </div>

                      <div class="info-item">
                        <label>Location</label>
                        <div class="info-value">{{ profileData.location || 'Not set' }}</div>
                      </div>

                      <div class="info-item full-width">
                        <label>Biography</label>
                        <div class="info-value">{{ profileData.bio || 'No bio added yet' }}</div>
                      </div>

                      <div class="info-item">
                        <label>Role</label>
                        <div class="info-value">
                          <span class="badge bg-primary">{{ userRoleName }}</span>
                        </div>
                      </div>

                      <div class="info-item">
                        <label>Account Status</label>
                        <div class="info-value">
                          <span class="badge bg-success">Active</span>
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 pt-3 border-top">
                      <router-link to="/settings" class="btn btn-primary">
                        <i class="bi bi-pencil me-2"></i>
                        Edit Profile
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-4">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">Quick Actions</h5>
                  </div>
                  <div class="card-body">
                    <div class="quick-actions">
                      <router-link to="/settings" class="action-link">
                        <i class="bi bi-gear"></i>
                        <span>Account Settings</span>
                      </router-link>
                      <router-link to="/settings?tab=account" class="action-link">
                        <i class="bi bi-key"></i>
                        <span>Change Password</span>
                      </router-link>
                      <router-link to="/settings?tab=notifications" class="action-link">
                        <i class="bi bi-bell"></i>
                        <span>Notifications</span>
                      </router-link>
                      <router-link to="/settings?tab=appearance" class="action-link">
                        <i class="bi bi-palette"></i>
                        <span>Appearance</span>
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Tab -->
          <div v-if="activeTab === 'activity'" class="tab-pane active">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Recent Activity</h5>
              </div>
              <div class="card-body">
                <div class="activity-timeline">
                  <div class="timeline-item">
                    <div class="timeline-icon bg-success">
                      <i class="bi bi-check-circle"></i>
                    </div>
                    <div class="timeline-content">
                      <div class="timeline-title">Task Completed</div>
                      <div class="timeline-description">You completed "Implement user authentication"</div>
                      <div class="timeline-time">2 hours ago</div>
                    </div>
                  </div>

                  <div class="timeline-item">
                    <div class="timeline-icon bg-primary">
                      <i class="bi bi-plus-circle"></i>
                    </div>
                    <div class="timeline-content">
                      <div class="timeline-title">Task Created</div>
                      <div class="timeline-description">You created a new task in "E-Commerce Platform"</div>
                      <div class="timeline-time">5 hours ago</div>
                    </div>
                  </div>

                  <div class="timeline-item">
                    <div class="timeline-icon bg-info">
                      <i class="bi bi-chat-dots"></i>
                    </div>
                    <div class="timeline-content">
                      <div class="timeline-title">Comment Added</div>
                      <div class="timeline-description">You commented on "Design UI mockups"</div>
                      <div class="timeline-time">1 day ago</div>
                    </div>
                  </div>

                  <div class="timeline-item">
                    <div class="timeline-icon bg-warning">
                      <i class="bi bi-arrow-repeat"></i>
                    </div>
                    <div class="timeline-content">
                      <div class="timeline-title">Task Updated</div>
                      <div class="timeline-description">You updated the status of "Setup CI/CD pipeline"</div>
                      <div class="timeline-time">2 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Security Tab -->
          <div v-if="activeTab === 'security'" class="tab-pane active">
            <div class="row">
              <div class="col-lg-8">
                <div class="card mb-4">
                  <div class="card-header">
                    <h5 class="mb-0">Security Settings</h5>
                  </div>
                  <div class="card-body">
                    <div class="security-item">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 class="mb-1">Password</h6>
                          <p class="text-muted small mb-0">
                            Last changed: {{ formatDate(user?.updated_at) }}
                          </p>
                        </div>
                        <router-link to="/settings?tab=account" class="btn btn-outline-primary btn-sm">
                          Change Password
                        </router-link>
                      </div>
                    </div>

                    <div class="security-item">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 class="mb-1">Two-Factor Authentication</h6>
                          <p class="text-muted small mb-0">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <router-link to="/settings?tab=account" class="btn btn-outline-primary btn-sm">
                          Configure
                        </router-link>
                      </div>
                    </div>

                    <div class="security-item border-0">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 class="mb-1">Active Sessions</h6>
                          <p class="text-muted small mb-0">
                            Manage devices where you're currently logged in
                          </p>
                        </div>
                        <button class="btn btn-outline-secondary btn-sm" disabled>
                          View Sessions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">Account Information</h5>
                  </div>
                  <div class="card-body">
                    <div class="info-row">
                      <label>Account Created</label>
                      <span>{{ formatDate(user?.created_at) }}</span>
                    </div>
                    <div class="info-row">
                      <label>Last Login</label>
                      <span>{{ formatDate(user?.updated_at) }}</span>
                    </div>
                    <div class="info-row">
                      <label>Email Verified</label>
                      <span>
                        <i class="bi bi-check-circle-fill text-success me-1"></i>
                        Verified
                      </span>
                    </div>
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const activeTab = ref('details')
const successMessage = ref('')
const errorMessage = ref('')

// Get user from auth store
const user = computed(() => authStore.user)

// Profile data from localStorage (for extra fields like bio, phone, location)
const profileData = ref({
  name: '',
  email: '',
  bio: '',
  phone: '',
  location: ''
})

// Mock stats (you can replace with real API calls)
const stats = ref({
  totalTasks: 24,
  completedTasks: 18,
  pendingTasks: 6,
  projects: 4
})

// Computed properties
const userRoleName = computed(() => {
  const role = user.value?.role || 'user'
  return role.charAt(0).toUpperCase() + role.slice(1)
})

const statusClass = computed(() => {
  return 'status-online' // Can be dynamic based on user status
})

// Methods
const loadProfileData = () => {
  // Load from auth store
  if (user.value) {
    profileData.value.name = user.value.name
    profileData.value.email = user.value.email
  }

  // Load additional data from localStorage (saved from settings page)
  const savedProfile = localStorage.getItem('userProfile')
  if (savedProfile) {
    try {
      const parsed = JSON.parse(savedProfile)
      profileData.value = { ...profileData.value, ...parsed }
    } catch (error) {
      console.error('Error parsing saved profile:', error)
    }
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadProfileData()
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 100px);
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.profile-header {
  margin-bottom: 2rem;
}

.profile-info-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.profile-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 4rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
}

.avatar-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-badge.status-online {
  background-color: #10b981;
}

.avatar-badge i {
  font-size: 0.5rem;
  color: white;
}

.profile-name {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.profile-email {
  font-size: 1rem;
  color: #64748b;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.profile-bio {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border-left: 4px solid #667eea;
}

.bio-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.75rem;
}

.bio-text {
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.contact-info {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9375rem;
}

.contact-item i {
  color: #667eea;
  font-size: 1rem;
}

.stats-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.stats-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  transition: transform 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.profile-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  color: #667eea;
  border-bottom-color: #e2e8f0;
}

.nav-tabs .nav-link.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: none;
}

.card {
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
}

.card-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1.25rem;
}

.card-header h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.info-value {
  font-size: 1rem;
  color: #1e293b;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 0.5rem;
  color: #475569;
  text-decoration: none;
  transition: all 0.2s;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.action-link:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateX(4px);
}

.action-link i {
  font-size: 1.25rem;
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.timeline-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.timeline-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.timeline-description {
  color: #64748b;
  font-size: 0.9375rem;
  margin-bottom: 0.5rem;
}

.timeline-time {
  font-size: 0.875rem;
  color: #94a3b8;
}

.security-item {
  padding: 1.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.security-item h6 {
  font-weight: 600;
  color: #1e293b;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row label {
  font-weight: 600;
  color: #64748b;
  margin: 0;
}

.info-row span {
  color: #1e293b;
}

.alert {
  border-radius: 0.75rem;
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

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem 0;
  }
  
  .profile-info-card {
    padding: 1.5rem;
  }
  
  .profile-avatar {
    width: 80px;
    height: 80px;
    font-size: 3rem;
  }
  
  .profile-name {
    font-size: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-tabs .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
</style>
