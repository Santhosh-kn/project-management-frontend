import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as dashboardApi from '@/api/dashboard'
import type { DashboardStats, RecentProject, RecentTask } from '@/api/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const stats = ref<DashboardStats>({
    total_projects: 0,
    active_projects: 0,
    total_tasks: 0,
    my_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    overdue_tasks: 0,
    tasks_by_status: {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    },
    tasks_by_priority: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
  })
  
  const recentProjects = ref<RecentProject[]>([])
  const recentTasks = ref<RecentTask[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchStats = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await dashboardApi.getDashboardStats()
      stats.value = data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch dashboard stats'
      console.error('Error fetching dashboard stats:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchRecentProjects = async () => {
    try {
      const data = await dashboardApi.getRecentProjects()
      recentProjects.value = data
    } catch (err: any) {
      console.error('Error fetching recent projects:', err)
    }
  }

  const fetchRecentTasks = async () => {
    try {
      const data = await dashboardApi.getRecentTasks()
      recentTasks.value = data
    } catch (err: any) {
      console.error('Error fetching recent tasks:', err)
    }
  }

  const fetchAll = async () => {
    loading.value = true
    error.value = null
    
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentProjects(),
        fetchRecentTasks(),
      ])
    } catch (err: any) {
      error.value = 'Failed to load dashboard data'
    } finally {
      loading.value = false
    }
  }

  const clearDashboard = () => {
    stats.value = {
      total_projects: 0,
      active_projects: 0,
      total_tasks: 0,
      my_tasks: 0,
      completed_tasks: 0,
      pending_tasks: 0,
      overdue_tasks: 0,
      tasks_by_status: {
        todo: 0,
        in_progress: 0,
        review: 0,
        done: 0,
      },
      tasks_by_priority: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
    }
    recentProjects.value = []
    recentTasks.value = []
    error.value = null
  }

  return {
    // State
    stats,
    recentProjects,
    recentTasks,
    loading,
    error,
    
    // Actions
    fetchStats,
    fetchRecentProjects,
    fetchRecentTasks,
    fetchAll,
    clearDashboard,
  }
})
