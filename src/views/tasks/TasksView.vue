<template>
  <div class="tasks-container">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">
          <i class="bi bi-list-check me-2"></i>
          Tasks
        </h2>
        <p class="text-muted mb-0">Manage and track all your tasks</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <i class="bi bi-plus-lg me-2"></i>
        Create Task
      </button>
    </div>

    <!-- Statistics Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="icon-box bg-primary bg-opacity-10 text-primary me-3">
                <i class="bi bi-list-check fs-4"></i>
              </div>
              <div>
                <h6 class="mb-0 text-muted">Total Tasks</h6>
                <h3 class="mb-0">{{ taskStore.total }}</h3>
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
                <i class="bi bi-arrow-repeat fs-4"></i>
              </div>
              <div>
                <h6 class="mb-0 text-muted">In Progress</h6>
                <h3 class="mb-0">{{ getStatusCount('in_progress') }}</h3>
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
                <i class="bi bi-clock-history fs-4"></i>
              </div>
              <div>
                <h6 class="mb-0 text-muted">Review</h6>
                <h3 class="mb-0">{{ getStatusCount('review') }}</h3>
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
                <i class="bi bi-check-circle fs-4"></i>
              </div>
              <div>
                <h6 class="mb-0 text-muted">Completed</h6>
                <h3 class="mb-0">{{ getStatusCount('done') }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Filters -->
    <AdvancedFilters 
      :users="allUsers"
      @filter="handleAdvancedFilter"
    />

    <!-- Loading State -->
    <div v-if="taskStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading tasks...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!taskStore.hasTasks && !hasActiveFilters"
      class="empty-state text-center py-5"
    >
      <i class="bi bi-clipboard-x display-1 text-muted"></i>
      <h4 class="mt-3">No Tasks Yet</h4>
      <p class="text-muted">Get started by creating your first task</p>
      <button class="btn btn-primary mt-3" @click="openCreateModal">
        <i class="bi bi-plus-lg me-2"></i>
        Create Your First Task
      </button>
    </div>

    <!-- No Results State -->
    <div
      v-else-if="!taskStore.hasTasks && hasActiveFilters"
      class="empty-state text-center py-5"
    >
      <i class="bi bi-search display-1 text-muted"></i>
      <h4 class="mt-3">No Tasks Found</h4>
      <p class="text-muted">Try adjusting your filters or search query</p>
      <button class="btn btn-outline-secondary mt-3" @click="clearFilters">
        Clear Filters
      </button>
    </div>

    <!-- Tasks Table -->
    <div v-else class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th class="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in taskStore.tasks" :key="task.id">
                <!-- Task -->
                <td class="ps-4">
                  <div class="fw-semibold">{{ task.title }}</div>
                  <small v-if="task.description" class="text-muted">
                    {{ truncateText(task.description, 60) }}
                  </small>
                </td>

                <!-- Project -->
                <td>
                  <span class="text-muted">{{ task.project_name || 'N/A' }}</span>
                </td>

                <!-- Status -->
                <td>
                  <span :class="['badge', getTaskStatusClass(task.status)]">
                    {{ formatStatus(task.status) }}
                  </span>
                </td>

                <!-- Priority -->
                <td>
                  <span :class="['badge', getPriorityClass(task.priority)]">
                    {{ formatPriority(task.priority) }}
                  </span>
                </td>

                <!-- Assigned To -->
                <td>
                  <div v-if="task.assigned_user" class="d-flex align-items-center">
                    <div class="avatar-sm me-2">
                      {{ getInitials(task.assigned_user.name) }}
                    </div>
                    <div>
                      <div class="small">{{ task.assigned_user.name }}</div>
                    </div>
                  </div>
                  <span v-else class="text-muted small">Unassigned</span>
                </td>

                <!-- Due Date -->
                <td>
                  <small v-if="task.due_date" class="text-muted">
                    {{ formatDate(task.due_date) }}
                  </small>
                  <span v-else class="text-muted small">-</span>
                </td>

                <!-- Actions -->
                <td class="text-center pe-4">
                  <div class="btn-group btn-group-sm">
                    <button
                      class="btn btn-outline-secondary"
                      @click="editTask(task)"
                      title="Edit Task"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger"
                      @click="confirmDelete(task)"
                      title="Delete Task"
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
              Showing {{ startRecord }} to {{ endRecord }} of {{ taskStore.total }} tasks
            </span>
          </div>

          <!-- Pagination Buttons -->
          <div class="col-md-3">
            <nav>
              <ul class="pagination pagination-sm justify-content-end mb-0">
                <li class="page-item" :class="{ disabled: taskStore.currentPage === 1 }">
                  <button
                    class="page-link"
                    @click="goToPage(taskStore.currentPage - 1)"
                    :disabled="taskStore.currentPage === 1"
                  >
                    Previous
                  </button>
                </li>

                <!-- Page Numbers -->
                <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === taskStore.currentPage }"
                >
                  <button class="page-link" @click="goToPage(page)">
                    {{ page }}
                  </button>
                </li>

                <li
                  class="page-item"
                  :class="{ disabled: taskStore.currentPage === taskStore.lastPage }"
                >
                  <button
                    class="page-link"
                    @click="goToPage(taskStore.currentPage + 1)"
                    :disabled="taskStore.currentPage === taskStore.lastPage"
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

    <!-- Select Project Modal -->
    <SelectProjectModal
      :is-open="showSelectProjectModal"
      :projects="projects"
      @close="showSelectProjectModal = false"
      @selected="handleProjectSelected"
    />

    <!-- Create Task Modal -->
    <CreateTaskModal
      v-if="showCreateModal && selectedProject"
      :is-open="showCreateModal"
      :project-id="selectedProject.id"
      :project-members="[]"
      @close="closeCreateModal"
      @created="handleTaskCreated"
    />

    <!-- Edit Task Modal -->
    <EditTaskModal
      :is-open="showEditModal"
      :task="taskToEdit"
      :project-members="[]"
      @close="closeEditModal"
      @updated="handleTaskUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useProjectStore } from '@/stores/project'
