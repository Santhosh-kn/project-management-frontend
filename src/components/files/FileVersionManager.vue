<template>
  <div class="version-manager">
    <!-- Header -->
    <div class="manager-header">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">File Versions</h3>
      <button
        @click="showUploadVersion = true"
        class="upload-version-btn"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Upload New Version
      </button>
    </div>

    <!-- Upload New Version Form -->
    <div v-if="showUploadVersion" class="upload-form">
      <div class="form-content">
        <div class="form-group">
          <label class="form-label">Select File</label>
          <input
            type="file"
            @change="handleFileSelect"
            class="file-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Changes Description (Optional)</label>
          <textarea
            v-model="versionDescription"
            rows="3"
            class="form-textarea"
            placeholder="Describe what changed in this version..."
          ></textarea>
        </div>

        <div class="form-actions">
          <button
            @click="handleUploadVersion"
            :disabled="!selectedFile || uploading"
            class="btn-primary"
          >
            {{ uploading ? 'Uploading...' : 'Upload Version' }}
          </button>
          <button
            @click="cancelUpload"
            class="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Versions List -->
    <div v-else-if="versions.length > 0" class="versions-list">
      <div
        v-for="version in versions"
        :key="version.id"
        class="version-item"
        :class="{ latest: version.version === file.version }"
      >
        <div class="version-header">
          <div class="version-number">
            v{{ version.version }}
            <span v-if="version.version === file.version" class="latest-badge">Latest</span>
          </div>
          <div class="version-date">
            {{ formatDate(version.created_at) }}
          </div>
        </div>

        <div class="version-body">
          <div class="version-info">
            <div class="info-row">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ version.uploader?.name || 'Unknown' }}
              </span>
            </div>

            <div class="info-row">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatFileSize(version.size) }}
              </span>
            </div>
          </div>

          <p v-if="version.changes_description" class="version-description">
            {{ version.changes_description }}
          </p>
        </div>

        <div class="version-actions">
          <button
            v-if="version.version !== file.version"
            @click="handleRestore(version.id)"
            class="action-btn"
            title="Restore this version"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Restore
          </button>

          <a
            :href="version.file_url"
            :download="version.filename"
            class="action-btn"
            title="Download"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download
          </a>

          <button
            v-if="version.version !== file.version && versions.length > 1"
            @click="handleDeleteVersion(version.id)"
            class="action-btn text-red-600 hover:text-red-700"
            title="Delete"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <p class="text-gray-600 dark:text-gray-400 mt-2">No versions available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fileApi } from '@/api/files'
import { useFileStore } from '@/stores/file'
import type { FileAttachment, FileVersion } from '@/types/file'

interface Props {
  file: FileAttachment
}

const props = defineProps<Props>()
const emit = defineEmits(['version-uploaded', 'version-restored'])

const store = useFileStore()
const loading = ref(false)
const uploading = ref(false)
const showUploadVersion = ref(false)
const versions = ref<FileVersion[]>([])
const selectedFile = ref<File | null>(null)
const versionDescription = ref('')

// Methods
const loadVersions = async () => {
  loading.value = true
  try {
    const response = await fileApi.getFileVersions(props.file.id)
    versions.value = response.data.data
  } catch (error) {
    console.error('Failed to load versions:', error)
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

const handleUploadVersion = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    if (versionDescription.value) {
      formData.append('changes_description', versionDescription.value)
    }

    await store.uploadNewVersion(props.file.id, formData)
    await loadVersions()
    
    cancelUpload()
    emit('version-uploaded')
  } catch (error) {
    console.error('Failed to upload version:', error)
  } finally {
    uploading.value = false
  }
}

const cancelUpload = () => {
  showUploadVersion.value = false
  selectedFile.value = null
  versionDescription.value = ''
}

const handleRestore = async (versionId: number) => {
  if (!confirm('Are you sure you want to restore this version?')) return

  try {
    await fileApi.restoreVersion(props.file.id, versionId)
    await loadVersions()
    emit('version-restored')
  } catch (error) {
    console.error('Failed to restore version:', error)
  }
}

const handleDeleteVersion = async (versionId: number) => {
  if (!confirm('Are you sure you want to delete this version?')) return

  try {
    await fileApi.deleteVersion(props.file.id, versionId)
    await loadVersions()
  } catch (error) {
    console.error('Failed to delete version:', error)
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadVersions()
})
</script>

<style scoped>
.version-manager {
  @apply space-y-4;
}

.manager-header {
  @apply flex items-center justify-between;
}

.upload-version-btn {
  @apply flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors;
}

.upload-form {
  @apply bg-gray-50 dark:bg-gray-700 rounded-lg p-4;
}

.form-content {
  @apply space-y-4;
}

.form-group {
  @apply space-y-1;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.file-input {
  @apply w-full text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800;
}

.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white;
}

.form-actions {
  @apply flex gap-2;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors;
}

.loading-state {
  @apply flex justify-center items-center py-8;
}

.versions-list {
  @apply space-y-3;
}

.version-item {
  @apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4;
}

.version-item.latest {
  @apply border-blue-500 bg-blue-50 dark:bg-blue-900/20;
}

.version-header {
  @apply flex items-center justify-between mb-3;
}

.version-number {
  @apply flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white;
}

.latest-badge {
  @apply px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full;
}

.version-date {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.version-body {
  @apply space-y-2 mb-3;
}

.version-info {
  @apply flex gap-4;
}

.info-row {
  @apply flex items-center gap-1;
}

.version-description {
  @apply text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded p-2;
}

.version-actions {
  @apply flex gap-2;
}

.action-btn {
  @apply flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}
</style>
