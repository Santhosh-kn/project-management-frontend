<template>
  <div class="modal fade" id="addDependencyModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-diagram-3 me-2"></i>
            Add Dependency
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <!-- Dependency Type -->
            <div class="mb-3">
              <label class="form-label">Dependency Type</label>
              <select 
                v-model="formData.dependency_type" 
                class="form-select"
                :class="{ 'is-invalid': errors.dependency_type }"
                required
              >
                <option value="">Select type...</option>
                <option value="blocked_by">Blocked By</option>
                <option value="blocks">Blocks</option>
                <option value="related_to">Related To</option>
              </select>
              <div v-if="errors.dependency_type" class="invalid-feedback">
                {{ errors.dependency_type }}
              </div>
              <small class="text-muted d-block mt-1">
                <span v-if="formData.dependency_type === 'blocked_by'">
                  This task cannot start until the selected task is complete
                </span>
                <span v-if="formData.dependency_type === 'blocks'">
                  This task blocks the selected task from starting
                </span>
                <span v-if="formData.dependency_type === 'related_to'">
                  This task is related to the selected task
                </span>
              </small>
            </div>

            <!-- Task Selection -->
            <div class="mb-3">
              <label class="form-label">Select Task</label>
              <select 
                v-model="formData.depends_on_task_id" 
                class="form-select"
                :class="{ 'is-invalid': errors.depends_on_task_id }"
                required
              >
                <option value="">Select task...</option>
                <option 
                  v-for="task in availableTasks" 
                  :key="task.id" 
                  :value="task.id"
                >
                  {{ task.title }} ({{ formatStatus(task.status) }})
                </option>
              </select>
              <div v-if="errors.depends_on_task_id" class="invalid-feedback">
                {{ errors.depends_on_task_id }}
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
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="submitting || !isValid"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-plus-lg me-1"></i>
              {{ submitting ? 'Adding...' : 'Add Dependency' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDependencyStore } from '@/stores/dependency'
import { useTaskStore } from '@/stores/task'
import type { CreateDependencyData } from '@/api/dependencies'

// Props
const props = defineProps<{
  taskId: number
  projectId: number
}>()

// Emits
const emit = defineEmits<{
  'dependency-added': []
}>()

// Stores
const dependencyStore = useDependencyStore()
const taskStore = useTaskStore()

// State
const formData = ref<CreateDependencyData>({
  depends_on_task_id: 0,
  dependency_type: 'blocked_by'
})

const submitting = ref(false)
const errors = ref<Record<string, string>>({})
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Computed
const availableTasks = computed(() => {
  // Filter out current task and tasks that already have dependencies
  const existingDependencies = dependencyStore.dependencies.map(d => d.depends_on_task_id)
  return taskStore.tasks.filter(task => 
    task.id !== props.taskId && 
    !existingDependencies.includes(task.id) &&
    task.project_id === props.projectId
  )
})

const isValid = computed(() => {
  return formData.value.depends_on_task_id > 0 && formData.value.dependency_type !== ''
})

// Methods
const formatStatus = (status: string): string => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const resetForm = () => {
  formData.value = {
    depends_on_task_id: 0,
    dependency_type: 'blocked_by'
  }
  errors.value = {}
  errorMessage.value = null
  successMessage.value = null
}

const handleSubmit = async () => {
  if (!isValid.value) {
    return
  }

  submitting.value = true
  errors.value = {}
  errorMessage.value = null
  successMessage.value = null

  try {
    await dependencyStore.createDependency(props.taskId, formData.value)
    
    successMessage.value = 'Dependency added successfully!'
    emit('dependency-added')
    
    // Close modal after short delay
    setTimeout(() => {
      const modalElement = document.getElementById('addDependencyModal')
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement)
        if (modal) {
          modal.hide()
        }
      }
      resetForm()
    }, 1500)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to add dependency'
    
    // Handle validation errors
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    }
  } finally {
    submitting.value = false
  }
}

// Watch for modal close to reset form
watch(() => props.taskId, () => {
  resetForm()
})
</script>

<style scoped>
.modal-body {
  padding: 1.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-select:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
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

.alert {
  border-radius: 0.5rem;
  font-size: 0.875rem;
}
</style>
