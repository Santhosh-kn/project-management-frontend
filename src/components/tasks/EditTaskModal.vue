<template>
  <div 
    v-if="isOpen && task" 
    class="modal fade show d-block" 
    tabindex="-1" 
    style="background-color: rgba(0, 0, 0, 0.5);"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-pencil me-2"></i>
            Edit Task
          </h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="closeModal"
            :disabled="submitting"
          ></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <!-- Task Title -->
            <div class="mb-3">
              <label for="taskTitle" class="form-label">
                Task Title <span class="text-danger">*</span>
              </label>
              <input
                id="taskTitle"
                v-model="formData.title"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.title }"
                placeholder="Enter task title"
                maxlength="255"
                required
              />
              <div v-if="errors.title" class="invalid-feedback">
                {{ errors.title }}
              </div>
            </div>

            <!-- Description -->
            <div class="mb-3">
              <label for="taskDescription" class="form-label">Description</label>
              <textarea
                id="taskDescription"
                v-model="formData.description"
                class="form-control"
                :class="{ 'is-invalid': errors.description }"
                rows="3"
                placeholder="Enter task description (optional)"
              ></textarea>
              <div v-if="errors.description" class="invalid-feedback">
                {{ errors.description }}
              </div>
            </div>

            <!-- Status and Priority Row -->
            <div class="row">
              <!-- Status -->
              <div class="col-md-6 mb-3">
                <label for="taskStatus" class="form-label">
                  Status <span class="text-danger">*</span>
                </label>
                <select
                  id="taskStatus"
                  v-model="formData.status"
                  class="form-select"
                  :class="{ 'is-invalid': errors.status }"
                  required
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
                <div v-if="errors.status" class="invalid-feedback">
                  {{ errors.status }}
                </div>
              </div>

              <!-- Priority -->
              <div class="col-md-6 mb-3">
                <label for="taskPriority" class="form-label">
                  Priority <span class="text-danger">*</span>
                </label>
                <select
                  id="taskPriority"
                  v-model="formData.priority"
                  class="form-select"
                  :class="{ 'is-invalid': errors.priority }"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <div v-if="errors.priority" class="invalid-feedback">
                  {{ errors.priority }}
                </div>
              </div>
            </div>

            <!-- Due Date and Estimated Hours -->
            <div class="row">
              <!-- Due Date -->
              <div class="col-md-6 mb-3">
                <label for="taskDueDate" class="form-label">Due Date</label>
                <input
                  id="taskDueDate"
                  v-model="formData.due_date"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': errors.due_date }"
                />
                <div v-if="errors.due_date" class="invalid-feedback">
                  {{ errors.due_date }}
                </div>
              </div>

              <!-- Estimated Hours -->
              <div class="col-md-6 mb-3">
                <label for="taskEstimatedHours" class="form-label">Estimated Hours</label>
                <input
                  id="taskEstimatedHours"
                  v-model.number="formData.estimated_hours"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.estimated_hours }"
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
                <div v-if="errors.estimated_hours" class="invalid-feedback">
                  {{ errors.estimated_hours }}
                </div>
              </div>
            </div>

            <!-- Assign To -->
            <div class="mb-3" v-if="projectMembers.length > 0">
              <label for="taskAssignedTo" class="form-label">Assign To</label>
              <select
                id="taskAssignedTo"
                v-model="formData.assigned_to"
                class="form-select"
                :class="{ 'is-invalid': errors.assigned_to }"
              >
                <option :value="null">Unassigned</option>
                <option 
                  v-for="member in projectMembers" 
                  :key="member.id"
                  :value="member.user?.id || member.id"
                >
                  {{ member.user?.name || member.name || 'Unknown' }} ({{ member.role || 'Member' }})
                </option>
              </select>
              <div v-if="errors.assigned_to" class="invalid-feedback">
                {{ errors.assigned_to }}
              </div>
            </div>

            <!-- Tags Selection -->
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-tags me-1"></i>
                Tags
              </label>
              <div v-if="tagStore.loading" class="text-muted small">
                <span class="spinner-border spinner-border-sm me-1"></span>
                Loading tags...
              </div>
              <div v-else-if="tagStore.hasTags" class="tags-selector">
                <div 
                  v-for="tag in tagStore.tags" 
                  :key="tag.id"
                  class="form-check form-check-inline"
                >
                  <input
                    :id="`tag-edit-${tag.id}`"
                    v-model="selectedTags"
                    type="checkbox"
                    class="form-check-input"
                    :value="tag.id"
                  />
                  <label 
                    :for="`tag-edit-${tag.id}`" 
                    class="form-check-label"
                  >
                    <span 
                      class="badge" 
                      :style="{ backgroundColor: tag.color, color: '#fff' }"
                    >
                      {{ tag.name }}
                    </span>
                  </label>
                </div>
              </div>
              <div v-else class="text-muted small">
                No tags available. <router-link to="/tags">Create tags</router-link>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ errorMessage }}
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="alert alert-success" role="alert">
              <i class="bi bi-check-circle-fill me-2"></i>
              {{ successMessage }}
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="closeModal"
            :disabled="submitting"
          >
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-primary"
            @click="handleSubmit"
            :disabled="submitting || !isFormValid"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            {{ submitting ? 'Updating...' : 'Update Task' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useTagStore } from '@/stores/tag'
import type { UpdateTaskData } from '@/api/tasks'
import type { Task } from '@/types/models'

// Props
const props = defineProps<{
  isOpen: boolean
  task: Task | null
  projectMembers?: any[]
}>()

// Emits
const emit = defineEmits<{
  close: []
  updated: [task: Task]
}>()

// Stores
const taskStore = useTaskStore()
const tagStore = useTagStore()

// Form data
const formData = ref<UpdateTaskData>({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: undefined,
  estimated_hours: undefined,
  assigned_to: undefined
})

// Selected tags
const selectedTags = ref<number[]>([])

// Form state
const submitting = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const errors = ref<Record<string, string>>({})

// Computed
const isFormValid = computed(() => {
  return formData.value.title && formData.value.title.trim().length > 0
})

const projectMembers = computed(() => props.projectMembers || [])

// Watch for modal open/close
watch(() => props.isOpen, (newValue) => {
  if (newValue && props.task) {
    populateForm()
    // Load tags when modal opens
    if (!tagStore.hasTags) {
      tagStore.fetchTags()
    }
  }
})

// Watch for task changes
watch(() => props.task, (newTask) => {
  if (newTask && props.isOpen) {
    populateForm()
  }
})

// Methods
// Methods
const populateForm = () => {
  if (!props.task) return
  // Populate form data
  formData.value = {
    title: props.task.title,
    description: props.task.description || '',
    status: props.task.status,
    priority: props.task.priority,
    due_date: props.task.due_date || undefined,
    estimated_hours: props.task.estimated_hours || undefined,
    // Fix: Handle assigned_to - could be number (ID) or object with id
    assigned_to: typeof props.task.assigned_to === 'number' 
      ? props.task.assigned_to 
      : props.task.assigned_to?.id || null
  }

  // Fix: Properly handle tags - could be array of IDs or array of objects
  if (props.task.tags && Array.isArray(props.task.tags)) {
    selectedTags.value = props.task.tags.map(t => {
      // If tag is a number (just ID), return it
      if (typeof t === 'number') return t
      // If tag is an object with id property, return the id
      if (t && typeof t === 'object' && 'id' in t) return t.id
      return t
    }).filter(id => id !== undefined && id !== null)
  } else {
    selectedTags.value = []
  }

  errors.value = {}
  errorMessage.value = null
  successMessage.value = null
  submitting.value = false
}

const closeModal = () => {
  if (!submitting.value) {
    emit('close')
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!formData.value.title || !formData.value.title.trim()) {
    errors.value.title = 'Task title is required'
    return false
  }
  
  if (formData.value.title && formData.value.title.length > 255) {
    errors.value.title = 'Task title must not exceed 255 characters'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm() || !props.task) {
    return
  }

  submitting.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    // Clean up data - only send changed fields
    const cleanData: UpdateTaskData = {
      title: formData.value.title,
      status: formData.value.status,
      priority: formData.value.priority
    }

    if (formData.value.description !== undefined) {
      cleanData.description = formData.value.description
    }
    if (formData.value.due_date) {
      cleanData.due_date = formData.value.due_date
    }
    if (formData.value.estimated_hours !== undefined) {
      cleanData.estimated_hours = formData.value.estimated_hours
    }
    if (formData.value.assigned_to !== undefined) {
      cleanData.assigned_to = formData.value.assigned_to
    }

    // Update the task
    const updatedTask = await taskStore.updateTask(props.task.id, cleanData)
    
    // Handle tag updates if tags changed
    // Note: This requires backend support for tag updates
    // For now, we'll emit the updated task
    
    successMessage.value = 'Task updated successfully!'
    
    // Emit the updated event
    emit('updated', updatedTask)
    
    // Close modal after a short delay to show success message
    setTimeout(() => {
      closeModal()
    }, 1000)
  } catch (error: any) {
    // Handle validation errors
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      errorMessage.value = error.response?.data?.message || 'Failed to update task. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}

// Load tags on mount
onMounted(() => {
  if (!tagStore.hasTags) {
    tagStore.fetchTags()
  }
})
</script>

<style scoped>
.modal.show {
  display: block;
}

.form-label {
  font-weight: 500;
  color: #374151;
}

.form-control:focus,
.form-select:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.tags-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  min-height: 50px;
}

.form-check-inline {
  margin: 0;
}

.form-check-input:checked {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.badge {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}

.btn-primary {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.btn-primary:hover {
  background-color: #2563EB;
  border-color: #2563EB;
}

.btn-primary:disabled {
  background-color: #93C5FD;
  border-color: #93C5FD;
}

.invalid-feedback {
  display: block;
}

.alert {
  margin-bottom: 0;
}
</style>
