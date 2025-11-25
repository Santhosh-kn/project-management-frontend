import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as reportsApi from '@/api/reports'
import type {
  ProjectProgress,
  TeamWorkload,
  CompletionTrends,
  DashboardData
} from '@/api/reports'

export const useReportStore = defineStore('report', () => {
  // State
  const projectProgress = ref<ProjectProgress | null>(null)
  const teamWorkload = ref<TeamWorkload | null>(null)
  const completionTrends = ref<CompletionTrends | null>(null)
  const dashboardData = ref<DashboardData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchProjectProgress = async (projectId: number) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await reportsApi.getProjectProgress(projectId)
      projectProgress.value = data
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch project progress'
      console.error('Error fetching project progress:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTeamWorkload = async (projectId: number) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await reportsApi.getTeamWorkload(projectId)
      teamWorkload.value = data
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch team workload'
      console.error('Error fetching team workload:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCompletionTrends = async (projectId: number, days: number = 30) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await reportsApi.getCompletionTrends(projectId, days)
      completionTrends.value = data
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch completion trends'
      console.error('Error fetching completion trends:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchDashboardData = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await reportsApi.getDashboardData()
      dashboardData.value = data
      return data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch dashboard data'
      console.error('Error fetching dashboard data:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearReports = () => {
    projectProgress.value = null
    teamWorkload.value = null
    completionTrends.value = null
    dashboardData.value = null
    error.value = null
  }

  return {
    // State
    projectProgress,
    teamWorkload,
    completionTrends,
    dashboardData,
    loading,
    error,
    
    // Actions
    fetchProjectProgress,
    fetchTeamWorkload,
    fetchCompletionTrends,
    fetchDashboardData,
    clearReports,
  }
})
