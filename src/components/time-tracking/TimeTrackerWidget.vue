<template>
  <div class="time-tracker-widget">
    <!-- Active Timer -->
    <div v-if="hasActiveTimer && activeTimer" class="active-timer">
      <div class="timer-display">
        <div class="timer-info">
          <span class="timer-icon">
            <svg class="w-6 h-6 animate-pulse text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
          </span>
          <div class="timer-details">
            <p class="timer-task">{{ activeTimer.task.title }}</p>
            <p v-if="activeTimer.task.project" class="timer-project">
              {{ activeTimer.task.project.name }}
            </p>
          </div>
        </div>
        <div class="timer-time">
          <span class="time-display">{{ formattedElapsed }}</span>
        </div>
      </div>
      <div class="timer-actions">
        <button @click="handleStopTimer" class="btn-stop" :disabled="loading">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd"/>
          </svg>
          Stop Timer
        </button>
      </div>
    </div>

    <!-- Start Timer (when no active timer) -->
    <div v-else class="start-timer">
      <button 
        @click="showTaskSelector = true" 
        class="btn-start"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
        </svg>
        Start Timer
      </button>
    </div>

    <!-- Task Selector Modal -->
    <div v-if="showTaskSelector" class="modal-overlay" @click="showTaskSelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Select Task to Track</h3>
          <button @click="showTaskSelector = false" class="btn-close">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
        
        <!-- Search -->
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tasks..."
            class="search-input"
          />
        </div>

        <!-- Task List -->
        <div class="task-list">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            @click="handleStartTimer(task.id)"
            class="task-item"
          >
            <div class="task-info">
              <p class="task-title">{{ task.title }}</p>
              <p v-if="task.project" class="task-project">
                {{ task.project.name }}
              </p>
            </div>
            <span class="task-status" :class="`status-${task.status}`">
              {{ task.status }}
            </span>
          </div>

          <!-- Empty State -->
          <div v-if="filteredTasks.length === 0" class="empty-state">
            <p>No tasks found</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTimeTrackingStore } from '@/stores/timeTracking'
import { useTaskStore } from '@/stores/task'

const timeTrackingStore = useTimeTrackingStore()
const taskStore = useTaskStore()

const showTaskSelector = ref(false)
const searchQuery = ref('')

const hasActiveTimer = computed(() => timeTrackingStore.hasActiveTimer)
const activeTimer = computed(() => timeTrackingStore.activeTimer)
const loading = computed(() => timeTrackingStore.loading)

const formattedElapsed = computed(() => {
  return timeTrackingStore.formatDuration(timeTrackingStore.activeTimerElapsed)
})

const filteredTasks = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return taskStore.tasks

  return taskStore.tasks.filter(task => 
    task.title.toLowerCase().includes(query) ||
    task.project?.name.toLowerCase().includes(query)
  )
})

const handleStartTimer = async (taskId: number) => {
  try {
    await timeTrackingStore.startTimer(taskId)
    showTaskSelector.value = false
    searchQuery.value = ''
  } catch (error) {
    console.error('Failed to start timer:', error)
  }
}

const handleStopTimer = async () => {
  try {
    await timeTrackingStore.stopTimer()
  } catch (error) {
    console.error('Failed to stop timer:', error)
  }
}

onMounted(async () => {
  await timeTrackingStore.fetchActiveTimer()
  await taskStore.fetchTasks()
})

onUnmounted(() => {
  timeTrackingStore.cleanup()
})
</script>

<style scoped>
.time-tracker-widget {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700;
}

/* Active Timer */
.active-timer {
  @apply p-4;
}

.timer-display {
  @apply flex items-start justify-between mb-3;
}

.timer-info {
  @apply flex items-start gap-3 flex-1;
}

.timer-icon {
  @apply flex-shrink-0;
}

.timer-details {
  @apply flex-1 min-w-0;
}

.timer-task {
  @apply text-sm font-semibold text-gray-900 dark:text-white truncate;
}

.timer-project {
  @apply text-xs text-gray-600 dark:text-gray-400;
}

.timer-time {
  @apply flex-shrink-0;
}

.time-display {
  @apply text-2xl font-bold text-gray-900 dark:text-white font-mono;
}

.timer-actions {
  @apply flex gap-2;
}

.btn-stop {
  @apply w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50;
}

/* Start Timer */
.start-timer {
  @apply p-4;
}

.btn-start {
  @apply w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
}

/* Modal */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4;
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.btn-close {
  @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-300;
}

.search-box {
  @apply p-4 border-b border-gray-200 dark:border-gray-700;
}

.search-input {
  @apply w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white;
}

.task-list {
  @apply flex-1 overflow-y-auto p-4 space-y-2;
}

.task-item {
  @apply flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors;
}

.task-info {
  @apply flex-1 min-w-0;
}

.task-title {
  @apply text-sm font-medium text-gray-900 dark:text-white truncate;
}

.task-project {
  @apply text-xs text-gray-600 dark:text-gray-400;
}

.task-status {
  @apply px-2 py-1 rounded text-xs font-medium;
}

.status-todo {
  @apply bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300;
}

.status-in_progress {
  @apply bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300;
}

.status-review {
  @apply bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300;
}

.status-done {
  @apply bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300;
}

.empty-state {
  @apply flex items-center justify-center py-8 text-gray-500 dark:text-gray-400;
}
</style>
