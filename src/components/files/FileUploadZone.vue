<template>
  <div class="file-upload-zone">
    <!-- Drag & Drop Area -->
    <div
      class="upload-area"
      :class="{ 
        'drag-over': isDragging,
        'uploading': isUploading
      }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <!-- Upload Icon -->
      <div class="upload-icon">
        <svg v-if="!isUploading" class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
        <div v-else class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>

      <!-- Upload Text -->
      <div class="upload-text">
        <p v-if="!isUploading" class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ isDragging ? 'Drop files here' : 'Drag & drop files here' }}
        </p>
        <p v-else class="text-lg font-semibold text-gray-900 dark:text-white">
          Uploading {{ uploadProgress }}%
        </p>
        <p v-if="!isUploading" class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          or click to browse
        </p>
      </div>

      <!-- File Input (Hidden) -->
      <input
        ref="fileInput"
        type="file"
        :multiple="multiple"
        :accept="accept"
        @change="handleFileSelect"
        class="hidden"
      />

      <!-- Upload Info -->
      <div v-if="!isUploading" class="upload-info">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Maximum file size: {{ maxSizeMB }}MB
        </p>
        <p v-if="accept" class="text-xs text-gray-500 dark:text-gray-400">
          Accepted formats: {{ accept }}
        </p>
      </div>
    </div>

    <!-- File Queue -->
    <transition-group name="list" tag="div" class="upload-queue">
      <div
        v-for="file in uploadQueue"
        :key="file.name + file.size"
        class="queue-item"
      >
        <!-- File Icon -->
        <div class="queue-icon">
          <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
          </svg>
        </div>

        <!-- File Info -->
        <div class="queue-info">
          <p class="queue-filename">{{ file.name }}</p>
          <p class="queue-size">{{ formatFileSize(file.size) }}</p>
        </div>

        <!-- Progress or Status -->
        <div class="queue-status">
          <div v-if="file.uploading" class="status-uploading">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: file.progress + '%' }"></div>
            </div>
            <span class="text-xs text-gray-600 dark:text-gray-400">{{ file.progress }}%</span>
          </div>
          
          <div v-else-if="file.error" class="status-error">
            <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span class="text-xs text-red-600 dark:text-red-400">{{ file.errorMessage }}</span>
          </div>
          
          <div v-else-if="file.success" class="status-success">
            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-xs text-green-600 dark:text-green-400">Uploaded</span>
          </div>
        </div>

        <!-- Remove Button -->
        <button
          v-if="!file.uploading"
          @click="removeFromQueue(file)"
          class="queue-remove"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </transition-group>

    <!-- Upload Actions -->
    <div v-if="uploadQueue.length > 0 && !isUploading" class="upload-actions">
      <button
        @click="clearQueue"
        class="btn-secondary"
      >
        Clear All
      </button>
      <button
        @click="startUpload"
        :disabled="uploadQueue.length === 0"
        class="btn-primary"
      >
        Upload {{ uploadQueue.length }} File{{ uploadQueue.length !== 1 ? 's' : '' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFileStore } from '@/stores/file'

interface Props {
  attachableType: string
  attachableId: number
  categoryId?: number
  multiple?: boolean
  accept?: string
  maxSizeMB?: number
}

interface QueueFile {
  file: File
  name: string
  size: number
  uploading: boolean
  progress: number
  success: boolean
  error: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  maxSizeMB: 50
})

const emit = defineEmits(['upload-complete', 'upload-error'])

const store = useFileStore()
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadQueue = ref<QueueFile[]>([])

// Methods
const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

const handleDragOver = (e: DragEvent) => {
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  addFilesToQueue(files)
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  addFilesToQueue(files)
  
  // Reset input
  target.value = ''
}

