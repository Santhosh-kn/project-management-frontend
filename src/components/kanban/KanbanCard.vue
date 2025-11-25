<template>
  <div
    draggable="true"
    @dragstart="handleDragStart"
    @click="goToTask"
    class="kanban-card"
  >
    <!-- Priority Indicator -->
    <div class="priority-bar" :class="priorityBarClass"></div>

    <!-- Card Content -->
    <div class="card-content">
      <!-- Title -->
      <h6 class="card-title">{{ task.title }}</h6>

      <!-- Description -->
      <p v-if="task.description" class="card-description">
        {{ truncateText(task.description, 100) }}
      </p>

      <!-- Tags -->
      <div v-if="task.tags && task.tags.length > 0" class="tags-container">
        <span
          v-for="tag in task.tags.slice(0, 3)"
          :key="tag.id"
          class="tag"
          :style="{ backgroundColor: tag.color + '20', color: tag.color }"
        >
          {{ tag.name }}
        </span>
        <span v-if="task.tags.length > 3" class="tag tag-more">
          +{{ task.tags.length - 3 }}
        </span>
      </div>

      <!-- Footer -->
      <div class="card-footer-info">
        <!-- Project -->
        <div v-if="task.project" class="project-badge">
          <i class="bi bi-folder"></i>
          <span>{{ truncateText(task.project.name, 15) }}</span>
        </div>

        <!-- Due Date -->
        <div v-if="task.due_date" class="due-date" :class="dueDateClass">
          <i class="bi bi-calendar"></i>
          <span>{{ formatDate(task.due_date) }}</span>
        </div>

        <!-- Assigned User -->
        <div v-if="task.assigned_user" class="assigned-user ms-auto">
          <div class="user-avatar">
            {{ getInitials(task.assigned_user.name) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

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

interface Props {
  task: Task
}

interface Emits {
  (e: 'drag-start', taskId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

const priorityBarClass = computed(() => {
  const classes: Record<string, string> = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    critical: 'priority-critical'
  }
  return classes[props.task.priority] || 'priority-low'
})

const dueDateClass = computed(() => {
  if (!props.task.due_date) return ''
  
  const dueDate = new Date(props.task.due_date)
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays <= 2) return 'due-soon'
  return ''
})

const handleDragStart = (e: DragEvent) => {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    // Store the task ID in dataTransfer so it can be accessed in drop handler
    e.dataTransfer.setData('taskId', props.task.id.toString())
  }
  emit('drag-start', props.task.id)
}

const goToTask = () => {
  router.push(`/tasks/${props.task.id}`)
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDate = (date: string) => {
  const d = new Date(date)
  const month = d.toLocaleString('default', { month: 'short' })
  const day = d.getDate()
  return `${month} ${day}`
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}
</script>

<style scoped>
.kanban-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: move;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.kanban-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
}

.priority-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.priority-low {
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
}

.priority-medium {
  background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
}

.priority-high,
.priority-critical {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
}

.card-content {
  padding: 1rem;
  padding-left: 1.25rem;
}

.card-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description {
  font-size: 0.8125rem;
  color: #64748b;
  margin-bottom: 0.75rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.tag-more {
  background-color: #f1f5f9;
  color: #64748b;
}

.card-footer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.project-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #64748b;
  background-color: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  border: 1px solid #e2e8f0;
}

.project-badge i {
  font-size: 0.75rem;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.due-date i {
  font-size: 0.75rem;
}

.due-date.overdue {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.due-date.due-soon {
  background: #fef3c7;
  color: #d97706;
  border-color: #fde68a;
}

.assigned-user {
  margin-left: auto;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
  border: 2px solid white;
}
</style>
