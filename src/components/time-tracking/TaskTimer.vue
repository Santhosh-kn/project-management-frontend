<template>
  <div class="task-timer">
    <!-- Timer Display -->
    <div class="timer-card" :class="{ active: store.isTimerRunning }">
      <div class="timer-header">
        <div class="timer-icon">
          <svg 
            v-if="!store.isTimerRunning" 
            class="w-6 h-6" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
          </svg>
          <svg 
            v-else 
            class="w-6 h-6 animate-pulse" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
          </svg>
        </div>
        
        <div class="timer-info">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ store.isTimerRunning ? 'Timer Running' : 'Time Tracking' }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ store.isTimerRunning ? 'Click stop when done' : 'Track time on this task' }}
          </p>
        </div>
      </div>

      <!-- Timer Display -->
      <div class="timer-display">
        <div class="time-value">{{ formattedTime }}</div>
        <div class="time-label">
          {{ store.isTimerRunning ? 'Elapsed Time' : 'Total Today: ' + formatDuration(store.totalHoursToday * 3600) }}
        </div>
      </div>

      <!-- Timer Controls -->
      <div class="timer-controls">
        <button
          v-if="!store.isTimerRunning"
          @click="handleStart"
          :disabled="store.loading"
          class="btn-start"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
          </svg>
          Start Timer
        </button>

        <button
          v-else
          @click="handleStop"
          :disabled="store.loading"
          class="btn-stop"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd"/>
          </svg>
          Stop Timer
        </button>
      </div>

      <!-- Current Task Info (when timer is running) -->
      <div v-if="store.isTimerRunning && store.activeTimer?.task" class="active-task-info">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>
          <span>{{ store.activeTimer.task.title }}</span>
        </div>
      </div>
    </div>

    <!-- Manual Time Entry -->
    <div class="manual-entry-section">
      <button
        @click="showManualEntry = !showManualEntry"
        class="btn-manual-entry"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Add Manual Entry
      </button>

      <!-- Manual Entry Form -->
      <div v-if="showManualEntry" class="manual-entry-form">
        <div class="form-grid">
          <div>
            <label class="form-label">Date</label>
            <input
              v-model="manualEntry.date"
              type="date"
              class="form-input"
            />
          </div>

          <div>
            <label class="form-label">Duration (hours)</label>
            <input
              v-model.number="manualEntry.hours"
              type="number"
              step="0.25"
              min="0"
              class="form-input"
            />
          </div>
        </div>

        <div>
          <label class="form-label">Description</label>
          <textarea
            v-model="manualEntry.description"
            rows="3"
            class="form-input"
            placeholder="What did you work on?"
          ></textarea>
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model="manualEntry.billable"
            type="checkbox"
            id="billable"
            class="checkbox"
          />
          <label for="billable" class="text-sm text-gray-700 dark:text-gray-300">
            Billable
          </label>
        </div>

        <div class="form-actions">
          <button
            @click="handleManualEntry"
            :disabled="!isManualEntryValid || store.loading"
            class="btn-primary"
          >
            Save Entry
          </button>
          <button
            @click="cancelManualEntry"
            class="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="store.error" class="error-message">
      {{ store.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTimeTrackingStore } from '@/stores/timeTracking'

interface Props {
  taskId: number
}

const props = defineProps<Props>()
const store = useTimeTrackingStore()

const showManualEntry = ref(false)
const currentTime = ref(0)
let intervalId: number | null = null

const manualEntry = ref({
  date: new Date().toISOString().split('T')[0],
  hours: 1,
  description: '',
  billable: false
})

// Computed
const formattedTime = computed(() => {
  const seconds = store.isTimerRunning ? store.getElapsedTime : currentTime.value
  return formatDuration(seconds)
})

const isManualEntryValid = computed(() => {
  return manualEntry.value.date && manualEntry.value.hours > 0
})

// Methods
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const handleStart = async () => {
  try {
    await store.startTimer(props.taskId)
    startInterval()
  } catch (error) {
    console.error('Failed to start timer:', error)
  }
}

const handleStop = async () => {
  try {
    await store.stopTimer()
    stopInterval()
  } catch (error) {
    console.error('Failed to stop timer:', error)
  }
}

const handleManualEntry = async () => {
  try {
    const startTime = new Date(manualEntry.value.date)
    startTime.setHours(9, 0, 0, 0) // Default to 9 AM
    
    const endTime = new Date(startTime)
    endTime.setSeconds(endTime.getSeconds() + (manualEntry.value.hours * 3600))

    await store.createTimeEntry({
      task_id: props.taskId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration: manualEntry.value.hours * 3600,
      description: manualEntry.value.description || null,
      billable: manualEntry.value.billable
    })

    cancelManualEntry()
  } catch (error) {
    console.error('Failed to create manual entry:', error)
  }
}

const cancelManualEntry = () => {
  showManualEntry.value = false
  manualEntry.value = {
    date: new Date().toISOString().split('T')[0],
    hours: 1,
    description: '',
    billable: false
  }
}

const startInterval = () => {
  intervalId = window.setInterval(() => {
    currentTime.value++
  }, 1000)
}

const stopInterval = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// Lifecycle
onMounted(async () => {
  await store.fetchActiveTimer()
  if (store.isTimerRunning) {
    startInterval()
  }
})

onUnmounted(() => {
  stopInterval()
})
</script>

<style scoped>
.task-timer {
  @apply space-y-4;
}

.timer-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-gray-200 dark:border-gray-700 p-6 transition-all;
}

.timer-card.active {
  @apply border-green-500 bg-green-50 dark:bg-green-900/10;
}

.timer-header {
  @apply flex items-center gap-4 mb-6;
}

.timer-icon {
  @apply w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center;
}

.timer-card.active .timer-icon {
  @apply bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400;
}

.timer-info {
  @apply flex-1;
}

.timer-display {
  @apply text-center mb-6 py-4;
}

.time-value {
  @apply text-5xl font-bold text-gray-900 dark:text-white font-mono;
}

.time-label {
  @apply text-sm text-gray-600 dark:text-gray-400 mt-2;
}

.timer-controls {
  @apply flex justify-center;
}

.btn-start {
  @apply flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-stop {
  @apply flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.active-task-info {
  @apply mt-4 pt-4 border-t border-gray-200 dark:border-gray-700;
}

.manual-entry-section {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4;
}

.btn-manual-entry {
  @apply flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors w-full justify-center;
}

.manual-entry-form {
  @apply mt-4 space-y-4;
}

.form-grid {
  @apply grid grid-cols-2 gap-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white;
}

.checkbox {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.form-actions {
  @apply flex gap-2;
}

.btn-primary {
  @apply flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors;
}

.error-message {
  @apply p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400;
}
</style>
