<template>
  <div class="project-details-container">
    <!-- Loading State -->
    <div v-if="projectStore.loading && !project" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading project details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-3" @click="goBack">
        <i class="bi bi-arrow-left me-1"></i>
        Go Back
      </button>
    </div>

    <!-- Project Not Found -->
    <div v-else-if="!project && !projectStore.loading" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      Project not found
      <button class="btn btn-sm btn-outline-warning ms-3" @click="goBack">
        <i class="bi bi-arrow-left me-1"></i>
        Go Back
      </button>
    </div>

    <!-- Project Details -->
    <div v-else-if="project">
      <!-- Header Section -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <!-- Back Button -->
              <button class="btn btn-sm btn-outline-secondary mb-3" @click="goBack">
                <i class="bi bi-arrow-left me-1"></i>
                Back to Projects
              </button>

              <!-- Project Title -->
              <h2 class="mb-2">
                <i class="bi bi-folder2-open me-2 text-primary"></i>
                {{ project.name || 'Untitled Project' }}
              </h2>

              <!-- Status and Priority Badges -->
              <div class="mb-3">
                <span v-if="project.status" :class="['badge me-2', getStatusClass(project.status)]">
                  {{ formatStatus(project.status) }}
                </span>
                <span v-if="project.priority" :class="['badge me-2', getPriorityClass(project.priority)]">
                  Priority: {{ formatPriority(project.priority) }}
                </span>
                <span v-if="project.is_public" class="badge bg-info">
                  <i class="bi bi-globe me-1"></i>
                  Public
                </span>
                <span v-else class="badge bg-secondary">
                  <i class="bi bi-lock-fill me-1"></i>
                  Private
                </span>
              </div>

              <!-- Description -->
              <p v-if="project.description" class="text-muted mb-0">
                {{ project.description }}
              </p>
              <p v-else class="text-muted fst-italic mb-0">
                No description provided
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="ms-3">
              <div class="btn-group">
                <button class="btn btn-primary" @click="editProject">
                  <i class="bi bi-pencil me-1"></i>
                  Edit
                </button>
                <button class="btn btn-outline-danger" @click="confirmDelete">
                  <i class="bi bi-trash me-1"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="icon-box bg-primary bg-opacity-10 text-primary me-3">
                  <i class="bi bi-list-check"></i>
                </div>
                <div>
                  <h6 class="mb-0 text-muted small">Total Tasks</h6>
                  <h3 class="mb-0">{{ tasks.length }}</h3>
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
                  <i class="bi bi-people"></i>
                </div>
                <div>
                  <h6 class="mb-0 text-muted small">Team Members</h6>
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
                <div class="icon-box bg-info bg-opacity-10 text-info me-3">
                  <i class="bi bi-calendar-event"></i>
                </div>
                <div>
                  <h6 class="mb-0 text-muted small">Created</h6>
                  <p class="mb-0 fw-semibold small">{{ project.created_at ? formatDate(project.created_at) : 'N/A' }}</p>
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
                  <i class="bi bi-person-badge"></i>
                </div>
                <div>
                  <h6 class="mb-0 text-muted small">Owner</h6>
                  <p class="mb-0 fw-semibold small">{{ project.owner?.name || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <ul class="nav nav-tabs mb-4" role="tablist">
        <li class="nav-item" role="presentation">
          <button 
            :class="['nav-link', { active: activeTab === 'overview' }]"
            type="button"
            role="tab"
            @click="switchTab('overview')"
          >
            <i class="bi bi-info-circle me-2"></i>
            Overview
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button 
            :class="['nav-link', { active: activeTab === 'tasks' }]"
            type="button"
            role="tab"
            @click="switchTab('tasks')"
          >
            <i class="bi bi-list-check me-2"></i>
            Tasks
            <span class="badge bg-secondary ms-2">{{ tasks.length }}</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button 
            :class="['nav-link', { active: activeTab === 'members' }]"
            type="button"
            role="tab"
            @click="switchTab('members')"
          >
            <i class="bi bi-people me-2"></i>
            Members
            <span class="badge bg-secondary ms-2">{{ members.length }}</span>
          </button>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="tab-pane show active">
          <div class="row g-4">
            <!-- Left Column: Project Info + Team -->
            <div class="col-lg-8">
              <div class="row g-4">
                <!-- Project Information -->
                <div class="col-12">
                  <div class="card">
                    <div class="card-header bg-white">
                      <h5 class="mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        Project Information
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row g-3">
                        <div class="col-md-6">
                          <label class="text-muted small">Project Name</label>
                          <p class="mb-0 fw-semibold">{{ project.name || 'N/A' }}</p>
                        </div>
                        <div class="col-md-6">
                          <label class="text-muted small">Project Slug</label>
                          <p class="mb-0 fw-semibold">{{ project.slug || 'N/A' }}</p>
                        </div>
                        <div class="col-md-6">
                          <label class="text-muted small">Status</label>
                          <p class="mb-0">
                            <span v-if="project.status" :class="['badge', getStatusClass(project.status)]">
                              {{ formatStatus(project.status) }}
                            </span>
                            <span v-else class="text-muted">N/A</span>
                          </p>
                        </div>
                        <div class="col-md-6">
                          <label class="text-muted small">Priority</label>
                          <p class="mb-0">
                            <span v-if="project.priority" :class="['badge', getPriorityClass(project.priority)]">
                              {{ formatPriority(project.priority) }}
                            </span>
                            <span v-else class="text-muted">N/A</span>
                          </p>
                        </div>
                        <div class="col-md-6">
                          <label class="text-muted small">Created At</label>
                          <p class="mb-0">{{ project.created_at ? formatDateTime(project.created_at) : 'N/A' }}</p>
                        </div>
                        <div class="col-md-6">
                          <label class="text-muted small">Last Updated</label>
                          <p class="mb-0">{{ project.updated_at ? formatDateTime(project.updated_at) : 'N/A' }}</p>
                        </div>
                        <div class="col-12" v-if="project.description">
                          <label class="text-muted small">Description</label>
                          <p class="mb-0">{{ project.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Quick Members List -->
                <div class="col-12">
                  <div class="card">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center">
                      <h5 class="mb-0">
                        <i class="bi bi-people me-2"></i>
                        Team
                      </h5>
                      <button class="btn btn-sm btn-link" @click="switchTab('members')">
                        View All
                      </button>
                    </div>
                    <div class="card-body">
                      <!-- Loading Members -->
                      <div v-if="loadingMembers" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </div>

                      <!-- Members List -->
                      <div v-else-if="members.length > 0" class="list-group list-group-flush">
                        <div
                          v-for="member in members.slice(0, 5)"
                          :key="member.id"
                          class="list-group-item px-0 d-flex align-items-center"
                        >
                          <div class="avatar-md me-3">
                            {{ getInitials(member.user?.name || member.name) }}
                          </div>
                          <div class="flex-grow-1">
                            <h6 class="mb-0 small">{{ member.user?.name || member.name || 'Unknown' }}</h6>
                            <small class="text-muted">{{ formatRole(member.role) }}</small>
                          </div>
                        </div>
                        <div v-if="members.length > 5" class="text-center mt-2">
                          <button class="btn btn-sm btn-link" @click="switchTab('members')">
                            +{{ members.length - 5 }} more
                          </button>
                        </div>
                      </div>

                      <!-- Empty State -->
                      <div v-else class="text-center py-4">
                        <i class="bi bi-people display-6 text-muted"></i>
                        <p class="text-muted mt-2 mb-0 small">No members yet</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Activity Timeline -->
            <div class="col-lg-4">
              <ActivityTimeline 
                v-if="project && project.id" 
                title="Project Activity" 
                :projectId="project.id" 
              />
            </div>
          </div>
        </div>

        <!-- Tasks Tab -->
        <div v-if="activeTab === 'tasks'" class="tab-pane show active">
          <div class="card">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-list-check me-2"></i>
                Project Tasks
              </h5>
              <button class="btn btn-primary" @click="openCreateTaskModal">
                <i class="bi bi-plus-lg me-1"></i>
                Add Task
              </button>
            </div>
            <div class="card-body">
              <!-- Loading Tasks -->
              <div v-if="loadingTasks" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Loading tasks...</p>
              </div>

              <!-- Empty State -->
              <div v-else-if="tasks.length === 0" class="text-center py-5">
                <i class="bi bi-clipboard-x display-4 text-muted"></i>
                <p class="text-muted mt-2 mb-0">No tasks yet</p>
                <small class="text-muted">Create your first task to get started</small>
              </div>

              <!-- Tasks List -->
              <div v-else class="list-group list-group-flush">
                <div
                  v-for="task in tasks"
                  :key="task.id"
                  class="list-group-item px-0 task-item"
                  @click="viewTaskDetails(task)"
                >
                  <div class="d-flex align-items-start">
                    <div class="flex-grow-1" style="cursor: pointer;">
                      <h6 class="mb-1">
                        <i class="bi bi-clipboard-check me-2 text-primary"></i>
                        {{ task.title }}
                      </h6>
                      <small class="text-muted">{{ task.description || 'No description' }}</small>
                      <div class="mt-2">
                        <span v-if="task.status" :class="['badge badge-sm me-1', getTaskStatusClass(task.status)]">
                          {{ formatStatus(task.status) }}
                        </span>
                        <span v-if="task.priority" :class="['badge badge-sm', getPriorityClass(task.priority)]">
                          {{ formatPriority(task.priority) }}
                        </span>
                      </div>
                    </div>
                    <div class="btn-group btn-group-sm" @click.stop>
                      <button 
                        class="btn btn-outline-info"
                        @click="viewTaskDetails(task)"
                        title="View Details"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      <button 
                        class="btn btn-outline-secondary"
                        @click="editTask(task)"
                        title="Edit Task"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-outline-danger"
                        @click="confirmDeleteTask(task)"
                        title="Delete Task"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Members Tab -->
        <div v-if="activeTab === 'members'" class="tab-pane show active">
          <MembersTab 
            v-if="project && project.id && project.owner"
            :project-id="project.id"
            :project-owner-id="project.owner.id"
            @members-updated="handleMembersUpdated"
          />
        </div>
      </div>
    </div>

    <!-- Edit Project Modal -->
    <EditProjectModal
      v-if="project"
      :is-open="showEditModal"
      :project="project"
      @close="showEditModal = false"
      @updated="handleProjectUpdated"
    />

    <!-- Create Task Modal -->
    <CreateTaskModal
      v-if="project && project.id"
      :is-open="showCreateTaskModal"
      :project-id="project.id"
      :project-members="members"
      @close="showCreateTaskModal = false"
      @created="handleTaskCreated"
    />

    <!-- Edit Task Modal -->
    <EditTaskModal
      v-if="taskToEdit"
      :is-open="showEditTaskModal"
      :task="taskToEdit"
      :project-members="members"
      @close="showEditTaskModal = false"
      @updated="handleTaskUpdated"
    />

    <!-- Task Details Modal -->
    <TaskDetailsModal
      v-if="taskToView"
      :is-open="showTaskDetailsModal"
      :task="taskToView"
      @close="showTaskDetailsModal = false"
      @edit="handleEditFromDetails"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import EditProjectModal from '@/components/projects/EditProjectModal.vue'
import CreateTaskModal from '@/components/tasks/CreateTaskModal.vue'
import EditTaskModal from '@/components/tasks/EditTaskModal.vue'
import TaskDetailsModal from '@/components/tasks/TaskDetailsModal.vue'
import MembersTab from '@/components/members/MembersTab.vue'
import ActivityTimeline from '@/components/activity/ActivityTimeline.vue'
import type { Project, Task } from '@/types/models'
import * as projectsApi from '@/api/projects'
import * as tasksApi from '@/api/tasks'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

// State
const project = computed(() => projectStore.currentProject)
const error = ref<string | null>(null)
const showEditModal = ref(false)
const showCreateTaskModal = ref(false)
const showEditTaskModal = ref(false)
const showTaskDetailsModal = ref(false)
const taskToEdit = ref<Task | null>(null)
const taskToView = ref<Task | null>(null)
const activeTab = ref('overview')

// Members and Tasks state
const members = ref<any[]>([])
const tasks = ref<any[]>([])
const loadingMembers = ref(false)
const loadingTasks = ref(false)

// Lifecycle
onMounted(async () => {
  await loadProjectDetails()
})

// Tab switching method
const switchTab = (tab: string) => {
  console.log('Switching to tab:', tab)
  console.log('Current tasks:', tasks.value.length)
  console.log('Current members:', members.value.length)
  activeTab.value = tab
}

// Methods
const loadProjectDetails = async () => {
  const projectId = parseInt(route.params.id as string)
  
  if (isNaN(projectId)) {
    error.value = 'Invalid project ID'
    return
  }

  try {
    // Load project details
    await projectStore.fetchProject(projectId)
    
    // Check if project was loaded
    if (!project.value) {
      error.value = 'Project not found'
      return
    }
    
    // Load members and tasks in parallel
    await Promise.all([
      loadMembers(projectId),
      loadTasks(projectId)
    ])
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load project details'
    console.error('Error loading project:', err)
  }
}

const loadMembers = async (projectId: number) => {
  loadingMembers.value = true
  try {
    const response = await projectsApi.getProjectMembers(projectId)
    members.value = response.data || []
  } catch (err: any) {
    console.error('Error loading members:', err)
    members.value = []
  } finally {
    loadingMembers.value = false
  }
}

const loadTasks = async (projectId: number) => {
  loadingTasks.value = true
  try {
    const response = await projectsApi.getProjectTasks(projectId)
    tasks.value = response.data || []
  } catch (err: any) {
    console.error('Error loading tasks:', err)
    tasks.value = []
  } finally {
    loadingTasks.value = false
  }
}

const handleMembersUpdated = () => {
  if (project.value?.id) {
    loadMembers(project.value.id)
  }
}

const goBack = () => {
  router.push({ name: 'projects' })
}

const editProject = () => {
  showEditModal.value = true
}

const handleProjectUpdated = (updatedProject: Project) => {
  showEditModal.value = false
}

const confirmDelete = () => {
  if (!project.value) return
  
  if (confirm(`Are you sure you want to delete "${project.value.name || 'this project'}"? This action cannot be undone.`)) {
    deleteProject()
  }
}

const deleteProject = async () => {
  if (!project.value) return
  
  try {
    await projectStore.deleteProject(project.value.id)
    router.push({ name: 'projects' })
  } catch (err: any) {
    alert('Failed to delete project. Please try again.')
    console.error('Error deleting project:', err)
  }
}

// Task methods
const openCreateTaskModal = () => {
  showCreateTaskModal.value = true
}

const handleTaskCreated = (task: Task) => {
  tasks.value.unshift(task)
  showCreateTaskModal.value = false
}

const viewTaskDetails = (task: Task) => {
  taskToView.value = task
  showTaskDetailsModal.value = true
}

const editTask = (task: Task) => {
  taskToEdit.value = task
  showEditTaskModal.value = true
}

const handleEditFromDetails = (task: Task) => {
  showTaskDetailsModal.value = false
  setTimeout(() => {
    editTask(task)
  }, 300)
}

const handleTaskUpdated = async (updatedTask: Task) => {
  console.log('Task updated:', updatedTask)
  
  // Close the edit modal first
  showEditTaskModal.value = false
  taskToEdit.value = null
  
  // Fetch the fresh task data from API to get all relationships
  try {
    const response = await tasksApi.getTask(updatedTask.id)
    const freshTask = response.data
    
    // Update in tasks array
    const index = tasks.value.findIndex(t => t.id === updatedTask.id)
    if (index !== -1) {
      tasks.value[index] = freshTask
    }
    
    // If this task is currently being viewed, update it
    if (taskToView.value?.id === updatedTask.id) {
      console.log('Updating taskToView with fresh data')
      taskToView.value = freshTask
      
      // Force modal to re-render with updated data
      if (showTaskDetailsModal.value) {
        // Close and reopen the modal to force refresh
        showTaskDetailsModal.value = false
        await new Promise(resolve => setTimeout(resolve, 50))
        showTaskDetailsModal.value = true
      }
    }
  } catch (error) {
    console.error('Failed to fetch updated task:', error)
    // Fallback to using the updatedTask data
    const index = tasks.value.findIndex(t => t.id === updatedTask.id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }
    if (taskToView.value?.id === updatedTask.id) {
      taskToView.value = updatedTask
    }
  }
}

const confirmDeleteTask = (task: Task) => {
  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
    deleteTask(task.id)
  }
}

const deleteTask = async (taskId: number) => {
  try {
    await tasksApi.deleteTask(taskId)
    tasks.value = tasks.value.filter(t => t.id !== taskId)
  } catch (err: any) {
    alert('Failed to delete task. Please try again.')
    console.error('Error deleting task:', err)
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
  if (!status) return 'N/A'
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatPriority = (priority: string): string => {
  if (!priority) return 'N/A'
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

const formatRole = (role: string | null | undefined): string => {
  if (!role) return 'Member'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'N/A'
  }
}

const formatDateTime = (dateString: string): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'N/A'
  }
}

const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}
</script>

<style scoped>
.project-details-container {
  padding: 1.5rem;
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
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

.list-group-item {
  border-left: 0;
  border-right: 0;
  transition: background-color 0.2s ease;
}

.list-group-item.task-item:hover {
  background-color: #F9FAFB;
  cursor: pointer;
}

.list-group-item:first-child {
  border-top: 0;
}

.list-group-item:last-child {
  border-bottom: 0;
}

label.small {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
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

/* Tab Styles */
.nav-tabs {
  border-bottom: 2px solid #e5e7eb;
}

.nav-tabs .nav-link {
  border: none;
  background: none;
  color: #6b7280;
  padding: 1rem 1.5rem;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-tabs .nav-link:hover {
  color: #3B82F6;
  border-bottom-color: #3B82F6;
}

.nav-tabs .nav-link.active {
  color: #3B82F6;
  border-bottom-color: #3B82F6;
}

.tab-content {
  min-height: 300px;
}

.tab-pane {
  display: block !important;
  opacity: 1 !important;
  animation: fadeIn 0.2s ease;
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
</style>
