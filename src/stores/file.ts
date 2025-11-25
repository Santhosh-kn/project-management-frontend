import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fileApi } from '@/api/files'
import type { FileAttachment, FileCategory, FileFilter } from '@/types/file'

export const useFileStore = defineStore('file', () => {
  const files = ref<FileAttachment[]>([])
  const categories = ref<FileCategory[]>([])
  const selectedFiles = ref<number[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasSelectedFiles = computed(() => selectedFiles.value.length > 0)
  
  const selectedFilesData = computed(() => 
    files.value.filter(f => selectedFiles.value.includes(f.id))
  )

  const filesByCategory = computed(() => {
    const grouped: Record<string, FileAttachment[]> = {}
    
    files.value.forEach(file => {
      const categoryName = file.category?.name || 'Uncategorized'
      if (!grouped[categoryName]) {
        grouped[categoryName] = []
      }
      grouped[categoryName].push(file)
    })
    
    return grouped
  })

  // Actions
  const fetchFiles = async (params?: FileFilter) => {
    loading.value = true
    error.value = null
    try {
      const response = await fileApi.getFiles(params)
      files.value = response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch files'
      throw err
    } finally {
      loading.value = false
    }
  }

  const uploadFile = async (formData: FormData) => {
    loading.value = true
    error.value = null
    try {
      const response = await fileApi.uploadFile(formData)
      files.value.unshift(response.data.data)
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to upload file'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFile = async (id: number, data: any) => {
    loading.value = true
    error.value = null
    try {
      const response = await fileApi.updateFile(id, data)
      const index = files.value.findIndex(f => f.id === id)
      if (index !== -1) {
        files.value[index] = response.data.data
      }
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update file'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteFile = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await fileApi.deleteFile(id)
      files.value = files.value.filter(f => f.id !== id)
      selectedFiles.value = selectedFiles.value.filter(fid => fid !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete file'
      throw err
    } finally {
      loading.value = false
    }
  }

  const downloadFile = async (id: number, filename: string) => {
    try {
      const response = await fileApi.downloadFile(id)
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to download file'
      throw err
    }
  }

  const uploadNewVersion = async (fileId: number, formData: FormData) => {
    loading.value = true
    error.value = null
    try {
      const response = await fileApi.uploadNewVersion(fileId, formData)
      const index = files.value.findIndex(f => f.id === fileId)
      if (index !== -1) {
        files.value[index] = response.data.data
      }
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to upload new version'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Categories
  const fetchCategories = async () => {
    try {
      const response = await fileApi.getCategories()
      categories.value = response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch categories'
      throw err
    }
  }

  const createCategory = async (data: Partial<FileCategory>) => {
    try {
      const response = await fileApi.createCategory(data)
      categories.value.push(response.data.data)
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create category'
      throw err
    }
  }

  const updateCategory = async (id: number, data: Partial<FileCategory>) => {
    try {
      const response = await fileApi.updateCategory(id, data)
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = response.data.data
      }
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update category'
      throw err
    }
  }

  const deleteCategory = async (id: number) => {
    try {
      await fileApi.deleteCategory(id)
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete category'
      throw err
    }
  }

  // Selection
  const toggleFileSelection = (fileId: number) => {
    const index = selectedFiles.value.indexOf(fileId)
    if (index > -1) {
      selectedFiles.value.splice(index, 1)
    } else {
      selectedFiles.value.push(fileId)
    }
  }

  const selectAllFiles = () => {
    selectedFiles.value = files.value.map(f => f.id)
  }

  const clearSelection = () => {
    selectedFiles.value = []
  }

  // Bulk Operations
  const bulkDelete = async () => {
    if (selectedFiles.value.length === 0) return
    
    loading.value = true
    error.value = null
    try {
      await fileApi.bulkDelete(selectedFiles.value)
      files.value = files.value.filter(f => !selectedFiles.value.includes(f.id))
      clearSelection()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete files'
      throw err
    } finally {
      loading.value = false
    }
  }

  const bulkDownload = async () => {
    if (selectedFiles.value.length === 0) return
    
    try {
      const response = await fileApi.bulkDownload(selectedFiles.value)
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'files.zip')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to download files'
      throw err
    }
  }

  const bulkCategorize = async (categoryId: number) => {
    if (selectedFiles.value.length === 0) return
    
    loading.value = true
    error.value = null
    try {
      await fileApi.bulkCategorize(selectedFiles.value, categoryId)
      
      // Update files with new category
      selectedFiles.value.forEach(fileId => {
        const file = files.value.find(f => f.id === fileId)
        if (file) {
          file.category_id = categoryId
          const category = categories.value.find(c => c.id === categoryId)
          if (category) {
            file.category = category
          }
        }
      })
      
      clearSelection()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to categorize files'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    files,
    categories,
    selectedFiles,
    loading,
    error,
    
    // Computed
    hasSelectedFiles,
    selectedFilesData,
    filesByCategory,
    
    // Actions
    fetchFiles,
    uploadFile,
    updateFile,
    deleteFile,
    downloadFile,
    uploadNewVersion,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    bulkDelete,
    bulkDownload,
    bulkCategorize
  }
})
