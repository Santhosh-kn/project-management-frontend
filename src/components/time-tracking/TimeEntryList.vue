<template>
  <div class="time-entry-list">
    <div class="list-header">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Time Entries</h3>
      <button @click="$emit('add-entry')" class="btn-add">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
        </svg>
        Add Entry
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="entries.length === 0" class="empty-state">
      <p class="text-gray-600 dark:text-gray-400">No time entries yet</p>
    </div>

    <div v-else class="entries-container">
      <div v-for="group in groupedEntries" :key="group.date" class="date-group">
        <div class="date-header">
          <h4 class="date-title">{{ formatDate(group.date) }}</h4>
          <span class="date-total">{{ formatDuration(group.total) }}</span>
        </div>

        <div class="entries-list">
          <div v-for="entry in group.entries" :key="entry.id" class="entry-card">
            <div class="entry-info">
              <h5 class="entry-title">{{ entry.task?.title }}</h5>
              <p v-if="entry.description" class="entry-description">{{ entry.description }}</p>
            </div>

            <div class="entry-actions">
              <span class="time-duration">{{ formatDuration(entry.duration || 0) }}</span>
              <div class="action-buttons">
                <button @click="$emit('edit-entry', entry)" class="btn-icon">Edit</button>
                <button @click="$emit('delete-entry', entry.id)" class="btn-icon btn-delete">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TimeEntry } from '@/types/timeTracking'

interface Props {
  entries: TimeEntry[]
  loading?: boolean
}

const props = defineProps<Props>()
defineEmits(['add-entry', 'edit-entry', 'delete-entry'])

const groupedEntries = computed(() => {
  const groups = new Map()
  props.entries.forEach(entry => {
    const date = entry.start_time.split('T')[0]
    if (!groups.has(date)) {
      groups.set(date, { date, entries: [], total: 0 })
    }
    const group = groups.get(date)
    group.entries.push(entry)
    group.total += entry.duration || 0
  })
  return Array.from(groups.values())
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}
</script>

<style scoped>
.time-entry-list { @apply space-y-4; }
.list-header { @apply flex items-center justify-between mb-4; }
.btn-add { @apply flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700; }
.loading-state { @apply flex justify-center py-12; }
.empty-state { @apply text-center py-12; }
.entries-container { @apply space-y-6; }
.date-group { @apply space-y-3; }
.date-header { @apply flex justify-between pb-2 border-b border-gray-200 dark:border-gray-700; }
.date-title { @apply text-sm font-semibold text-gray-900 dark:text-white; }
.date-total { @apply text-sm font-medium text-gray-600 dark:text-gray-400; }
.entries-list { @apply space-y-2; }
.entry-card { @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4; }
.entry-info { @apply mb-3; }
.entry-title { @apply text-sm font-semibold text-gray-900 dark:text-white; }
.entry-description { @apply text-sm text-gray-700 dark:text-gray-300 mt-1; }
.entry-actions { @apply flex items-center justify-between; }
.time-duration { @apply text-lg font-bold text-gray-900 dark:text-white; }
.action-buttons { @apply flex gap-2; }
.btn-icon { @apply px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded; }
.btn-delete { @apply hover:text-red-600; }
</style>
