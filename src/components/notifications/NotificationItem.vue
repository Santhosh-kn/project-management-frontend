<template>
  <div
    class="notification-item"
    :class="{ 'unread': !notification.read_at }"
  >
    <!-- Icon -->
    <div class="notification-icon" :class="iconColorClass">
      <i :class="iconClass"></i>
    </div>

    <!-- Content -->
    <div class="notification-content" @click="$emit('click')">
      <div class="notification-header">
        <h6 class="notification-title">{{ notification.data.title }}</h6>
        <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
      </div>
      
      <p class="notification-message">{{ notification.data.message }}</p>

      <!-- Actor Info -->
      <div v-if="notification.data.actor" class="notification-actor">
        <div class="actor-avatar">
          {{ getInitials(notification.data.actor.name) }}
        </div>
        <span class="actor-name">{{ notification.data.actor.name }}</span>
      </div>

      <!-- Context Info -->
      <div v-if="notification.data.context" class="notification-context">
        <span v-if="notification.data.context.project_name" class="context-tag">
          {{ notification.data.context.project_name }}
        </span>
        <span v-if="notification.data.context.task_title" class="context-tag">
          {{ notification.data.context.task_title }}
        </span>
      </div>

      <!-- Action Button -->
      <button
        v-if="notification.data.action_text"
        class="notification-action-btn"
        @click.stop="$emit('click')"
      >
        {{ notification.data.action_text }}
      </button>
    </div>

    <!-- Actions Menu -->
    <div class="notification-actions">
      <button
        v-if="!notification.read_at"
        @click.stop="$emit('mark-read')"
        class="action-icon-btn"
        title="Mark as read"
      >
        <i class="bi bi-check"></i>
      </button>
      <button
        v-else
        @click.stop="$emit('mark-unread')"
        class="action-icon-btn"
        title="Mark as unread"
      >
        <i class="bi bi-envelope"></i>
      </button>
      <button
        @click.stop="$emit('delete')"
        class="action-icon-btn text-danger"
        title="Delete"
      >
        <i class="bi bi-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Notification } from '@/types/notification'

interface Props {
  notification: Notification
}

const props = defineProps<Props>()

defineEmits(['click', 'mark-read', 'mark-unread', 'delete'])

// Icon mapping based on notification type
const iconClass = computed(() => {
  const type = props.notification.type
  const icons: Record<string, string> = {
    task_assigned: 'bi bi-person-check',
    task_completed: 'bi bi-check-circle',
    task_commented: 'bi bi-chat',
    task_mentioned: 'bi bi-at',
    task_due_soon: 'bi bi-clock',
    task_overdue: 'bi bi-exclamation-triangle',
    project_invited: 'bi bi-folder-plus',
    default: 'bi bi-bell'
  }
  
  return icons[type] || icons.default
})

const iconColorClass = computed(() => {
  const type = props.notification.type
  const colors: Record<string, string> = {
    task_assigned: 'icon-blue',
    task_completed: 'icon-success',
    task_commented: 'icon-purple',
    task_mentioned: 'icon-warning',
    task_due_soon: 'icon-orange',
    task_overdue: 'icon-danger',
    project_invited: 'icon-indigo',
    default: 'icon-secondary'
  }
  
  return colors[type] || colors.default
})

// Format time
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Get initials
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
.notification-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.notification-item:hover {
  background-color: #f8fafc;
}

.notification-item.unread {
  background-color: #eff6ff;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
}

/* Icon Colors */
.icon-blue {
  background-color: #dbeafe;
  color: #2563eb;
}

.icon-success {
  background-color: #d1fae5;
  color: #10b981;
}

.icon-purple {
  background-color: #e9d5ff;
  color: #9333ea;
}

.icon-warning {
  background-color: #fef3c7;
  color: #f59e0b;
}

.icon-orange {
  background-color: #fed7aa;
  color: #ea580c;
}

.icon-danger {
  background-color: #fee2e2;
  color: #dc2626;
}

.icon-indigo {
  background-color: #e0e7ff;
  color: #6366f1;
}

.icon-secondary {
  background-color: #f1f5f9;
  color: #64748b;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.notification-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.notification-time {
  font-size: 0.75rem;
  color: #64748b;
  flex-shrink: 0;
}

.notification-message {
  font-size: 0.8125rem;
  color: #475569;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-actor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.actor-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
}

.actor-name {
  font-size: 0.75rem;
  color: #64748b;
}

.notification-context {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.context-tag {
  padding: 0.125rem 0.5rem;
  background-color: #f1f5f9;
  font-size: 0.75rem;
  color: #475569;
  border-radius: 0.25rem;
}

.notification-action-btn {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #3b82f6;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.notification-action-btn:hover {
  text-decoration: underline;
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-icon-btn {
  padding: 0.375rem;
  background: none;
  border: none;
  color: #94a3b8;
  border-radius: 0.25rem;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon-btn:hover {
  color: #475569;
  background-color: #f1f5f9;
}

.action-icon-btn.text-danger {
  color: #ef4444;
}

.action-icon-btn.text-danger:hover {
  color: #dc2626;
  background-color: #fee2e2;
}

.action-icon-btn i {
  font-size: 0.875rem;
}
</style>
