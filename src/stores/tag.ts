import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as tagsApi from '@/api/tags'
import type { Tag, CreateTagData, UpdateTagData } from '@/api/tags'

export const useTagStore = defineStore('tag', () => {
  // State
  const tags = ref<Tag[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const tagsCount = computed(() => tags.value.length)
  const hasTags = computed(() => tags.value.length > 0)

  // Actions
  const fetchTags = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await tagsApi.getTags()
      tags.value = data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch tags'
      console.error('Error fetching tags:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTag = async (data: CreateTagData) => {
    loading.value = true
    error.value = null
    
    try {
      const newTag = await tagsApi.createTag(data)
      tags.value.push(newTag)
      return newTag
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create tag'
      console.error('Error creating tag:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTag = async (id: number, data: UpdateTagData) => {
    loading.value = true
    error.value = null
    
    try {
      const updatedTag = await tagsApi.updateTag(id, data)
      
      const index = tags.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tags.value[index] = updatedTag
      }
      
      return updatedTag
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update tag'
      console.error('Error updating tag:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTag = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      await tagsApi.deleteTag(id)
      tags.value = tags.value.filter(t => t.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete tag'
      console.error('Error deleting tag:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearTags = () => {
    tags.value = []
    error.value = null
  }

  return {
    // State
    tags,
    loading,
    error,
    
    // Getters
    tagsCount,
    hasTags,
    
    // Actions
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    clearTags,
  }
})
