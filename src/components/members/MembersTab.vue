<template>
  <div class="members-tab">
    <!-- Statistics Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-box bg-primary bg-opacity-10 text-primary me-3">
                <i class="bi bi-people fs-4"></i>
              </div>
              <div>
                <h6 class="mb-0 text-muted">Total Members</h6>
                <h3 class="mb-0">{{ members.length }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-box bg-success bg-opacity-10 text-success me-3">
                <i class="bi bi-shield-check fs-4"></i>
              </div>
              <div>
                <h6 class="mb-0 text-muted">Managers</h6>
                <h3 class="mb-0">{{ managerCount }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-box bg-info bg-opacity-10 text-info me-3">
                <i class="bi bi-person-check fs-4"></i>
              </div>
              <div>
                <h6 class="mb-0 text-muted">Members</h6>
                <h3 class="mb-0">{{ regularMemberCount }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-box bg-warning bg-opacity-10 text-warning me-3">
                <i class="bi bi-eye fs-4"></i>
              </div>
              <div>
                <h6 class="mb-0 text-muted">Viewers</h6>
                <h3 class="mb-0">{{ viewerCount }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Members Table Card -->
    <div class="card">
      <div class="card-header bg-white">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h5 class="mb-0">
              <i class="bi bi-people me-2"></i>
              Project Members
            </h5>
          </div>
          <div class="col-md-6 text-end">
            <button 
              v-if="canManageMembers"
              class="btn btn-primary"
              @click="openAddMemberModal"
            >
              <i class="bi bi-person-plus me-1"></i>
              Add Member
            </button>
          </div>
        </div>
      </div>

      <div class="card-body">
        <!-- Search -->
        <div class="row mb-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="Search members..."
                v-model="searchQuery"
              />
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading members...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredMembers.length === 0" class="text-center py-5">
          <i class="bi bi-people display-4 text-muted"></i>
          <p class="text-muted mt-2 mb-0">
            {{ searchQuery ? 'No members found' : 'No members yet' }}
          </p>
          <small class="text-muted">
            {{ searchQuery ? 'Try adjusting your search' : 'Add your first member to get started' }}
          </small>
        </div>

        <!-- Members Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th v-if="canManageMembers" class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in filteredMembers" :key="member.id">
                <!-- Member Info -->
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-md me-3">
                      {{ getInitials(member.user?.name || member.name || 'U') }}
                    </div>
                    <div>
                      <h6 class="mb-0">{{ member.user?.name || member.name || 'Unknown User' }}</h6>
                      <span v-if="member.role === 'owner'" class="badge badge-sm bg-warning text-dark">
                        <i class="bi bi-star-fill me-1"></i>
                        Owner
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td>
                  <span class="text-muted">{{ member.user?.email || member.email || 'No email' }}</span>
                </td>

                <!-- Role -->
                <td>
                  <div v-if="canManageMembers && member.role !== 'owner'" class="role-select-wrapper">
                    <select
                      v-model="member.role"
                      class="form-select form-select-sm"
                      @change="updateRole(member)"
                      :disabled="updatingRoles.has(member.id)"
                    >
                      <option value="manager">Manager</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <span v-if="updatingRoles.has(member.id)" class="spinner-border spinner-border-sm ms-2"></span>
                  </div>
                  <span v-else :class="['badge', getRoleBadgeClass(member.role)]">
                    {{ formatRole(member.role) }}
                  </span>
                </td>

                <!-- Joined Date -->
                <td>
                  <small class="text-muted">{{ formatDate(member.created_at) }}</small>
                </td>

                <!-- Actions -->
                <td v-if="canManageMembers" class="text-end">
                  <button
                    v-if="member.role !== 'owner'"
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmRemoveMember(member)"
                    :disabled="removingMembers.has(member.id)"
                    title="Remove Member"
                  >
                    <span v-if="removingMembers.has(member.id)" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-trash"></i>
                  </button>
                  <span v-else class="text-muted small">
                    <i class="bi bi-lock-fill"></i>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <AddMemberModal
      :is-open="showAddMemberModal"
      :project-id="projectId"
      :existing-members="members"
      @close="showAddMemberModal = false"
      @added="handleMemberAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AddMemberModal from './AddMemberModal.vue'
import * as projectsApi from '@/api/projects'
import type { ProjectMember } from '@/types/models'

interface Props {
  projectId: number
  projectOwnerId?: number
}

const props = defineProps<Props>()

// State
const authStore = useAuthStore()
const loading = ref(false)
const members = ref<any[]>([])
const showAddMemberModal = ref(false)
const searchQuery = ref('')
const updatingRoles = ref<Set<number>>(new Set())
const removingMembers = ref<Set<number>>(new Set())

// Computed
const currentUserId = computed(() => authStore.user?.id)

const canManageMembers = computed(() => {
  const currentMember = members.value.find(m => (m.user_id || m.user?.id) === currentUserId.value)
  return currentMember?.role === 'owner' || currentMember?.role === 'manager'
})

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value

  const query = searchQuery.value.toLowerCase()
  return members.value.filter(member => {
    const name = (member.user?.name || member.name || '').toLowerCase()
    const email = (member.user?.email || member.email || '').toLowerCase()
    return name.includes(query) || email.includes(query)
  })
})

const managerCount = computed(() => {
  return members.value.filter(m => m.role === 'manager' || m.role === 'owner').length
})

const regularMemberCount = computed(() => {
  return members.value.filter(m => m.role === 'member').length
})

const viewerCount = computed(() => {
  return members.value.filter(m => m.role === 'viewer').length
})

// Lifecycle
onMounted(() => {
  loadMembers()
})

// Methods
const loadMembers = async () => {
  loading.value = true
  try {
    const response = await projectsApi.getProjectMembers(props.projectId)
    members.value = response.data || []
  } catch (err: any) {
    console.error('Error loading members:', err)
    members.value = []
  } finally {
    loading.value = false
  }
}

const openAddMemberModal = () => {
  showAddMemberModal.value = true
}

const handleMemberAdded = (newMember: any) => {
  members.value.push(newMember)
  showAddMemberModal.value = false
}

const updateRole = async (member: any) => {
  const memberId = member.id
  const userId = member.user_id || member.user?.id
  const newRole = member.role

  // Add to updating set
  updatingRoles.value.add(memberId)

  try {
    await projectsApi.updateMemberRole(props.projectId, userId, newRole)
    // Role is already updated in the reactive object
  } catch (err: any) {
    console.error('Error updating role:', err)
    alert('Failed to update role. Please try again.')
    // Reload to get correct state
    await loadMembers()
  } finally {
    updatingRoles.value.delete(memberId)
  }
}

const confirmRemoveMember = (member: any) => {
  const name = member.user?.name || member.name || 'this member'
  if (confirm(`Are you sure you want to remove ${name} from the project?`)) {
    removeMember(member)
  }
}

const removeMember = async (member: any) => {
  const memberId = member.id
  const userId = member.user_id || member.user?.id

  // Add to removing set
  removingMembers.value.add(memberId)

  try {
    await projectsApi.removeProjectMember(props.projectId, userId)
    // Remove from local array
    members.value = members.value.filter(m => m.id !== memberId)
  } catch (err: any) {
    console.error('Error removing member:', err)
    alert('Failed to remove member. Please try again.')
  } finally {
    removingMembers.value.delete(memberId)
  }
}

// Utility functions
const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatRole = (role: string | null | undefined): string => {
  if (!role) return 'Member'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const getRoleBadgeClass = (role: string | null | undefined): string => {
  if (!role) return 'bg-primary'
  const classes: Record<string, string> = {
    owner: 'bg-warning text-dark',
    manager: 'bg-success',
    member: 'bg-primary',
    viewer: 'bg-secondary'
  }
  return classes[role] || 'bg-secondary'
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.members-tab {
  padding: 0;
}

.icon-box {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-md {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3B82F6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
}

.badge {
  padding: 0.35rem 0.65rem;
  font-weight: 500;
  font-size: 0.75rem;
}

.badge-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
}

.btn-primary {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.btn-primary:hover {
  background-color: #2563EB;
  border-color: #2563EB;
}

.input-group-text {
  background-color: #f9fafb;
  border-right: 0;
}

.form-control {
  border-left: 0;
}

.form-control:focus {
  border-color: #d1d5db;
  box-shadow: none;
}

.role-select-wrapper {
  display: flex;
  align-items: center;
}

.role-select-wrapper .form-select {
  width: auto;
  min-width: 120px;
}

.table th {
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
}

.table td {
  vertical-align: middle;
}

.table tbody tr:hover {
  background-color: #f9fafb;
}

h5 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

h6 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #374151;
}
</style>
