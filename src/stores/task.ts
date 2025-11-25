import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task } from '@/types/models'
import type { PaginatedResponse } from '@/types/api'
import * as tasksApi from '@/api/tasks'
import type { TaskFilters, CreateTaskData, UpdateTaskData, AssignTaskData, UpdateStatusData, UpdatePriorityData } from '@/api/tasks'

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination
  const currentPage = ref(1)
  const perPage = ref(15)
  const total = ref(0)
  const lastPage = ref(1)
  
  // Filters
  const filters = ref<TaskFilters>({
    project_id: undefined,
    status: '',
    priority: '',
    assigned_to: undefined,
    search: '',
    sort: 'created_at',
    order: 'desc',
    due_date_from: undefined,
    due_date_to: undefined
  })

  // Computed
  const hasTasks = computed(() => tasks.value.length > 0)
  const totalPages = computed(() => lastPage.value)

  // Actions
  const fetchTasks = async (customFilters?: Partial<TaskFilters>, resetPage = false) => {
    loading.value = true
    error.value = null
    
    if (resetPage) {
      currentPage.value = 1
    }

    try {
      // Merge custom filters with store filters
      const mergedFilters = customFilters ? { ...filters.value, ...customFilters } : filters.value
      
      // Use per_page from mergedFilters if provided, otherwise use store's perPage
      const requestPerPage = mergedFilters.per_page || perPage.value
      
      const response: PaginatedResponse<Task> = await tasksApi.getTasks({
        ...mergedFilters,
        page: currentPage.value,
        per_page: requestPerPage
      })
      
      tasks.value = response.data
      total.value = response.meta.total
      currentPage.value = response.meta.current_page
      lastPage.value = response.meta.last_page
      perPage.value = response.meta.per_page
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch tasks'
      console.error('Error fetching tasks:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTask = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await tasksApi.getTask(id)
      currentTask.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch task'
      console.error('Error fetching task:', err)
    } finally {
      loading.value = false
    }
  }

  const createTask = async (data: CreateTaskData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await tasksApi.createTask(data)
      // Add to the beginning of the list
      tasks.value.unshift(response.data)
      total.value++
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create task'
      console.error('Error creating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: number, data: UpdateTaskData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await tasksApi.updateTask(id, data)
      // Update in the list
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      // Update current task if it's the one being edited
      if (currentTask.value?.id === id) {
        currentTask.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update task'
      console.error('Error updating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTask = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      await tasksApi.deleteTask(id)
      // Remove from list
      tasks.value = tasks.value.filter(t => t.id !== id)
      total.value--
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete task'
      console.error('Error deleting task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const assignTask = async (id: number, data: AssignTaskData) => {
    try {
      const response = await tasksApi.assignTask(id, data)
      // Update in the list
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      // Update current task
      if (currentTask.value?.id === id) {
        currentTask.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to assign task'
      console.error('Error assigning task:', err)
      throw err
    }
  }

  const updateTaskStatus = async (id: number, data: UpdateStatusData) => {
    try {
      const response = await tasksApi.updateTaskStatus(id, data)
      // Update in the list
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      // Update current task
      if (currentTask.value?.id === id) {
        currentTask.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update task status'
      console.error('Error updating task status:', err)
      throw err
    }
  }

  const updateTaskPriority = async (id: number, data: UpdatePriorityData) => {
    try {
      const response = await tasksApi.updateTaskPriority(id, data)
      // Update in the list
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = response.data
      }
      // Update current task
      if (currentTask.value?.id === id) {
        currentTask.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update task priority'
      console.error('Error updating task priority:', err)
      throw err
    }
  }

  // Filter actions
  const setProjectFilter = (projectId?: number) => {
    filters.value.project_id = projectId
  }

  const setSearch = (search: string) => {
    filters.value.search = search
  }

  const setStatus = (status: string) => {
    filters.value.status = status
  }

  const setPriority = (priority: string) => {
    filters.value.priority = priority
  }

  const setAssignedTo = (userId?: number) => {
    filters.value.assigned_to = userId
  }

  const setSort = (sort: string, order: 'asc' | 'desc' = 'desc') => {
    filters.value.sort = sort
    filters.value.order = order
  }

  const setPerPage = (value: number) => {
    perPage.value = value
    currentPage.value = 1 // Reset to first page when changing per page
  }

  const setPage = (page: number) => {
    currentPage.value = page
  }

  const clearFilters = () => {
    filters.value = {
      project_id: undefined,
      status: '',
      priority: '',
      assigned_to: undefined,
      search: '',
      sort: 'created_at',
      order: 'desc',
      due_date_from: undefined,
      due_date_to: undefined
    }
  }

  const resetState = () => {
    tasks.value = []
    currentTask.value = null
    loading.value = false
    error.value = null
    currentPage.value = 1
    perPage.value = 15
    total.value = 0
    lastPage.value = 1
    clearFilters()
  }

  return {
    // State
    tasks,
    currentTask,
    loading,
    error,
    currentPage,
    perPage,
    total,
    lastPage,
    filters,
    // Computed
    hasTasks,
    totalPages,
    // Actions
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    updateTaskStatus,
    updateTaskPriority,
    setProjectFilter,
    setSearch,
    setStatus,
    setPriority,
    setAssignedTo,
    setSort,
    setPerPage,
    setPage,
    clearFilters,
    resetState
  }
})
