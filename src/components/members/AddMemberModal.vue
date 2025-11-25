<template>
  <div 
    class="modal fade" 
    :class="{ show: isOpen, 'd-block': isOpen }"
    tabindex="-1"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-person-plus me-2"></i>
            Add Member to Project
          </h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="closeModal"
            :disabled="loading"
          ></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <!-- User Selection -->
            <div class="mb-3">
              <label for="user" class="form-label">
                Select User <span class="text-danger">*</span>
              </label>
              <select
                id="user"
                v-model="formData.userId"
                class="form-select"
                :class="{ 'is-invalid': errors.userId }"
                required
                :disabled="loading || loadingUsers"
              >
                <option value="">
                  {{ loadingUsers ? 'Loading users...' : 'Choose a user...' }}
                </option>
                <option 
                  v-for="user in availableUsers" 
                  :key="user.id" 
                  :value="user.id"
                >
                  {{ user.name }} ({{ user.email }})
                </option>
              </select>
              <div v-if="errors.userId" class="invalid-feedback">
                {{ errors.userId }}
              </div>
              <small class="text-muted">
                Select a user to add as a member
              </small>
            </div>

            <!-- Role Selection -->
            <div class="mb-3">
              <label for="role" class="form-label">
                Role <span class="text-danger">*</span>
              </label>
              <select
                id="role"
                v-model="formData.role"
                class="form-select"
                :class="{ 'is-invalid': errors.role }"
                required
                :disabled="loading"
              >
                <option value="">Choose a role...</option>
                <option value="manager">Manager</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
              <div v-if="errors.role" class="invalid-feedback">
                {{ errors.role }}
              </div>
              <div class="mt-2">
                <small class="text-muted d-block">
                  <strong>Manager:</strong> Can manage project, add/remove members, create/assign tasks
                </small>
                <small class="text-muted d-block">
                  <strong>Member:</strong> Can create/edit tasks, view project
                </small>
                <small class="text-muted d-block">
                  <strong>Viewer:</strong> Can only view project (read-only)
                </small>
              </div>
            </div>

            <!-- Error Alert -->
            <div v-if="apiError" class="alert alert-danger">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ apiError }}
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="closeModal"
            :disabled="loading"
          >
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-primary"
            @click="handleSubmit"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-plus-lg me-1"></i>
            {{ loading ? 'Adding...' : 'Add Member' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isOpen" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { User } from '@/types/models'
import * as usersApi from '@/api/users'
import * as projectsApi from '@/api/projects'

interface Props {
  isOpen: boolean
  projectId: number
  existingMembers: any[]
}

interface Emits {
  (e: 'close'): void
  (e: 'added', member: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)
const loadingUsers = ref(false)
const allUsers = ref<User[]>([])
const apiError = ref<string | null>(null)

const formData = ref({
  userId: '',
  role: 'member'
})

const errors = ref<Record<string, string>>({})

// Computed
const availableUsers = computed(() => {
  // Filter out users who are already members
  const memberIds = props.existingMembers.map(m => m.user_id || m.id)
  return allUsers.value.filter(user => !memberIds.includes(user.id))
})

const isFormValid = computed(() => {
  return formData.value.userId && formData.value.role
})

// Watch for modal open
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadUsers()
    resetForm()
  }
})

// Methods
const loadUsers = async () => {
  loadingUsers.value = true
  apiError.value = null
  
  try {
    const response = await usersApi.getUsers()
    allUsers.value = response.data || []
  } catch (err: any) {
    console.error('Error loading users:', err)
    apiError.value = 'Failed to load users. Please try again.'
  } finally {
    loadingUsers.value = false
  }
}

const handleSubmit = async () => {
  // Clear errors
  errors.value = {}
  apiError.value = null

  // Validate
  if (!formData.value.userId) {
    errors.value.userId = 'Please select a user'
    return
  }

  if (!formData.value.role) {
    errors.value.role = 'Please select a role'
    return
  }

  loading.value = true

  try {
    // Add member to project
    await projectsApi.addProjectMember(
      props.projectId,
      parseInt(formData.value.userId),
      formData.value.role
    )

    // Find the added user
    const addedUser = allUsers.value.find(u => u.id === parseInt(formData.value.userId))
    
    // Emit success event
    emit('added', {
      user_id: parseInt(formData.value.userId),
      role: formData.value.role,
      user: addedUser
    })

    closeModal()
  } catch (err: any) {
    console.error('Error adding member:', err)
    apiError.value = err.response?.data?.message || 'Failed to add member. Please try again.'
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  if (!loading.value) {
    emit('close')
  }
}

const resetForm = () => {
  formData.value = {
    userId: '',
    role: 'member'
  }
  errors.value = {}
  apiError.value = null
}
</script>

<style scoped>
.modal.show {
  display: block;
  padding-right: 17px;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.btn-primary {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563EB;
  border-color: #2563EB;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-select,
.form-control {
  border: 1px solid #d1d5db;
  padding: 0.625rem 0.875rem;
}

.form-select:focus,
.form-control:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.invalid-feedback {
  display: block;
}

.alert {
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
}
</style>
