import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as commentsApi from '@/api/comments'
import type { Comment } from '@/types/models'

export const useCommentStore = defineStore('comment', () => {
  // State
  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentTaskId = ref<number | null>(null)

  // Getters
  const commentsCount = computed(() => comments.value.length)
  
  const hasComments = computed(() => comments.value.length > 0)
  
  const sortedComments = computed(() => {
    return [...comments.value].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  })

  // Actions
  const fetchTaskComments = async (taskId: number) => {
    loading.value = true
    error.value = null
    currentTaskId.value = taskId
    
    try {
      const data = await commentsApi.getTaskComments(taskId)
      comments.value = data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch comments'
      console.error('Error fetching comments:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createComment = async (taskId: number, content: string) => {
    loading.value = true
    error.value = null
    
    try {
      const newComment = await commentsApi.createComment(taskId, { content })
      comments.value.unshift(newComment)
      return newComment
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create comment'
      console.error('Error creating comment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateComment = async (commentId: number, content: string) => {
    loading.value = true
    error.value = null
    
    try {
      const updatedComment = await commentsApi.updateComment(commentId, { content })
      
      const index = comments.value.findIndex(c => c.id === commentId)
      if (index !== -1) {
        comments.value[index] = updatedComment
      }
      
      return updatedComment
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update comment'
      console.error('Error updating comment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteComment = async (commentId: number) => {
    loading.value = true
    error.value = null
    
    try {
      await commentsApi.deleteComment(commentId)
      comments.value = comments.value.filter(c => c.id !== commentId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete comment'
      console.error('Error deleting comment:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearComments = () => {
    comments.value = []
    currentTaskId.value = null
    error.value = null
  }

  return {
    // State
    comments,
    loading,
    error,
    currentTaskId,
    
    // Getters
    commentsCount,
    hasComments,
    sortedComments,
    
    // Actions
    fetchTaskComments,
    createComment,
    updateComment,
    deleteComment,
    clearComments,
  }
})
