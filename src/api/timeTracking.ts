import client from './client'
import type { 
  TimeEntry, 
  CreateTimeEntryRequest, 
  UpdateTimeEntryRequest,
  TimeTrackingStats,
  TimesheetEntry,
  TimeReport
} from '@/types/timeTracking'

export const timeTrackingApi = {
  // Get all time entries
  getTimeEntries(params?: {
    task_id?: number
    user_id?: number
    start_date?: string
    end_date?: string
    billable?: boolean
  }) {
    return client.get<{ data: TimeEntry[] }>('/time-entries', { params })
  },

  // Get a single time entry
  getTimeEntry(id: number) {
    return client.get<{ data: TimeEntry }>(`/time-entries/${id}`)
  },

  // Create a new time entry
  createTimeEntry(data: CreateTimeEntryRequest) {
    return client.post<{ data: TimeEntry }>('/time-entries', data)
  },

  // Update a time entry
  updateTimeEntry(id: number, data: UpdateTimeEntryRequest) {
    return client.put<{ data: TimeEntry }>(`/time-entries/${id}`, data)
  },

  // Delete a time entry
  deleteTimeEntry(id: number) {
    return client.delete(`/time-entries/${id}`)
  },

  // Start timer for a task
  startTimer(taskId: number, description?: string) {
    return client.post<{ data: TimeEntry }>('/time-entries/start', {
      task_id: taskId,
      description
    })
  },

  // Stop active timer
  stopTimer(id: number) {
    return client.post<{ data: TimeEntry }>(`/time-entries/${id}/stop`)
  },

  // Get active timer
  getActiveTimer() {
    return client.get<{ data: TimeEntry | null }>('/time-entries/active')
  },

  // Get time tracking stats
  getStats(params?: {
    user_id?: number
    start_date?: string
    end_date?: string
  }) {
    return client.get<{ data: TimeTrackingStats }>('/time-entries/stats', { params })
  },

  // Get timesheet (grouped by date)
  getTimesheet(params: {
    user_id?: number
    start_date: string
    end_date: string
  }) {
    return client.get<{ data: TimesheetEntry[] }>('/time-entries/timesheet', { params })
  },

  // Get time report
  getTimeReport(params: {
    start_date: string
    end_date: string
    project_id?: number
    user_id?: number
  }) {
    return client.get<{ data: TimeReport[] }>('/time-entries/report', { params })
  }
}
