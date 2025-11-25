<template>
  <div class="time-entries-list">
    <div class="list-header">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Time Entries</h3>
      <div class="total-time">
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
        </svg>
        <span class="font-semibold">Total: {{ totalHours }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.loading" class="loading-state">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Entries List -->
    <div v-else-if="entries.length > 0" class="entries-container">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="entry-card"
      >
        <div class="entry-header">
          <div class="entry-date">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
            <span>{{ formatDate(entry.start_time) }}</span>
          </div>
          
          <div class="entry-actions">
            <button
              @click="editEntry(entry)"
              class="action-btn"
              title="Edit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              @click="deleteEntry(entry.id)"
              class="action-btn text-red-600 hover:text-red-700"
              title="Delete"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="entry-body">
          <div class="entry-time">
            <span class="time-range">
              {{ formatTime(entry.start_time) }} - {{ entry.end_time ? formatTime(entry.end_time) : 'Running' }}
            </span>
            <span class="duration">{{ formatDuration(entry.duration) }}</span>
          </div>

          <p v-if="entry.description" class="entry-description">
            {{ entry.description }}
          </p>

          <div class="entry-footer">
            <div v-if="entry.user" class="user-info">
              <div class="user-avatar">
                {{ getInitials(entry.user.name) }}
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ entry.user.name }}</span>
            </div>

            <span
              v-if="entry.billable"
              class="billable-badge"
            >
              💰 Billable
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p class="text-gray-600 dark:text-gray-400">No time entries yet</p>
      <p class="text-sm text-gray-500 dark:text-gray-500">Start the timer to track your time</p>
    </div>

    <!-- Edit Modal -->
    <div v-if="editingEntry" class="modal-overlay" @click.self="cancelEdit">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Time Entry</h3>
          <button @click="cancelEdit" class="close-btn">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Duration (hours)</label>
            <input
              v-model.number="editForm.hours"
              type="number"
              step="0.25"
              min="0"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea
              v-model="editForm.description"
              rows="3"
              class="form-input"
            ></textarea>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="editForm.billable"
              type="checkbox"
              id="edit-billable"
              class="checkbox"
            />
            <label for="edit-billable" class="text-sm text-gray-700 dark:text-gray-300">
              Billable
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="cancelEdit" class="btn-secondary">Cancel</button>
          <button @click="saveEdit" class="btn-primary" :disabled="store.loading">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTimeTrackingStore } from '@/stores/timeTracking'
import type { TimeEntry } from '@/types/timeTracking'

interface Props {
  taskId: number
}

const props = defineProps<Props>()
const store = useTimeTrackingStore()

const editingEntry = ref<TimeEntry | null>(null)
const editForm = ref({
  hours: 0,
  description: '',
  billable: false
})

// Computed
const entries = computed(() => {
  return store.timeEntries.filter(entry => entry.task_id === props.taskId)
})

const totalHours = computed(() => {
  const total = entries.value.reduce((sum, entry) => sum + entry.duration, 0) / 3600
  return `${total.toFixed(2)}h`
})

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
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

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const editEntry = (entry: TimeEntry) => {
  editingEntry.value = entry
  editForm.value = {
    hours: entry.duration / 3600,
    description: entry.description || '',
    billable: entry.billable
  }
}

const cancelEdit = () => {
  editingEntry.value = null
  editForm.value = {
    hours: 0,
    description: '',
    billable: false
  }
}

const saveEdit = async () => {
  if (!editingEntry.value) return

  try {
    await store.updateTimeEntry(editingEntry.value.id, {
      duration: editForm.value.hours * 3600,
      description: editForm.value.description || null,
      billable: editForm.value.billable
    })
    cancelEdit()
  } catch (error) {
    console.error('Failed to update entry:', error)
  }
}

const deleteEntry = async (id: number) => {
  if (!confirm('Are you sure you want to delete this time entry?')) return

  try {
    await store.deleteTimeEntry(id)
  } catch (error) {
    console.error('Failed to delete entry:', error)
  }
}

// Lifecycle
onMounted(() => {
  store.fetchTimeEntries({ task_id: props.taskId })
})
</script>

<style scoped>
.time-entries-list {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6;
}

.list-header {
  @apply flex items-center justify-between mb-6;
}

.total-time {
  @apply flex items-center gap-2 text-gray-600 dark:text-gray-400;
}

.loading-state {
  @apply flex justify-center items-center py-12;
}

.entries-container {
  @apply space-y-3;
}

.entry-card {
  @apply bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors;
}

.entry-header {
  @apply flex items-center justify-between mb-3;
}

.entry-date {
  @apply flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400;
}

.entry-actions {
  @apply flex items-center gap-2;
}

.action-btn {
  @apply p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors;
}

.entry-body {
  @apply space-y-3;
}

.entry-time {
  @apply flex items-center justify-between;
}

.time-range {
  @apply text-sm text-gray-700 dark:text-gray-300;
}

.duration {
  @apply text-lg font-semibold text-blue-600 dark:text-blue-400;
}

.entry-description {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.entry-footer {
  @apply flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600;
}

.user-info {
  @apply flex items-center gap-2;
}

.user-avatar {
  @apply w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium;
}

.billable-badge {
  @apply px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

/* Modal Styles */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.close-btn {
  @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors;
}

.modal-body {
  @apply p-6 space-y-4;
}

.form-group {
  @apply space-y-1;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white;
}

.checkbox {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.modal-footer {
  @apply flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors;
}
</style>
