<template>
  <div class="users-view container-fluid py-4">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col">
          <h2>
            <i class="bi bi-people me-2"></i>
            User Management
          </h2>
          <p class="text-muted mb-0">Manage system users and their roles</p>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-person-plus me-2"></i>
            Add User
          </button>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Search by name or email..."
              />
            </div>
          </div>
          <div class="col-md-3">
            <select v-model="roleFilter" class="form-select">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
            </select>
          </div>
          <div class="col-md-3">
            <button class="btn btn-outline-secondary w-100" @click="clearFilters">
              <i class="bi bi-x-circle me-2"></i>
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="stats-card">
          <div class="stats-icon bg-primary">
            <i class="bi bi-people-fill"></i>
          </div>
          <div class="stats-info">
            <h3>{{ userStore.usersCount }}</h3>
            <p>Total Users</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stats-card">
          <div class="stats-icon bg-danger">
            <i class="bi bi-shield-fill-check"></i>
          </div>
          <div class="stats-info">
            <h3>{{ userStore.adminUsers.length }}</h3>
            <p>Admins</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stats-card">
          <div class="stats-icon bg-warning">
            <i class="bi bi-briefcase-fill"></i>
          </div>
          <div class="stats-info">
            <h3>{{ userStore.managerUsers.length }}</h3>
            <p>Managers</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stats-card">
          <div class="stats-icon bg-success">
            <i class="bi bi-person-fill"></i>
          </div>
          <div class="stats-info">
            <h3>{{ userStore.memberUsers.length }}</h3>
            <p>Members</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="userStore.loading && !userStore.hasUsers" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading users...</span>
      </div>
      <p class="text-muted mt-2">Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="userStore.error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ userStore.error }}
    </div>

    <!-- Users Table -->
    <div v-else-if="userStore.hasUsers" class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="user-avatar me-2">
                      {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                    <strong>{{ user.name }}</strong>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span 
                    class="badge"
                    :class="{
                      'bg-danger': user.role === 'admin',
                      'bg-warning': user.role === 'manager',
                      'bg-success': user.role === 'member'
                    }"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td>{{ formatDate(user.created_at) }}</td>
                <td class="text-end">
                  <button
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="editUser(user)"
                    :disabled="user.id === authStore.user?.id"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteUser(user.id)"
                    :disabled="user.id === authStore.user?.id"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5">
      <i class="bi bi-people text-muted" style="font-size: 4rem;"></i>
      <h4 class="mt-3">No users found</h4>
      <p class="text-muted">Add your first user to get started</p>
      <button class="btn btn-primary mt-3" @click="openCreateModal">
        <i class="bi bi-person-plus me-2"></i>
        Add First User
      </button>
    </div>

    <!-- Create/Edit User Modal -->
    <div class="modal fade" :class="{ 'show d-block': showModal }" tabindex="-1" ref="modalElement">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingUser ? 'Edit User' : 'Add New User' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="form-control"
                  required
                  placeholder="Enter user name"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="form-control"
                  required
                  placeholder="Enter email address"
                />
              </div>
              <div class="mb-3" v-if="!editingUser">
                <label class="form-label">Password</label>
                <input
                  v-model="formData.password"
                  type="password"
                  class="form-control"
                  required
                  placeholder="Enter password"
                  minlength="8"
                />
                <small class="text-muted">Minimum 8 characters</small>
              </div>
              <div class="mb-3" v-else>
                <label class="form-label">New Password (optional)</label>
                <input
                  v-model="formData.password"
                  type="password"
                  class="form-control"
                  placeholder="Leave blank to keep current password"
                  minlength="8"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Role</label>
                <select v-model="formData.role" class="form-select" required>
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div v-if="modalError" class="alert alert-danger">
                {{ modalError }}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? 'Saving...' : 'Save User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/api/users'

const userStore = useUserStore()
const authStore = useAuthStore()

// State
const showModal = ref(false)
const modalElement = ref<HTMLElement | null>(null)
const editingUser = ref<User | null>(null)
const submitting = ref(false)
const modalError = ref<string | null>(null)
const searchQuery = ref('')
const roleFilter = ref('')

const formData = reactive({
  name: '',
  email: '',
  password: '',
  role: 'member'
})

// Computed
const filteredUsers = computed(() => {
  let filtered = userStore.users

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  // Role filter
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  return filtered
})

// Methods
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  roleFilter.value = ''
}

const openCreateModal = () => {
  editingUser.value = null
  formData.name = ''
  formData.email = ''
  formData.password = ''
  formData.role = 'member'
  modalError.value = null
  showModal.value = true
}

const editUser = (user: User) => {
  editingUser.value = user
  formData.name = user.name
  formData.email = user.email
  formData.password = ''
  formData.role = user.role
  modalError.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  modalError.value = null

  try {
    if (editingUser.value) {
      // Update user
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      }
      if (formData.password) {
        updateData.password = formData.password
      }
      await userStore.updateUser(editingUser.value.id, updateData)
    } else {
      // Create user
      await userStore.createUser(formData)
    }
    closeModal()
  } catch (error: any) {
    modalError.value = error.response?.data?.message || 'Failed to save user'
  } finally {
    submitting.value = false
  }
}

const deleteUser = async (id: number) => {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return
  }

  try {
    await userStore.deleteUser(id)
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to delete user')
  }
}

// Lifecycle
onMounted(() => {
  userStore.fetchUsers()
})
</script>

<style scoped>
.users-view {
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
}

.page-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.stats-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin-right: 1rem;
}

.stats-info h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
}

.stats-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.card {
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.btn-primary {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.btn-primary:hover {
  background-color: #2563EB;
  border-color: #2563EB;
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