const addFilesToQueue = (files: File[]) => {
  const validFiles: QueueFile[] = []
  
  files.forEach(file => {
    // Check file size
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > props.maxSizeMB) {
      alert(`File "${file.name}" is too large. Maximum size is ${props.maxSizeMB}MB.`)
      return
    }

    // Check file type if accept is specified
    if (props.accept) {
      const acceptedTypes = props.accept.split(',').map(t => t.trim())
      const fileExt = '.' + file.name.split('.').pop()
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExt.toLowerCase() === type.toLowerCase()
        }
        return file.type.match(type.replace('*', '.*'))
      })
      
      if (!isAccepted) {
        alert(`File type "${file.type}" is not accepted.`)
        return
      }
    }

    validFiles.push({
      file,
      name: file.name,
      size: file.size,
      uploading: false,
      progress: 0,
      success: false,
      error: false
    })
  })

  uploadQueue.value.push(...validFiles)
}

const removeFromQueue = (queueFile: QueueFile) => {
  const index = uploadQueue.value.indexOf(queueFile)
  if (index > -1) {
    uploadQueue.value.splice(index, 1)
  }
}

const clearQueue = () => {
  uploadQueue.value = uploadQueue.value.filter(f => f.uploading)
}

const startUpload = async () => {
  isUploading.value = true
  uploadProgress.value = 0

  const totalFiles = uploadQueue.value.length
  let completedFiles = 0

  for (const queueFile of uploadQueue.value) {
    if (queueFile.success || queueFile.error) continue

    queueFile.uploading = true
    
    try {
      const formData = new FormData()
      formData.append('file', queueFile.file)
      formData.append('attachable_type', props.attachableType)
      formData.append('attachable_id', props.attachableId.toString())
      
      if (props.categoryId) {
        formData.append('category_id', props.categoryId.toString())
      }

      // Simulate progress (in real app, use axios onUploadProgress)
      const progressInterval = setInterval(() => {
        if (queueFile.progress < 90) {
          queueFile.progress += 10
        }
      }, 100)

      await store.uploadFile(formData)
      
      clearInterval(progressInterval)
      queueFile.progress = 100
      queueFile.uploading = false
      queueFile.success = true
      
      completedFiles++
      uploadProgress.value = Math.round((completedFiles / totalFiles) * 100)

      emit('upload-complete', queueFile.file)
    } catch (error: any) {
      queueFile.uploading = false
      queueFile.error = true
      queueFile.errorMessage = error.message || 'Upload failed'
      
      emit('upload-error', error)
    }
  }

  isUploading.value = false
  
  // Auto-clear successful uploads after 2 seconds
  setTimeout(() => {
    uploadQueue.value = uploadQueue.value.filter(f => !f.success)
  }, 2000)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.file-upload-zone {
  @apply space-y-4;
}

.upload-area {
  @apply relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10;
}

.upload-area.drag-over {
  @apply border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105;
}

.upload-area.uploading {
  @apply cursor-not-allowed opacity-75;
}

.upload-icon {
  @apply flex justify-center mb-4;
}

.upload-text {
  @apply mb-4;
}

.upload-info {
  @apply space-y-1;
}

.upload-queue {
  @apply space-y-2;
}

.queue-item {
  @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-4;
}

.queue-icon {
  @apply flex-shrink-0;
}

.queue-info {
  @apply flex-1 min-w-0;
}

.queue-filename {
  @apply text-sm font-medium text-gray-900 dark:text-white truncate;
}

.queue-size {
  @apply text-xs text-gray-600 dark:text-gray-400;
}

.queue-status {
  @apply flex-shrink-0 w-32;
}

.status-uploading {
  @apply space-y-1;
}

.progress-bar {
  @apply w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-blue-600 transition-all duration-300;
}

.status-error,
.status-success {
  @apply flex items-center gap-2;
}

.queue-remove {
  @apply p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors;
}

.upload-actions {
  @apply flex items-center justify-end gap-2;
}

.btn-primary {
  @apply px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors;
}

/* List Transition */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
