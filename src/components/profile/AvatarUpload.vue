<template>
  <div class="avatar-upload">
    <div class="avatar-container">
      <!-- Current Avatar -->
      <div class="avatar-display">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          :alt="userName"
          class="avatar-image"
        />
        <div v-else class="avatar-placeholder">
          {{ getInitials(userName) }}
        </div>
        
        <!-- Upload Overlay -->
        <div class="avatar-overlay">
          <label for="avatar-input" class="upload-label">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="text-xs">Change</span>
          </label>
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            class="hidden"
          />
        </div>
      </div>

      <!-- Upload Info -->
      <div class="avatar-info">
        <p class="text-sm font-medium text-gray-900 dark:text-white">Profile Picture</p>
        <p class="text-xs text-gray-600 dark:text-gray-400">JPG, PNG or GIF (max 2MB)</p>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Uploading... {{ uploadProgress }}%</p>
    </div>

    <!-- Success Message -->
    <div v-if="uploadSuccess" class="success-message">
      <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <span class="text-sm text-green-600 dark:text-green-400">Avatar updated successfully!</span>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      <span class="text-sm text-red-600 dark:text-red-400">{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import api from '@/services/api'

interface Props {
  userName: string
  currentAvatar?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['avatar-updated'])

const avatarUrl = ref(props.currentAvatar || '')
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadSuccess = ref(false)
const error = ref('')

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Validate file
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file'
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    error.value = 'File size must be less than 2MB'
    return
  }

  error.value = ''
  uploadSuccess.value = false
  
  await uploadAvatar(file)
}

const uploadAvatar = async (file: File) => {
  uploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }
    })

    avatarUrl.value = response.data.avatar_url
    uploadSuccess.value = true
    emit('avatar-updated', response.data.avatar_url)

    // Hide success message after 3 seconds
    setTimeout(() => {
      uploadSuccess.value = false
    }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to upload avatar'
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.avatar-upload {
  @apply space-y-4;
}

.avatar-container {
  @apply flex items-center gap-4;
}

.avatar-display {
  @apply relative w-24 h-24 rounded-full overflow-hidden group;
}

.avatar-image {
  @apply w-full h-full object-cover;
}

.avatar-placeholder {
  @apply w-full h-full flex items-center justify-center bg-blue-500 text-white text-2xl font-bold;
}

.avatar-overlay {
  @apply absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer;
}

.upload-label {
  @apply flex flex-col items-center text-white cursor-pointer;
}

.avatar-info {
  @apply flex-1;
}

/* Progress Bar */
.upload-progress {
  @apply mt-4;
}

.progress-bar {
  @apply w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-blue-600 transition-all duration-300;
}

/* Messages */
.success-message,
.error-message {
  @apply flex items-center gap-2 p-3 rounded-lg;
}

.success-message {
  @apply bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800;
}

.error-message {
  @apply bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800;
}
</style>