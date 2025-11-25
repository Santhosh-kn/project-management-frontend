<template>
  <div class="files-management-view">
    <!-- Header -->
    <div class="view-header">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Files</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Manage and organize your files</p>
      </div>
      <button
        @click="showUploadModal = true"
        class="btn-primary"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
        Upload Files
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">Total Files</p>
          <p class="stat-value">{{ store.files.length }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"/>
            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"/>
            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">Total Size</p>
          <p class="stat-value">{{ formatTotalSize }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">Categories</p>
          <p class="stat-value">{{ store.categories.length }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-grid">
      <!-- Sidebar: Categories & Organizer -->
      <aside class="sidebar">
        <FileOrganizer
          :total-files="store.files.length"
          :selected-category-id="selectedCategoryId"
          @filter-category="handleFilterCategory"
        />
      </aside>

      <!-- Main: File List -->
      <main class="main-content">
        <!-- Search & Filter Bar -->
        <div class="filter-bar">
          <div class="search-box">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search files..."
              class="search-input"
            />
          </div>

          <select v-model="fileTypeFilter" class="filter-select">
            <option value="">All Types</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="archive">Archives</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Loading State -->
        <div v-if="store.loading" class="loading-state">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="text-gray-600 dark:text-gray-400 mt-4">Loading files...</p>
        </div>

        <!-- File List -->
        <FileList
          v-else
          :files="filteredFiles"
          :selected-files="store.selectedFiles"
          @toggle-selection="store.toggleFileSelection"
          @toggle-all="toggleSelectAll"
          @preview="handlePreview"
          @download="handleDownload"
          @delete="handleDelete"
        />
      </main>
    </div>

    <!-- Upload Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showUploadModal" class="modal-overlay" @click.self="showUploadModal = false">
          <div class="modal-container">
            <div class="modal-header">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Upload Files</h3>
              <button @click="showUploadModal = false" class="close-btn">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <div class="form-group mb-4">
                <label class="form-label">Category (Optional)</label>
                <select v-model="uploadCategoryId" class="form-select">
                  <option :value="null">No Category</option>
                  <option
                    v-for="category in store.categories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.icon }} {{ category.name }}
                  </option>
                </select>
              </div>

              <FileUploadZone
                attachable-type="project"
                :attachable-id="1"
                :category-id="uploadCategoryId"
                :multiple="true"
                :max-size-m-b="50"
                @upload-complete="handleUploadComplete"
              />
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Preview Modal -->
    <FilePreviewModal
      v-if="previewFile"
      :file="previewFile"
      :is-open="showPreviewModal"
      @close="closePreview"
    />

    <!-- Version Manager Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showVersionModal && versionFile" class="modal-overlay" @click.self="showVersionModal = false">
          <div class="modal-container">
            <div class="modal-header">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                File Versions: {{ versionFile.original_filename }}
              </h3>
              <button @click="showVersionModal = false" class="close-btn">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <FileVersionManager
                :file="versionFile"
                @version-uploaded="handleVersionUploaded"
                @version-restored="handleVersionRestored"
              />
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFileStore } from '@/stores/file'
import FileOrganizer from '@/components/files/FileOrganizer.vue'
import FileList from '@/components/files/FileList.vue'
import FileUploadZone from '@/components/files/FileUploadZone.vue'
import FilePreviewModal from '@/components/files/FilePreviewModal.vue'
import FileVersionManager from '@/components/files/FileVersionManager.vue'
import type { FileAttachment } from '@/types/file'

const store = useFileStore()

const showUploadModal = ref(false)
const showPreviewModal = ref(false)
const showVersionModal = ref(false)
const previewFile = ref<FileAttachment | null>(null)
const versionFile = ref<FileAttachment | null>(null)
const uploadCategoryId = ref<number | null>(null)
const selectedCategoryId = ref<number | null>(null)
const searchQuery = ref('')
const fileTypeFilter = ref('')

// Computed
const filteredFiles = computed(() => {
  let files = store.files

  // Filter by category
  if (selectedCategoryId.value) {
    files = files.filter(f => f.category_id === selectedCategoryId.value)
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    files = files.filter(f =>
      f.original_filename.toLowerCase().includes(query) ||
      f.filename.toLowerCase().includes(query)
    )
  }

  // Filter by file type
  if (fileTypeFilter.value) {
    files = files.filter(f => {
      const type = fileTypeFilter.value
      if (type === 'image') return f.mime_type.startsWith('image/')
      if (type === 'video') return f.mime_type.startsWith('video/')
      if (type === 'audio') return f.mime_type.startsWith('audio/')
      if (type === 'document') return f.mime_type.includes('pdf') || f.mime_type.includes('document') || f.mime_type.includes('word')
      if (type === 'archive') return f.mime_type.includes('zip') || f.mime_type.includes('rar')
      return true
    })
  }

  return files
})

const formatTotalSize = computed(() => {
  const total = store.files.reduce((sum, file) => sum + file.size, 0)
  return formatFileSize(total)
})

// Methods
const handleFilterCategory = (categoryId: number | null) => {
  selectedCategoryId.value = categoryId
}

const toggleSelectAll = () => {
  if (store.selectedFiles.length === filteredFiles.value.length) {
    store.clearSelection()
  } else {
    store.clearSelection()
    filteredFiles.value.forEach(file => {
      store.toggleFileSelection(file.id)
    })
  }
}

const handlePreview = (file: FileAttachment) => {
  previewFile.value = file
  showPreviewModal.value = true
}

const closePreview = () => {
  showPreviewModal.value = false
  previewFile.value = null
}

const handleDownload = async (file: FileAttachment) => {
  try {
    await store.downloadFile(file.id, file.original_filename)
  } catch (error) {
    console.error('Failed to download file:', error)
  }
}

const handleDelete = async (fileId: number) => {
  if (!confirm('Are you sure you want to delete this file? This cannot be undone.')) return

  try {
    await store.deleteFile(fileId)
  } catch (error) {
    console.error('Failed to delete file:', error)
  }
}

const handleUploadComplete = () => {
  store.fetchFiles()
}

const handleVersionUploaded = () => {
  store.fetchFiles()
}

const handleVersionRestored = () => {
  store.fetchFiles()
  showVersionModal.value = false
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Lifecycle
onMounted(async () => {
  await store.fetchFiles()
  await store.fetchCategories()
})
</script>

<style scoped>
.files-management-view {
  @apply p-6 max-w-[1800px] mx-auto;
}

.view-header {
  @apply flex items-start justify-between mb-6;
}

.btn-primary {
  @apply flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors;
}

/* Stats Grid */
.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4 mb-6;
}

.stat-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4;
}

.stat-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center;
}

.stat-info {
  @apply flex-1;
}

.stat-label {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

/* Content Grid */
.content-grid {
  @apply grid grid-cols-1 lg:grid-cols-4 gap-6;
}

.sidebar {
  @apply lg:col-span-1;
}

.main-content {
  @apply lg:col-span-3 space-y-4;
}

/* Filter Bar */
.filter-bar {
  @apply flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4;
}

.search-box {
  @apply flex-1 relative;
}

.search-box svg {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2;
}

.search-input {
  @apply w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white;
}

.filter-select {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white;
}

/* Loading State */
.loading-state {
  @apply flex flex-col items-center justify-center py-16;
}

/* Modal */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-container {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.close-btn {
  @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors;
}

.modal-body {
  @apply flex-1 overflow-auto p-6;
}

.form-group {
  @apply space-y-1;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.form-select {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white;
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
</style>
