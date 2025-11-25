<template>
  <div class="timesheet-view">
    <!-- Header -->
    <div class="view-header">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Timesheet</h1>
      <p class="text-gray-600 dark:text-gray-400">Track and manage your time entries</p>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="date-range">
        <label class="filter-label">From</label>
        <input
          v-model="filters.startDate"
          type="date"
          class="filter-input"
        />
      </div>

      <div class="date-range">
        <label class="filter-label">To</label>
        <input
          v-model="filters.endDate"
          type="date"
          class="filter-input"
        />
      </div>

      <button
        @click="fetchTimesheet"
        class="btn-filter"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        Apply
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">Total Hours</p>
          <p class="stat-value">{{ stats.totalHours.toFixed(2) }}h</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">Billable</p>
          <p class="stat-value">{{ stats.billableHours.toFixed(2) }}h</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">Entries</p>
          <p class="stat-value">{{ stats.entriesCount }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">Days Worked</p>
          <p class="stat-value">{{ timesheet.length }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="text-gray-600 dark:text-gray-400 mt-4">Loading timesheet...</p>
    </div>

    <!-- Timesheet Entries -->
    <div v-else-if="timesheet.length > 0" class="timesheet-container">
      <div
        v-for="day in timesheet"
        :key="day.date"
        class="day-section"
      >
        <div class="day-header">
          <div class="day-info">
            <h3 class="day-date">{{ formatDayDate(day.date) }}</h3>
            <span class="day-total">{{ formatDuration(day.total_duration) }}</span>
          </div>
          <button
            @click="toggleDay(day.date)"
            class="toggle-btn"
          >
            <svg
              class="w-5 h-5 transition-transform"
              :class="{ 'rotate-180': expandedDays.includes(day.date) }"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

        <!-- Day Entries -->
        <div v-if="expandedDays.includes(day.date)" class="day-entries">
          <div
            v-for="entry in day.entries"
            :key="entry.id"
            class="entry-item"
          >
            <div class="entry-main">
              <div class="entry-task">
                <router-link
                  v-if="entry.task"
                  :to="`/tasks/${entry.task.id}`"
                  class="task-link"
                >
                  {{ entry.task.title }}
                </router-link>
                <span v-if="entry.task?.project" class="project-badge">
                  {{ entry.task.project.name }}
                </span>
              </div>

              <div class="entry-time-info">
                <span class="time-range">
                  {{ formatTime(entry.start_time) }} - {{ entry.end_time ? formatTime(entry.end_time) : 'Running' }}
                </span>
                <span class="duration-badge">{{ formatDuration(entry.duration) }}</span>
              </div>

              <p v-if="entry.description" class="entry-description">
                {{ entry.description }}
              </p>
            </div>

            <div class="entry-meta">
              <span
                v-if="entry.billable"
                class="billable-indicator"
              >
                💰 Billable
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg class="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4">No time entries found</h3>
      <p class="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your date range</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { timeTrackingApi } from '@/api/timeTracking'
import type { TimesheetEntry } from '@/types/timeTracking'

const loading = ref(false)
const timesheet = ref<TimesheetEntry[]>([])
const expandedDays = ref<string[]>([])

// Get current week
const today = new Date()
const startOfWeek = new Date(today)
startOfWeek.setDate(today.getDate() - today.getDay())
const endOfWeek = new Date(today)
endOfWeek.setDate(today.getDate() + (6 - today.getDay()))

const filters = ref({
  startDate: startOfWeek.toISOString().split('T')[0],
  endDate: endOfWeek.toISOString().split('T')[0]
})

// Computed
const stats = computed(() => {
  const totalSeconds = timesheet.value.reduce((sum, day) => sum + day.total_duration, 0)
  const billableSeconds = timesheet.value.reduce((sum, day) => {
    return sum + day.entries
      .filter(e => e.billable)
      .reduce((s, e) => s + e.duration, 0)
  }, 0)
  const entriesCount = timesheet.value.reduce((sum, day) => sum + day.entries.length, 0)

  return {
    totalHours: totalSeconds / 3600,
    billableHours: billableSeconds / 3600,
    nonBillableHours: (totalSeconds - billableSeconds) / 3600,
    entriesCount
  }
})

// Methods
const fetchTimesheet = async () => {
  loading.value = true
  try {
    const response = await timeTrackingApi.getTimesheet({
      start_date: filters.value.startDate,
      end_date: filters.value.endDate
    })
    timesheet.value = response.data.data
    
    // Auto-expand today's entries
    const todayStr = new Date().toISOString().split('T')[0]
    if (timesheet.value.some(day => day.date === todayStr)) {
      expandedDays.value = [todayStr]
    }
  } catch (error) {
    console.error('Failed to fetch timesheet:', error)
  } finally {
    loading.value = false
  }
}

const toggleDay = (date: string) => {
  const index = expandedDays.value.indexOf(date)
  if (index > -1) {
    expandedDays.value.splice(index, 1)
  } else {
    expandedDays.value.push(date)
  }
}

const formatDayDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateString === today.toISOString().split('T')[0]) {
    return 'Today'
  } else if (dateString === yesterday.toISOString().split('T')[0]) {
    return 'Yesterday'
  }

  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Lifecycle
onMounted(() => {
  fetchTimesheet()
})
</script>

<style scoped>
.timesheet-view {
  @apply p-6 max-w-7xl mx-auto;
}

.view-header {
  @apply mb-6;
}

.filters-section {
  @apply flex flex-wrap gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700;
}

.date-range {
  @apply flex flex-col gap-1;
}

.filter-label {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

.filter-input {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white;
}

.btn-filter {
  @apply flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors self-end;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6;
}

.stat-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4;
}

.stat-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center;
}

.stat-info {
  @apply flex-1;
}

.stat-label {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.loading-state {
  @apply flex flex-col items-center justify-center py-16;
}

.timesheet-container {
  @apply space-y-4;
}

.day-section {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden;
}

.day-header {
  @apply flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700;
}

.day-info {
  @apply flex-1;
}

.day-date {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.day-total {
  @apply text-sm text-gray-600 dark:text-gray-400 ml-4;
}

.toggle-btn {
  @apply text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors;
}

.day-entries {
  @apply divide-y divide-gray-200 dark:divide-gray-700;
}

.entry-item {
  @apply p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors;
}

.entry-main {
  @apply space-y-2;
}

.entry-task {
  @apply flex items-center gap-2 flex-wrap;
}

.task-link {
  @apply text-blue-600 dark:text-blue-400 hover:underline font-medium;
}

.project-badge {
  @apply px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded;
}

.entry-time-info {
  @apply flex items-center gap-3;
}

.time-range {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.duration-badge {
  @apply px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded;
}

.entry-description {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.entry-meta {
  @apply mt-2;
}

.billable-indicator {
  @apply inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}
</style>
