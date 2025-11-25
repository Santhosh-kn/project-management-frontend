<template>
  <div class="timer-widget">
    <!-- Active Timer Display -->
    <div v-if="timeStore.isTimerRunning" class="active-timer">
      <div class="timer-content">
        <!-- Timer Info -->
        <div class="timer-info">
          <div class="flex items-center gap-2">
            <div class="pulse-dot"></div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ timeStore.activeTimer?.task?.title || 'Tracking Time' }}
            </span>
          </div>
          <div class="timer-display">
            {{ formatTime(timeStore.currentDuration) }}
          </div>
        </div>

        <!-- Timer Actions -->
        <div class="timer-actions">
          <button
            @click="stopTimer"
            class="btn-stop"
            :disabled="timeStore.loading"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd"/>
            </svg>
            Stop
          </button>
        </div>
      </div>

      <!-- Project Info -->
      <div v-if="timeStore.activeTimer?.task?.project" class="timer-meta">
        <svg class="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
        </svg>
        <span class="text-xs text-gray-600 dark:text-gray-400">
          {{ timeStore.activeTimer.task.project.name }}
        </span>
      </div>
    </div>

    <!-- Start Timer Button (when no active timer) -->
    <div v-else class="start-timer-prompt">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        No timer running
      </p>
      <button
        v-if="currentTaskId"
        @click="startTimer"
        class="btn-start"
        :disabled="timeStore.loading"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
        </svg>
        Start Timer
      </button>
    </div>

    <!-- Recent Time Entries -->
    <div v-if="showRecent && recentEntries.length > 0" class="recent-entries">
      <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Recent Entries
      </h4>
      <div class="entries-list">
        <div
          v-for="entry in recentEntries.slice(0, 3)"
          :key="entry.id"
          class="entry-item"
        >
          <div class="entry-info">
            <span class="entry-task">{{ entry.task?.title }}</span>
            <span class="entry-duration">{{ formatDuration(entry.duration) }}</span>
          </div>
          <span class="entry-date">{{ formatDate(entry.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTimeTrackingStore } from '@/stores/timeTracking'

interface Props {
  currentTaskId?: number
  showRecent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showRecent: true
})

const timeStore = useTimeTrackingStore()
const recentEntries = computed(() => timeStore.timeEntries)

const startTimer = async () => {
  if (!props.currentTaskId) return
  try {
    await timeStore.startTimer(props.currentTaskId)
  } catch (error) {
    console.error('Failed to start timer:', error)
  }
}

const stopTimer = async () => {
  try {
    await timeStore.stopTimer()
  } catch (error) {
    console.error('Failed to stop timer:', error)
  }
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':')
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  timeStore.loadActiveTimer()
  if (props.showRecent) {
    timeStore.loadEntries({ task_id: props.currentTaskId })
  }
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<style scoped>
.timer-widget {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4;
}

/* Active Timer */
.active-timer {
  @apply space-y-3;
}

.timer-content {
  @apply flex items-center justify-between;
}

.timer-info {
  @apply flex-1;
}

.pulse-dot {
  @apply w-2 h-2 bg-red-500 rounded-full animate-pulse;
}

.timer-display {
  @apply text-2xl font-mono font-bold text-gray-900 dark:text-white mt-1;
}

.timer-actions {
  @apply flex gap-2;
}

.btn-stop {
  @apply flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50;
}

.timer-meta {
  @apply flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700;
}

/* Start Timer */
.start-timer-prompt {
  @apply text-center py-4;
}

.btn-start {
  @apply flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 mx-auto;
}

/* Recent Entries */
.recent-entries {
  @apply mt-4 pt-4 border-t border-gray-200 dark:border-gray-700;
}

.entries-list {
  @apply space-y-2;
}

.entry-item {
  @apply p-2 bg-gray-50 dark:bg-gray-700/50 rounded;
}

.entry-info {
  @apply flex items-center justify-between mb-1;
}

.entry-task {
  @apply text-sm text-gray-900 dark:text-white font-medium truncate;
}

.entry-duration {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.entry-date {
  @apply text-xs text-gray-500 dark:text-gray-500;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
