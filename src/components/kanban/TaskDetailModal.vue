<template>
  <div 
    v-if="isOpen" 
    class="modal fade show d-block" 
    tabindex="-1" 
    style="background-color: rgba(0, 0, 0, 0.5);"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-content">
            <h5 class="modal-title">
              <span class="task-id">#{{ task.id }}</span>
              {{ task.title }}
            </h5>
            <div class="task-meta">
              <span class="badge" :class="`bg-${getPriorityColor(task.priority)}`">
                {{ task.priority }}
              </span>
              <span class="badge" :class="`bg-${getStatusColor(task.status)}`">
                {{ formatStatus(task.status) }}
              </span>
            </div>
          </div>
          <button 
            type="button" 
            class="btn-close" 
            @click="closeModal"
          ></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <div class="row">
            <!-- Main Content -->
            <div class="col-lg-8">
              <!-- Description -->
              <div class="section">
                <h6 class="section-title">
                  <i class="bi bi-align-left me-2"></i>
                  Description
                </h6>
                <p v-if="task.description" class="description-text">
                  {{ task.description }}
                </p>
                <p v-else class="text-muted fst-italic">
                  No description provided
                </p>
              </div>

              <!-- Tags -->
              <div v-if="task.tags && task.tags.length > 0" class="section">
                <h6 class="section-title">
                  <i class="bi bi-tags me-2"></i>
                  Tags
                </h6>
                <div class="tags-list">
                  <span
                    v-for="tag in task.tags"
                    :key="tag.id"
                    class="tag-badge"
                    :style="{ backgroundColor: tag.color }"
                  >
                    {{ tag.name }}
                  </span>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="section">
                <h6 class="section-title">
                  <i class="bi bi-lightning me-2"></i>
                  Quick Actions
                </h6>
                <div class="quick-actions">
                  <button class="btn btn-sm btn-outline-primary" @click="editTask">
                    <i class="bi bi-pencil me-1"></i>
                    Edit Task
                  </button>
                  <button class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-paperclip me-1"></i>
                    Add Attachment
                  </button>
                  <button class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-chat-left-text me-1"></i>
                    Add Comment
                  </button>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="col-lg-4">
              <!-- Details Card -->
              <div class="details-card">
                <h6 class="card-title">Task Details</h6>
                
                <div class="detail-item">
                  <label>Status</label>
                  <div class="detail-value">
                    <span class="badge" :class="`bg-${getStatusColor(task.status)}`">
                      {{ formatStatus(task.status) }}
                    </span>
                  </div>
                </div>

                <div class="detail-item">
                  <label>Priority</label>
                  <div class="detail-value">
                    <span class="badge" :class="`bg-${getPriorityColor(task.priority)}`">
                      {{ task.priority }}
                    </span>
                  </div>
                </div>

                <div class="detail-item">
                  <label>Project</label>
                  <div class="detail-value">
                    <i class="bi bi-folder me-1"></i>
                    {{ task.project_name || 'Unknown' }}
                  </div>
                </div>

                <div class="detail-item">
                  <label>Assigned To</label>
                  <div class="detail-value">
                    <span v-if="task.assigned_to">
                      <div class="assignee-info">
                        <div class="avatar-small">
                          {{ getInitials(task.assigned_to.name) }}
                        </div>
                        <span>{{ task.assigned_to.name }}</span>
                      </div>
                    </span>
                    <span v-else class="text-muted">Unassigned</span>
                  </div>
                </div>

                <div v-if="task.due_date" class="detail-item">
                  <label>Due Date</label>
                  <div class="detail-value" :class="dueDateClass">
                    <i class="bi bi-calendar3 me-1"></i>
                    {{ formatDate(task.due_date) }}
                  </div>
                </div>

                <div v-if="task.estimated_hours" class="detail-item">
                  <label>Estimated Hours</label>
                  <div class="detail-value">
                    <i class="bi bi-clock me-1"></i>
                    {{ task.estimated_hours }}h
                  </div>
                </div>

                <div class="detail-item">
                  <label>Created</label>
                  <div class="detail-value small text-muted">
                    {{ formatDate(task.created_at) }}
                  </div>
                </div>

                <div class="detail-item">
                  <label>Updated</label>
                  <div class="detail-value small text-muted">
                    {{ formatDate(task.updated_at) }}
                  </div>
                </div>
              </div>
            </div>
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

  <!-- Edit Task Modal -->
  <EditTaskModal
    v-if="showEditModal"
    :is-open="showEditModal"
    :task="task"
    :project-members="[]"
    @close="showEditModal = false"
    @updated="handleTaskUpdated"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import EditTaskModal from '@/components/tasks/EditTaskModal.vue'
import type { Task } from '@/types/models'

// Props
const props = defineProps<{
  isOpen: boolean
  task: Task
}>()

// Emits
const emit = defineEmits<{
  close: []
  updated: []
}>()

// State
const showEditModal = ref(false)

// Methods
const closeModal = () => {
  emit('close')
}

const editTask = () => {
  showEditModal.value = true
}

const handleTaskUpdated = () => {
  showEditModal.value = false
  emit('updated')
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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

const dueDateClass = computed(() => {
  if (!props.task.due_date) return ''
  
  const date = new Date(props.task.due_date)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'text-danger fw-bold'
  if (diffDays === 0) return 'text-warning fw-bold'
  if (diffDays <= 3) return 'text-primary fw-bold'
  return ''
})
</script>

<style scoped>
.modal.show {
  display: block;
}

.modal-dialog {
  max-width: 1200px;
}

.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.task-id {
  color: #9ca3af;
  font-size: 1rem;
  font-weight: 500;
}

.task-meta {
  display: flex;
  gap: 0.5rem;
}

.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.description-text {
  color: #6b7280;
  line-height: 1.7;
  white-space: pre-wrap;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-badge {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  color: #fff;
  font-weight: 500;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.details-card {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
}

.detail-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.375rem;
}

.detail-value {
  font-size: 0.9375rem;
  color: #1f2937;
  font-weight: 500;
}

.assignee-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar-small {
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
}
</style>
