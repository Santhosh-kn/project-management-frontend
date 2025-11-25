<template>
  <div 
    v-if="isOpen" 
    class="modal fade show d-block" 
    tabindex="-1" 
    style="background-color: rgba(0, 0, 0, 0.5);"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-content">
            <h5 class="modal-title">
              <i class="bi bi-calendar-day me-2"></i>
              {{ formatDate(date) }}
            </h5>
            <p class="text-muted mb-0">
              {{ tasks.length }} {{ tasks.length === 1 ? 'task' : 'tasks' }} due
            </p>
          </div>
          <button 
            type="button" 
            class="btn-close" 
            @click="closeModal"
          ></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Task List -->
          <div v-if="tasks.length > 0" class="tasks-list">
            <div
              v-for="task in sortedTasks"
              :key="task.id"
              class="task-item"
              :class="`priority-${task.priority}`"
              @click="handleTaskClick(task)"
            >
              <!-- Priority Indicator -->
              <div class="priority-bar" :class="`priority-${task.priority}`"></div>

              <!-- Task Content -->
              <div class="task-content">
                <div class="task-header">
                  <h6 class="task-title">
                    {{ task.title }}
                    <span class="task-id">#{{ task.id }}</span>
                  </h6>
                  
                  <div class="task-badges">
                    <span class="badge" :class="`bg-${getPriorityColor(task.priority)}`">
                      {{ task.priority }}
                    </span>
                    <span class="badge" :class="`bg-${getStatusColor(task.status)}`">
                      {{ formatStatus(task.status) }}
                    </span>
                  </div>
                </div>

                <!-- Task Description -->
                <p v-if="task.description" class="task-description">
                  {{ truncateText(task.description, 120) }}
                </p>

                <!-- Task Meta -->
                <div class="task-meta">
                  <span v-if="task.project_name" class="meta-item">
                    <i class="bi bi-folder"></i>
                    {{ task.project_name }}
                  </span>
                  
                  <span v-if="task.assigned_to" class="meta-item">
                    <i class="bi bi-person"></i>
                    {{ task.assigned_to.name }}
                  </span>
                  
                  <span v-if="task.estimated_hours" class="meta-item">
                    <i class="bi bi-clock"></i>
                    {{ task.estimated_hours }}h
                  </span>
                </div>

                <!-- Tags -->
                <div v-if="task.tags && task.tags.length > 0" class="task-tags">
                  <span
                    v-for="tag in task.tags.slice(0, 3)"
                    :key="tag.id"
                    class="tag-badge"
                    :style="{ backgroundColor: tag.color }"
                  >
                    {{ tag.name }}
                  </span>
                  <span v-if="task.tags.length > 3" class="more-tags">
                    +{{ task.tags.length - 3 }}
                  </span>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="task-actions">
                <button 
                  class="btn btn-sm btn-outline-primary"
                  @click.stop="handleTaskClick(task)"
                >
                  <i class="bi bi-eye"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <i class="bi bi-calendar-x"></i>
            <p>No tasks due on this date</p>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="closeModal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types/models'

// Props
const props = defineProps<{
  isOpen: boolean
  date: any
  tasks: Task[]
}>()

// Emits
const emit = defineEmits<{
  close: []
  'task-click': [task: Task]
}>()

// Computed
const sortedTasks = computed(() => {
  return [...props.tasks].sort((a, b) => {
    // Sort by priority first (critical > high > medium > low)
    const priorityOrder: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    }
    
    const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    if (priorityDiff !== 0) return priorityDiff
    
    // Then by status (todo > in_progress > review > done)
    const statusOrder: Record<string, number> = {
      todo: 4,
      in_progress: 3,
      review: 2,
      done: 1
    }
    
    return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0)
  })
})

// Methods
const closeModal = () => {
  emit('close')
}

const handleTaskClick = (task: Task) => {
  emit('task-click', task)
}

const formatDate = (dateObj: any): string => {
  if (!dateObj || !dateObj.date) return ''
  
  return dateObj.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'todo': 'To Do',
    'in_progress': 'In Progress',
    'review': 'Review',
    'done': 'Done'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'todo': 'secondary',
    'in_progress': 'primary',
    'review': 'warning',
    'done': 'success'
  }
  return colorMap[status] || 'secondary'
}

const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    'low': 'secondary',
    'medium': 'info',
    'high': 'warning',
    'critical': 'danger'
  }
  return colorMap[priority] || 'secondary'
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.task-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.priority-bar {
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
}

.priority-bar.priority-low {
  background: #6b7280;
}

.priority-bar.priority-medium {
  background: #3b82f6;
}

.priority-bar.priority-high {
  background: #f59e0b;
}

.priority-bar.priority-critical {
  background: #ef4444;
}

.task-content {
  flex: 1;
  min-width: 0;
  padding-left: 0.75rem;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.task-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.task-id {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
  margin-left: 0.5rem;
}

.task-badges {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.task-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.meta-item i {
  font-size: 1rem;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  color: #fff;
  font-weight: 500;
}

.more-tags {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #e5e7eb;
  color: #6b7280;
  font-weight: 500;
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}
</style>
