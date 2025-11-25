<template>
  <div class="attachment-item card h-100">
    <div class="card-body d-flex flex-column">
      <!-- File Icon/Preview -->
      <div class="file-icon mb-3 text-center">
        <i :class="fileIcon" :style="{ color: fileColor }"></i>
      </div>

      <!-- File Info -->
      <div class="file-info flex-grow-1">
        <h6 class="file-name mb-2" :title="attachment.filename">
          {{ attachment.filename }}
        </h6>
        <div class="file-meta">
          <small class="text-muted d-block">
            <i class="bi bi-hdd me-1"></i>
            {{ formattedSize }}
          </small>
          <small class="text-muted d-block">
            <i class="bi bi-person me-1"></i>
            {{ attachment.uploaded_by?.name || 'Unknown' }}
          </small>
          <small class="text-muted d-block">
            <i class="bi bi-clock me-1"></i>
            {{ formatDate(attachment.created_at) }}
          </small>
        </div>
      </div>

      <!-- Actions -->
      <div class="file-actions mt-3 d-flex gap-2">
        <button
          v-if="canPreview"
          class="btn btn-sm btn-outline-success"
          @click="handlePreview"
          title="Preview file"
        >
          <i class="bi bi-eye"></i>
        </button>
        <button
          class="btn btn-sm btn-outline-primary flex-grow-1"
          @click="handleDownload"
          :disabled="downloading"
        >
          <span v-if="downloading" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-download me-1"></i>
          {{ downloading ? 'Downloading...' : 'Download' }}
        </button>
        <button
          v-if="canDelete"
          class="btn btn-sm btn-outline-danger"
          @click="handleDelete"
          :disabled="deleting"
          :title="'Delete attachment'"
        >
          <span v-if="deleting" class="spinner-border spinner-border-sm"></span>
          <i v-else class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAttachmentStore } from '@/stores/attachment'
import { useAuthStore } from '@/stores/auth'
import type { Attachment } from '@/types/models'

// Props
const props = defineProps<{
  attachment: Attachment
}>()

// Emits
const emit = defineEmits<{
  'attachment-deleted': [attachmentId: number]
  'attachment-downloaded': [attachment: Attachment]
  'attachment-preview': [attachment: Attachment]
}>()

// Stores
const attachmentStore = useAttachmentStore()
const authStore = useAuthStore()

// State
const downloading = ref(false)
const deleting = ref(false)

// Computed
const canDelete = computed(() => {
  return authStore.user?.id === props.attachment.uploaded_by?.id || authStore.user?.role === 'admin'
})

const canPreview = computed(() => {
  const ext = props.attachment.filename.split('.').pop()?.toLowerCase() || ''
  const previewableExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'pdf', 'txt', 'md', 'json', 'xml', 'csv', 'log', 'js', 'ts', 'vue', 'css', 'html']
  return previewableExtensions.includes(ext)
})

const formattedSize = computed(() => {
  const bytes = props.attachment.size
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
})

const fileIcon = computed(() => {
  const mimeType = props.attachment.mime_type.toLowerCase()
  
  // Images
  if (props.attachment.is_image || mimeType.startsWith('image/')) {
    return 'bi bi-file-earmark-image'
  }
  
  // Documents
  if (props.attachment.is_document) {
    if (mimeType.includes('pdf')) return 'bi bi-file-earmark-pdf'
    if (mimeType.includes('word')) return 'bi bi-file-earmark-word'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'bi bi-file-earmark-excel'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'bi bi-file-earmark-ppt'
    return 'bi bi-file-earmark-text'
  }
  
  // Archives
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
    return 'bi bi-file-earmark-zip'
  }
  
  // Code
  if (mimeType.includes('javascript') || mimeType.includes('json') || 
      mimeType.includes('html') || mimeType.includes('css') ||
      props.attachment.filename.endsWith('.js') || props.attachment.filename.endsWith('.ts') ||
      props.attachment.filename.endsWith('.vue') || props.attachment.filename.endsWith('.jsx')) {
    return 'bi bi-file-earmark-code'
  }
  
  // Videos
  if (mimeType.startsWith('video/')) {
    return 'bi bi-file-earmark-play'
  }
  
  // Audio
  if (mimeType.startsWith('audio/')) {
    return 'bi bi-file-earmark-music'
  }
  
  // Default
  return 'bi bi-file-earmark'
})

const fileColor = computed(() => {
  const mimeType = props.attachment.mime_type.toLowerCase()
  
  if (props.attachment.is_image) return '#10B981'
  if (mimeType.includes('pdf')) return '#EF4444'
  if (mimeType.includes('word')) return '#3B82F6'
  if (mimeType.includes('excel')) return '#10B981'
  if (mimeType.includes('powerpoint')) return '#F59E0B'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '#8B5CF6'
  if (mimeType.startsWith('video/')) return '#EC4899'
  if (mimeType.startsWith('audio/')) return '#06B6D4'
  
  return '#6B7280'
})

// Methods
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleDownload = async () => {
  downloading.value = true
  try {
    await attachmentStore.downloadAttachment(props.attachment.id, props.attachment.filename)
    emit('attachment-downloaded', props.attachment)
  } catch (error: any) {
    console.error('Failed to download attachment:', error)
    alert(error.response?.data?.message || 'Failed to download attachment')
  } finally {
    downloading.value = false
  }
}

const handlePreview = () => {
  emit('attachment-preview', props.attachment)
}

const handleDelete = async () => {
  if (!confirm(`Are you sure you want to delete "${props.attachment.filename}"?`)) {
    return
  }

  deleting.value = true
  try {
    await attachmentStore.deleteAttachment(props.attachment.id)
    emit('attachment-deleted', props.attachment.id)
  } catch (error: any) {
    console.error('Failed to delete attachment:', error)
    alert(error.response?.data?.message || 'Failed to delete attachment')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.attachment-item {
  transition: all 0.2s ease;
  border: 2px solid #E5E7EB;
}

.attachment-item:hover {
  border-color: #3B82F6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.file-icon i {
  font-size: 3rem;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.file-meta small {
  font-size: 0.75rem;
  line-height: 1.5;
}

.file-actions .btn {
  font-size: 0.875rem;
}

.btn-outline-primary {
  color: #3B82F6;
  border-color: #3B82F6;
}

.btn-outline-primary:hover {
  background-color: #3B82F6;
  border-color: #3B82F6;
  color: white;
}

.btn-outline-danger {
  color: #EF4444;
  border-color: #EF4444;
}

.btn-outline-danger:hover {
  background-color: #EF4444;
  border-color: #EF4444;
  color: white;
}

.btn-outline-success {
  color: #10B981;
  border-color: #10B981;
}

.btn-outline-success:hover {
  background-color: #10B981;
  border-color: #10B981;
  color: white;
}
</style>
