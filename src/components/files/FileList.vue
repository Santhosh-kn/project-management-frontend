<template>
  <div class="file-list">
    <!-- View Toggle & Filters -->
    <div class="list-header">
      <div class="view-controls">
        <button
          @click="viewMode = 'grid'"
          class="view-btn"
          :class="{ active: viewMode === 'grid' }"
          title="Grid View"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
        </button>
        <button
          @click="viewMode = 'list'"
          class="view-btn"
          :class="{ active: viewMode === 'list' }"
          title="List View"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
          </svg>
        </button>
      </div>

      <div class="filter-controls">
        <select v-model="sortBy" class="sort-select">
          <option value="name">Name</option>
          <option value="date">Date</option>
          <option value="size">Size</option>
          <option value="type">Type</option>
        </select>

        <button
          @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
          class="sort-order-btn"
          :title="sortOrder === 'asc' ? 'Ascending' : 'Descending'"
        >
          <svg v-if="sortOrder === 'asc'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="files-grid">
      <div
        v-for="file in sortedFiles"
        :key="file.id"
        class="file-card"
        :class="{ selected: isSelected(file.id) }"
      >
        <!-- Selection Checkbox -->
        <div class="card-checkbox">
          <input
            type="checkbox"
            :checked="isSelected(file.id)"
            @change="$emit('toggle-selection', file.id)"
            class="checkbox"
          />
        </div>

        <!-- File Preview/Icon -->
        <div
          class="card-preview"
          @click="$emit('preview', file)"
        >
          <img
            v-if="isImage(file)"
            :src="file.file_url"
            :alt="file.filename"
            class="preview-image"
          />
          <div v-else class="file-icon" :class="getFileTypeClass(file)">
            <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
            </svg>
            <span class="file-ext">{{ getFileExtension(file.filename) }}</span>
          </div>
        </div>

        <!-- File Info -->
        <div class="card-body">
          <h4 class="file-name" :title="file.original_filename">
            {{ truncate(file.original_filename, 30) }}
          </h4>
          <p class="file-meta">
            {{ formatFileSize(file.size) }} • {{ formatDate(file.created_at) }}
          </p>

          <!-- Category Badge -->
          <div v-if="file.category" class="category-badge" :style="{ backgroundColor: file.category.color + '20', color: file.category.color }">
            {{ file.category.icon }} {{ file.category.name }}
          </div>

          <!-- Version Badge -->
          <div v-if="file.version > 1" class="version-badge">
            v{{ file.version }}
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <button
            @click="$emit('preview', file)"
            class="action-btn"
            title="Preview"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>

          <button
            @click="$emit('download', file)"
            class="action-btn"
            title="Download"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
          </button>

          <button
            @click="$emit('delete', file.id)"
            class="action-btn text-red-600"
            title="Delete"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="files-list">
      <table class="files-table">
        <thead>
          <tr>
            <th class="checkbox-col">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="$emit('toggle-all')"
                class="checkbox"
              />
            </th>
            <th>Name</th>
            <th>Category</th>
            <th>Size</th>
            <th>Uploaded</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="file in sortedFiles"
            :key="file.id"
            class="file-row"
            :class="{ selected: isSelected(file.id) }"
          >
            <td class="checkbox-col">
              <input
                type="checkbox"
                :checked="isSelected(file.id)"
                @change="$emit('toggle-selection', file.id)"
                class="checkbox"
              />
            </td>
            <td class="name-col">
              <div class="file-info">
                <div class="file-icon-small" :class="getFileTypeClass(file)">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <button
                    @click="$emit('preview', file)"
                    class="file-name-link"
                  >
                    {{ file.original_filename }}
                  </button>
                  <p v-if="file.version > 1" class="text-xs text-gray-500 dark:text-gray-400">
                    Version {{ file.version }}
                  </p>
                </div>
              </div>
            </td>
            <td>
              <span
                v-if="file.category"
                class="category-badge"
                :style="{ backgroundColor: file.category.color + '20', color: file.category.color }"
              >
                {{ file.category.icon }} {{ file.category.name }}
              </span>
              <span v-else class="text-gray-400 text-sm">—</span>
            </td>
            <td class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatFileSize(file.size) }}
            </td>
            <td class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatDate(file.created_at) }}
            </td>
            <td>
              <div class="table-actions">
                <button
                  @click="$emit('preview', file)"
                  class="action-btn-sm"
                  title="Preview"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
                <button
                  @click="$emit('download', file)"
                  class="action-btn-sm"
                  title="Download"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                </button>
                <button
                  @click="$emit('delete', file.id)"
                  class="action-btn-sm text-red-600"
                  title="Delete"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="sortedFiles.length === 0" class="empty-state">
      <svg class="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
      </svg>
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4">No files yet</h3>
      <p class="text-gray-500 dark:text-gray-400 mt-2">Upload your first file to get started</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FileAttachment } from '@/types/file'

interface Props {
  files: FileAttachment[]
  selectedFiles: number[]
}

