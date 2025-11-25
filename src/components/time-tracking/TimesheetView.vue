<template>
  <div class="timesheet-view">
    <div class="timesheet-header">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Weekly Timesheet</h3>
      
      <div class="week-navigator">
        <button @click="previousWeek" class="btn-nav">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
        <span class="week-label">{{ weekLabel }}</span>
        <button @click="nextWeek" class="btn-nav">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>
        <button @click="goToToday" class="btn-today">Today</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="timesheet-grid">
      <div v-for="day in weekDays" :key="day.date" class="day-column" :class="{ 'is-today': day.isToday }">
        <div class="day-header">
          <div class="day-name">{{ day.dayName }}</div>
          <div class="day-date">{{ day.dateStr }}</div>
          <div class="day-total">{{ formatDuration(day.total) }}</div>
        </div>

        <div class="day-entries">
          <div v-for="entry in day.entries" :key="entry.id" class="entry-item" @click="$emit('edit-entry', entry)">
            <div class="entry-task">{{ entry.task?.title }}</div>
            <div class="entry-duration">{{ formatDuration(entry.duration || 0) }}</div>
          </div>

          <div v-if="day.entries.length === 0" class="no-entries">
            <p class="text-xs text-gray-400">No entries</p>
          </div>
        </div>
      </div>
    </div>

    <div class="timesheet-summary">
      <div class="summary-item">
        <span class="summary-label">Total Hours:</span>
        <span class="summary-value">{{ formatDuration(totalHours) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Billable Hours:</span>
        <span class="summary-value text-green-600 dark:text-green-400">{{ formatDuration(billableHours) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { TimeEntry } from '@/types/timeTracking'

interface Props {
  entries: TimeEntry[]
  loading?: boolean
}

const props = defineProps<Props>()
defineEmits(['edit-entry', 'week-changed'])

const currentWeekStart = ref(getWeekStart(new Date()))

const weekLabel = computed(() => {
  const start = new Date(currentWeekStart.value)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
})

const weekDays = computed(() => {
  const days = []
  const today = new Date().toDateString()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart.value)
    date.setDate(date.getDate() + i)
    
    const dateStr = date.toISOString().split('T')[0]
    const dayEntries = props.entries.filter(entry => entry.start_time.startsWith(dateStr))
    const total = dayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
    
    days.push({
      date: dateStr,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateStr: date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      isToday: date.toDateString() === today,
      entries: dayEntries,
      total
    })
  }
  
  return days
})

const totalHours = computed(() => {
  return props.entries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
})

const billableHours = computed(() => {
  return props.entries.filter(e => e.is_billable).reduce((sum, entry) => sum + (entry.duration || 0), 0)
})

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function previousWeek() {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(newStart.getDate() - 7)
  currentWeekStart.value = newStart
}

function nextWeek() {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(newStart.getDate() + 7)
  currentWeekStart.value = newStart
}

function goToToday() {
  currentWeekStart.value = getWeekStart(new Date())
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}
</script>

<style scoped>
.timesheet-view { @apply space-y-4; }
.timesheet-header { @apply flex items-center justify-between mb-6; }
.week-navigator { @apply flex items-center gap-2; }
.btn-nav { @apply p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors; }
.week-label { @apply text-sm font-medium text-gray-900 dark:text-white px-4; }
.btn-today { @apply px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors; }
.loading-state { @apply flex justify-center py-12; }
.timesheet-grid { @apply grid grid-cols-7 gap-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg; }
.day-column { @apply bg-white dark:bg-gray-800 rounded-lg p-3 min-h-[200px]; }
.day-column.is-today { @apply ring-2 ring-blue-500; }
.day-header { @apply mb-3 pb-2 border-b border-gray-200 dark:border-gray-700; }
.day-name { @apply text-xs font-semibold text-gray-900 dark:text-white uppercase; }
.day-date { @apply text-xs text-gray-600 dark:text-gray-400; }
.day-total { @apply text-sm font-bold text-blue-600 dark:text-blue-400 mt-1; }
.day-entries { @apply space-y-2; }
.entry-item { @apply p-2 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors; }
.entry-task { @apply text-xs font-medium text-gray-900 dark:text-white truncate; }
.entry-duration { @apply text-xs text-gray-600 dark:text-gray-400; }
.no-entries { @apply flex items-center justify-center h-full; }
.timesheet-summary { @apply flex gap-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700; }
.summary-item { @apply flex items-center gap-2; }
.summary-label { @apply text-sm text-gray-600 dark:text-gray-400; }
.summary-value { @apply text-xl font-bold text-gray-900 dark:text-white; }
</style>
