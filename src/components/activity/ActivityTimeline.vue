<template>
  <div class="activity-timeline">
    <!-- Header -->
    <div class="timeline-header mb-3">
      <h5 class="mb-0">
        <i class="bi bi-clock-history me-2"></i>
        {{ title }}
      </h5>
    </div>

    <!-- Loading State -->
    <div v-if="activityStore.loading && !activityStore.hasActivities" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading activities...</span>
      </div>
      <p class="text-muted mt-2 small">Loading activities...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="activityStore.error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ activityStore.error }}
    </div>

    <!-- Activities List -->
    <div v-else-if="activityStore.hasActivities" class="timeline-list">
      <div 
        v-for="activity in activityStore.activities" 
        :key="activity.id"
        class="timeline-item"
      >
        <!-- Timeline Dot -->
        <div class="timeline-dot" :class="getActivityTypeClass(activity.description)"></div>
        
        <!-- Timeline Content -->
        <div class="timeline-content">
          <!-- User Avatar & Info -->
          <div class="timeline-header-content">
            <div class="user-avatar" :style="{ backgroundColor: getUserColor(activity.user?.name) }">
              {{ getUserInitials(activity.user?.name) }}
            </div>
            <div class="timeline-info">
              <div class="timeline-user">
                {{ activity.user?.name || 'System' }}
              </div>
              <div class="timeline-time">
                {{ formatTimeAgo(activity.created_at) }}
              </div>
            </div>
          </div>

          <!-- Activity Description -->
          <div class="timeline-description">
            {{ activity.description }}
          </div>

          <!-- Activity Properties (if any) -->
          <div v-if="activity.properties" class="timeline-properties">
            <small class="text-muted">
              <template v-if="activity.properties.old && activity.properties.new">
                Changed from <strong>{{ activity.properties.old }}</strong> to <strong>{{ activity.properties.new }}</strong>
              </template>
            </small>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="activityStore.hasMore" class="text-center mt-3">
        <button 
          class="btn btn-sm btn-outline-primary" 
          @click="loadMore"
          :disabled="activityStore.loading"
        >
          <span v-if="activityStore.loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ activityStore.loading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5">
      <i class="bi bi-clock-history text-muted" style="font-size: 3rem;"></i>
      <p class="text-muted mt-2">No activity yet</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useActivityStore } from '@/stores/activity'

// Props
const props = withDefaults(defineProps<{
  title?: string
  projectId?: number
  taskId?: number
}>(), {
  title: 'Activity Timeline'
})

// Stores
const activityStore = useActivityStore()

// Methods
const getUserInitials = (name?: string): string => {
  if (!name) return 'S' // System
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getUserColor = (name?: string): string => {
  if (!name) return '#6b7280'
  
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

const getActivityTypeClass = (description: string): string => {
  const desc = description.toLowerCase()
  
  if (desc.includes('created')) return 'bg-success'
  if (desc.includes('updated') || desc.includes('changed')) return 'bg-primary'
  if (desc.includes('completed') || desc.includes('done')) return 'bg-success'
  if (desc.includes('deleted') || desc.includes('removed')) return 'bg-danger'
  if (desc.includes('assigned')) return 'bg-info'
  if (desc.includes('commented')) return 'bg-warning'
  
  return 'bg-secondary'
}

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const loadMore = async () => {
  if (props.projectId) {
    await activityStore.fetchProjectActivities(props.projectId, activityStore.currentPage + 1)
  } else if (props.taskId) {
    await activityStore.fetchTaskActivities(props.taskId, activityStore.currentPage + 1)
  } else {
    await activityStore.loadMore()
  }
}

// Lifecycle
onMounted(async () => {
  activityStore.clearActivities()
  
  if (props.projectId) {
    await activityStore.fetchProjectActivities(props.projectId)
  } else if (props.taskId) {
    await activityStore.fetchTaskActivities(props.taskId)
  } else {
    await activityStore.fetchActivities()
  }
})
</script>

<style scoped>
.activity-timeline {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.timeline-header h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.timeline-list {
  position: relative;
}

.timeline-list::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item {
  position: relative;
  padding-left: 50px;
  padding-bottom: 1.5rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: 12px;
  top: 8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 1px #e5e7eb;
  z-index: 1;
}

.timeline-content {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.timeline-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.timeline-info {
  flex: 1;
  min-width: 0;
}

.timeline-user {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
}

.timeline-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.timeline-description {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
}

.timeline-properties {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.timeline-properties strong {
  color: #1f2937;
}

/* Color classes for dots */
.bg-primary {
  background-color: #3B82F6;
}

.bg-success {
  background-color: #10B981;
}

.bg-danger {
  background-color: #EF4444;
}

.bg-warning {
  background-color: #F59E0B;
}

.bg-info {
  background-color: #06B6D4;
}

.bg-secondary {
  background-color: #6b7280;
}
</style>
