<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <div class="header-info">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ file.filename }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatFileSize(file.size) }} • {{ formatDate(file.created_at) }}
              </p>
            </div>
            <div class="header-actions">
              <button
                @click="handleDownload"
                class="action-btn"
                title="Download"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
              </button>
              <button
                @click="close"
                class="action-btn"
                title="Close"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Preview Content -->
          <div class="modal-body">
            <!-- Loading State -->
            <div v-if="loading" class="preview-loading">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p class="text-gray-600 dark:text-gray-400 mt-4">Loading preview...</p>
            </div>

            <!-- Image Preview -->
            <div v-else-if="isImage" class="image-preview">
              <img
                :src="file.file_url"
                :alt="file.filename"
                class="preview-image"
              />
            </div>

            <!-- PDF Preview -->
            <div v-else-if="isPdf" class="pdf-preview">
              <iframe
                :src="file.file_url"
                class="pdf-frame"
                frameborder="0"
              ></iframe>
            </div>

            <!-- Video Preview -->
            <div v-else-if="isVideo" class="video-preview">
              <video
                :src="file.file_url"
                controls
                class="preview-video"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <!-- Audio Preview -->
            <div v-else-if="isAudio" class="audio-preview">
              <div class="audio-container">
                <svg class="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                </svg>
                <audio
                  :src="file.file_url"
                  controls
                  class="audio-player"
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>

            <!-- Text/Code Preview -->
            <div v-else-if="isText" class="text-preview">
              <pre class="code-block">{{ textContent }}</pre>
            </div>

            <!-- No Preview Available -->
            <div v-else class="no-preview">
              <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
              <p class="text-lg font-medium text-gray-900 dark:text-white mt-4">Preview not available</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                This file type cannot be previewed. Download to view.
              </p>
              <button
                @click="handleDownload"
                class="download-btn mt-4"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Download File
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <div class="footer-info">
              <div class="info-item">
                <span class="info-label">Uploaded by:</span>
                <span class="info-value">{{ file.uploader?.name || 'Unknown' }}</span>
              </div>
              <div v-if="file.category" class="info-item">
                <span class="info-label">Category:</span>
                <span
                  class="category-badge"
                  :style="{ backgroundColor: file.category.color + '20', color: file.category.color }"
                >
                  {{ file.category.name }}
                </span>
              </div>
              <div v-if="file.version > 1" class="info-item">
                <span class="info-label">Version:</span>
                <span class="info-value">v{{ file.version }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFileStore } from '@/stores/file'
import type { FileAttachment } from '@/types/file'

interface Props {
  file: FileAttachment
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const store = useFileStore()
const loading = ref(false)
const textContent = ref('')

// Computed
const isImage = computed(() => {
  return props.file.mime_type.startsWith('image/')
})

const isPdf = computed(() => {
  return props.file.mime_type === 'application/pdf'
})

const isVideo = computed(() => {
  return props.file.mime_type.startsWith('video/')
})

const isAudio = computed(() => {
  return props.file.mime_type.startsWith('audio/')
})

const isText = computed(() => {
  const textTypes = [
    'text/',
    'application/json',
    'application/javascript',
    'application/xml'
  ]
  return textTypes.some(type => props.file.mime_type.startsWith(type))
})

// Methods
const close = () => {
  emit('close')
}

const handleDownload = async () => {
  try {
    await store.downloadFile(props.file.id, props.file.original_filename)
  } catch (error) {
    console.error('Failed to download file:', error)
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const loadTextContent = async () => {
  if (!isText.value) return
  
  loading.value = true
  try {
    const response = await fetch(props.file.file_url)
    textContent.value = await response.text()
  } catch (error) {
    console.error('Failed to load text content:', error)
    textContent.value = 'Failed to load content'
  } finally {
    loading.value = false
  }
}

// Watch for file changes
watch(() => props.file, (newFile) => {
  if (newFile && isText.value) {
    loadTextContent()
  }
}, { immediate: true })

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    close()
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4;
}

.modal-container {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col;
}

.modal-header {
  @apply flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.header-info {
  @apply flex-1;
}

.header-actions {
  @apply flex items-center gap-2;
}

.action-btn {
  @apply p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors;
}

.modal-body {
  @apply flex-1 overflow-auto p-6;
}

.preview-loading {
  @apply flex flex-col items-center justify-center h-full min-h-[400px];
}

.image-preview {
  @apply flex items-center justify-center;
}

.preview-image {
  @apply max-w-full max-h-[600px] object-contain rounded;
}

.pdf-preview {
  @apply h-[600px];
}

.pdf-frame {
  @apply w-full h-full rounded;
}

.video-preview {
  @apply flex items-center justify-center;
}

.preview-video {
  @apply max-w-full max-h-[600px] rounded;
}

.audio-preview {
  @apply flex items-center justify-center min-h-[400px];
}

.audio-container {
  @apply flex flex-col items-center gap-6;
}

.audio-player {
  @apply w-full max-w-md;
}

.text-preview {
  @apply bg-gray-50 dark:bg-gray-900 rounded p-4 overflow-auto max-h-[600px];
}

.code-block {
  @apply text-sm text-gray-900 dark:text-gray-100 font-mono whitespace-pre-wrap;
}

.no-preview {
  @apply flex flex-col items-center justify-center min-h-[400px] text-center;
}

.download-btn {
  @apply flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors;
}

.modal-footer {
  @apply p-6 border-t border-gray-200 dark:border-gray-700;
}

.footer-info {
  @apply flex flex-wrap gap-4;
}

.info-item {
  @apply flex items-center gap-2;
}

.info-label {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400;
}

.info-value {
  @apply text-sm text-gray-900 dark:text-white;
}

.category-badge {
  @apply px-2 py-1 rounded text-sm font-medium;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
