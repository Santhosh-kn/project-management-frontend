import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as mentionsApi from '@/api/mentions'
import type { Mention } from '@/api/mentions'

export const useMentionStore = defineStore('mention', () => {
  // State
  const mentions = ref<Mention[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const unreadCount = ref(0)

  // Getters
  const hasMentions = computed(() => mentions.value.length > 0)
  const hasUnreadMentions = computed(() => unreadCount.value > 0)
  
  const unreadMentions = computed(() => {
    return mentions.value.filter(m => !m.is_read)
  })

  // Actions
  const fetchMentions = async (params?: { page?: number; unread_only?: boolean }) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await mentionsApi.getMentions(params)
      mentions.value = data.data
      unreadCount.value = data.meta.unread_count
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch mentions'
      console.error('Error fetching mentions:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchUnreadCount = async () => {
    try {
      unreadCount.value = await mentionsApi.getUnreadMentionCount()
    } catch (err: any) {
      console.error('Error fetching unread count:', err)
    }
  }

  const markAsRead = async (mentionIds: number[]) => {
    try {
      await mentionsApi.markMentionsAsRead(mentionIds)
      
      // Update local state
      mentions.value = mentions.value.map(m => 
        mentionIds.includes(m.id) ? { ...m, is_read: true } : m
      )
      
      // Update unread count
      await fetchUnreadCount()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to mark mentions as read'
      console.error('Error marking mentions as read:', err)
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      await mentionsApi.markAllMentionsAsRead()
      
      // Update local state
      mentions.value = mentions.value.map(m => ({ ...m, is_read: true }))
      unreadCount.value = 0
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to mark all mentions as read'
      console.error('Error marking all mentions as read:', err)
      throw err
    }
  }

  const clearMentions = () => {
    mentions.value = []
    error.value = null
  }

  return {
    // State
    mentions,
    loading,
    error,
    unreadCount,
    
    // Getters
    hasMentions,
    hasUnreadMentions,
    unreadMentions,
    
    // Actions
    fetchMentions,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    clearMentions,
  }
})
