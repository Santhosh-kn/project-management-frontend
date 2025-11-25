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
            <i class="bi bi-folder2-open me-2"></i>
            Select Project
          </h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="closeModal"
          ></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <p class="text-muted mb-3">
            Select a project to create the task in:
          </p>

          <!-- Projects List -->
          <div v-if="projects.length > 0" class="list-group">
            <button
              v-for="project in projects"
              :key="project.id"
              type="button"
              class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              @click="selectProject(project)"
            >
              <div>
                <h6 class="mb-1">{{ project.name }}</h6>
                <small class="text-muted">{{ project.description || 'No description' }}</small>
              </div>
              <div>
                <span :class="['badge', getStatusClass(project.status)]">
                  {{ formatStatus(project.status) }}
                </span>
              </div>
            </button>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-4">
            <i class="bi bi-folder-x display-4 text-muted"></i>
            <p class="text-muted mt-3 mb-0">No projects available</p>
            <small class="text-muted">Please create a project first</small>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="closeModal"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/types/models'

// Props
const props = defineProps<{
  isOpen: boolean
  projects: Project[]
}>()

// Emits
const emit = defineEmits<{
  close: []
  selected: [project: Project]
}>()

// Methods
const closeModal = () => {
  emit('close')
}

const selectProject = (project: Project) => {
  emit('selected', project)
}

// Utility functions
const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    draft: 'bg-secondary',
    active: 'bg-success',
    on_hold: 'bg-warning text-dark',
    completed: 'bg-primary',
    archived: 'bg-secondary'
  }
  return classes[status] || 'bg-secondary'
}

const formatStatus = (status: string): string => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.list-group-item:hover {
  background-color: #f3f4f6;
  cursor: pointer;
}

.list-group-item h6 {
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.badge {
  padding: 0.35rem 0.65rem;
  font-weight: 500;
  font-size: 0.75rem;
}
</style>
