<template>
  <div class="dependency-manager">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">
        <i class="bi bi-diagram-3 me-2"></i>
        Dependencies
        <span class="badge bg-primary ms-2">{{ dependencyStore.dependenciesCount }}</span>
      </h5>
      <button 
        class="btn btn-sm btn-primary"
        @click="openAddModal"
      >
        <i class="bi bi-plus-lg me-1"></i>
        Add Dependency
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !dependencyStore.hasDependencies" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading dependencies...</span>
      </div>
      <p class="text-muted mt-2">Loading dependencies...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="dependencyStore.error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ dependencyStore.error }}
    </div>

    <!-- Dependencies Content -->
    <div v-else>
      <!-- Tabs -->
      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'depends_on' }"
            @click="activeTab = 'depends_on'"
            type="button"
          >
            <i class="bi bi-arrow-left-circle me-1"></i>
            Depends On
            <span class="badge bg-secondary ms-1">{{ dependencyStore.dependenciesCount }}</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'blocks' }"
            @click="activeTab = 'blocks'"
            type="button"
          >
            <i class="bi bi-arrow-right-circle me-1"></i>
            Blocks
            <span class="badge bg-secondary ms-1">{{ dependencyStore.dependentsCount }}</span>
          </button>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Depends On Tab -->
        <div v-show="activeTab === 'depends_on'" class="tab-pane">
          <div v-if="!dependencyStore.hasDependencies" class="text-center py-4">
            <i class="bi bi-diagram-3 text-muted" style="font-size: 2.5rem;"></i>
            <p class="text-muted mt-3 mb-0">No dependencies</p>
            <p class="text-muted small">This task doesn't depend on any other tasks</p>
          </div>
          <DependencyList
            v-else
            :dependencies="dependencyStore.dependencies"
            @dependency-deleted="handleDependencyDeleted"
          />
        </div>

        <!-- Blocks Tab -->
        <div v-show="activeTab === 'blocks'" class="tab-pane">
          <div v-if="!dependencyStore.hasDependents" class="text-center py-4">
            <i class="bi bi-diagram-3 text-muted" style="font-size: 2.5rem;"></i>
            <p class="text-muted mt-3 mb-0">No dependent tasks</p>
            <p class="text-muted small">No other tasks depend on this one</p>
          </div>
          <DependencyList
            v-else
            :dependencies="dependentsAsDependencies"
            @dependency-deleted="handleDependencyDeleted"
          />
        </div>
      </div>
    </div>

    <!-- Add Dependency Modal -->
    <AddDependencyModal
      :task-id="taskId"
      :project-id="projectId"
      @dependency-added="handleDependencyAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDependencyStore } from '@/stores/dependency'
import DependencyList from './DependencyList.vue'
import AddDependencyModal from './AddDependencyModal.vue'

// Props
const props = defineProps<{
  taskId: number
  projectId: number
}>()

// Store
const dependencyStore = useDependencyStore()

// State
const loading = ref(false)
const activeTab = ref<'depends_on' | 'blocks'>('depends_on')

// Computed
const dependentsAsDependencies = computed(() => {
  // Convert dependents to the same format as dependencies for display
  return dependencyStore.dependents.map(dep => ({
    ...dep,
    depends_on_task: {
      id: dep.task_id,
      title: (dep as any).task?.title || 'Unknown Task',
      status: (dep as any).task?.status || 'unknown',
      priority: (dep as any).task?.priority || 'medium',
      due_date: (dep as any).task?.due_date || null,
      assigned_to: (dep as any).task?.assigned_to || null,
    }
  }))
})

// Methods
const loadDependencies = async () => {
  loading.value = true
  try {
    await dependencyStore.fetchTaskDependencies(props.taskId)
    await dependencyStore.fetchTaskDependents(props.taskId)
  } catch (error) {
    console.error('Failed to load dependencies:', error)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  const modalElement = document.getElementById('addDependencyModal')
  if (modalElement) {
    const modal = new (window as any).bootstrap.Modal(modalElement)
    modal.show()
  }
}

const handleDependencyAdded = async () => {
  await loadDependencies()
}

const handleDependencyDeleted = async (dependencyId: number) => {
  try {
    await dependencyStore.deleteDependency(dependencyId)
    await loadDependencies()
  } catch (error: any) {
    console.error('Failed to delete dependency:', error)
    alert(error.response?.data?.message || 'Failed to delete dependency')
  }
}

// Watch for task ID changes
watch(() => props.taskId, () => {
  if (props.taskId) {
    loadDependencies()
  }
}, { immediate: true })

// Load on mount
onMounted(() => {
  if (props.taskId) {
    loadDependencies()
  }
})
</script>

<style scoped>
.dependency-manager {
  padding: 0;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.nav-tabs {
  border-bottom: 2px solid #E5E7EB;
}

.nav-tabs .nav-link {
  color: #6B7280;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link:hover {
  border-color: #D1D5DB;
  color: #374151;
}

.nav-tabs .nav-link.active {
  color: #3B82F6;
  border-bottom-color: #3B82F6;
  background-color: transparent;
}

.tab-content {
  min-height: 200px;
}
</style>
