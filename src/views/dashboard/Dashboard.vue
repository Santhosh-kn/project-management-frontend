<template>
  <div class="dashboard">
    <div class="container-fluid">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <h2 class="page-title">Dashboard</h2>
        <p class="text-muted">Welcome back, {{ userName }}!</p>
      </div>

      <!-- Loading State -->
      <div v-if="dashboardStore.loading && !hasData" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading dashboard...</span>
        </div>
        <p class="text-muted mt-2">Loading dashboard...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="dashboardStore.error" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ dashboardStore.error }}
        <button class="btn btn-sm btn-outline-danger ms-3" @click="refreshDashboard">
          <i class="bi bi-arrow-clockwise me-1"></i>
          Retry
        </button>
      </div>

      <!-- Dashboard Content -->
      <div v-else>
        <!-- Stats Cards -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-primary">
                <i class="bi bi-folder"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-value">{{ dashboardStore.stats.total_projects || 0 }}</h3>
                <p class="stat-label">Total Projects</p>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-info">
                <i class="bi bi-check2-square"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-value">{{ dashboardStore.stats.total_tasks || 0 }}</h3>
                <p class="stat-label">Total Tasks</p>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-success">
                <i class="bi bi-check-circle"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-value">{{ dashboardStore.stats.completed_tasks || 0 }}</h3>
                <p class="stat-label">Completed</p>
              </div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-warning">
                <i class="bi bi-clock"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-value">{{ dashboardStore.stats.pending_tasks || 0 }}</h3>
                <p class="stat-label">Pending</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <TaskStatusChart :data="statusData" />
          </div>
          <div class="col-md-6">
            <TaskPriorityChart :data="priorityData" />
          </div>
        </div>

        <!-- Recent Projects & Tasks & Activity -->
        <div class="row g-3">
          <!-- Recent Projects -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Recent Projects</h5>
                <router-link to="/projects" class="btn btn-sm btn-primary">View All</router-link>
              </div>
              <div class="card-body">
                <div v-if="dashboardStore.recentProjects.length === 0" class="empty-state text-center py-4">
                  <i class="bi bi-folder-x fs-1 text-muted"></i>
                  <p class="text-muted mt-2 mb-3">No projects yet</p>
                  <router-link to="/projects" class="btn btn-primary btn-sm">Create Project</router-link>
                </div>
                <div v-else class="projects-list">
                  <div
                    v-for="project in dashboardStore.recentProjects"
                    :key="project.id"
                    class="project-item"
                  >
                    <div class="project-info">
                      <router-link :to="`/projects/${project.id}`" class="project-name">
                        {{ project.name }}
                      </router-link>
                      <div class="project-meta">
                        <span class="badge me-1" :class="getStatusClass(project.status)">
                          {{ project.status }}
                        </span>
                        <span class="badge me-1" :class="getPriorityClass(project.priority)">
                          {{ project.priority }}
                        </span>
                        <small class="text-muted">
                          <i class="bi bi-people me-1"></i>
                          {{ project.members_count }} members
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Tasks -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Recent Tasks</h5>
                <router-link to="/tasks" class="btn btn-sm btn-primary">View All</router-link>
              </div>
              <div class="card-body">
                <div v-if="dashboardStore.recentTasks.length === 0" class="empty-state text-center py-4">
                  <i class="bi bi-list-task fs-1 text-muted"></i>
                  <p class="text-muted mt-2 mb-3">No tasks yet</p>
                  <router-link to="/tasks" class="btn btn-primary btn-sm">Create Task</router-link>
                </div>
                <div v-else class="tasks-list">
                  <div
                    v-for="task in dashboardStore.recentTasks"
                    :key="task.id"
                    class="task-item"
                  >
                    <div class="task-info">
                      <div class="task-title">{{ task.title }}</div>
                      <div class="task-meta">
                        <small class="text-muted d-block mb-1">{{ task.project_name }}</small>
                        <span class="badge me-1" :class="getStatusClass(task.status)">
                          {{ task.status }}
                        </span>
                        <span class="badge" :class="getPriorityClass(task.priority)">
                          {{ task.priority }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="col-lg-4">
            <ActivityTimeline title="Recent Activity" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import ActivityTimeline from '@/components/activity/ActivityTimeline.vue'
import TaskStatusChart from '@/components/charts/TaskStatusChart.vue'
import TaskPriorityChart from '@/components/charts/TaskPriorityChart.vue'

const statusData = ref({
  todo: 15,
  in_progress: 8,
  review: 5,
  done: 22
})

const priorityData = ref({
  high: 12,
  medium: 18,
  low: 20
})

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const userName = computed(() => authStore.userName)
const hasData = computed(() => dashboardStore.stats.total_projects > 0 || dashboardStore.recentProjects.length > 0)

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    todo: 'bg-secondary',
    in_progress: 'bg-primary',
    review: 'bg-warning',
    done: 'bg-success',
    active: 'bg-success',
    draft: 'bg-secondary',
    completed: 'bg-success',
    on_hold: 'bg-warning',
    archived: 'bg-dark',
  }
  return classes[status] || 'bg-secondary'
}

const getPriorityClass = (priority: string): string => {
  const classes: Record<string, string> = {
    low: 'bg-info',
    medium: 'bg-primary',
    high: 'bg-warning',
    critical: 'bg-danger',
  }
  return classes[priority] || 'bg-secondary'
}

const refreshDashboard = async () => {
  await dashboardStore.fetchAll()
}

onMounted(async () => {
  await dashboardStore.fetchAll()
})
</script>

<style scoped>
.dashboard {
  padding: 1.5rem 0;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

/* Stat Cards */
.stat-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0;
  color: #1e293b;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  line-height: 1.2;
}

/* Card Styles */
.card {
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  height: 100%;
}

.card-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.875rem 1rem;
}

.card-header h5 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.card-body {
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

/* Empty State */
.empty-state {
  padding: 2rem 1rem;
}

.empty-state i {
  font-size: 2.5rem;
}

/* Projects List */
.projects-list,
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.project-item,
.task-item {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.project-item:hover,
.task-item:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.project-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #1e293b;
  text-decoration: none;
  display: block;
  margin-bottom: 0.5rem;
}

.project-name:hover {
  color: #3b82f6;
}

.task-title {
  font-weight: 500;
  font-size: 0.875rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.project-meta,
.task-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.badge {
  font-size: 0.65rem;
  padding: 0.25rem 0.5rem;
  text-transform: capitalize;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.25rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
    font-size: 1rem;
  }
}
</style>