const props = defineProps<Props>()
const emit = defineEmits(['toggle-selection', 'toggle-all', 'preview', 'download', 'delete'])

const viewMode = ref<'grid' | 'list'>('grid')
const sortBy = ref<'name' | 'date' | 'size' | 'type'>('date')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Computed
const allSelected = computed(() => {
  return props.files.length > 0 && props.selectedFiles.length === props.files.length
})

const sortedFiles = computed(() => {
  const files = [...props.files]
  
  files.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy.value) {
      case 'name':
        comparison = a.original_filename.localeCompare(b.original_filename)
        break
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'size':
        comparison = a.size - b.size
        break
      case 'type':
        comparison = a.mime_type.localeCompare(b.mime_type)
        break
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
  
  return files
})

// Methods
const isSelected = (fileId: number) => {
  return props.selectedFiles.includes(fileId)
}

const isImage = (file: FileAttachment) => {
  return file.mime_type.startsWith('image/')
}

const getFileExtension = (filename: string) => {
  const ext = filename.split('.').pop()
  return ext ? ext.toUpperCase() : 'FILE'
}

const getFileTypeClass = (file: FileAttachment) => {
  if (file.mime_type.startsWith('image/')) return 'file-type-image'
  if (file.mime_type.startsWith('video/')) return 'file-type-video'
  if (file.mime_type.startsWith('audio/')) return 'file-type-audio'
  if (file.mime_type === 'application/pdf') return 'file-type-pdf'
  if (file.mime_type.includes('word') || file.mime_type.includes('document')) return 'file-type-doc'
  if (file.mime_type.includes('sheet') || file.mime_type.includes('excel')) return 'file-type-sheet'
  if (file.mime_type.includes('zip') || file.mime_type.includes('rar')) return 'file-type-archive'
  return 'file-type-default'
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
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const truncate = (text: string, length: number) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}
</script>

<style scoped>
.file-list {
  @apply space-y-4;
}

/* Header */
.list-header {
  @apply flex items-center justify-between;
}

.view-controls {
  @apply flex items-center gap-1;
}

.view-btn {
  @apply p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors;
}

.view-btn.active {
  @apply bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400;
}

.filter-controls {
  @apply flex items-center gap-2;
}

.sort-select {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm;
}

.sort-order-btn {
  @apply p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors;
}

/* Grid View */
.files-grid {
  @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4;
}

.file-card {
  @apply relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition-all group;
}

.file-card.selected {
  @apply border-blue-500 ring-2 ring-blue-500 ring-opacity-50;
}

.card-checkbox {
  @apply absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity;
}

.card-checkbox input:checked ~ * {
  @apply opacity-100;
}

.checkbox {
  @apply w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bg-white;
}

.card-preview {
  @apply aspect-square flex items-center justify-center bg-gray-50 dark:bg-gray-700 cursor-pointer;
}

.preview-image {
  @apply w-full h-full object-cover;
}

.file-icon {
  @apply relative flex flex-col items-center justify-center;
}

.file-ext {
  @apply absolute bottom-0 text-xs font-bold;
}

.card-body {
  @apply p-3 space-y-2;
}

.file-name {
  @apply text-sm font-medium text-gray-900 dark:text-white truncate;
}

.file-meta {
  @apply text-xs text-gray-600 dark:text-gray-400;
}

.category-badge {
  @apply inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium;
}

.version-badge {
  @apply inline-block px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs font-medium;
}

.card-actions {
  @apply flex items-center gap-1 p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50;
}

.action-btn {
  @apply flex-1 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors;
}

/* File Type Colors */
.file-type-image { @apply text-green-600 dark:text-green-400; }
.file-type-video { @apply text-purple-600 dark:text-purple-400; }
.file-type-audio { @apply text-pink-600 dark:text-pink-400; }
.file-type-pdf { @apply text-red-600 dark:text-red-400; }
.file-type-doc { @apply text-blue-600 dark:text-blue-400; }
.file-type-sheet { @apply text-green-600 dark:text-green-400; }
.file-type-archive { @apply text-yellow-600 dark:text-yellow-400; }
.file-type-default { @apply text-gray-600 dark:text-gray-400; }

/* List View */
.files-list {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden;
}

.files-table {
  @apply w-full;
}

.files-table thead {
  @apply bg-gray-50 dark:bg-gray-700;
}

.files-table th {
  @apply px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider;
}

.files-table td {
  @apply px-4 py-4 whitespace-nowrap text-sm;
}

.file-row {
  @apply border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors;
}

.file-row.selected {
  @apply bg-blue-50 dark:bg-blue-900/20;
}

.checkbox-col {
  @apply w-12;
}

.name-col {
  @apply max-w-md;
}

.file-info {
  @apply flex items-center gap-3;
}

.file-icon-small {
  @apply w-10 h-10 rounded flex items-center justify-center;
}

.file-name-link {
  @apply text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium;
}

.table-actions {
  @apply flex items-center gap-1;
}

.action-btn-sm {
  @apply p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors;
}

/* Empty State */
.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-center;
}
</style>
