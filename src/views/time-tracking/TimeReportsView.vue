<template>
  <div class="time-reports-view">
    <!-- Header -->
    <div class="view-header">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Time Reports</h1>
      <p class="text-gray-600 dark:text-gray-400">Analyze time tracking data</p>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label class="filter-label">From</label>
        <input
          v-model="filters.startDate"
          type="date"
          class="filter-input"
        />
      </div>

      <div class="filter-group">
        <label class="filter-label">To</label>
        <input
          v-model="filters.endDate"
          type="date"
          class="filter-input"
        />
      </div>

      <div class="filter-group">
        <label class="filter-label">Project</label>
        <select
          v-model="filters.projectId"
          class="filter-input"
        >
          <option value="">All Projects</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>
      </div>

      <button
        @click="fetchReport"
        class="btn-generate"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        Generate Report
      </button>

      <button
        @click="exportReport"
        :disabled="report.length === 0"
        class="btn-export"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        Export CSV
      </button>
    </div>

    <!-- Summary Stats -->
    <div v-if="report.length > 0" class="summary-section">
      <div class="summary-card">
        <div class="summary-icon bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="summary-info">
          <p class="summary-label">Team Members</p>
          <p class="summary-value">{{ report.length }}</p>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="summary-info">
          <p class="summary-label">Total Hours</p>
          <p class="summary-value">{{ totalHours.toFixed(2) }}h</p>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="summary-info">
          <p class="summary-label">Billable Hours</p>
          <p class="summary-value">{{ totalBillableHours.toFixed(2) }}h</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="text-gray-600 dark:text-gray-400 mt-4">Generating report...</p>
    </div>

    <!-- Report Table -->
    <div v-else-if="report.length > 0" class="report-table-container">
      <table class="report-table">
        <thead>
          <tr>
            <th class="table-header">Team Member</th>
            <th class="table-header text-right">Total Hours</th>
            <th class="table-header text-right">Billable</th>
            <th class="table-header text-right">Non-Billable</th>
            <th class="table-header">Projects</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(user, index) in report"
            :key="user.user_id"
            class="table-row"
            :class="{ 'bg-gray-50 dark:bg-gray-800': index % 2 === 0 }"
          >
            <td class="table-cell">
              <div class="user-cell">
                <div class="user-avatar">
                  {{ getInitials(user.user_name) }}
                </div>
                <span class="font-medium">{{ user.user_name }}</span>
              </div>
            </td>
            <td class="table-cell text-right">
              <span class="font-semibold text-gray-900 dark:text-white">
                {{ user.total_hours.toFixed(2) }}h
              </span>
            </td>
            <td class="table-cell text-right">
              <span class="text-green-600 dark:text-green-400 font-medium">
                {{ user.billable_hours.toFixed(2) }}h
              </span>
            </td>
            <td class="table-cell text-right">
              <span class="text-gray-600 dark:text-gray-400">
                {{ (user.total_hours - user.billable_hours).toFixed(2) }}h
              </span>
            </td>
            <td class="table-cell">
              <div class="projects-list">
                <button
                  @click="toggleUserProjects(user.user_id)"
                  class="projects-toggle"
                >
                  {{ user.projects.length }} project{{ user.projects.length !== 1 ? 's' : '' }}
                  <svg
                    class="w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': expandedUsers.includes(user.user_id) }"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <!-- Projects Breakdown -->
          <tr
            v-if="expandedUsers.includes(user.user_id)"
            v-for="user in report"
            :key="`${user.user_id}-projects`"
            class="projects-row"
          >
            <td colspan="5" class="projects-cell">
              <div class="project-breakdown">
                <div
                  v-for="project in user.projects"
                  :key="project.project_id"
                  class="project-item"
                >
                  <span class="project-name">{{ project.project_name }}</span>
                  <span class="project-hours">{{ project.hours.toFixed(2) }}h</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="table-footer">
            <td class="table-cell font-bold">Total</td>
            <td class="table-cell text-right font-bold">{{ totalHours.toFixed(2) }}h</td>
            <td class="table-cell text-right font-bold text-green-600 dark:text-green-400">
              {{ totalBillableHours.toFixed(2) }}h
            </td>
            <td class="table-cell text-right font-bold text-gray-600 dark:text-gray-400">
              {{ (totalHours - totalBillableHours).toFixed(2) }}h
            </td>
            <td class="table-cell"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg class="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4">No data available</h3>
      <p class="text-gray-500 dark:text-gray-400 mt-2">Generate a report to see time tracking data</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { timeTrackingApi } from '@/api/timeTracking'
