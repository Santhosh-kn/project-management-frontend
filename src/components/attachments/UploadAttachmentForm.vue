<template>
  <div class="upload-attachment-form card">
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <!-- Upload Area -->
        <div
          class="upload-area"
          :class="{ 'dragover': isDragging, 'uploading': uploading }"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            class="d-none"
            @change="handleFileSelect"
            :disabled="uploading"
          />

          <div v-if="!selectedFile && !uploading" class="upload-prompt">
            <i class="bi bi-cloud-upload upload-icon"></i>
            <h6 class="mb-2">Upload Attachment</h6>
            <p class="text-muted small mb-2">
              Drag and drop files here, or click to browse
            </p>
            <p class="text-muted small mb-0">
              Maximum file size: 10MB
            </p>
          </div>

          <div v-else-if="selectedFile && !uploading" class="selected-file">
            <i :class="getFileIcon(selectedFile)" class="file-icon me-2"></i>
            <div class="file-details">
              <h6 class="mb-1">{{ selectedFile.name }}</h6>
              <small class="text-muted">{{ formatFileSize(selectedFile.size) }}</small>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-outline-danger"
              @click.stop="clearFile"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div v-else-if="uploading" class="uploading-state">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Uploading...</span>
            </div>
            <h6 class="mb-2">Uploading...</h6>
            <div class="progress" style="height: 8px; width: 100%; max-width: 300px;">
              <div
                class="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                :style="{ width: attachmentStore.uploadProgress + '%' }"
                :aria-valuenow="attachmentStore.uploadProgress"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <p class="text-muted small mt-2 mb-0">{{ attachmentStore.uploadProgress }}% complete</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="alert alert-danger mt-3 mb-0">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="alert alert-success mt-3 mb-0">
          <i class="bi bi-check-circle-fill me-2"></i>
          {{ successMessage }}
        </div>

        <!-- Upload Button -->
        <div v-if="selectedFile && !uploading" class="mt-3 d-flex gap-2">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="uploading"
          >
            <i class="bi bi-upload me-2"></i>
            Upload File
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="clearFile"
            :disabled="uploading"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAttachmentStore } from '@/stores/attachment'
import type { Attachment } from '@/types/models'

// Props
const props = defineProps<{
  taskId: number
}>()

// Emits
const emit = defineEmits<{
  'attachment-uploaded': [attachment: Attachment]
}>()

// Store
const attachmentStore = useAttachmentStore()

// Refs
const fileInput = ref<HTMLInputElement>()

// State
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const isDragging = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Methods
const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    validateAndSetFile(files[0])
  }
}

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    validateAndSetFile(files[0])
  }
}

const validateAndSetFile = (file: File) => {
  errorMessage.value = null
  successMessage.value = null

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = `File size exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`
    return
  }

  selectedFile.value = file
}

const clearFile = () => {
  selectedFile.value = null
  errorMessage.value = null
  successMessage.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleSubmit = async () => {
  if (!selectedFile.value) {
    errorMessage.value = 'Please select a file to upload'
    return
  }

  uploading.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    // Pass taskId and file separately
    const uploaded = await attachmentStore.uploadAttachment(props.taskId, selectedFile.value)

    emit('attachment-uploaded', uploaded)
    successMessage.value = 'File uploaded successfully!'
    
    // Clear form after a short delay
    setTimeout(() => {
      clearFile()
      successMessage.value = null
    }, 2000)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to upload file. Please try again.'
  } finally {
    uploading.value = false
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const getFileIcon = (file: File): string => {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()

  if (type.startsWith('image/')) return 'bi bi-file-earmark-image'
  if (type.includes('pdf')) return 'bi bi-file-earmark-pdf'
  if (type.includes('word')) return 'bi bi-file-earmark-word'
  if (type.includes('excel') || type.includes('spreadsheet')) return 'bi bi-file-earmark-excel'
  if (type.includes('powerpoint') || type.includes('presentation')) return 'bi bi-file-earmark-ppt'
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'bi bi-file-earmark-zip'
  if (type.startsWith('video/')) return 'bi bi-file-earmark-play'
  if (type.startsWith('audio/')) return 'bi bi-file-earmark-music'
  if (type.includes('text/') || name.endsWith('.txt')) return 'bi bi-file-earmark-text'
  if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.vue') || name.endsWith('.jsx')) {
    return 'bi bi-file-earmark-code'
  }

  return 'bi bi-file-earmark'
}
</script>

<style scoped>
.upload-attachment-form {
  border: 2px dashed #E5E7EB;
  background-color: #F9FAFB;
}

.upload-area {
  min-height: 200px;
  border: 2px dashed #D1D5DB;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
}

.upload-area:hover:not(.uploading) {
  border-color: #3B82F6;
  background-color: #EFF6FF;
}

.upload-area.dragover {
  border-color: #3B82F6;
  background-color: #EFF6FF;
  transform: scale(1.02);
}

.upload-area.uploading {
  cursor: not-allowed;
  background-color: #F9FAFB;
}

.upload-prompt {
  pointer-events: none;
}

.upload-icon {
  font-size: 3rem;
  color: #3B82F6;
  margin-bottom: 1rem;
}

.selected-file {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #F9FAFB;
  border-radius: 0.5rem;
}

.selected-file .file-icon {
  font-size: 2rem;
  color: #3B82F6;
}

.selected-file .file-details {
  flex-grow: 1;
  text-align: left;
}

.selected-file .file-details h6 {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #374151;
}

.uploading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress {
  background-color: #E5E7EB;
}

.progress-bar {
  background-color: #3B82F6;
}

.btn-primary {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.btn-primary:hover {
  background-color: #2563EB;
  border-color: #2563EB;
}

.btn-primary:disabled {
  background-color: #93C5FD;
  border-color: #93C5FD;
}

.alert {
  font-size: 0.875rem;
}
</style>
