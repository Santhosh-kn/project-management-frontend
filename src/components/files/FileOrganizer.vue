<template>
  <div class="file-organizer">
    <!-- Bulk Actions Bar -->
    <transition name="slide-down">
      <div v-if="store.hasSelectedFiles" class="bulk-actions-bar">
        <div class="selection-info">
          <input
            type="checkbox"
            :checked="allSelected"
            @change="toggleSelectAll"
            class="checkbox"
          />
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {{ store.selectedFiles.length }} file{{ store.selectedFiles.length !== 1 ? 's' : '' }} selected
          </span>
        </div>

        <div class="actions">
          <button
            @click="showCategorizeModal = true"
            class="bulk-btn"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            Categorize
          </button>

          <button
            @click="handleBulkDownload"
            :disabled="downloading"
            class="bulk-btn"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            {{ downloading ? 'Downloading...' : 'Download' }}
          </button>

          <button
            @click="handleBulkDelete"
            class="bulk-btn text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Delete
          </button>

          <button
            @click="store.clearSelection()"
            class="bulk-btn"
          >
            Clear
          </button>
        </div>
      </div>
    </transition>

    <!-- Categories Sidebar -->
    <div class="categories-section">
      <div class="section-header">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Categories</h3>
        <button
          @click="showCreateCategory = true"
          class="add-category-btn"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </button>
      </div>

      <!-- All Files -->
      <button
        @click="$emit('filter-category', null)"
        class="category-item"
        :class="{ active: !selectedCategoryId }"
      >
        <div class="category-info">
          <div class="category-icon" style="background-color: #e5e7eb">
            <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <span class="category-name">All Files</span>
        </div>
        <span class="file-count">{{ totalFiles }}</span>
      </button>

      <!-- Categories List -->
      <div class="categories-list">
        <div
          v-for="category in store.categories"
          :key="category.id"
          class="category-item"
          :class="{ active: selectedCategoryId === category.id }"
        >
          <button
            @click="$emit('filter-category', category.id)"
            class="category-btn"
          >
            <div class="category-info">
              <div
                class="category-icon"
                :style="{ backgroundColor: category.color + '20' }"
              >
                <span :style="{ color: category.color }">{{ category.icon }}</span>
              </div>
              <span class="category-name">{{ category.name }}</span>
            </div>
            <span class="file-count">{{ getCategoryFileCount(category.id) }}</span>
          </button>

          <div class="category-actions">
            <button
              @click="editCategory(category)"
              class="action-icon-btn"
              title="Edit"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              @click="handleDeleteCategory(category.id)"
              class="action-icon-btn text-red-600"
              title="Delete"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Category Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showCreateCategory || editingCategory" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ editingCategory ? 'Edit Category' : 'Create Category' }}
              </h3>
              <button @click="closeModal" class="close-btn">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Name</label>
                <input
                  v-model="categoryForm.name"
                  type="text"
                  class="form-input"
                  placeholder="e.g., Documents, Images"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Icon (Emoji)</label>
                <input
                  v-model="categoryForm.icon"
                  type="text"
                  class="form-input"
                  placeholder="e.g., 📄, 🖼️, 📁"
                  maxlength="2"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Color</label>
                <div class="color-picker">
                  <input
                    v-model="categoryForm.color"
                    type="color"
                    class="color-input"
                  />
                  <input
                    v-model="categoryForm.color"
                    type="text"
                    class="form-input flex-1"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Description (Optional)</label>
                <textarea
                  v-model="categoryForm.description"
                  rows="3"
                  class="form-input"
                  placeholder="Brief description..."
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button @click="closeModal" class="btn-secondary">Cancel</button>
              <button
                @click="saveCategory"
                :disabled="!categoryForm.name"
                class="btn-primary"
              >
                {{ editingCategory ? 'Update' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Categorize Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showCategorizeModal" class="modal-overlay" @click.self="showCategorizeModal = false">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Categorize {{ store.selectedFiles.length }} File{{ store.selectedFiles.length !== 1 ? 's' : '' }}
              </h3>
              <button @click="showCategorizeModal = false" class="close-btn">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select a category to assign to the selected files
              </p>

              <div class="categories-grid">
                <button
                  v-for="category in store.categories"
                  :key="category.id"
                  @click="handleCategorize(category.id)"
                  class="category-card"
                >
                  <div class="category-icon-large" :style="{ backgroundColor: category.color + '20' }">
                    <span class="text-2xl" :style="{ color: category.color }">{{ category.icon }}</span>
                  </div>
                  <span class="category-card-name">{{ category.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFileStore } from '@/stores/file'
import type { FileCategory } from '@/types/file'

interface Props {
  totalFiles: number
  selectedCategoryId?: number | null
}

const props = defineProps<Props>()
const emit = defineEmits(['filter-category'])

const store = useFileStore()
const downloading = ref(false)
const showCreateCategory = ref(false)
const showCategorizeModal = ref(false)
const editingCategory = ref<FileCategory | null>(null)

const categoryForm = ref({
  name: '',
  icon: '📁',
  color: '#3B82F6',
  description: ''
})

// Computed
const allSelected = computed(() => {
  return store.files.length > 0 && store.selectedFiles.length === store.files.length
})

// Methods
const toggleSelectAll = () => {
  if (allSelected.value) {
    store.clearSelection()
  } else {
    store.selectAllFiles()
  }
}

const getCategoryFileCount = (categoryId: number) => {
  return store.files.filter(f => f.category_id === categoryId).length
}

const editCategory = (category: FileCategory) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    icon: category.icon,
    color: category.color,
    description: category.description || ''
  }
}

const closeModal = () => {
  showCreateCategory.value = false
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    icon: '📁',
    color: '#3B82F6',
    description: ''
  }
}

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      await store.updateCategory(editingCategory.value.id, categoryForm.value)
    } else {
      await store.createCategory(categoryForm.value)
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save category:', error)
  }
}

