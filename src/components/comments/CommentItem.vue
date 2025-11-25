<template>
  <div class="comment-item card">
    <div class="card-body">
      <!-- Comment Header -->
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div class="d-flex align-items-center">
          <!-- User Avatar -->
          <div class="user-avatar me-2">
            <i class="bi bi-person-circle"></i>
          </div>
          <!-- User Info -->
          <div>
            <h6 class="mb-0">{{ comment.user?.name || 'Unknown User' }}</h6>
            <small class="text-muted">{{ formatDate(comment.created_at) }}</small>
          </div>
        </div>

        <!-- Actions (only for comment owner) -->
        <div v-if="canEdit" class="dropdown">
          <button
            class="btn btn-sm btn-link text-muted"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="bi bi-three-dots-vertical"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="dropdown-item" href="#" @click.prevent="startEdit">
                <i class="bi bi-pencil me-2"></i>Edit
              </a>
            </li>
            <li><hr class="dropdown-divider" /></li>
            <li>
              <a class="dropdown-item text-danger" href="#" @click.prevent="handleDelete">
                <i class="bi bi-trash me-2"></i>Delete
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Comment Content -->
      <div v-if="!isEditing" class="comment-content">
        <p class="mb-0">{{ comment.content }}</p>
      </div>

      <!-- Edit Form -->
      <div v-else class="edit-form">
        <textarea
          v-model="editContent"
          class="form-control mb-2"
          rows="3"
          placeholder="Edit your comment..."
          :disabled="updating"
        ></textarea>
        <div class="d-flex gap-2">
          <button
            class="btn btn-sm btn-primary"
            @click="handleUpdate"
            :disabled="updating || !editContent.trim()"
          >
            <span v-if="updating" class="spinner-border spinner-border-sm me-1"></span>
            {{ updating ? 'Saving...' : 'Save' }}
          </button>
          <button
            class="btn btn-sm btn-secondary"
            @click="cancelEdit"
            :disabled="updating"
          >
            Cancel
          </button>
        </div>
        <div v-if="errorMessage" class="alert alert-danger alert-sm mt-2 mb-0">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Updated indicator -->
      <div v-if="comment.updated_at !== comment.created_at && !isEditing" class="mt-2">
        <small class="text-muted fst-italic">
          <i class="bi bi-pencil-square me-1"></i>Edited
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCommentStore } from '@/stores/comment'
import { useAuthStore } from '@/stores/auth'
import type { Comment } from '@/types/models'

// Props
const props = defineProps<{
  comment: Comment
}>()

// Emits
const emit = defineEmits<{
  'comment-updated': [comment: Comment]
  'comment-deleted': [commentId: number]
}>()

// Stores
const commentStore = useCommentStore()
const authStore = useAuthStore()

// State
const isEditing = ref(false)
const editContent = ref('')
const updating = ref(false)
const errorMessage = ref<string | null>(null)

// Computed
const canEdit = computed(() => {
  return authStore.user?.id === props.comment.user_id
})

// Methods
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const startEdit = () => {
  editContent.value = props.comment.content
  isEditing.value = true
  errorMessage.value = null
}

const cancelEdit = () => {
  isEditing.value = false
  editContent.value = ''
  errorMessage.value = null
}

const handleUpdate = async () => {
  if (!editContent.value.trim()) {
    errorMessage.value = 'Comment cannot be empty'
    return
  }

  updating.value = true
  errorMessage.value = null

  try {
    const updated = await commentStore.updateComment(props.comment.id, {
      content: editContent.value.trim()
    })
    emit('comment-updated', updated)
    isEditing.value = false
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to update comment'
  } finally {
    updating.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this comment?')) {
    return
  }

  try {
    await commentStore.deleteComment(props.comment.id)
    emit('comment-deleted', props.comment.id)
  } catch (error: any) {
    console.error('Failed to delete comment:', error)
    alert(error.response?.data?.message || 'Failed to delete comment')
  }
}
</script>

<style scoped>
.comment-item {
  border-left: 3px solid #3B82F6;
}

.user-avatar i {
  font-size: 2rem;
  color: #6B7280;
}

.comment-content {
  line-height: 1.6;
  color: #374151;
}

.edit-form textarea {
  resize: vertical;
}

.btn-link {
  text-decoration: none;
  padding: 0.25rem 0.5rem;
}

.btn-link:hover {
  background-color: #F3F4F6;
  border-radius: 0.25rem;
}

.dropdown-menu {
  min-width: 150px;
}

.alert-sm {
  padding: 0.5rem;
  font-size: 0.875rem;
}
</style>
