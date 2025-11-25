<template>
  <div class="kanban-board">
    <!-- Header -->
    <div class="kanban-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h4 class="mb-1">
            <i class="bi bi-kanban me-2"></i>
            Kanban Board
          </h4>
          <p class="text-muted mb-0 small">Drag and drop tasks to update status</p>
        </div>
        <div class="d-flex gap-2">
          <!-- Filter by User -->
          <select 
            v-model="filterUserId" 
            class="form-select form-select-sm"
            style="width: 200px;"
            @change="loadTasks"
          >
            <option value="">All Users</option>
            <option 
              v-for="member in members" 
              :key="member.id"
              :value="member.id"
            >
              {{ member.name }}
            </option>
          </select>
          
          <!-- Refresh Button -->
          <button 
            class="btn btn-sm btn-outline-primary"
            @click="loadTasks"
            :disabled="loading"
          >
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && tasks.length === 0" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-2">Loading tasks...</p>
    </div>

    <!-- Kanban Columns -->
    <div v-else class="kanban-columns">
      <!-- Todo Column -->
      <div class="kanban-column">
        <div class="column-header bg-secondary">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <i class="bi bi-circle me-2"></i>
              <span class="fw-semibold">To Do</span>
            </div>
            <span class="badge bg-white text-secondary">{{ todoTasks.length }}</span>
          </div>
        </div>
        <div 
          class="column-body"
          @drop="onDrop($event, 'todo')"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="task in todoTasks"
            :key="task.id"
            class="task-card"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
          >
            <KanbanTaskCard :task="task" @click="viewTask(task)" />
          </div>
          <div v-if="todoTasks.length === 0" class="empty-column">
            <i class="bi bi-inbox text-muted"></i>
            <p class="text-muted small mb-0 mt-2">No tasks</p>
          </div>
        </div>
      </div>

      <!-- In Progress Column -->
      <div class="kanban-column">
        <div class="column-header bg-info">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <i class="bi bi-arrow-repeat me-2"></i>
              <span class="fw-semibold">In Progress</span>
            </div>
            <span class="badge bg-white text-info">{{ inProgressTasks.length }}</span>
          </div>
        </div>
        <div 
          class="column-body"
          @drop="onDrop($event, 'in_progress')"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="task in inProgressTasks"
            :key="task.id"
            class="task-card"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
          >
            <KanbanTaskCard :task="task" @click="viewTask(task)" />
          </div>
          <div v-if="inProgressTasks.length === 0" class="empty-column">
            <i class="bi bi-inbox text-muted"></i>
            <p class="text-muted small mb-0 mt-2">No tasks</p>
          </div>
        </div>
      </div>

      <!-- Review Column -->
      <div class="kanban-column">
        <div class="column-header bg-warning">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <i class="bi bi-eye me-2"></i>
              <span class="fw-semibold">Review</span>
            </div>
            <span class="badge bg-white text-warning">{{ reviewTasks.length }}</span>
          </div>
        </div>
        <div 
          class="column-body"
          @drop="onDrop($event, 'review')"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="task in reviewTasks"
            :key="task.id"
            class="task-card"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
          >
            <KanbanTaskCard :task="task" @click="viewTask(task)" />
          </div>
          <div v-if="reviewTasks.length === 0" class="empty-column">
            <i class="bi bi-inbox text-muted"></i>
            <p class="text-muted small mb-0 mt-2">No tasks</p>
          </div>
        </div>
      </div>

      <!-- Done Column -->
      <div class="kanban-column">
        <div class="column-header bg-success">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <i class="bi bi-check-circle me-2"></i>
              <span class="fw-semibold">Done</span>
            </div>
            <span class="badge bg-white text-success">{{ doneTasks.length }}</span>
          </div>
        </div>
        <div 
          class="column-body"
          @drop="onDrop($event, 'done')"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="task in doneTasks"
            :key="task.id"
            class="task-card"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
          >
            <KanbanTaskCard :task="task" @click="viewTask(task)" />
          </div>
          <div v-if="doneTasks.length === 0" class="empty-column">
            <i class="bi bi-inbox text-muted"></i>
            <p class="text-muted small mb-0 mt-2">No tasks</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Details Modal -->
    <TaskDetailsModal
      :is-open="showTaskModal"
      :task="selectedTask"
      @close="showTaskModal = false"
      @updated="handleTaskUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import KanbanTaskCard from './KanbanTaskCard.vue'
import TaskDetailsModal from '../tasks/TaskDetailsModal.vue'
import type { Task } from '@/types/models'
import * as tasksApi from '@/api/tasks'
import * as projectsApi from '@/api/projects'

// Props
const props = defineProps<{
  projectId: number
}>()

// Emits
const emit = defineEmits<{
  taskUpdated: [task: Task]
}>()

