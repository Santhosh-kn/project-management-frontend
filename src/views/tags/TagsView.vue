<template>
  <div class="tags-view container-fluid py-4">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col">
          <h2>
            <i class="bi bi-tags me-2"></i>
            Tags Management
          </h2>
          <p class="text-muted mb-0">Organize your projects and tasks with tags</p>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="bi bi-plus-lg me-2"></i>
            Create Tag
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="tagStore.loading && !tagStore.hasTags" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading tags...</span>
      </div>
      <p class="text-muted mt-2">Loading tags...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="tagStore.error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ tagStore.error }}
    </div>

    <!-- Tags Grid -->
    <div v-else-if="tagStore.hasTags" class="tags-grid">
      <div
        v-for="tag in tagStore.tags"
        :key="tag.id"
        class="tag-card card"
      >
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="tag-color-preview" :style="{ backgroundColor: tag.color }"></div>
            <div class="dropdown">
              <button
                class="btn btn-sm btn-link text-muted"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <button class="dropdown-item" @click="editTag(tag)">
                    <i class="bi bi-pencil me-2"></i>Edit
                  </button>
                </li>
                <li>
                  <button class="dropdown-item text-danger" @click="deleteTag(tag.id)">
                    <i class="bi bi-trash me-2"></i>Delete
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <h5 class="tag-name">{{ tag.name }}</h5>
          <small class="text-muted">
            Created {{ formatDate(tag.created_at) }}
          </small>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5">
      <i class="bi bi-tags text-muted" style="font-size: 4rem;"></i>
      <h4 class="mt-3">No tags yet</h4>
      <p class="text-muted">Create tags to organize your projects and tasks</p>
      <button class="btn btn-primary mt-3" @click="openCreateModal">
        <i class="bi bi-plus-lg me-2"></i>
        Create Your First Tag
      </button>
    </div>

    <!-- Create/Edit Tag Modal -->
    <div class="modal fade" id="tagModal" tabindex="-1" ref="modalElement">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingTag ? 'Edit Tag' : 'Create Tag' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Tag Name</label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="form-control"
                  required
                  placeholder="Enter tag name"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Color</label>
                <div class="d-flex gap-2 align-items-center">
                  <input
                    v-model="formData.color"
                    type="color"
                    class="form-control form-control-color"
                    style="width: 60px;"
                  />
                  <input
                    v-model="formData.color"
                    type="text"
                    class="form-control"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div v-if="modalError" class="alert alert-danger">
                {{ modalError }}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? 'Saving...' : 'Save Tag' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { useTagStore } from '@/stores/tag'
import type { Tag } from '@/api/tags'

const tagStore = useTagStore()

// State
const modalElement = ref<HTMLElement | null>(null)
let modalInstance: Modal | null = null
const editingTag = ref<Tag | null>(null)
const submitting = ref(false)
const modalError = ref<string | null>(null)
const formData = reactive({
  name: '',
  color: '#3B82F6'
})

// Methods
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const openCreateModal = () => {
  editingTag.value = null
  formData.name = ''
  formData.color = '#3B82F6'
  modalError.value = null
  
  if (modalElement.value && !modalInstance) {
    modalInstance = new Modal(modalElement.value)
  }
  modalInstance?.show()
}

const editTag = (tag: Tag) => {
  editingTag.value = tag
  formData.name = tag.name
  formData.color = tag.color
  modalError.value = null
  
  if (modalElement.value && !modalInstance) {
    modalInstance = new Modal(modalElement.value)
  }
  modalInstance?.show()
}

const handleSubmit = async () => {
  submitting.value = true
  modalError.value = null

  try {
    if (editingTag.value) {
      await tagStore.updateTag(editingTag.value.id, formData)
    } else {
      await tagStore.createTag(formData)
    }

    modalInstance?.hide()
  } catch (error: any) {
    modalError.value = error.response?.data?.message || 'Failed to save tag'
  } finally {
    submitting.value = false
  }
}

const deleteTag = async (id: number) => {
  if (!confirm('Are you sure you want to delete this tag?')) {
    return
  }

  try {
    await tagStore.deleteTag(id)
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to delete tag')
  }
}

// Lifecycle
onMounted(() => {
  tagStore.fetchTags()
})
</script>

<style scoped>
.tags-view {
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
}

.page-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tag-card {
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.tag-card:hover {
  border-color: #3B82F6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.tag-color-preview {
  width: 50px;
  height: 50px;
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
}

.tag-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.btn-primary {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.btn-primary:hover {
  background-color: #2563EB;
  border-color: #2563EB;
}
</style>
