<template>
  <div class="reports-view container-fluid py-4">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col">
          <h2>
            <i class="bi bi-bar-chart me-2"></i>
            Reports & Analytics
          </h2>
          <p class="text-muted mb-0">Track project progress and team performance</p>
        </div>
      </div>
    </div>

    <!-- Project Selector -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <label class="form-label fw-bold">Select Project</label>
            <select 
              v-model="selectedProjectId" 
              class="form-select"
              @change="handleProjectChange"
            >
              <option value="">Select a project...</option>
              <option 
                v-for="project in projectStore.projects" 
                :key="project.id" 
                :value="project.id"
              >
                {{ project.name }}
              </option>
            </select>
          </div>
          <div class="col-md-6">
            <div class="d-flex gap-2">
              <button 
                v-if="selectedProjectId"
                class="btn btn-primary"
                @click="loadReports"
                :disabled="loadingReports"
              >
                <span v-if="loadingReports" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-arrow-clockwise me-2"></i>
                Refresh Reports
              </button>
              <button 
                v-if="selectedProject"
                class="btn btn-outline-secondary"
                @click="exportReports"
              >
                <i class="bi bi-download me-2"></i>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loadingReports && !selectedProject" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading reports...</span>
      </div>
      <p class="text-muted mt-2">Loading reports...</p>
    </div>

    <!-- No Project Selected -->
    <div v-else-if="!selectedProjectId" class="text-center py-5">
      <i class="bi bi-bar-chart text-muted" style="font-size: 4rem;"></i>
      <h4 class="mt-3">Select a project to view reports</h4>
      <p class="text-muted">Choose a project from the dropdown above to see detailed analytics</p>
    </div>

    <!-- Reports Content -->
    <div v-else-if="selectedProject" class="reports-content">
      <!-- Project Info Banner -->
      <div class="alert alert-info mb-4">
        <div class="d-flex align-items-center">
          <i class="bi bi-info-circle me-3" style="font-size: 1.5rem;"></i>
          <div>
            <strong>{{ selectedProject.name }}</strong>
            <p class="mb-0 small">{{ selectedProject.description || 'No description' }}</p>
          </div>
        </div>
      </div>

      <!-- First Row: Progress and Workload -->
      <div class="row g-4 mb-4">
        <!-- Project Progress Chart -->
        <div class="col-lg-6">
          <ProjectProgressChart 
            :data="reportStore.projectProgress"
            :loading="reportStore.loading"
            :error="reportStore.error"
          />
        </div>

        <!-- Team Workload Chart -->
        <div class="col-lg-6">
          <TeamWorkloadChart 
            :data="reportStore.teamWorkload"
            :loading="reportStore.loading"
            :error="reportStore.error"
          />
        </div>
      </div>

      <!-- Second Row: Completion Trends -->
      <div class="row g-4">
        <div class="col-12">
          <CompletionTrendsChart 
            :data="reportStore.completionTrends"
            :loading="reportStore.loading"
            :error="reportStore.error"
            @change-period="handlePeriodChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useReportStore } from '@/stores/report'
import ProjectProgressChart from '@/components/reports/ProjectProgressChart.vue'
import TeamWorkloadChart from '@/components/reports/TeamWorkloadChart.vue'
import CompletionTrendsChart from '@/components/reports/CompletionTrendsChart.vue'

// Stores
const projectStore = useProjectStore()
const reportStore = useReportStore()

// State
const selectedProjectId = ref<number | string>('')
const loadingReports = ref(false)
const trendsDays = ref(30)

// Computed
const selectedProject = computed(() => {
  if (!selectedProjectId.value) return null
  return projectStore.projects.find(p => p.id === Number(selectedProjectId.value))
})

// Methods
const loadProjects = async () => {
  try {
    await projectStore.fetchProjects()
  } catch (error) {
    console.error('Failed to load projects:', error)
  }
}

const loadReports = async () => {
  if (!selectedProjectId.value) return

  loadingReports.value = true
  const projectId = Number(selectedProjectId.value)

  try {
    // Load all reports in parallel
    await Promise.all([
      reportStore.fetchProjectProgress(projectId),
      reportStore.fetchTeamWorkload(projectId),
      reportStore.fetchCompletionTrends(projectId, trendsDays.value)
    ])
  } catch (error: any) {
    console.error('Failed to load reports:', error)
    alert(error.response?.data?.message || 'Failed to load reports')
  } finally {
    loadingReports.value = false
  }
}

const handleProjectChange = () => {
  if (selectedProjectId.value) {
    loadReports()
  } else {
    reportStore.clearReports()
  }
}

const handlePeriodChange = async (days: number) => {
  if (!selectedProjectId.value) return

  trendsDays.value = days
  const projectId = Number(selectedProjectId.value)

  try {
    await reportStore.fetchCompletionTrends(projectId, days)
  } catch (error: any) {
    console.error('Failed to load trends:', error)
    alert(error.response?.data?.message || 'Failed to load completion trends')
  }
}

const exportReports = () => {
  // TODO: Implement export functionality
  alert('Export functionality coming soon!')
}

// Lifecycle
onMounted(async () => {
  await loadProjects()
  
  // Auto-select first project if available
  if (projectStore.projects.length > 0) {
    selectedProjectId.value = projectStore.projects[0].id
    await loadReports()
  }
})
</script>

<style scoped>
.reports-view {
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
}

.page-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.page-header p {
  font-size: 1rem;
  margin-top: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-select {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.625rem 1rem;
}

.form-select:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-primary {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.btn-primary:hover {
  background-color: #2563EB;
  border-color: #2563EB;
}

.btn-outline-secondary {
  border-color: #d1d5db;
  color: #6b7280;
}

.btn-outline-secondary:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.alert-info {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
  border-radius: 0.5rem;
}

.reports-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .page-header h2 {
    font-size: 1.5rem;
  }
}
</style>
