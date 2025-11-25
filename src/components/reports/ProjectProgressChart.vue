<template>
  <div class="project-progress-chart card">
    <div class="card-header">
      <h5 class="mb-0">
        <i class="bi bi-pie-chart me-2"></i>
        Project Progress
      </h5>
    </div>
    <div class="card-body">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Chart -->
      <div v-else-if="data" class="chart-container">
        <Doughnut :data="chartData" :options="chartOptions" />
        
        <!-- Stats Grid -->
        <div class="stats-grid mt-4">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="bi bi-list-check"></i>
            </div>
            <div class="stat-info">
              <small class="text-muted">Total Tasks</small>
              <h4>{{ data.total_tasks }}</h4>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="bi bi-check-circle"></i>
            </div>
            <div class="stat-info">
              <small class="text-muted">Completed</small>
              <h4>{{ data.status_breakdown.done }}</h4>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <div class="stat-info">
              <small class="text-muted">Overdue</small>
              <h4>{{ data.overdue_tasks }}</h4>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="bi bi-percent"></i>
            </div>
            <div class="stat-info">
              <small class="text-muted">Completion</small>
              <h4>{{ data.completion_percentage.toFixed(1) }}%</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import type { ProjectProgress } from '@/api/reports'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

// Props
const props = defineProps<{
  data: ProjectProgress | null
  loading?: boolean
  error?: string | null
}>()

// Computed
const chartData = computed<ChartData<'doughnut'>>(() => {
  if (!props.data) {
    return {
      labels: [],
      datasets: []
    }
  }

  return {
    labels: ['To Do', 'In Progress', 'Done', 'Blocked'],
    datasets: [
      {
        data: [
          props.data.status_breakdown.todo,
          props.data.status_breakdown.in_progress,
          props.data.status_breakdown.done,
          props.data.status_breakdown.blocked
        ],
        backgroundColor: [
          '#6B7280', // To Do - Gray
          '#3B82F6', // In Progress - Blue
          '#10B981', // Done - Green
          '#EF4444'  // Blocked - Red
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  }
})

const chartOptions = computed<ChartOptions<'doughnut'>>(() => {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = props.data?.total_tasks || 0
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    }
  }
})
</script>

<style scoped>
.project-progress-chart {
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

.chart-container {
  max-width: 400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.stat-info {
  flex: 1;
}

.stat-info small {
  display: block;
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 0.25rem;
}

.stat-info h4 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #374151;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
