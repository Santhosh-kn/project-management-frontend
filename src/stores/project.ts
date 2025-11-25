import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from '@/types/models'
import type { PaginatedResponse } from '@/types/api'
import * as projectsApi from '@/api/projects'
import type { ProjectFilters, CreateProjectData, UpdateProjectData } from '@/api/projects'

export const useProjectStore = defineStore('project', () => {
  // State
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination
  const currentPage = ref(1)
  const perPage = ref(15)
  const total = ref(0)
  const lastPage = ref(1)
  
  // Filters
  const filters = ref<ProjectFilters>({
    search: '',
    status: '',
    priority: '',
    sort: 'created_at',
    order: 'desc'
  })

  // Computed
  const hasProjects = computed(() => projects.value.length > 0)
  const totalPages = computed(() => lastPage.value)

  // Actions
  const fetchProjects = async (resetPage = false) => {
    loading.value = true
    error.value = null
    
    if (resetPage) {
      currentPage.value = 1
    }

    try {
      const response: PaginatedResponse<Project> = await projectsApi.getProjects({
        ...filters.value,
        page: currentPage.value,
        per_page: perPage.value
      })
      
      projects.value = response.data
      total.value = response.meta.total
      currentPage.value = response.meta.current_page
      lastPage.value = response.meta.last_page
      perPage.value = response.meta.per_page
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch projects'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchProject = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await projectsApi.getProject(id)
      currentProject.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch project'
      console.error('Error fetching project:', err)
    } finally {
      loading.value = false
    }
  }

  const createProject = async (data: CreateProjectData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await projectsApi.createProject(data)
      // Refresh the list after creating
      await fetchProjects()
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create project'
      console.error('Error creating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProject = async (id: number, data: UpdateProjectData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await projectsApi.updateProject(id, data)
      // Update in the list
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = response.data
      }
      // Update current project if it's the one being edited
      if (currentProject.value?.id === id) {
        currentProject.value = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update project'
      console.error('Error updating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProject = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      await projectsApi.deleteProject(id)
      // Remove from list
      projects.value = projects.value.filter(p => p.id !== id)
      total.value--
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete project'
      console.error('Error deleting project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const archiveProject = async (id: number) => {
    try {
      await projectsApi.archiveProject(id)
      // Update status in list
      const project = projects.value.find(p => p.id === id)
      if (project) {
        project.status = 'archived'
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to archive project'
      console.error('Error archiving project:', err)
      throw err
    }
  }

  const unarchiveProject = async (id: number) => {
    try {
      await projectsApi.unarchiveProject(id)
      // Update status in list
      const project = projects.value.find(p => p.id === id)
      if (project) {
        project.status = 'active'
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to unarchive project'
      console.error('Error unarchiving project:', err)
      throw err
    }
  }

  // Filter actions
  const setSearch = (search: string) => {
    filters.value.search = search
  }

  const setStatus = (status: string) => {
    filters.value.status = status
  }

  const setPriority = (priority: string) => {
    filters.value.priority = priority
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
      search: '',
      status: '',
      priority: '',
      sort: 'created_at',
      order: 'desc'
    }
  }

  const resetState = () => {
    projects.value = []
    currentProject.value = null
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
    projects,
    currentProject,
    loading,
    error,
    currentPage,
    perPage,
    total,
    lastPage,
    filters,
    // Computed
    hasProjects,
    totalPages,
    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    unarchiveProject,
    setSearch,
    setStatus,
    setPriority,
    setSort,
    setPerPage,
    setPage,
    clearFilters,
    resetState
  }
})
