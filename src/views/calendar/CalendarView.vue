<template>
  <div class="calendar-view">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h2>
          <i class="bi bi-calendar3 me-2"></i>
          Calendar
        </h2>
        <p class="text-muted mb-0">View tasks by due date</p>
      </div>
      
      <div class="header-actions">
        <!-- Project Filter -->
        <select v-model="selectedProjectId" class="form-select" style="width: 250px;">
          <option :value="null">All Projects</option>
          <option 
            v-for="project in projectStore.projects" 
            :key="project.id"
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>

        <!-- Today Button -->
        <button class="btn btn-outline-primary" @click="goToToday">
          <i class="bi bi-calendar-day me-1"></i>
          Today
        </button>
      </div>
    </div>

    <!-- Calendar Navigation -->
    <div class="calendar-nav">
      <button class="btn btn-outline-secondary" @click="previousMonth">
        <i class="bi bi-chevron-left"></i>
      </button>
      
      <h3 class="current-month">
        {{ formatMonthYear(currentDate) }}
      </h3>
      
      <button class="btn btn-outline-secondary" @click="nextMonth">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && tasks.length === 0" class="loading-state">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading calendar...</p>
    </div>

    <!-- Calendar Grid -->
    <div v-else class="calendar-container">
      <!-- Weekday Headers -->
      <div class="calendar-grid">
        <div 
          v-for="day in weekDays" 
          :key="day" 
          class="calendar-header"
        >
          {{ day }}
        </div>

        <!-- Calendar Days -->
        <div
          v-for="date in calendarDays"
          :key="date.dateString"
          class="calendar-day"
          :class="{
            'other-month': !date.isCurrentMonth,
            'today': date.isToday,
            'has-tasks': getTasksForDate(date.dateString).length > 0
          }"
          @click="openDayModal(date)"
        >
          <div class="day-number">
            {{ date.day }}
          </div>
          
          <!-- Tasks for this day -->
          <div class="day-tasks">
            <div
              v-for="task in getTasksForDate(date.dateString).slice(0, 3)"
              :key="task.id"
              class="task-pill"
              :class="[
                `priority-${task.priority}`,
                `status-${task.status}`
              ]"
              @click.stop="openTaskDetail(task)"
            >
              <span class="task-title">{{ task.title }}</span>
            </div>
            
            <!-- More tasks indicator -->
            <div
              v-if="getTasksForDate(date.dateString).length > 3"
              class="more-tasks"
              @click.stop="openDayModal(date)"
            >
              +{{ getTasksForDate(date.dateString).length - 3 }} more
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="calendar-legend">
      <h6>Priority Legend:</h6>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-color priority-low"></span>
          <span>Low</span>
        </div>
        <div class="legend-item">
          <span class="legend-color priority-medium"></span>
          <span>Medium</span>
        </div>
        <div class="legend-item">
          <span class="legend-color priority-high"></span>
          <span>High</span>
        </div>
        <div class="legend-item">
          <span class="legend-color priority-critical"></span>
          <span>Critical</span>
        </div>
      </div>
    </div>

    <!-- Day Modal -->
    <DayTasksModal
      v-if="showDayModal"
      :is-open="showDayModal"
      :date="selectedDate"
      :tasks="selectedDayTasks"
      @close="closeDayModal"
      @task-click="openTaskDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { useProjectStore } from '@/stores/project'
import DayTasksModal from '@/components/calendar/DayTasksModal.vue'
import type { Task } from '@/types/models'

// Stores
const taskStore = useTaskStore()
const projectStore = useProjectStore()
const router = useRouter()

// State
const loading = ref(false)
const currentDate = ref(new Date())
const selectedProjectId = ref<number | null>(null)
const showDayModal = ref(false)
const selectedDate = ref<any>(null)

// Constants
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Computed
const tasks = computed(() => taskStore.tasks)

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // First day of the month
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay()
  
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  
  // Days from previous month
  const prevMonthDays = firstDayOfWeek
  const prevMonth = new Date(year, month, 0)
  const prevMonthLastDay = prevMonth.getDate()
  
  const days = []
  
  // Previous month days
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(year, month - 1, day)
    days.push({
      day,
      date,
      dateString: formatDateString(date),
      isCurrentMonth: false,
      isToday: isToday(date)
    })
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    days.push({
      day,
      date,
      dateString: formatDateString(date),
      isCurrentMonth: true,
      isToday: isToday(date)
    })
  }
  
  // Next month days to fill grid
  const remainingDays = 42 - days.length // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      day,
      date,
      dateString: formatDateString(date),
      isCurrentMonth: false,
      isToday: isToday(date)
    })
  }
  
  return days
})

