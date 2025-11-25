<template>
  <div class="add-comment-form card">
    <div class="card-body">
      <form @submit.prevent="handleSubmit">
        <!-- Comment Input -->
        <div class="mb-3">
          <label for="commentContent" class="form-label">
            <i class="bi bi-chat-left-text me-1"></i>
            Add a comment
          </label>
          <textarea
            id="commentContent"
            ref="textareaRef"
            v-model="commentContent"
            class="form-control"
            :class="{ 'is-invalid': errorMessage }"
            rows="3"
            placeholder="Write your comment here... (Type @ to mention someone)"
            :disabled="submitting"
            @input="handleInput"
            @keydown.meta.enter="handleSubmit"
            @keydown.ctrl.enter="handleSubmit"
          ></textarea>
          <div v-if="errorMessage" class="invalid-feedback">
            {{ errorMessage }}
          </div>
          <small class="text-muted">
            Press Ctrl+Enter (Cmd+Enter on Mac) to submit
          </small>
        </div>

        <!-- Actions -->
        <div class="d-flex justify-content-between align-items-center">
          <div class="text-muted small">
            <i class="bi bi-info-circle me-1"></i>
            {{ commentContent.length }} characters
          </div>
          <div class="d-flex gap-2">
            <button
              v-if="commentContent.trim()"
              type="button"
              class="btn btn-sm btn-secondary"
              @click="handleClear"
              :disabled="submitting"
            >
              Clear
            </button>
            <button
              type="submit"
              class="btn btn-sm btn-primary"
              :disabled="submitting || !isValid"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-send me-1"></i>
              {{ submitting ? 'Posting...' : 'Post Comment' }}
            </button>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="alert alert-success alert-sm mt-3 mb-0">
          <i class="bi bi-check-circle-fill me-2"></i>
          {{ successMessage }}
        </div>
      </form>
    </div>

    <!-- Mention Autocomplete -->
    <MentionAutocomplete
      :show="showMentions"
      :members="members"
      :loading="loadingMembers"
      :query="mentionQuery"
      :position="mentionPosition"
      @select="selectMember"
      @close="closeMentions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCommentStore } from '@/stores/comment'
import * as projectsApi from '@/api/projects'
import MentionAutocomplete from '../mentions/MentionAutocomplete.vue'
import type { Comment } from '@/types/models'
import type { Member } from '../mentions/MentionAutocomplete.vue'

// Props
const props = defineProps<{
  taskId: number
  projectId: number
  projectMembers?: Member[] // Add this prop
}>()

// Emits
const emit = defineEmits<{
  'comment-added': [comment: Comment]
}>()

// Stores
const commentStore = useCommentStore()

// State
const commentContent = ref('')
const submitting = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Mention autocomplete state
const showMentions = ref(false)
const mentionQuery = ref('')
const mentionPosition = ref({ top: 0, left: 0 })
const members = ref<Member[]>([])
const loadingMembers = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const cursorPosition = ref(0)

// Computed
const isValid = computed(() => {
  return commentContent.value.trim().length > 0
})

// Methods
const handleClear = () => {
  commentContent.value = ''
  errorMessage.value = null
  successMessage.value = null
}

const handleInput = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  const content = textarea.value
  const position = textarea.selectionStart
  cursorPosition.value = position

  // Check if user is typing @
  const textBeforeCursor = content.substring(0, position)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')
  
  if (lastAtIndex !== -1) {
    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
    // Check if there's no space after @
    if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
      mentionQuery.value = textAfterAt
      showMentions.value = true
      updateMentionPosition(textarea, lastAtIndex)
      return
    }
  }
  
  // Hide mentions if @ not found or space after
  showMentions.value = false
}

const updateMentionPosition = (textarea: HTMLTextAreaElement, atIndex: number) => {
  // Get textarea position
  const rect = textarea.getBoundingClientRect()
  
  // Calculate line height
  const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight)
  const textBeforeAt = textarea.value.substring(0, atIndex)
  const lines = textBeforeAt.split('\n').length
  
  // Position dropdown below textarea for simplicity
  mentionPosition.value = {
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX
  }
}

const selectMember = (member: Member) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const content = commentContent.value
  const position = cursorPosition.value
  
  // Find @ position
  const textBeforeCursor = content.substring(0, position)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')
  
  if (lastAtIndex !== -1) {
    // Replace @query with @[Name](id)
    const beforeMention = content.substring(0, lastAtIndex)
    const afterMention = content.substring(position)
    const mentionText = `@[${member.name}](${member.id})`
    
    commentContent.value = beforeMention + mentionText + afterMention
    
    // Move cursor after mention
    const newPosition = lastAtIndex + mentionText.length
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }
  
  showMentions.value = false
}

const closeMentions = () => {
  showMentions.value = false
}

const fetchMembers = async () => {
  // If members passed as prop, use them
  if (props.projectMembers && props.projectMembers.length > 0) {
    members.value = props.projectMembers
    return
  }
  
  // Otherwise fetch from API
  loadingMembers.value = true
  try {
    const response = await projectsApi.getProjectMembers(props.projectId)
    const memberData = response.data || []
    members.value = memberData.map((m: any) => ({
      id: m.user_id || m.id,
      name: m.user?.name || m.name || 'Unknown',
      email: m.user?.email || m.email || ''
    }))
  } catch (error) {
    console.error('Failed to fetch members:', error)
    members.value = []
  } finally {
    loadingMembers.value = false
  }
}

const handleSubmit = async () => {
  if (!isValid.value) {
    errorMessage.value = 'Please enter a comment'
    return
  }

  submitting.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    // Pass taskId and content string directly
    const newComment = await commentStore.createComment(
      props.taskId,
      commentContent.value.trim()
    )

    emit('comment-added', newComment)
    successMessage.value = 'Comment posted successfully!'
    
    // Clear form
    commentContent.value = ''
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Failed to post comment. Please try again.'
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchMembers()
})
</script>

<style scoped>
.add-comment-form {
  border: 2px dashed #E5E7EB;
  background-color: #F9FAFB;
}

.add-comment-form:hover {
  border-color: #3B82F6;
  background-color: #EFF6FF;
}

.form-control:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.btn-primary {
  background-color: #3B82F6;
  border-color: #3B82F6;
}

.btn-primary:hover {
  background-color: #2563EB;
  border-color: #2563EB;
}

.btn-primary:disabled {
  background-color: #93C5FD;
  border-color: #93C5FD;
}

.alert-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.invalid-feedback {
  display: block;
}
</style>
