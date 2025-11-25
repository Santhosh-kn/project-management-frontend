export interface TimeEntry {
  id: number
  task_id: number
  user_id: number
  start_time: string
  end_time: string | null
  duration: number // in seconds
  description: string | null
  billable: boolean
  created_at: string
  updated_at: string
  task?: {
    id: number
    title: string
    project?: {
      id: number
      name: string
    }
  }
  user?: {
    id: number
    name: string
    email: string
  }
}

export interface CreateTimeEntryRequest {
  task_id: number
  start_time: string
  end_time?: string
  duration?: number
  description?: string
  billable?: boolean
}

export interface UpdateTimeEntryRequest {
  start_time?: string
  end_time?: string
  duration?: number
  description?: string
  billable?: boolean
}

export interface TimeTrackingStats {
  total_hours: number
  billable_hours: number
  non_billable_hours: number
  entries_count: number
}

export interface TimesheetEntry {
  date: string
  entries: TimeEntry[]
  total_duration: number
}

export interface TimeReport {
  user_id: number
  user_name: string
  total_hours: number
  billable_hours: number
  projects: {
    project_id: number
    project_name: string
    hours: number
  }[]
}
