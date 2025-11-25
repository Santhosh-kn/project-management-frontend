import apiClient from './client'
import type { ApiResponse } from '@/types/api'

export interface User {
  id: number
  name: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  role?: string
}

/**
 * Get all users (admin only)
 */
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<ApiResponse<User[]>>('/users')
  return response.data.data
}

/**
 * Get single user
 */
export const getUser = async (id: number): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`)
  return response.data.data
}

/**
 * Create a new user (admin only)
 */
export const createUser = async (data: CreateUserData): Promise<User> => {
  const response = await apiClient.post<ApiResponse<User>>('/users', data)
  return response.data.data
}

/**
 * Update a user (admin only)
 */
export const updateUser = async (id: number, data: UpdateUserData): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data)
  return response.data.data
}

/**
 * Delete a user (admin only)
 */
export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/users/${id}`)
}
