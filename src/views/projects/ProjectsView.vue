<template>
  <div class="projects-container">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">
          <i class="bi bi-folder2-open me-2"></i>
          Projects
        </h2>
        <p class="text-muted mb-0">Manage and track all your projects</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <i class="bi bi-plus-lg me-2"></i>
        Create Project
      </button>
    </div>

    <!-- Filters Section -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <!-- Search -->
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-white">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="Search projects..."
                v-model="searchQuery"
                @input="handleSearchChange"
              />
            </div>
          </div>

          <!-- Status Filter -->
          <div class="col-md-3">
            <select
              class="form-select"
              v-model="statusFilter"
              @change="handleFilterChange"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <!-- Priority Filter -->
          <div class="col-md-3">
            <select
              class="form-select"
              v-model="priorityFilter"
              @change="handleFilterChange"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <!-- Clear Filters -->
          <div class="col-md-2">
            <button
              class="btn btn-outline-secondary w-100"
              @click="clearFilters"
              :disabled="!hasActiveFilters"
            >
              <i class="bi bi-x-circle me-1"></i>
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="projectStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading projects...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!projectStore.hasProjects && !hasActiveFilters"
      class="empty-state text-center py-5"
    >
      <i class="bi bi-folder-x display-1 text-muted"></i>
      <h4 class="mt-3">No Projects Yet</h4>
      <p class="text-muted">Get started by creating your first project</p>
      <button class="btn btn-primary mt-3" @click="openCreateModal">
        <i class="bi bi-plus-lg me-2"></i>
        Create Your First Project
      </button>
    </div>

    <!-- No Results State -->
    <div
      v-else-if="!projectStore.hasProjects && hasActiveFilters"
      class="empty-state text-center py-5"
    >
      <i class="bi bi-search display-1 text-muted"></i>
      <h4 class="mt-3">No Projects Found</h4>
      <p class="text-muted">Try adjusting your filters or search query</p>
      <button class="btn btn-outline-secondary mt-3" @click="clearFilters">
        Clear Filters
      </button>
    </div>

    <!-- Projects Table -->
    <div v-else class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">Name</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Owner</th>
                <th class="text-center">Tasks</th>
                <th class="text-center">Members</th>
                <th>Created</th>
                <th class="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="project in projectStore.projects" :key="project.id">
                <!-- Name -->
                <td class="ps-4">
                  <div class="fw-semibold">{{ project.name }}</div>
                  <small v-if="project.description" class="text-muted">
                    {{ truncateText(project.description, 60) }}
                  </small>
                </td>

                <!-- Status -->
                <td>
                  <span :class="['badge', getStatusClass(project.status)]">
                    {{ formatStatus(project.status) }}
                  </span>
                </td>

                <!-- Priority -->
                <td>
                  <span :class="['badge', getPriorityClass(project.priority)]">
                    {{ formatPriority(project.priority) }}
                  </span>
                </td>

                <!-- Owner -->
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm me-2">
                      {{ getInitials(project.owner.name) }}
                    </div>
                    <div>
                      <div class="small">{{ project.owner.name }}</div>
                    </div>
                  </div>
                </td>

                <!-- Tasks Count -->
                <td class="text-center">
                  <span class="badge bg-secondary">
                    {{ project.tasks_count || 0 }}
                  </span>
                </td>

                <!-- Members Count -->
                <td class="text-center">
                  <span class="badge bg-info">
                    {{ project.members_count || 0 }}
                  </span>
                </td>

                <!-- Created Date -->
                <td>
                  <small class="text-muted">
                    {{ formatDate(project.created_at) }}
                  </small>
                </td>

                <!-- Actions -->
                <td class="text-center pe-4">
                  <div class="btn-group btn-group-sm">
                    <button
                      class="btn btn-outline-primary"
                      @click="viewProject(project.id)"
                      title="View Details"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-outline-secondary"
                      @click="editProject(project)"
                      title="Edit Project"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger"
                      @click="confirmDelete(project)"
                      title="Delete Project"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="card-footer bg-white">
        <div class="row align-items-center">
          <!-- Per Page Selector -->
          <div class="col-md-3">
            <div class="d-flex align-items-center">
              <label class="me-2 text-muted small">Per page:</label>
              <select
                class="form-select form-select-sm"
                style="width: auto;"
                v-model.number="perPageValue"
                @change="handlePerPageChange"
              >
                <option :value="10">10</option>
                <option :value="15">15</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>

          <!-- Pagination Info -->
          <div class="col-md-6 text-center">
            <span class="text-muted small">
              Showing {{ startRecord }} to {{ endRecord }} of {{ projectStore.total }} projects
            </span>
          </div>

          <!-- Pagination Buttons -->
          <div class="col-md-3">
            <nav>
              <ul class="pagination pagination-sm justify-content-end mb-0">
                <li class="page-item" :class="{ disabled: projectStore.currentPage === 1 }">
                  <button
                    class="page-link"
                    @click="goToPage(projectStore.currentPage - 1)"
                    :disabled="projectStore.currentPage === 1"
                  >
                    Previous
                  </button>
                </li>

                <!-- Page Numbers -->
                <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === projectStore.currentPage }"
                >
                  <button class="page-link" @click="goToPage(page)">
                    {{ page }}
                  </button>
                </li>

                <li
                  class="page-item"
                  :class="{ disabled: projectStore.currentPage === projectStore.lastPage }"
                >
                  <button
                    class="page-link"
                    @click="goToPage(projectStore.currentPage + 1)"
                    :disabled="projectStore.currentPage === projectStore.lastPage"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Project Modal -->
    <CreateProjectModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @created="handleProjectCreated"
    />

    <!-- Edit Project Modal -->
    <EditProjectModal
      :is-open="showEditModal"
      :project="projectToEdit"
      @close="showEditModal = false"
      @updated="handleProjectUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import CreateProjectModal from '@/components/projects/CreateProjectModal.vue'
