<template>
  <div class="advanced-filters">
    <!-- Filter Toggle Button -->
    <button 
      class="btn btn-outline-primary btn-sm"
      @click="toggleFilters"
      :class="{ 'active': showFilters }"
    >
      <i class="bi bi-funnel me-1"></i>
      Filters
      <span v-if="activeFiltersCount > 0" class="badge bg-primary ms-1">
        {{ activeFiltersCount }}
      </span>
    </button>

    <!-- Filters Panel -->
    <div v-if="showFilters" class="filters-panel mt-3">
      <div class="card">
        <div class="card-body">
          <div class="row g-3">
            <!-- Search -->
            <div class="col-md-4">
              <label class="form-label small">Search</label>
              <input
                v-model="filters.search"
                type="text"
                class="form-control form-control-sm"
                placeholder="Search tasks..."
              />
            </div>

            <!-- Status Filter -->
            <div class="col-md-4">
              <label class="form-label small">Status</label>
              <select 
                v-model="filters.status" 
                class="form-select form-select-sm"
              >
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <!-- Priority Filter -->
            <div class="col-md-4">
              <label class="form-label small">Priority</label>
              <select 
                v-model="filters.priority" 
                class="form-select form-select-sm"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <!-- Assignee Filter -->
            <div class="col-md-4" v-if="users.length > 0">
              <label class="form-label small">Assignee</label>
              <select 
                v-model="filters.assigned_to" 
                class="form-select form-select-sm"
              >
                <option value="">All Users</option>
                <option value="unassigned">Unassigned</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>

            <!-- Date Range: From -->
            <div class="col-md-4">
              <label class="form-label small">Due Date From</label>
              <input
                v-model="filters.due_date_from"
                type="date"
                class="form-control form-control-sm"
              />
            </div>

            <!-- Date Range: To -->
            <div class="col-md-4">
              <label class="form-label small">Due Date To</label>
              <input
                v-model="filters.due_date_to"
                type="date"
                class="form-control form-control-sm"
              />
            </div>

            <!-- Tags Filter -->
            <div class="col-md-12" v-if="tagStore.hasTags">
              <label class="form-label small">Tags</label>
              <div class="tags-filter">
                <div 
                  v-for="tag in tagStore.tags" 
                  :key="tag.id"
                  class="form-check form-check-inline"
                >
                  <input
                    :id="`filter-tag-${tag.id}`"
                    v-model="filters.tags"
                    type="checkbox"
                    class="form-check-input"
                    :value="tag.id"
                  />
                  <label 
                    :for="`filter-tag-${tag.id}`" 
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
            </div>

            <!-- Show Completed Tasks -->
            <div class="col-md-12">
              <div class="form-check">
                <input
                  id="showCompleted"
                  v-model="filters.show_completed"
                  type="checkbox"
                  class="form-check-input"
                />
                <label for="showCompleted" class="form-check-label small">
                  Show completed tasks
                </label>
              </div>
            </div>
          </div>

          <!-- Filter Actions -->
          <div class="filter-actions mt-3 pt-3 border-top">
            <button 
              class="btn btn-primary btn-sm me-2" 
              @click="applyFilters"
            >
              <i class="bi bi-check2 me-1"></i>
              Apply Filters
            </button>
            <button 
              class="btn btn-outline-secondary btn-sm" 
              @click="clearFilters"
            >
              <i class="bi bi-x-lg me-1"></i>
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Filters Pills -->
    <div v-if="activeFiltersList.length > 0" class="active-filters mt-2">
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <span class="text-muted small">Active filters:</span>
        <span 
          v-for="filter in activeFiltersList" 
          :key="filter.key"
          class="badge bg-primary"
        >
          {{ filter.label }}
          <i 
            class="bi bi-x ms-1" 
            style="cursor: pointer;"
            @click="removeFilter(filter.key)"
          ></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useTagStore } from '@/stores/tag'

// Props
const props = withDefaults(defineProps<{
  users?: any[]
  initialFilters?: any
}>(), {
  users: () => []
})

// Emits
const emit = defineEmits<{
  filter: [filters: any]
}>()

// Stores
const tagStore = useTagStore()

// State
const showFilters = ref(false)
const filters = ref({
  search: '',
  status: '',
  priority: '',
  assigned_to: '',
  due_date_from: '',
  due_date_to: '',
  tags: [] as number[],
  show_completed: true
})

// Computed
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.search) count++
  if (filters.value.status) count++
  if (filters.value.priority) count++
  if (filters.value.assigned_to) count++
  if (filters.value.due_date_from) count++
  if (filters.value.due_date_to) count++
  if (filters.value.tags.length > 0) count++
  if (!filters.value.show_completed) count++
  return count
})

const activeFiltersList = computed(() => {
  const list: { key: string, label: string }[] = []
  
  if (filters.value.search) {
    list.push({ key: 'search', label: `Search: ${filters.value.search}` })
  }
  if (filters.value.status) {
    list.push({ key: 'status', label: `Status: ${filters.value.status}` })
  }
  if (filters.value.priority) {
    list.push({ key: 'priority', label: `Priority: ${filters.value.priority}` })
  }
  if (filters.value.assigned_to) {
    const userName = props.users.find(u => u.id === Number(filters.value.assigned_to))?.name || 'User'
    list.push({ key: 'assigned_to', label: `Assigned to: ${filters.value.assigned_to === 'unassigned' ? 'Unassigned' : userName}` })
  }
  if (filters.value.due_date_from) {
    list.push({ key: 'due_date_from', label: `From: ${filters.value.due_date_from}` })
  }
  if (filters.value.due_date_to) {
    list.push({ key: 'due_date_to', label: `To: ${filters.value.due_date_to}` })
  }
  if (filters.value.tags.length > 0) {
    list.push({ key: 'tags', label: `${filters.value.tags.length} tag(s)` })
  }
  if (!filters.value.show_completed) {
    list.push({ key: 'show_completed', label: 'Hide completed' })
  }
  
  return list
})

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const applyFilters = () => {
  emit('filter', { ...filters.value })
}

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    priority: '',
    assigned_to: '',
    due_date_from: '',
    due_date_to: '',
    tags: [],
    show_completed: true
  }
  applyFilters()
}

const removeFilter = (key: string) => {
  if (key === 'tags') {
    filters.value.tags = []
  } else if (key === 'show_completed') {
    filters.value.show_completed = true
  } else {
    (filters.value as any)[key] = ''
  }
  applyFilters()
}

// Watch for filter changes and auto-apply
watch(filters, () => {
  // Auto-apply filters after a short delay
  applyFilters()
}, { deep: true })

// Load tags on mount
onMounted(() => {
  if (!tagStore.hasTags) {
    tagStore.fetchTags()
  }
  
  // Apply initial filters if provided
  if (props.initialFilters) {
    filters.value = { ...filters.value, ...props.initialFilters }
  }
})
</script>

<style scoped>
.advanced-filters {
  margin-bottom: 1rem;
}

.btn.active {
  background-color: #3B82F6;
  color: white;
  border-color: #3B82F6;
}

.filters-panel {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.tags-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #f9fafb;
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

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.active-filters {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.active-filters .badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.active-filters .badge i {
  opacity: 0.8;
  transition: opacity 0.2s;
}

.active-filters .badge i:hover {
  opacity: 1;
}
</style>