import type { TimeReport } from '@/types/timeTracking'

interface Project {
  id: number
  name: string
}

const loading = ref(false)
const report = ref<TimeReport[]>([])
const projects = ref<Project[]>([])
const expandedUsers = ref<number[]>([])

// Get last 30 days
const today = new Date()
const thirtyDaysAgo = new Date(today)
thirtyDaysAgo.setDate(today.getDate() - 30)

const filters = ref({
  startDate: thirtyDaysAgo.toISOString().split('T')[0],
  endDate: today.toISOString().split('T')[0],
  projectId: ''
})

// Computed
const totalHours = computed(() => {
  return report.value.reduce((sum, user) => sum + user.total_hours, 0)
})

const totalBillableHours = computed(() => {
  return report.value.reduce((sum, user) => sum + user.billable_hours, 0)
})

// Methods
const fetchReport = async () => {
  loading.value = true
  try {
    const params: any = {
      start_date: filters.value.startDate,
      end_date: filters.value.endDate
    }
    
    if (filters.value.projectId) {
      params.project_id = filters.value.projectId
    }

    const response = await timeTrackingApi.getTimeReport(params)
    report.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch report:', error)
  } finally {
    loading.value = false
  }
}

const fetchProjects = async () => {
  try {
    // Assuming you have a projects API
    const response = await fetch('/api/projects')
    const data = await response.json()
    projects.value = data.data
  } catch (error) {
    console.error('Failed to fetch projects:', error)
  }
}

const toggleUserProjects = (userId: number) => {
  const index = expandedUsers.value.indexOf(userId)
  if (index > -1) {
    expandedUsers.value.splice(index, 1)
  } else {
    expandedUsers.value.push(userId)
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const exportReport = () => {
  // Create CSV content
  let csv = 'Team Member,Total Hours,Billable Hours,Non-Billable Hours\n'
  
  report.value.forEach(user => {
    csv += `"${user.user_name}",${user.total_hours.toFixed(2)},${user.billable_hours.toFixed(2)},${(user.total_hours - user.billable_hours).toFixed(2)}\n`
  })

  // Add totals
  csv += `\nTotal,${totalHours.value.toFixed(2)},${totalBillableHours.value.toFixed(2)},${(totalHours.value - totalBillableHours.value).toFixed(2)}\n`

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `time-report-${filters.value.startDate}-to-${filters.value.endDate}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

// Lifecycle
onMounted(() => {
  fetchProjects()
  fetchReport()
})
</script>

<style scoped>
.time-reports-view {
  @apply p-6 max-w-7xl mx-auto;
}

.view-header {
  @apply mb-6;
}

.filters-section {
  @apply flex flex-wrap gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700;
}

.filter-group {
  @apply flex flex-col gap-1;
}

.filter-label {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

.filter-input {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white;
}

.btn-generate {
  @apply flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors self-end;
}

.btn-export {
  @apply flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors self-end disabled:opacity-50 disabled:cursor-not-allowed;
}

.summary-section {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4 mb-6;
}

.summary-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4;
}

.summary-icon {
  @apply w-16 h-16 rounded-full flex items-center justify-center;
}

.summary-info {
  @apply flex-1;
}

.summary-label {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.summary-value {
  @apply text-3xl font-bold text-gray-900 dark:text-white;
}

.loading-state {
  @apply flex flex-col items-center justify-center py-16;
}

.report-table-container {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden;
}

.report-table {
  @apply w-full;
}

.table-header {
  @apply px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider;
}

.table-row {
  @apply transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50;
}

.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white;
}

.user-cell {
  @apply flex items-center gap-3;
}

.user-avatar {
  @apply w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold;
}

.projects-list {
  @apply flex items-center gap-2;
}

.projects-toggle {
  @apply flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline;
}

.projects-row {
  @apply bg-gray-100 dark:bg-gray-700/30;
}

.projects-cell {
  @apply px-6 py-4;
}

.project-breakdown {
  @apply space-y-2;
}

.project-item {
  @apply flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded;
}

.project-name {
  @apply text-sm text-gray-700 dark:text-gray-300;
}

.project-hours {
  @apply text-sm font-semibold text-blue-600 dark:text-blue-400;
}

.table-footer {
  @apply bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-200 dark:border-gray-600;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}
</style>
