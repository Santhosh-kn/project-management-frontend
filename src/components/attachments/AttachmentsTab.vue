<template>
  <div class="attachments-tab">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">
        <i class="bi bi-paperclip me-2"></i>
        Attachments
        <span class="badge bg-primary ms-2">{{ attachmentStore.attachmentsCount }}</span>
      </h5>
      <div v-if="attachmentStore.hasAttachments" class="text-muted small">
        Total size: {{ attachmentStore.formattedTotalSize }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !attachmentStore.hasAttachments" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading attachments...</span>
      </div>
      <p class="text-muted mt-2">Loading attachments...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="attachmentStore.error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ attachmentStore.error }}
    </div>

    <!-- Attachments Content -->
    <div v-else>
      <!-- Upload Form -->
      <UploadAttachmentForm 
        :task-id="taskId" 
        @attachment-uploaded="handleAttachmentUploaded"
        class="mb-4"
      />

      <!-- Empty State -->
      <div v-if="!attachmentStore.hasAttachments && !loading" class="text-center py-5">
        <i class="bi bi-cloud-upload text-muted" style="font-size: 3rem;"></i>
        <p class="text-muted mt-3 mb-0">No attachments yet</p>
        <p class="text-muted small">Upload files to attach them to this task</p>
      </div>

      <!-- Attachments Grid -->
      <div v-else class="attachments-grid">
        <AttachmentItem
          v-for="attachment in attachmentStore.attachments"
          :key="attachment.id"
          :attachment="attachment"
          @attachment-deleted="handleAttachmentDeleted"
          @attachment-downloaded="handleAttachmentDownloaded"
          @attachment-preview="handleAttachmentPreview"
        />
      </div>
    </div>

    <!-- File Preview Modal -->
    <FilePreviewModal
      ref="previewModalRef"
      modal-id="attachmentPreviewModal"
      :attachment="previewAttachment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAttachmentStore } from '@/stores/attachment'
import AttachmentItem from './AttachmentItem.vue'
import UploadAttachmentForm from './UploadAttachmentForm.vue'
import FilePreviewModal from './FilePreviewModal.vue'
import type { Attachment } from '@/types/models'

// Props
const props = defineProps<{
  taskId: number
}>()

// Store
const attachmentStore = useAttachmentStore()

// State
const loading = ref(false)
const previewAttachment = ref<Attachment | null>(null)
const previewModalRef = ref<InstanceType<typeof FilePreviewModal> | null>(null)

// Methods
const loadAttachments = async () => {
  loading.value = true
  try {
    await attachmentStore.fetchTaskAttachments(props.taskId)
  } catch (error) {
    console.error('Failed to load attachments:', error)
  } finally {
    loading.value = false
  }
}

const handleAttachmentUploaded = async (attachment: Attachment) => {
  console.log('Attachment uploaded:', attachment)
  // Reload attachments to ensure we have the latest data with proper relationships
  await loadAttachments()
}

const handleAttachmentDeleted = (attachmentId: number) => {
  console.log('Attachment deleted:', attachmentId)
}

const handleAttachmentDownloaded = (attachment: Attachment) => {
  console.log('Attachment downloaded:', attachment)
}

const handleAttachmentPreview = (attachment: Attachment) => {
  previewAttachment.value = attachment
  // Open modal using Bootstrap's API
  const modalElement = document.getElementById('attachmentPreviewModal')
  if (modalElement) {
    const modal = new (window as any).bootstrap.Modal(modalElement)
    modal.show()
  }
}

// Watch for task ID changes
watch(() => props.taskId, () => {
  if (props.taskId) {
    loadAttachments()
  }
}, { immediate: true })

// Load attachments on mount
onMounted(() => {
  if (props.taskId) {
    loadAttachments()
  }
})
</script>

<style scoped>
.attachments-tab {
  padding: 0;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

@media (max-width: 768px) {
  .attachments-grid {
    grid-template-columns: 1fr;
  }
}
</style>