const selectedDayTasks = computed(() => {
  if (!selectedDate.value) return []
  return getTasksForDate(selectedDate.value.dateString)
})

// Methods
const formatDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
}

const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const getTasksForDate = (dateString: string): Task[] => {
  return tasks.value.filter(task => {
    if (!task.due_date) return false
    
    // Handle both 'T' and space as date/time separator
    const taskDate = task.due_date.split(/[T ]/)[0]
    const matchesDate = taskDate === dateString
    const matchesProject = selectedProjectId.value 
      ? task.project_id === selectedProjectId.value 
      : true
    
    return matchesDate && matchesProject
  })
}

const loadTasks = async () => {
  loading.value = true
  try {
    // Get first and last day of current month view
    const firstCalendarDay = calendarDays.value[0].date
    const lastCalendarDay = calendarDays.value[calendarDays.value.length - 1].date
    
    const filters: any = {
      due_date_from: formatDateString(firstCalendarDay),
      due_date_to: formatDateString(lastCalendarDay),
      per_page: 1000  // Load all tasks in the date range
    }
    
    if (selectedProjectId.value) {
      filters.project_id = selectedProjectId.value
    }
    
    await taskStore.fetchTasks(filters)
  } catch (error) {
    console.error('Failed to load tasks:', error)
  } finally {
    loading.value = false
  }
}

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
  loadTasks()
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
  loadTasks()
}

const goToToday = () => {
  currentDate.value = new Date()
  loadTasks()
}

const openDayModal = (date: any) => {
  if (getTasksForDate(date.dateString).length > 0) {
    selectedDate.value = date
    showDayModal.value = true
  }
}

const closeDayModal = () => {
  showDayModal.value = false
  selectedDate.value = null
}

const openTaskDetail = (task: Task) => {
  // Navigate to task details page
  router.push(`/tasks`)
  showDayModal.value = false
}

// Watch for project filter changes
watch(selectedProjectId, () => {
  loadTasks()
})

// Lifecycle
onMounted(async () => {
  // Load projects if not already loaded
  if (projectStore.projects.length === 0) {
    await projectStore.fetchProjects()
  }
  
  // Load tasks for current month
  await loadTasks()
})
</script>

<style scoped>
.calendar-view {
  padding: 2rem;
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.calendar-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.current-month {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  min-width: 200px;
  text-align: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
}

.calendar-container {
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e5e7eb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.calendar-header {
  background: #f3f4f6;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.calendar-day {
  background: #fff;
  min-height: 120px;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  overflow: hidden;
}

.calendar-day:hover {
  background: #f9fafb;
}

.calendar-day.other-month {
  background: #f9fafb;
  opacity: 0.6;
}

.calendar-day.today {
  background: #eff6ff;
  border: 2px solid #3b82f6;
}

.calendar-day.has-tasks {
  cursor: pointer;
}

.day-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.calendar-day.today .day-number {
  color: #3b82f6;
  font-weight: 700;
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.task-pill {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: transform 0.2s;
  border-left: 3px solid;
}

.task-pill:hover {
  transform: translateX(2px);
}

.task-pill.priority-low {
  background: #f3f4f6;
  border-left-color: #6b7280;
  color: #374151;
}

.task-pill.priority-medium {
  background: #dbeafe;
  border-left-color: #3b82f6;
  color: #1e40af;
}

.task-pill.priority-high {
  background: #fef3c7;
  border-left-color: #f59e0b;
  color: #92400e;
}

.task-pill.priority-critical {
  background: #fee2e2;
  border-left-color: #ef4444;
  color: #991b1b;
}

.task-title {
  font-weight: 500;
}

.more-tasks {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  cursor: pointer;
  text-align: center;
  background: #f3f4f6;
  border-radius: 0.25rem;
}

.more-tasks:hover {
  background: #e5e7eb;
}

.calendar-legend {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.calendar-legend h6 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.legend-items {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 0.25rem;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.legend-color.priority-low {
  background: #6b7280;
}

.legend-color.priority-medium {
  background: #3b82f6;
}

.legend-color.priority-high {
  background: #f59e0b;
}

.legend-color.priority-critical {
  background: #ef4444;
}

@media (max-width: 1200px) {
  .calendar-day {
    min-height: 100px;
  }
  
  .task-pill {
    font-size: 0.7rem;
  }
}

@media (max-width: 768px) {
  .calendar-view {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .header-actions .form-select {
    width: 100% !important;
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 0.25rem;
  }
  
  .day-number {
    font-size: 0.75rem;
  }
  
  .task-pill {
    font-size: 0.65rem;
    padding: 0.2rem 0.4rem;
  }
  
  .calendar-header {
    font-size: 0.7rem;
    padding: 0.5rem;
  }
}
</style>
