<template>
  <div 
    v-if="isOpen" 
    class="modal fade show d-block" 
    tabindex="-1" 
    style="background-color: rgba(0, 0, 0, 0.5);"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-pencil-square me-2"></i>
            Edit Project
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
            <!-- Project Name -->
            <div class="mb-3">
              <label for="projectName" class="form-label">
                Project Name <span class="text-danger">*</span>
              </label>
              <input
                id="projectName"
                v-model="formData.name"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.name }"
                placeholder="Enter project name"
                maxlength="255"
                required
              />
              <div v-if="errors.name" class="invalid-feedback">
                {{ errors.name }}
              </div>
            </div>

            <!-- Description -->
            <div class="mb-3">
              <label for="projectDescription" class="form-label">Description</label>
              <textarea
                id="projectDescription"
                v-model="formData.description"
                class="form-control"
                :class="{ 'is-invalid': errors.description }"
                rows="3"
                placeholder="Enter project description (optional)"
              ></textarea>
              <div v-if="errors.description" class="invalid-feedback">
                {{ errors.description }}
              </div>
            </div>

            <!-- Status and Priority Row -->
            <div class="row">
              <!-- Status -->
              <div class="col-md-6 mb-3">
                <label for="projectStatus" class="form-label">
                  Status <span class="text-danger">*</span>
                </label>
                <select
                  id="projectStatus"
                  v-model="formData.status"
                  class="form-select"
                  :class="{ 'is-invalid': errors.status }"
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
                <div v-if="errors.status" class="invalid-feedback">
                  {{ errors.status }}
                </div>
              </div>

              <!-- Priority -->
              <div class="col-md-6 mb-3">
                <label for="projectPriority" class="form-label">
                  Priority <span class="text-danger">*</span>
                </label>
                <select
                  id="projectPriority"
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

            <!-- Is Public Checkbox -->
            <div class="mb-3">
              <div class="form-check">
                <input
                  id="projectIsPublic"
                  v-model="formData.is_public"
                  type="checkbox"
                  class="form-check-input"
                />
                <label class="form-check-label" for="projectIsPublic">
                  Make this project public
                  <small class="text-muted d-block">Public projects are visible to all users</small>
                </label>
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
            {{ submitting ? 'Updating...' : 'Update Project' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useProjectStore } from '@/stores/project'
import type { UpdateProjectData } from '@/api/projects'
import type { Project } from '@/types/models'

// Props
const props = defineProps<{
  isOpen: boolean
  project: Project | null
}>()

// Emits
const emit = defineEmits<{
  close: []
  updated: [project: Project]
}>()

// Store
const projectStore = useProjectStore()

// Form data
const formData = ref<UpdateProjectData>({
  name: '',
  description: '',
  status: 'active',
  priority: 'medium',
  is_public: false
})

// Form state
const submitting = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const errors = ref<Record<string, string>>({})

// Computed
const isFormValid = computed(() => {
  return formData.value.name && formData.value.name.trim().length > 0
})

// Watch for modal open/close and project changes
watch(() => props.isOpen, (newValue) => {
  if (newValue && props.project) {
    populateForm(props.project)
  } else {
    resetMessages()
  }
})

watch(() => props.project, (newProject) => {
  if (newProject && props.isOpen) {
    populateForm(newProject)
  }
})

// Methods
const populateForm = (project: Project) => {
  formData.value = {
    name: project.name,
    description: project.description || '',
    status: project.status,
    priority: project.priority,
    is_public: project.is_public
  }
  errors.value = {}
  errorMessage.value = null
  successMessage.value = null
}

const resetMessages = () => {
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
  
  if (!formData.value.name || !formData.value.name.trim()) {
    errors.value.name = 'Project name is required'
    return false
  }
  
  if (formData.value.name && formData.value.name.length > 255) {
    errors.value.name = 'Project name must not exceed 255 characters'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!props.project) {
    errorMessage.value = 'No project selected for editing'
    return
  }

  if (!validateForm()) {
    return
  }

  submitting.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    const updatedProject = await projectStore.updateProject(props.project.id, formData.value)
    successMessage.value = 'Project updated successfully!'
    
    // Emit the updated event
    emit('updated', updatedProject)
    
    // Close modal after a short delay to show success message
    setTimeout(() => {
      closeModal()
    }, 1000)
  } catch (error: any) {
    // Handle validation errors
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      errorMessage.value = error.response?.data?.message || 'Failed to update project. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}
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
