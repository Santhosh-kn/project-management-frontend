<template>
  <div class="kanban-task-card" @click="$emit('click')">
    <!-- Priority Badge -->
    <div class="d-flex justify-content-between align-items-start mb-2">
      <span :class="['badge badge-sm', getPriorityClass(task.priority)]">
        {{ formatPriority(task.priority) }}
      </span>
      <span v-if="task.due_date" :class="['badge badge-sm', getDueDateClass()]">
        <i class="bi bi-calendar-event me-1"></i>
        {{ formatDueDate(task.due_date) }}
      </span>
    </div>

    <!-- Task Title -->
    <h6 class="task-title mb-2">{{ task.title }}</h6>

    <!-- Task Description -->
    <p v-if="task.description" class="task-description text-muted small mb-3">
      {{ truncate(task.description, 80) }}
    </p>

    <!-- Tags -->
    <div v-if="task.tags && task.tags.length > 0" class="task-tags mb-2">
      <span 
        v-for="tag in task.tags.slice(0, 3)" 
        :key="tag.id"
        class="tag-badge"
        :style="{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }"
      >
        {{ tag.name }}
      </span>
      <span v-if="task.tags.length > 3" class="text-muted small">
        +{{ task.tags.length - 3 }}
      </span>
    </div>

    <!-- Footer -->
    <div class="task-footer">
      <div class="d-flex justify-content-between align-items-center">
        <!-- Assignee -->
        <div v-if="task.assigned_to" class="assignee d-flex align-items-center">
          <div class="avatar-xs me-1" :style="{ backgroundColor: getAvatarColor(task.assigned_to.name) }">
            {{ getInitials(task.assigned_to.name) }}
          </div>
          <span class="small text-muted">{{ task.assigned_to.name }}</span>
        </div>
        <div v-else class="text-muted small">
          <i class="bi bi-person-dash"></i>
          Unassigned
        </div>

        <!-- Metadata -->
        <div class="d-flex gap-2 align-items-center">
          <!-- Comments Count -->
          <span v-if="task.comments_count" class="metadata-item">
            <i class="bi bi-chat-dots"></i>
            {{ task.comments_count }}
          </span>
          
          <!-- Attachments Count -->
          <span v-if="task.attachments_count" class="metadata-item">
            <i class="bi bi-paperclip"></i>
            {{ task.attachments_count }}
          </span>

          <!-- Subtasks Progress -->
          <span v-if="task.subtasks_count" class="metadata-item">
            <i class="bi bi-check2-square"></i>
            {{ task.completed_subtasks_count || 0 }}/{{ task.subtasks_count }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '@/types/models'

// Props
defineProps<{
  task: Task
}>()

// Emits
defineEmits<{
  click: []
}>()

// Methods
const getPriorityClass = (priority: string): string => {
  const classes: Record<string, string> = {
    low: 'bg-secondary',
    medium: 'bg-primary',
    high: 'bg-warning',
    critical: 'bg-danger'
  }
  return classes[priority] || 'bg-secondary'
}

const getDueDateClass = (): string => {
  return 'bg-light text-muted'
}

const formatPriority = (priority: string): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

const formatDueDate = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return 'Overdue'
  } else if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else if (diffDays <= 7) {
    return `${diffDays}d`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

const truncate = (text: string, length: number): string => {
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

const getAvatarColor = (name: string): string => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ]
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}
</script>

<style scoped>
.kanban-task-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.kanban-task-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #3B82F6;
}

.task-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  margin: 0;
}

.task-description {
  font-size: 0.8125rem;
  line-height: 1.4;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.badge-sm {
  font-size: 0.6875rem;
  padding: 0.25rem 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  align-items: center;
}

.tag-badge {
  font-size: 0.6875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
  border: 1px solid;
  white-space: nowrap;
}

.task-footer {
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
  margin-top: 0.5rem;
}

.avatar-xs {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.metadata-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.metadata-item i {
  font-size: 0.875rem;
}

.assignee {
  min-width: 0;
  overflow: hidden;
}

.assignee span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
