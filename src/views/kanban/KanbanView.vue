<template>
  <div class="kanban-view-container">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div>
        <h2 class="page-title mb-1">
          <i class="bi bi-kanban me-2"></i>
          Kanban Board
        </h2>
        <p class="text-muted mb-0">Visualize and manage your tasks with drag & drop</p>
      </div>
      
      <div class="header-actions">
        <!-- Project Selector -->
        <select 
          v-model="selectedProjectId" 
          class="form-select"
          @change="handleProjectChange"
        >
          <option :value="null">Select a project...</option>
          <option 
            v-for="project in projects" 
            :key="project.id"
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading Projects -->
    <div v-if="loadingProjects" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-2">Loading projects...</p>
    </div>

    <!-- No Projects -->
    <div v-else-if="projects.length === 0" class="empty-state text-center py-5">
      <i class="bi bi-folder-x display-1 text-muted"></i>
      <h4 class="mt-3">No Projects Found</h4>
      <p class="text-muted">Create a project first to use the Kanban board</p>
      <router-link to="/projects" class="btn btn-primary mt-3">
        <i class="bi bi-plus-lg me-2"></i>
        Create Project
      </router-link>
    </div>

    <!-- No Project Selected -->
    <div v-else-if="!selectedProjectId" class="empty-state text-center py-5">
      <i class="bi bi-kanban display-1 text-muted"></i>
      <h4 class="mt-3">Select a Project</h4>
      <p class="text-muted">Choose a project from the dropdown above to view its Kanban board</p>
    </div>

    <!-- Kanban Board -->
    <div v-else class="kanban-board-wrapper">
      <KanbanBoard 
        :projectId="selectedProjectId" 
        @task-updated="handleTaskUpdated"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import KanbanBoard from '@/components/kanban/KanbanBoard.vue'
import type { Project, Task } from '@/types/models'

const projectStore = useProjectStore()

// State
const selectedProjectId = ref<number | null>(null)
const projects = ref<Project[]>([])
const loadingProjects = ref(false)

// Methods
const loadProjects = async () => {
  loadingProjects.value = true
  try {
    await projectStore.fetchProjects()
    projects.value = projectStore.projects
    
    // Auto-select first project if available
    if (projects.value.length > 0 && !selectedProjectId.value) {
      selectedProjectId.value = projects.value[0].id
    }
  } catch (error) {
    console.error('Error loading projects:', error)
  } finally {
    loadingProjects.value = false
  }
}

const handleProjectChange = () => {
  // The KanbanBoard component will automatically reload when projectId changes
}

const handleTaskUpdated = (task: Task) => {
  console.log('Task updated:', task)
  // You can add any additional logic here if needed
}

// Lifecycle
onMounted(async () => {
  await loadProjects()
})
</script>

<style scoped>
.kanban-view-container {
  padding: 1.5rem;
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.header-actions .form-select {
  width: 300px;
}

.empty-state {
  background: white;
  border-radius: 0.5rem;
  padding: 3rem 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-state i {
  color: #9ca3af;
}

.kanban-board-wrapper {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .header-actions .form-select {
    width: 100%;
  }
}
</style>