const handleDeleteCategory = async (id: number) => {
  if (!confirm('Are you sure you want to delete this category? Files will not be deleted.')) return

  try {
    await store.deleteCategory(id)
  } catch (error) {
    console.error('Failed to delete category:', error)
  }
}

const handleCategorize = async (categoryId: number) => {
  try {
    await store.bulkCategorize(categoryId)
    showCategorizeModal.value = false
  } catch (error) {
    console.error('Failed to categorize files:', error)
  }
}

const handleBulkDownload = async () => {
  downloading.value = true
  try {
    await store.bulkDownload()
  } catch (error) {
    console.error('Failed to download files:', error)
  } finally {
    downloading.value = false
  }
}

const handleBulkDelete = async () => {
  const count = store.selectedFiles.length
  if (!confirm(`Are you sure you want to delete ${count} file${count !== 1 ? 's' : ''}? This cannot be undone.`)) return

  try {
    await store.bulkDelete()
  } catch (error) {
    console.error('Failed to delete files:', error)
  }
}
</script>

<style scoped>
.file-organizer {
  @apply space-y-6;
}

/* Bulk Actions Bar */
.bulk-actions-bar {
  @apply bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between;
}

.selection-info {
  @apply flex items-center gap-3;
}

.checkbox {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.actions {
  @apply flex items-center gap-2;
}

.bulk-btn {
  @apply flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium;
}

/* Categories Section */
.categories-section {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4;
}

.section-header {
  @apply flex items-center justify-between mb-4;
}

.add-category-btn {
  @apply p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors;
}

.categories-list {
  @apply space-y-1;
}

.category-item {
  @apply flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
}

.category-item.active {
  @apply bg-blue-50 dark:bg-blue-900/20;
}

.category-btn {
  @apply flex items-center justify-between flex-1 text-left;
}

.category-info {
  @apply flex items-center gap-2;
}

.category-icon {
  @apply w-8 h-8 rounded flex items-center justify-center;
}

.category-name {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.file-count {
  @apply text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full;
}

.category-actions {
  @apply flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity;
}

.category-item:hover .category-actions {
  @apply opacity-100;
}

.action-icon-btn {
  @apply p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors;
}

/* Modal */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
}

.close-btn {
  @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors;
}

.modal-body {
  @apply p-6 space-y-4;
}

.form-group {
  @apply space-y-1;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white;
}

.color-picker {
  @apply flex items-center gap-2;
}

.color-input {
  @apply w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer;
}

.modal-footer {
  @apply flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors;
}

.categories-grid {
  @apply grid grid-cols-3 gap-3;
}

.category-card {
  @apply flex flex-col items-center gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 rounded-lg transition-colors;
}

.category-icon-large {
  @apply w-16 h-16 rounded-lg flex items-center justify-center;
}

.category-card-name {
  @apply text-sm font-medium text-gray-900 dark:text-white text-center;
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
