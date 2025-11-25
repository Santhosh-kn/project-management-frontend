import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { timeTrackingApi } from '@/api/timeTracking'
import type { TimeEntry, CreateTimeEntryRequest, UpdateTimeEntryRequest } from '@/types/timeTracking'

export const useTimeTrackingStore = defineStore('timeTracking', () => {
  const timeEntries = ref<TimeEntry[]>([])
  const activeTimer = ref<TimeEntry | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isTimerRunning = computed(() => activeTimer.value !== null)
  
  const totalHoursToday = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return timeEntries.value
      .filter(entry => entry.start_time.startsWith(today))
      .reduce((sum, entry) => sum + entry.duration, 0) / 3600
  })

  // Actions
  const fetchTimeEntries = async (params?: {
    task_id?: number
    user_id?: number
    start_date?: string
    end_date?: string
  }) => {
    loading.value = true
    error.value = null
    try {
      const response = await timeTrackingApi.getTimeEntries(params)
      timeEntries.value = response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch time entries'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTimeEntry = async (data: CreateTimeEntryRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await timeTrackingApi.createTimeEntry(data)
      timeEntries.value.unshift(response.data.data)
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create time entry'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTimeEntry = async (id: number, data: UpdateTimeEntryRequest) => {
    loading.value = true
    error.value = null
    try {
      const response = await timeTrackingApi.updateTimeEntry(id, data)
      const index = timeEntries.value.findIndex(entry => entry.id === id)
      if (index !== -1) {
        timeEntries.value[index] = response.data.data
      }
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update time entry'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTimeEntry = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await timeTrackingApi.deleteTimeEntry(id)
      timeEntries.value = timeEntries.value.filter(entry => entry.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete time entry'
      throw err
    } finally {
      loading.value = false
    }
  }

  const startTimer = async (taskId: number, description?: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await timeTrackingApi.startTimer(taskId, description)
      activeTimer.value = response.data.data
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to start timer'
      throw err
    } finally {
      loading.value = false
    }
  }

  const stopTimer = async () => {
    if (!activeTimer.value) return
    
    loading.value = true
    error.value = null
    try {
      const response = await timeTrackingApi.stopTimer(activeTimer.value.id)
      timeEntries.value.unshift(response.data.data)
      activeTimer.value = null
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to stop timer'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchActiveTimer = async () => {
    try {
      const response = await timeTrackingApi.getActiveTimer()
      activeTimer.value = response.data.data
    } catch (err: any) {
      console.error('Failed to fetch active timer:', err)
    }
  }

  const getElapsedTime = computed(() => {
    if (!activeTimer.value) return 0
    const start = new Date(activeTimer.value.start_time).getTime()
    const now = Date.now()
    return Math.floor((now - start) / 1000) // seconds
  })

  return {
    // State
    timeEntries,
    activeTimer,
    loading,
    error,
    
    // Computed
    isTimerRunning,
    totalHoursToday,
    getElapsedTime,
    
    // Actions
    fetchTimeEntries,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    startTimer,
    stopTimer,
    fetchActiveTimer
  }
})
