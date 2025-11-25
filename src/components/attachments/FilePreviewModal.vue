<template>
  <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-eye me-2"></i>
            {{ attachment?.file_name || 'File Preview' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading preview...</span>
            </div>
            <p class="text-muted mt-2">Loading preview...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ error }}
          </div>

          <!-- Image Preview -->
          <div v-else-if="isImage" class="preview-container">
            <img :src="previewUrl" :alt="attachment?.file_name" class="img-fluid rounded" />
          </div>

          <!-- PDF Preview -->
          <div v-else-if="isPDF" class="preview-container">
            <iframe 
              :src="previewUrl" 
              class="pdf-preview"
              frameborder="0"
            ></iframe>
          </div>

          <!-- Text Preview -->
          <div v-else-if="isText" class="preview-container">
            <pre class="text-preview">{{ textContent }}</pre>
          </div>

          <!-- Unsupported Format -->
          <div v-else class="text-center py-5">
            <i class="bi bi-file-earmark-x text-muted" style="font-size: 4rem;"></i>
            <h5 class="mt-3">Preview not available</h5>
            <p class="text-muted">
              This file type cannot be previewed. 
              <a :href="downloadUrl" class="btn btn-sm btn-primary mt-2">
                <i class="bi bi-download me-1"></i>
                Download to view
              </a>
            </p>
          </div>

          <!-- File Info -->
          <div v-if="attachment" class="file-info mt-3 p-3 bg-light rounded">
            <div class="row">
              <div class="col-md-6">
                <small class="text-muted d-block">File Size</small>
                <strong>{{ formatFileSize(attachment.file_size) }}</strong>
              </div>
              <div class="col-md-6">
                <small class="text-muted d-block">File Type</small>
                <strong>{{ attachment.mime_type }}</strong>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <a 
            v-if="attachment" 
            :href="downloadUrl" 
            class="btn btn-primary"
            download
          >
            <i class="bi bi-download me-1"></i>
            Download
          </a>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Attachment } from '@/types/models'
import apiClient from '@/api/client'

// Props
const props = defineProps<{
  modalId: string
  attachment: Attachment | null
}>()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const textContent = ref<string>('')
const previewUrl = ref<string>('')

// Computed
const isImage = computed(() => {
  if (!props.attachment) return false
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return imageTypes.includes(props.attachment.mime_type)
})

const isPDF = computed(() => {
  if (!props.attachment) return false
  return props.attachment.mime_type === 'application/pdf'
})

const isText = computed(() => {
  if (!props.attachment) return false
  const textTypes = ['text/plain', 'text/markdown', 'application/json', 'text/csv']
  return textTypes.includes(props.attachment.mime_type)
})

const downloadUrl = computed(() => {
  if (!props.attachment) return ''
  return `${apiClient.defaults.baseURL}/attachments/${props.attachment.id}/download`
})

// Methods
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const loadPreview = async () => {
  if (!props.attachment) return

  loading.value = true
  error.value = null

  try {
    if (isImage.value || isPDF.value) {
      // For images and PDFs, use the download URL directly
      previewUrl.value = downloadUrl.value
    } else if (isText.value) {
      // For text files, fetch content
      const response = await apiClient.get(
        `/attachments/${props.attachment.id}/download`,
        { responseType: 'text' }
      )
      textContent.value = response.data
    }
  } catch (err: any) {
    error.value = 'Failed to load preview'
    console.error('Error loading preview:', err)
  } finally {
    loading.value = false
  }
}

// Watch for attachment changes
watch(() => props.attachment, (newAttachment) => {
  if (newAttachment) {
    loadPreview()
  }
}, { immediate: true })
</script>

<style scoped>
.preview-container {
  max-height: 600px;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
}

.preview-container img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.pdf-preview {
  width: 100%;
  height: 600px;
}

.text-preview {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  margin: 0;
  max-height: 500px;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.file-info {
  border: 1px solid #dee2e6;
}

.file-info small {
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}
</style>
