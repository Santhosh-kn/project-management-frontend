<template>
  <div class="dependency-list">
    <!-- Empty State -->
    <div v-if="dependencies.length === 0" class="text-center py-4">
      <i class="bi bi-diagram-3 text-muted" style="font-size: 2rem;"></i>
      <p class="text-muted mt-2 mb-0">No dependencies</p>
    </div>

    <!-- Dependencies List -->
    <div v-else class="list-group">
      <div
        v-for="dependency in dependencies"
        :key="dependency.id"
        class="list-group-item"
      >
        <div class="d-flex align-items-start">
          <!-- Dependency Icon -->
          <div class="dependency-icon me-3">
            <i
              :class="getDependencyIcon(dependency.dependency_type)"
              :style="{ color: getDependencyColor(dependency.dependency_type) }"
            ></i>
          </div>

          <!-- Dependency Info -->
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="mb-1">
                  {{ dependency.depends_on_task.title }}
                </h6>
                <div class="dependency-meta">
                  <span
                    class="badge me-2"
                    :class="getStatusBadgeClass(dependency.depends_on_task.status)"
                  >
                    {{ formatStatus(dependency.depends_on_task.status) }}
                  </span>
                  <span
                    class="badge me-2"
                    :class="getPriorityBadgeClass(dependency.depends_on_task.priority)"
                  >
                    {{ formatPriority(dependency.depends_on_task.priority) }}
                  </span>
                  <span class="badge bg-secondary">
                    {{ formatDependencyType(dependency.dependency_type) }}
                  </span>
                </div>
                <div class="mt-2">
                  <small v-if="dependency.depends_on_task.assigned_to" class="text-muted d-block">
                    <i class="bi bi-person me-1"></i>
                    {{ dependency.depends_on_task.assigned_to.name }}
                  </small>
                  <small v-if="dependency.depends_on_task.due_date" class="text-muted d-block">
                    <i class="bi bi-calendar me-1"></i>
                    Due: {{ formatDate(dependency.depends_on_task.due_date) }}
                  </small>
                </div>
              </div>

              <!-- Delete Button -->
              <button
                class="btn btn-sm btn-outline-danger"
                @click="handleDelete(dependency.id)"
                :disabled="deleting === dependency.id"
                title="Remove dependency"
              >
                <span v-if="deleting === dependency.id" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TaskDependency } from '@/api/dependencies'

// Props
const props = defineProps<{
  dependencies: TaskDependency[]
}>()

// Emits
const emit = defineEmits<{
  'dependency-deleted': [dependencyId: number]
}>()

// State
const deleting = ref<number | null>(null)

// Methods
const getDependencyIcon = (type: string): string => {
  switch (type) {
    case 'blocks':
      return 'bi bi-arrow-right-circle'
    case 'blocked_by':
      return 'bi bi-arrow-left-circle'
    case 'related_to':
      return 'bi bi-link-45deg'
    default:
      return 'bi bi-link'
  }
}

const getDependencyColor = (type: string): string => {
  switch (type) {
    case 'blocks':
      return '#EF4444'
    case 'blocked_by':
      return '#F59E0B'
    case 'related_to':
      return '#3B82F6'
    default:
      return '#6B7280'
  }
}

const formatDependencyType = (type: string): string => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatStatus = (status: string): string => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatPriority = (priority: string): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'done':
      return 'bg-success'
    case 'in_progress':
      return 'bg-primary'
    case 'blocked':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}

const getPriorityBadgeClass = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-danger'
    case 'medium':
      return 'bg-warning text-dark'
    case 'low':
      return 'bg-info'
    default:
      return 'bg-secondary'
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleDelete = (dependencyId: number) => {
  if (!confirm('Are you sure you want to remove this dependency?')) {
    return
  }

  deleting.value = dependencyId
  emit('dependency-deleted', dependencyId)
}
</script>

<style scoped>
.dependency-list {
  margin-top: 1rem;
}

.list-group-item {
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 1rem;
  transition: all 0.2s ease;
}

.list-group-item:hover {
  border-color: #3B82F6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dependency-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.dependency-meta {
  margin-top: 0.5rem;
}

.dependency-meta .badge {
  font-size: 0.75rem;
}

h6 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

small {
  font-size: 0.8125rem;
  line-height: 1.5;
}
</style>
