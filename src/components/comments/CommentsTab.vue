<template>
  <div class="comments-tab">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">
        <i class="bi bi-chat-left-text me-2"></i>
        Comments
        <span class="badge bg-primary ms-2">{{ commentStore.commentsCount }}</span>
      </h5>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !commentStore.hasComments" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading comments...</span>
      </div>
      <p class="text-muted mt-2">Loading comments...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="commentStore.error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ commentStore.error }}
    </div>

    <!-- Comments List -->
    <div v-else>
      <!-- Add Comment Form -->
      <AddCommentForm 
        :task-id="taskId"
        :project-id="projectId" 
        @comment-added="handleCommentAdded"
        class="mb-4"
      />

      <!-- Empty State -->
      <div v-if="!commentStore.hasComments && !loading" class="text-center py-5">
        <i class="bi bi-chat-left text-muted" style="font-size: 3rem;"></i>
        <p class="text-muted mt-3 mb-0">No comments yet</p>
        <p class="text-muted small">Be the first to comment on this task</p>
      </div>

      <!-- Comments List -->
      <div v-else class="comments-list">
        <CommentItem
          v-for="comment in commentStore.comments"
          :key="comment.id"
          :comment="comment"
          @comment-updated="handleCommentUpdated"
          @comment-deleted="handleCommentDeleted"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useCommentStore } from '@/stores/comment'
import CommentItem from './CommentItem.vue'
import AddCommentForm from './AddCommentForm.vue'
import type { Comment } from '@/types/models'

// Props
const props = defineProps<{
  taskId: number
  projectId: number
}>()

// Store
const commentStore = useCommentStore()

// State
const loading = ref(false)

// Methods
const loadComments = async () => {
  loading.value = true
  try {
    await commentStore.fetchTaskComments(props.taskId)
  } catch (error) {
    console.error('Failed to load comments:', error)
  } finally {
    loading.value = false
  }
}

const handleCommentAdded = (comment: Comment) => {
  console.log('Comment added:', comment)
  // No need to reload - the store's createComment already added it via unshift()
  // This prevents the race condition where fetch overwrites the newly added comment
}

const handleCommentUpdated = (comment: Comment) => {
  console.log('Comment updated:', comment)
}

const handleCommentDeleted = (commentId: number) => {
  console.log('Comment deleted:', commentId)
}

// Watch for task ID changes
watch(() => props.taskId, () => {
  if (props.taskId) {
    loadComments()
  }
}, { immediate: true })

// Load comments on mount
onMounted(() => {
  if (props.taskId) {
    loadComments()
  }
})
</script>

<style scoped>
.comments-tab {
  padding: 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>