// State
const tasks = ref<Task[]>([])
const members = ref<any[]>([])
const loading = ref(false)
const draggedTask = ref<Task | null>(null)
const showTaskModal = ref(false)
const selectedTask = ref<Task | null>(null)
const filterUserId = ref<string>('')

// Computed - Filter tasks by status
const todoTasks = computed(() => 
  tasks.value.filter(t => t.status === 'todo' && matchesFilter(t))
)

const inProgressTasks = computed(() => 
  tasks.value.filter(t => t.status === 'in_progress' && matchesFilter(t))
)

const reviewTasks = computed(() => 
  tasks.value.filter(t => t.status === 'review' && matchesFilter(t))
)

const doneTasks = computed(() => 
  tasks.value.filter(t => t.status === 'done' && matchesFilter(t))
)

// Methods
const matchesFilter = (task: Task): boolean => {
  if (!filterUserId.value) return true
  return task.assigned_to?.id === parseInt(filterUserId.value)
}

const loadTasks = async () => {
  loading.value = true
  try {
    const response = await projectsApi.getProjectTasks(props.projectId)
    tasks.value = response.data || []
  } catch (error) {
    console.error('Error loading tasks:', error)
    tasks.value = []
  } finally {
    loading.value = false
  }
}

const loadMembers = async () => {
  try {
    const response = await projectsApi.getProjectMembers(props.projectId)
    members.value = response.data || []
  } catch (error) {
    console.error('Error loading members:', error)
  }
}

const onDragStart = (event: DragEvent, task: Task) => {
  draggedTask.value = task
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', (event.target as HTMLElement).innerHTML)
  }
  // Add dragging class
  ;(event.target as HTMLElement).classList.add('dragging')
}

const onDragEnd = (event: DragEvent) => {
  ;(event.target as HTMLElement).classList.remove('dragging')
}

const onDrop = async (event: DragEvent, newStatus: string) => {
  event.preventDefault()
  
  if (!draggedTask.value || draggedTask.value.status === newStatus) {
    draggedTask.value = null
    return
  }

  const taskToUpdate = draggedTask.value
  const oldStatus = taskToUpdate.status

  try {
    // Optimistic update
    const taskIndex = tasks.value.findIndex(t => t.id === taskToUpdate.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex].status = newStatus as any
    }

    // Update on server
    await tasksApi.updateTask(taskToUpdate.id, { status: newStatus })
    
    // Emit update event
    emit('taskUpdated', tasks.value[taskIndex])
    
    // Show success feedback
    showSuccessToast(`Task moved to ${formatStatus(newStatus)}`)
  } catch (error) {
    console.error('Error updating task:', error)
    
    // Revert on error
    const taskIndex = tasks.value.findIndex(t => t.id === taskToUpdate.id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex].status = oldStatus as any
    }
    
    alert('Failed to update task. Please try again.')
  } finally {
    draggedTask.value = null
  }
}

const viewTask = (task: Task) => {
  selectedTask.value = task
  showTaskModal.value = true
}

const handleTaskUpdated = (updatedTask: Task) => {
  const index = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (index !== -1) {
    tasks.value[index] = updatedTask
  }
  emit('taskUpdated', updatedTask)
}

const formatStatus = (status: string): string => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const showSuccessToast = (message: string) => {
  // Simple toast notification
  const toast = document.createElement('div')
  toast.className = 'toast-notification'
  toast.innerHTML = `
    <i class="bi bi-check-circle-fill me-2"></i>
    ${message}
  `
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.classList.add('show')
  }, 100)
  
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadTasks(),
    loadMembers()
  ])
})
</script>

<style scoped>
.kanban-board {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.kanban-header {
  flex-shrink: 0;
}

.kanban-columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  height: calc(100vh - 300px);
  min-height: 600px;
}

.kanban-column {
  background: #f8f9fa;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.column-header {
  padding: 1rem;
  color: white;
  flex-shrink: 0;
}

.column-header .badge {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}

.column-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.column-body::-webkit-scrollbar {
  width: 8px;
}

.column-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.column-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.column-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.task-card {
  cursor: move;
  transition: all 0.2s ease;
}

.task-card:hover {
  transform: translateY(-2px);
}

.task-card.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.empty-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #9ca3af;
}

.empty-column i {
  font-size: 2rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .kanban-columns {
    grid-template-columns: repeat(2, 1fr);
    height: auto;
  }
}

@media (max-width: 768px) {
  .kanban-columns {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
/* Global toast styles */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  font-weight: 500;
  opacity: 0;
  transform: translateY(1rem);
  transition: all 0.3s ease;
  z-index: 9999;
}

.toast-notification.show {
  opacity: 1;
  transform: translateY(0);
}
</style>
