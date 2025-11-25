<template>
  <div
    class="task-card"
    :class="[`priority-${task.priority}`, { 'dragging': isDragging }]"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="$emit('click', task)"
  >
    <!-- Priority Indicator -->
    <div class="priority-indicator" :class="`priority-${task.priority}`"></div>

    <!-- Task Header -->
    <div class="task-header">
      <h6 class="task-title">{{ task.title }}</h6>
      <span class="task-id">#{{ task.id }}</span>
    </div>

    <!-- Task Description -->
    <p v-if="task.description" class="task-description">
      {{ truncateText(task.description, 80) }}
    </p>

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

    <!-- Task Footer -->
    <div class="task-footer">
      <!-- Due Date -->
      <div v-if="task.due_date" class="task-due-date" :class="dueDateClass">
        <i class="bi bi-calendar3"></i>
        <span>{{ formatDueDate(task.due_date) }}</span>
      </div>

      <!-- Spacer -->
      <div class="flex-grow-1"></div>

      <!-- Assignee Avatar -->
      <div v-if="task.assigned_to" class="task-assignee" :title="task.assigned_to.name">
        <div class="avatar-circle">
          {{ getInitials(task.assigned_to.name) }}
        </div>
      </div>
      <div v-else class="task-assignee unassigned" title="Unassigned">
        <i class="bi bi-person"></i>
      </div>
    </div>

    <!-- Task Metadata -->
    <div class="task-metadata">
      <!-- Project Name -->
      <span v-if="task.project_name" class="project-name">
        <i class="bi bi-folder"></i>
        {{ task.project_name }}
      </span>

      <!-- Comments Count -->
      <span v-if="task.comments_count" class="metadata-item">
        <i class="bi bi-chat-left-text"></i>
        {{ task.comments_count }}
      </span>

      <!-- Attachments Count -->
      <span v-if="task.attachments_count" class="metadata-item">
        <i class="bi bi-paperclip"></i>
        {{ task.attachments_count }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '@/types/models'

// Props
const props = defineProps<{
  task: Task
}>()

// Emits
const emit = defineEmits<{
  'drag-start': [task: Task]
  'click': [task: Task]
}>()

// State
const isDragging = ref(false)

// Methods
const handleDragStart = (event: DragEvent) => {
  isDragging.value = true
  emit('drag-start', props.task)
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(props.task.id))
  }
}

const handleDragEnd = () => {
  isDragging.value = false
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatDueDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `${Math.abs(diffDays)}d overdue`
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

const dueDateClass = computed(() => {
  if (!props.task.due_date) return ''
  
  const date = new Date(props.task.due_date)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'due-today'
  if (diffDays <= 3) return 'due-soon'
  return ''
})
</script>

<style scoped>
.task-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: grab;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.task-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-card:active {
  cursor: grabbing;
}

.task-card.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

/* Priority Indicator */
.priority-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.priority-indicator.priority-low {
  background: #6b7280;
}

.priority-indicator.priority-medium {
  background: #3b82f6;
}

.priority-indicator.priority-high {
  background: #f59e0b;
}

.priority-indicator.priority-critical {
  background: #ef4444;
}

/* Task Header */
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
}

.task-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.task-id {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
  margin-left: 0.5rem;
  white-space: nowrap;
}

/* Task Description */
.task-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0.5rem;
  line-height: 1.5;
}

/* Tags */
.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
  padding-left: 0.5rem;
}

.tag-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  color: #fff;
  font-weight: 500;
  white-space: nowrap;
}

.more-tags {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #e5e7eb;
  color: #6b7280;
  font-weight: 500;
}

/* Task Footer */
.task-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
}

.task-due-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #f3f4f6;
}

.task-due-date.overdue {
  background: #fee2e2;
  color: #dc2626;
  font-weight: 600;
}

.task-due-date.due-today {
  background: #fef3c7;
  color: #d97706;
  font-weight: 600;
}

.task-due-date.due-soon {
  background: #dbeafe;
  color: #2563eb;
  font-weight: 600;
}

.task-assignee {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-assignee.unassigned {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Task Metadata */
.task-metadata {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f3f4f6;
  padding-left: 0.5rem;
}

.project-name {
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metadata-item {
  font-size: 0.75rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.metadata-item i {
  font-size: 0.875rem;
}

.flex-grow-1 {
  flex-grow: 1;
}
</style>
