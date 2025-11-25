<template>
  <div class="kanban-page">
    <!-- Filters Header -->
    <div class="kanban-header">
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <!-- Project Filter -->
          <select
            v-model="selectedProjectId"
            @change="loadTasks"
            class="form-select"
            style="width: 220px;"
          >
            <option value="">All Projects</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
          
          <!-- Create Task Button -->
          <router-link to="/tasks" class="btn btn-primary btn-sm">
            <i class="bi bi-plus-lg me-2"></i>
            New Task
          </router-link>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-white" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-white mt-3">Loading tasks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger m-3">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-3" @click="loadTasks">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Retry
      </button>
    </div>

    <!-- Kanban Board -->
    <div v-else class="kanban-board">
      <div class="kanban-columns">
        <KanbanColumn
          v-for="column in columns"
          :key="column.status"
          :column="column"
          :tasks="getTasksByStatus(column.status)"
          @task-moved="handleTaskMoved"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import KanbanColumn from '@/components/kanban/KanbanColumn.vue'
import api from '@/services/api'

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  due_date: string | null
  project?: {
    id: number
    name: string
  }
  assigned_user?: {
    id: number
    name: string
  }
  tags?: Array<{
    id: number
    name: string
    color: string
  }>
}

interface Project {
  id: number
  name: string
}

interface Column {
  status: string
  title: string
  color: string
  count: number
}

const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)
const tasks = ref<Task[]>([])
const projects = ref<Project[]>([])
const selectedProjectId = ref('')

const columns = ref<Column[]>([
  { status: 'todo', title: 'To Do', color: 'secondary', count: 0 },
  { status: 'in_progress', title: 'In Progress', color: 'primary', count: 0 },
  { status: 'review', title: 'Review', color: 'warning', count: 0 },
  { status: 'done', title: 'Done', color: 'success', count: 0 }
])

const loadProjects = async () => {
  try {
    const response = await api.get('/projects', {
      params: { per_page: 100 }
    })
    projects.value = response.data.data || []
  } catch (err: any) {
    console.error('Error loading projects:', err)
    error.value = 'Failed to load projects'
  }
}

const loadTasks = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params: any = { per_page: 1000 }
    if (selectedProjectId.value) {
      params.project_id = selectedProjectId.value
    }
    
    const response = await api.get('/tasks', { params })
    tasks.value = response.data.data || []
    
    columns.value.forEach(column => {
      column.count = tasks.value.filter(task => task.status === column.status).length
    })
  } catch (err: any) {
    console.error('Error loading tasks:', err)
    error.value = err.response?.data?.message || 'Failed to load tasks'
  } finally {
    loading.value = false
  }
}

const getTasksByStatus = (status: string) => {
  return tasks.value.filter(task => task.status === status)
}

const handleTaskMoved = async ({ taskId, newStatus }: { taskId: number; newStatus: string }) => {
  // Optimistic update - update UI immediately
  const taskIndex = tasks.value.findIndex(t => t.id === taskId)
  if (taskIndex !== -1) {
    const oldStatus = tasks.value[taskIndex].status
    tasks.value[taskIndex].status = newStatus
    
    // Update column counts
    columns.value.forEach(column => {
      column.count = tasks.value.filter(task => task.status === column.status).length
    })
    
    try {
      // Update on server
      await api.put(`/tasks/${taskId}`, { status: newStatus })
    } catch (err: any) {
      // Revert on error
      tasks.value[taskIndex].status = oldStatus
      columns.value.forEach(column => {
        column.count = tasks.value.filter(task => task.status === column.status).length
      })
      console.error('Error updating task status:', err)
      error.value = 'Failed to update task status'
    }
  }
}

onMounted(async () => {
  await loadProjects()
  await loadTasks()
})
</script>

<style scoped>
.kanban-page {
  margin: -1.5rem;
  min-height: calc(100vh - 132px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.kanban-header {
  background: rgba(255, 255, 255, 0.98);
  padding: 1rem 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.kanban-board {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.kanban-columns {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  align-items: flex-start;
  position: relative;
}

/* Scroll hint - fade on right side */
.kanban-columns::after {
  content: '';
  position: sticky;
  right: 0;
  top: 0;
  height: 100%;
  width: 100px;
  background: linear-gradient(to left, rgba(102, 126, 234, 0.3), transparent);
  pointer-events: none;
  z-index: 1;
}

/* Custom scrollbar for horizontal scroll */
.kanban-columns::-webkit-scrollbar {
  height: 12px;
}

.kanban-columns::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  margin: 0 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.kanban-columns::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.kanban-columns::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.7);
}

/* Responsive */
@media (max-width: 768px) {
  .kanban-page {
    margin: -1rem;
  }
  
  .kanban-header {
    padding: 1rem;
  }
  
  .kanban-columns {
    padding: 1rem;
    gap: 1rem;
  }
}
</style>
