import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as activitiesApi from '@/api/activities'
import type { Activity } from '@/api/activities'

export const useActivityStore = defineStore('activity', () => {
  // State
  const activities = ref<Activity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const hasMore = ref(true)

  // Getters
  const activitiesCount = computed(() => activities.value.length)
  const hasActivities = computed(() => activities.value.length > 0)

  // Actions
  const fetchActivities = async (page: number = 1) => {
    loading.value = true
    error.value = null

    try {
      const response = await activitiesApi.getActivities(page)
      
      if (page === 1) {
        activities.value = response.data
      } else {
        activities.value.push(...response.data)
      }

      currentPage.value = response.meta.current_page
      totalPages.value = response.meta.last_page
      hasMore.value = currentPage.value < totalPages.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch activities'
      console.error('Error fetching activities:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProjectActivities = async (projectId: number, page: number = 1) => {
    loading.value = true
    error.value = null

    try {
      const response = await activitiesApi.getProjectActivities(projectId, page)
      
      if (page === 1) {
        activities.value = response.data
      } else {
        activities.value.push(...response.data)
      }

      currentPage.value = response.meta.current_page
      totalPages.value = response.meta.last_page
      hasMore.value = currentPage.value < totalPages.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch project activities'
      console.error('Error fetching project activities:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTaskActivities = async (taskId: number, page: number = 1) => {
    loading.value = true
    error.value = null

    try {
      const response = await activitiesApi.getTaskActivities(taskId, page)
      
      if (page === 1) {
        activities.value = response.data
      } else {
        activities.value.push(...response.data)
      }

      currentPage.value = response.meta.current_page
      totalPages.value = response.meta.last_page
      hasMore.value = currentPage.value < totalPages.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch task activities'
      console.error('Error fetching task activities:', err)
    } finally {
      loading.value = false
    }
  }

  const loadMore = async () => {
    if (hasMore.value && !loading.value) {
      await fetchActivities(currentPage.value + 1)
    }
  }

  const clearActivities = () => {
    activities.value = []
    currentPage.value = 1
    totalPages.value = 1
    hasMore.value = true
    error.value = null
  }

  return {
    // State
    activities,
    loading,
    error,
    currentPage,
    totalPages,
    hasMore,

    // Getters
    activitiesCount,
    hasActivities,

    // Actions
    fetchActivities,
    fetchProjectActivities,
    fetchTaskActivities,
    loadMore,
    clearActivities,
  }
})
