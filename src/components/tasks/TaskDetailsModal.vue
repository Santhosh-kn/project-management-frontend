<template>
  <div 
    v-if="isOpen && task" 
    class="modal fade show d-block" 
    tabindex="-1" 
    style="background-color: rgba(0, 0, 0, 0.5);"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="flex-grow-1">
            <h5 class="modal-title mb-2">
              <i class="bi bi-clipboard-check me-2"></i>
              {{ task.title }}
            </h5>
            <div>
              <span :class="['badge me-2', getStatusClass(task.status)]">
                {{ formatStatus(task.status) }}
              </span>
              <span :class="['badge', getPriorityClass(task.priority)]">
                Priority: {{ formatPriority(task.priority) }}
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
          <!-- Task Information -->
          <div class="card mb-4">
            <div class="card-body">
              <h6 class="card-title mb-3">
                <i class="bi bi-info-circle me-2"></i>
                Task Details
              </h6>
              
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="text-muted small">Assigned To</label>
                  <p class="mb-0">
                    <i class="bi bi-person me-1"></i>
                    {{ task.assigned_to?.name || 'Unassigned' }}
                  </p>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">Created By</label>
                  <p class="mb-0">
                    <i class="bi bi-person-badge me-1"></i>
                    {{ task.created_by?.name || 'Unknown' }}
                  </p>
                </div>
                <div class="col-md-6" v-if="task.due_date">
                  <label class="text-muted small">Due Date</label>
                  <p class="mb-0">
                    <i class="bi bi-calendar-event me-1"></i>
                    {{ formatDate(task.due_date) }}
                  </p>
                </div>
                <div class="col-md-6" v-if="task.estimated_hours">
                  <label class="text-muted small">Estimated Hours</label>
                  <p class="mb-0">
                    <i class="bi bi-clock me-1"></i>
                    {{ task.estimated_hours }} hours
                  </p>
                </div>
                <div class="col-12" v-if="task.description">
                  <label class="text-muted small">Description</label>
                  <p class="mb-0">{{ task.description }}</p>
                </div>
                <div class="col-12" v-else>
                  <p class="text-muted fst-italic mb-0">No description provided</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs for Comments and Attachments -->
          <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
              <button 
                :class="['nav-link', { active: activeTab === 'comments' }]"
                @click="activeTab = 'comments'"
              >
                <i class="bi bi-chat-left-text me-2"></i>
                Comments
                <span class="badge bg-primary ms-2">{{ commentStore.commentsCount }}</span>
              </button>
            </li>
            <li class="nav-item">
              <button 
                :class="['nav-link', { active: activeTab === 'attachments' }]"
                @click="activeTab = 'attachments'"
              >
                <i class="bi bi-paperclip me-2"></i>
                Attachments
                <span class="badge bg-primary ms-2">{{ attachmentStore.attachmentsCount }}</span>
              </button>
            </li>
          </ul>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Comments Tab -->
            <div v-show="activeTab === 'comments'" class="tab-pane fade show active">
              <CommentsTab 
                :task-id="task.id" 
                :project-id="task.project_id || 0"
              />
            </div>

            <!-- Attachments Tab -->
            <div v-show="activeTab === 'attachments'" class="tab-pane fade show active">
              <AttachmentsTab :task-id="task.id" />
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
          <button 
            type="button" 
            class="btn btn-primary"
            @click="handleEdit"
          >
            <i class="bi bi-pencil me-1"></i>
            Edit Task
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCommentStore } from '@/stores/comment'
import { useAttachmentStore } from '@/stores/attachment'
import CommentsTab from '@/components/comments/CommentsTab.vue'
import AttachmentsTab from '@/components/attachments/AttachmentsTab.vue'
import type { Task } from '@/types/models'

// Props
const props = defineProps<{
  isOpen: boolean
  task: Task | null
}>()

// Emits
const emit = defineEmits<{
  close: []
  edit: [task: Task]
}>()

// Stores
const commentStore = useCommentStore()
const attachmentStore = useAttachmentStore()

// State
const activeTab = ref('comments')

// Computed to force reactivity
const currentTask = computed(() => props.task)

// Watch for modal open/close and task changes
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    activeTab.value = 'comments'
  } else {
    // Clean up when modal closes
    commentStore.clearComments()
    attachmentStore.clearAttachments()
  }
})

// Watch for task updates
watch(() => props.task, (newTask, oldTask) => {
  if (newTask && oldTask && newTask.id === oldTask.id) {
    // Task was updated, but modal stayed open
    // Force re-render by clearing and reloading comments if on comments tab
    if (activeTab.value === 'comments') {
      commentStore.clearComments()
      // Comments will auto-reload via CommentsTab watch
    }
  }
}, { deep: true })

// Methods
const closeModal = () => {
  emit('close')
}

const handleEdit = () => {
  if (props.task) {
    emit('edit', props.task)
  }
}

// Utility functions
const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    todo: 'bg-secondary',
    in_progress: 'bg-info',
    review: 'bg-warning text-dark',
    done: 'bg-success'
  }
  return classes[status] || 'bg-secondary'
}

const getPriorityClass = (priority: string): string => {
  const classes: Record<string, string> = {
    low: 'bg-secondary',
    medium: 'bg-primary',
    high: 'bg-warning text-dark',
    critical: 'bg-danger'
  }
  return classes[priority] || 'bg-secondary'
}

const formatStatus = (status: string): string => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatPriority = (priority: string): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.modal-xl {
  max-width: 1140px;
}

.card {
  border: 1px solid #e5e7eb;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

label.small {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
  display: block;
}

.badge {
  padding: 0.35rem 0.65rem;
  font-weight: 500;
  font-size: 0.75rem;
}

/* Tab Styles */
.nav-tabs {
  border-bottom: 2px solid #e5e7eb;
}

.nav-tabs .nav-link {
  border: none;
  background: none;
  color: #6b7280;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link:hover {
  color: #3B82F6;
  border-bottom-color: #3B82F6;
}

.nav-tabs .nav-link.active {
  color: #3B82F6;
  border-bottom-color: #3B82F6;
}

.tab-content {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}

.btn-primary {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.btn-primary:hover {
  background-color: #2563EB;
  border-color: #2563EB;
}
</style>
