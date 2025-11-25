import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as usersApi from '@/api/users'
import type { User, CreateUserData, UpdateUserData } from '@/api/users'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const usersCount = computed(() => users.value.length)
  const hasUsers = computed(() => users.value.length > 0)
  
  const adminUsers = computed(() => 
    users.value.filter(user => user.role === 'admin')
  )
  
  const managerUsers = computed(() => 
    users.value.filter(user => user.role === 'manager')
  )
  
  const memberUsers = computed(() => 
    users.value.filter(user => user.role === 'member')
  )

  // Actions
  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await usersApi.getUsers()
      users.value = data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch users'
      console.error('Error fetching users:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createUser = async (data: CreateUserData) => {
    loading.value = true
    error.value = null
    
    try {
      const newUser = await usersApi.createUser(data)
      users.value.push(newUser)
      return newUser
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create user'
      console.error('Error creating user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: number, data: UpdateUserData) => {
    loading.value = true
    error.value = null
    
    try {
      const updatedUser = await usersApi.updateUser(id, data)
      
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      return updatedUser
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update user'
      console.error('Error updating user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: number) => {
    loading.value = true
    error.value = null
    
    try {
      await usersApi.deleteUser(id)
      users.value = users.value.filter(u => u.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete user'
      console.error('Error deleting user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearUsers = () => {
    users.value = []
    error.value = null
  }

  return {
    // State
    users,
    loading,
    error,
    
    // Getters
    usersCount,
    hasUsers,
    adminUsers,
    managerUsers,
    memberUsers,
    
    // Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    clearUsers,
  }
})