import CreateTaskModal from '@/components/tasks/CreateTaskModal.vue'
import EditTaskModal from '@/components/tasks/EditTaskModal.vue'
import SelectProjectModal from '@/components/tasks/SelectProjectModal.vue'
import AdvancedFilters from '@/components/filters/AdvancedFilters.vue'
import { useUserStore } from '@/stores/user'
import type { Task, Project } from '@/types/models'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

// Modal state
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showSelectProjectModal = ref(false)
const taskToEdit = ref<Task | null>(null)
const selectedProject = ref<Project | null>(null)

// Filters
const searchQuery = ref('')
const projectFilter = ref<number | ''>('')
const statusFilter = ref('')
const priorityFilter = ref('')
const sortBy = ref('created_at')
const perPageValue = ref(15)

// Projects list for filter
const projects = ref<Project[]>([])

// Users list for filter
const allUsers = ref<any[]>([])

// Search debounce timer
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Computed
const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || projectFilter.value || statusFilter.value || priorityFilter.value)
})

const startRecord = computed(() => {
  return taskStore.total === 0 ? 0 : (taskStore.currentPage - 1) * taskStore.perPage + 1
})

const endRecord = computed(() => {
  const end = taskStore.currentPage * taskStore.perPage
  return Math.min(end, taskStore.total)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = taskStore.lastPage
  const current = taskStore.currentPage

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push(total)
    }
  }

  return pages
})

// Methods
const openCreateModal = () => {
  // If no projects, show message
  if (projects.value.length === 0) {
    alert('Please create a project first before creating tasks.')
    return
  }
  
  // Show project selection modal first
  showSelectProjectModal.value = true
}

const handleProjectSelected = (project: Project) => {
  selectedProject.value = project
  showSelectProjectModal.value = false
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  selectedProject.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  taskToEdit.value = null
}

const handleTaskCreated = async () => {
  closeCreateModal()
  // Refresh tasks list
  await taskStore.fetchTasks()
}

const editTask = (task: Task) => {
  taskToEdit.value = task
  showEditModal.value = true
}

const handleTaskUpdated = async () => {
  closeEditModal()
  // Task is automatically updated in store
}

const confirmDelete = (task: Task) => {
  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
    deleteTask(task.id)
  }
}

const deleteTask = async (id: number) => {
  try {
    await taskStore.deleteTask(id)
  } catch (error) {
    console.error('Error deleting task:', error)
    alert('Failed to delete task. Please try again.')
  }
}

const handleAdvancedFilter = (filters: any) => {
  // Apply all filters from AdvancedFilters component
  if (filters.search) {
    taskStore.setSearch(filters.search)
  }
  if (filters.status) {
    taskStore.setStatus(filters.status)
  }
  if (filters.priority) {
    taskStore.setPriority(filters.priority)
  }
  if (filters.assigned_to) {
    // Handle assigned_to filter if your task store supports it
  }
  
  // Fetch tasks with applied filters
  taskStore.fetchTasks(true)
}

const clearFilters = () => {
  taskStore.clearFilters()
  taskStore.fetchTasks(true)
}

const handlePerPageChange = () => {
  taskStore.setPerPage(perPageValue.value)
  taskStore.fetchTasks(true)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= taskStore.lastPage) {
    taskStore.setPage(page)
    taskStore.fetchTasks()
  }
}

const getStatusCount = (status: string): number => {
  return taskStore.tasks.filter(t => t.status === status).length
}

// Utility functions
const getTaskStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    todo: 'bg-secondary',
    in_progress: 'bg-info',
    review: 'bg-warning text-dark',
    done: 'bg-success'
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

const getInitials = (name: string | undefined): string => {
  if (!name) return '?'
  
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

// Load projects for filter
const loadProjects = async () => {
  await projectStore.fetchProjects()
  projects.value = projectStore.projects
}

// Load users for filter
const loadUsers = async () => {
  await userStore.fetchUsers()
  allUsers.value = userStore.users
}

// Lifecycle
onMounted(async () => {
  // Load all data in parallel for faster page load
  await Promise.all([
    loadProjects(),
    loadUsers(),
    taskStore.fetchTasks()
  ])
  perPageValue.value = taskStore.perPage
})
</script>

<style scoped>
.tasks-container {
  padding: 1.5rem;
}

.icon-box {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