import EditProjectModal from '@/components/projects/EditProjectModal.vue'
import type { Project } from '@/types/models'

const router = useRouter()
const projectStore = useProjectStore()

// Modal state
const showCreateModal = ref(false)
const showEditModal = ref(false)
const projectToEdit = ref<Project | null>(null)

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const perPageValue = ref(15)

// Search debounce timer
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Computed
const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || statusFilter.value || priorityFilter.value)
})

const startRecord = computed(() => {
  return projectStore.total === 0 ? 0 : (projectStore.currentPage - 1) * projectStore.perPage + 1
})

const endRecord = computed(() => {
  const end = projectStore.currentPage * projectStore.perPage
  return Math.min(end, projectStore.total)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = projectStore.lastPage
  const current = projectStore.currentPage

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push(-1) // Ellipsis
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push(-1) // Ellipsis
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push(-1) // Ellipsis
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push(-1) // Ellipsis
      pages.push(total)
    }
  }

  return pages.filter(p => p !== -1) // Remove ellipsis for now
})

// Methods
const openCreateModal = () => {
  showCreateModal.value = true
}

const handleProjectCreated = (project: Project) => {
  console.log('Project created:', project)
  // List is automatically refreshed by the store
}

const handleSearchChange = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    projectStore.setSearch(searchQuery.value)
    projectStore.fetchProjects(true)
  }, 500)
}

const handleFilterChange = () => {
  projectStore.setStatus(statusFilter.value)
  projectStore.setPriority(priorityFilter.value)
  projectStore.fetchProjects(true)
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  priorityFilter.value = ''
  projectStore.clearFilters()
  projectStore.fetchProjects(true)
}

const handlePerPageChange = () => {
  projectStore.setPerPage(perPageValue.value)
  projectStore.fetchProjects(true)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= projectStore.lastPage) {
    projectStore.setPage(page)
    projectStore.fetchProjects()
  }
}

const viewProject = (id: number) => {
  router.push(`/projects/${id}`)
}

const editProject = (project: Project) => {
  projectToEdit.value = project
  showEditModal.value = true
}

const handleProjectUpdated = (project: Project) => {
  console.log('Project updated:', project)
  // List is automatically updated by the store
  showEditModal.value = false
  projectToEdit.value = null
}

const confirmDelete = (project: Project) => {
  if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
    deleteProject(project.id)
  }
}

const deleteProject = async (id: number) => {
  try {
    await projectStore.deleteProject(id)
  } catch (error) {
    console.error('Error deleting project:', error)
    alert('Failed to delete project. Please try again.')
  }
}

// Utility functions
const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    draft: 'bg-secondary',
    active: 'bg-success',
    on_hold: 'bg-warning text-dark',
    completed: 'bg-primary',
    archived: 'bg-secondary'
  }
  return classes[status] || 'bg-secondary'
}

const getPriorityClass = (priority: string): string => {
  const classes: Record<string, string> = {
    low: 'bg-secondary',
    medium: 'bg-primary',
    high: 'bg-warning text-dark',
    critical: 'bg-danger'
  }
  return classes[priority] || 'bg-secondary'
}

const formatStatus = (status: string): string => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatPriority = (priority: string): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  projectStore.fetchProjects()
  perPageValue.value = projectStore.perPage
})
</script>

<style scoped>
.projects-container {
  padding: 1.5rem;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #3B82F6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.btn-primary {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.btn-primary:hover {
  background-color: #2563EB;
  border-color: #2563EB;
}

.empty-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.table th {
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.table td {
  vertical-align: middle;
}

.table tbody tr:hover {
  background-color: #f9fafb;
}

.badge {
  padding: 0.35rem 0.65rem;
  font-weight: 500;
  font-size: 0.75rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.input-group-text {
  border-right: 0;
  color: #6B7280;
}

.input-group .form-control {
  border-left: 0;
}

.page-link {
  color: #3B82F6;
}

.page-item.active .page-link {
  background-color: #3B82F6;
  border-color: #3B82F6;
}
</style>
