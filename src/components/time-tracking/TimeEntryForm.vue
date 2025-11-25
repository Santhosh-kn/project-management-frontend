<template>
  <div class="time-entry-form">
    <form @submit.prevent="handleSubmit" class="form-content">
      <!-- Task Selection -->
      <div class="form-group">
        <label class="form-label">Task *</label>
        <select v-model="form.task_id" class="form-select" required>
          <option value="">Select a task</option>
          <optgroup v-for="project in projectsWithTasks" :key="project.id" :label="project.name">
            <option v-for="task in project.tasks" :key="task.id" :value="task.id">
              {{ task.title }}
            </option>
          </optgroup>
        </select>
      </div>

      <!-- Date -->
      <div class="form-group">
        <label class="form-label">Date *</label>
        <input
          v-model="form.date"
          type="date"
          class="form-input"
          required
        />
      </div>

      <!-- Time Range or Duration -->
      <div class="form-group">
        <div class="flex items-center justify-between mb-2">
          <label class="form-label mb-0">Time Entry</label>
          <button
            type="button"
            @click="entryMode = entryMode === 'range' ? 'duration' : 'range'"
            class="text-sm text-blue-600 hover:text-blue-700"
          >
            {{ entryMode === 'range' ? 'Enter duration instead' : 'Enter time range instead' }}
          </button>
        </div>

        <!-- Time Range Mode -->
        <div v-if="entryMode === 'range'" class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label-sm">Start Time *</label>
            <input
              v-model="form.start_time"
              type="time"
              class="form-input"
              required
            />
          </div>
          <div>
            <label class="form-label-sm">End Time *</label>
            <input
              v-model="form.end_time"
              type="time"
              class="form-input"
              required
            />
          </div>
        </div>

        <!-- Duration Mode -->
        <div v-else class="grid grid-cols-3 gap-3">
          <div>
            <label class="form-label-sm">Hours</label>
            <input
              v-model.number="form.duration_hours"
              type="number"
              min="0"
              max="23"
              class="form-input"
              placeholder="0"
            />
          </div>
          <div>
            <label class="form-label-sm">Minutes</label>
            <input
              v-model.number="form.duration_minutes"
              type="number"
              min="0"
              max="59"
              class="form-input"
              placeholder="0"
            />
          </div>
          <div class="flex items-end">
            <div class="form-input bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
              <span class="text-lg font-semibold">{{ totalDuration }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea
          v-model="form.description"
          rows="3"
          class="form-input"
          placeholder="What did you work on?"
        ></textarea>
      </div>

      <!-- Billable & Rate -->
      <div class="form-group">
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="form.is_billable"
              type="checkbox"
              class="form-checkbox"
            />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Billable</span>
          </label>

          <div v-if="form.is_billable" class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">Rate:</span>
              <input
                v-model.number="form.hourly_rate"
                type="number"
                min="0"
                step="0.01"
                class="form-input w-32"
                placeholder="0.00"
              />
              <span class="text-sm text-gray-600 dark:text-gray-400">$/hr</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Calculated Amount -->
      <div v-if="form.is_billable && form.hourly_rate" class="calculated-amount">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
          <span class="text-lg font-bold text-blue-600 dark:text-blue-400">
            ${{ calculatedAmount.toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="form-actions">
        <button
          type="button"
          @click="$emit('cancel')"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="btn-primary"
        >
          {{ loading ? 'Saving...' : 'Save Time Entry' }}
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span>{{ error }}</span>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTimeTrackingStore } from '@/stores/timeTracking'
import { useTaskStore } from '@/stores/task'
import { useProjectStore } from '@/stores/project'
import type { TimeEntry } from '@/types/timeTracking'

interface Props {
  entry?: TimeEntry
}

const props = defineProps<Props>()
const emit = defineEmits(['saved', 'cancel'])

const timeTrackingStore = useTimeTrackingStore()
const taskStore = useTaskStore()
const projectStore = useProjectStore()

const entryMode = ref<'range' | 'duration'>('range')
const loading = ref(false)
const error = ref<string | null>(null)

const form = ref({
  task_id: props.entry?.task_id || '',
  date: props.entry?.start_time.split('T')[0] || new Date().toISOString().split('T')[0],
  start_time: props.entry?.start_time.split('T')[1]?.substring(0, 5) || '',
  end_time: props.entry?.end_time?.split('T')[1]?.substring(0, 5) || '',
  duration_hours: 0,
  duration_minutes: 0,
  description: props.entry?.description || '',
  is_billable: props.entry?.is_billable || false,
  hourly_rate: props.entry?.hourly_rate || 0
})

const projectsWithTasks = computed(() => {
  return projectStore.projects.map(project => ({
    id: project.id,
    name: project.name,
    tasks: taskStore.tasks.filter(task => task.project_id === project.id)
  })).filter(project => project.tasks.length > 0)
})

const totalDuration = computed(() => {
  const hours = form.value.duration_hours || 0
  const minutes = form.value.duration_minutes || 0
  return `${hours}h ${minutes}m`
})

const calculatedAmount = computed(() => {
  let durationInHours = 0

  if (entryMode.value === 'range' && form.value.start_time && form.value.end_time) {
    const start = new Date(`${form.value.date}T${form.value.start_time}`)
    const end = new Date(`${form.value.date}T${form.value.end_time}`)
    durationInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  } else {
    durationInHours = (form.value.duration_hours || 0) + (form.value.duration_minutes || 0) / 60
  }

  return durationInHours * (form.value.hourly_rate || 0)
})

const isFormValid = computed(() => {
  if (!form.value.task_id || !form.value.date) return false
  
  if (entryMode.value === 'range') {
    return form.value.start_time && form.value.end_time
  } else {
    return (form.value.duration_hours > 0 || form.value.duration_minutes > 0)
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = null

  try {
    let startDateTime: string
    let endDateTime: string | undefined
    let duration: number | undefined

    if (entryMode.value === 'range') {
      startDateTime = `${form.value.date}T${form.value.start_time}:00`
      endDateTime = `${form.value.date}T${form.value.end_time}:00`
    } else {
      startDateTime = `${form.value.date}T00:00:00`
      duration = (form.value.duration_hours * 3600) + (form.value.duration_minutes * 60)
    }

    const data = {
      task_id: Number(form.value.task_id),
      start_time: startDateTime,
      end_time: endDateTime,
      duration,
      description: form.value.description || undefined,
      is_billable: form.value.is_billable,
      hourly_rate: form.value.is_billable ? form.value.hourly_rate : undefined
    }

    if (props.entry) {
      await timeTrackingStore.updateTimeEntry(props.entry.id, data)
    } else {
      await timeTrackingStore.createTimeEntry(data)
    }

    emit('saved')
  } catch (err: any) {
    error.value = err.message || 'Failed to save time entry'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    taskStore.fetchTasks(),
    projectStore.fetchProjects()
  ])
})
</script>

<style scoped>
.time-entry-form {
  @apply bg-white dark:bg-gray-800 rounded-lg;
}

.form-content {
  @apply space-y-5;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.form-label-sm {
  @apply block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1;
}

.form-input,
.form-select {
  @apply w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white;
}

.form-checkbox {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.calculated-amount {
  @apply p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800;
}

.form-actions {
  @apply flex gap-3 pt-4;
}

.btn-primary {
  @apply flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
}

.error-message {
  @apply flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm;
}
</style>
