<template>
  <div class="kanban-column">
    <!-- Column Header -->
    <div class="column-header" :class="`bg-${column.color}`">
      <div class="d-flex align-items-center justify-content-between">
        <h6 class="column-title mb-0 text-white">{{ column.title }}</h6>
        <span class="count-badge">{{ tasks.length }}</span>
      </div>
    </div>

    <!-- Tasks Container -->
    <div
      ref="dropZone"
      class="tasks-container"
      :class="{ 'drag-over': isDragOver }"
      @drop="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <KanbanCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @drag-start="handleDragStart"
      />
      
      <!-- Empty State -->
      <div v-if="tasks.length === 0" class="empty-state">
        <i class="bi bi-inbox"></i>
        <p class="mb-0 mt-2">No tasks</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import KanbanCard from './KanbanCard.vue'

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  due_date: string | null
  project?: {
    id: number
    name: string
  }
  assigned_user?: {
    id: number
    name: string
  }
  tags?: Array<{
    id: number
    name: string
    color: string
  }>
}

interface Column {
  status: string
  title: string
  color: string
  count: number
}

interface Props {
  column: Column
  tasks: Task[]
}

interface Emits {
  (e: 'task-moved', payload: { taskId: number; newStatus: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dropZone = ref<HTMLElement | null>(null)
const isDragOver = ref(false)

const handleDragStart = (taskId: number) => {
  // No longer needed - we use dataTransfer
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  // Get taskId from dataTransfer (set in KanbanCard)
  const taskIdString = e.dataTransfer?.getData('taskId')
  if (taskIdString) {
    const taskId = parseInt(taskIdString, 10)
    if (!isNaN(taskId)) {
      emit('task-moved', {
        taskId: taskId,
        newStatus: props.column.status
      })
    }
  }
}
</script>

<style scoped>
.kanban-column {
  flex-shrink: 0;
  width: 280px;
  min-width: 260px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 240px);
  transition: transform 0.2s, box-shadow 0.2s;
}

/* Ensure all columns fit on screen */
@media (min-width: 1400px) {
  .kanban-column {
    width: 300px;
  }
}

@media (max-width: 1199px) {
  .kanban-column {
    width: 260px;
  }
}

.kanban-column:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.column-header {
  padding: 1rem 1.25rem;
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
}

.column-header.bg-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%) !important;
}

.column-header.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.column-header.bg-warning {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%) !important;
}

.column-header.bg-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
}

.column-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.count-badge {
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #374151;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  min-width: 32px;
  text-align: center;
}

.tasks-container {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.tasks-container > * + * {
  margin-top: 0.875rem;
}

.tasks-container.drag-over {
  background-color: rgba(102, 126, 234, 0.08);
  border: 2px dashed #667eea;
  border-radius: 8px;
  margin: 0.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #94a3b8;
}

.empty-state i {
  font-size: 2.5rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.875rem;
  opacity: 0.7;
}

/* Custom scrollbar */
.tasks-container::-webkit-scrollbar {
  width: 6px;
}

.tasks-container::-webkit-scrollbar-track {
  background: transparent;
  margin: 0.5rem 0;
}

.tasks-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.tasks-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}
</style>
