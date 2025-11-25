import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as dependenciesApi from '@/api/dependencies'
import type { TaskDependency, DependencyTree, CreateDependencyData } from '@/api/dependencies'

export const useDependencyStore = defineStore('dependency', () => {
  // State
  const dependencies = ref<TaskDependency[]>([])
  const dependents = ref<TaskDependency[]>([])
  const dependencyTree = ref<DependencyTree | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentTaskId = ref<number | null>(null)

  // Getters
  const dependenciesCount = computed(() => dependencies.value.length)
  const dependentsCount = computed(() => dependents.value.length)
  const hasDependencies = computed(() => dependencies.value.length > 0)
  const hasDependents = computed(() => dependents.value.length > 0)

  const blockedByDependencies = computed(() => 
    dependencies.value.filter(d => d.dependency_type === 'blocked_by')
  )

  const blocksDependencies = computed(() => 
    dependencies.value.filter(d => d.dependency_type === 'blocks')
  )

  const relatedDependencies = computed(() => 
    dependencies.value.filter(d => d.dependency_type === 'related_to')
  )

  // Actions
  const fetchTaskDependencies = async (taskId: number) => {
    loading.value = true
    error.value = null
    currentTaskId.value = taskId
    
    try {
      const data = await dependenciesApi.getTaskDependencies(taskId)
      dependencies.value = data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch dependencies'
      console.error('Error fetching dependencies:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTaskDependents = async (taskId: number) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await dependenciesApi.getTaskDependents(taskId)
      dependents.value = data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch dependents'
      console.error('Error fetching dependents:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchDependencyTree = async (taskId: number) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await dependenciesApi.getDependencyTree(taskId)
      dependencyTree.value = data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch dependency tree'
      console.error('Error fetching dependency tree:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createDependency = async (taskId: number, data: CreateDependencyData) => {
    loading.value = true
    error.value = null
    
    try {
      const newDependency = await dependenciesApi.createDependency(taskId, data)
      dependencies.value.push(newDependency)
      return newDependency
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create dependency'
      console.error('Error creating dependency:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteDependency = async (dependencyId: number) => {
    loading.value = true
    error.value = null
    
    try {
      await dependenciesApi.deleteDependency(dependencyId)
      dependencies.value = dependencies.value.filter(d => d.id !== dependencyId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete dependency'
      console.error('Error deleting dependency:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearDependencies = () => {
    dependencies.value = []
    dependents.value = []
    dependencyTree.value = null
    currentTaskId.value = null
    error.value = null
  }

  return {
    // State
    dependencies,
    dependents,
    dependencyTree,
    loading,
    error,
    currentTaskId,
    
    // Getters
    dependenciesCount,
    dependentsCount,
    hasDependencies,
    hasDependents,
    blockedByDependencies,
    blocksDependencies,
    relatedDependencies,
    
    // Actions
    fetchTaskDependencies,
    fetchTaskDependents,
    fetchDependencyTree,
    createDependency,
    deleteDependency,
    clearDependencies,
  }
})
