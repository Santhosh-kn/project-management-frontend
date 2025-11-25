import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Attachment } from '@/types/models'
import * as attachmentsApi from '@/api/attachments'

export const useAttachmentStore = defineStore('attachment', () => {
  // State
  const attachments = ref<Attachment[]>([])
  const currentAttachment = ref<Attachment | null>(null)
  const loading = ref(false)
  const uploadProgress = ref(0)
  const error = ref<string | null>(null)

  // Computed
  const hasAttachments = computed(() => attachments.value.length > 0)
  const attachmentsCount = computed(() => attachments.value.length)
  const totalSize = computed(() => {
    return attachments.value.reduce((total, attachment) => total + attachment.size, 0)
  })
  const formattedTotalSize = computed(() => {
    const bytes = totalSize.value
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  })

  // Actions
  const fetchTaskAttachments = async (taskId: number) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await attachmentsApi.getTaskAttachments(taskId)
      attachments.value = response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch attachments'
      console.error('Error fetching attachments:', err)
    } finally {
      loading.value = false
    }
  }

  const uploadAttachment = async (taskId: number, file: File) => {
    loading.value = true
    uploadProgress.value = 0
    error.value = null
    
    try {
      const response = await attachmentsApi.uploadTaskAttachment(
        taskId,
        file,
        (progressEvent: any) => {
          if (progressEvent.total) {
            uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        }
      )
      // Add to the beginning of the list (newest first)
      attachments.value.unshift(response)
      uploadProgress.value = 100
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to upload attachment'
      console.error('Error uploading attachment:', err)
      throw err
    } finally {
      loading.value = false
      // Reset progress after a short delay
      setTimeout(() => {
        uploadProgress.value = 0
      }, 1000)
    }
  }

  const deleteAttachment = async (attachmentId: number) => {
    loading.value = true
    error.value = null
    
    try {
      await attachmentsApi.deleteAttachment(attachmentId)
      // Remove from list
      attachments.value = attachments.value.filter(a => a.id !== attachmentId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete attachment'
      console.error('Error deleting attachment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const downloadAttachment = async (attachmentId: number, filename: string) => {
    loading.value = true
    error.value = null
    
    try {
      const blob = await attachmentsApi.downloadAttachment(attachmentId)
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to download attachment'
      console.error('Error downloading attachment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setCurrentAttachment = (attachment: Attachment | null) => {
    currentAttachment.value = attachment
  }

  const clearAttachments = () => {
    attachments.value = []
    currentAttachment.value = null
  }

  const resetState = () => {
    attachments.value = []
    currentAttachment.value = null
    loading.value = false
    uploadProgress.value = 0
    error.value = null
  }

  return {
    // State
    attachments,
    currentAttachment,
    loading,
    uploadProgress,
    error,
    // Computed
    hasAttachments,
    attachmentsCount,
    totalSize,
    formattedTotalSize,
    // Actions
    fetchTaskAttachments,
    uploadAttachment,
    deleteAttachment,
    downloadAttachment,
    setCurrentAttachment,
    clearAttachments,
    resetState
  }
})
