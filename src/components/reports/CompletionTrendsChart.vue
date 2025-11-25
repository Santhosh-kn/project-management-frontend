<template>
  <div class="completion-trends-chart card">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-graph-up me-2"></i>
          Task Completion Trends
        </h5>
        <div class="btn-group btn-group-sm" role="group">
          <button 
            type="button" 
            class="btn"
            :class="{ 'btn-primary': days === 7, 'btn-outline-primary': days !== 7 }"
            @click="changePeriod(7)"
          >
            7 Days
          </button>
          <button 
            type="button" 
            class="btn"
            :class="{ 'btn-primary': days === 30, 'btn-outline-primary': days !== 30 }"
            @click="changePeriod(30)"
          >
            30 Days
          </button>
          <button 
            type="button" 
            class="btn"
            :class="{ 'btn-primary': days === 90, 'btn-outline-primary': days !== 90 }"
            @click="changePeriod(90)"
          >
            90 Days
          </button>
        </div>
      </div>
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
        <Line :data="chartData" :options="chartOptions" />
        
        <!-- Summary Stats -->
        <div class="summary-stats mt-4">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="stat-box">
                <div class="stat-icon bg-success">
                  <i class="bi bi-check-circle"></i>
                </div>
                <div class="stat-content">
                  <small class="text-muted">Total Completed</small>
                  <h4>{{ data.summary.total_completed }}</h4>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-box">
                <div class="stat-icon bg-primary">
                  <i class="bi bi-plus-circle"></i>
                </div>
                <div class="stat-content">
                  <small class="text-muted">Total Created</small>
                  <h4>{{ data.summary.total_created }}</h4>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-box">
                <div class="stat-icon bg-info">
                  <i class="bi bi-speedometer2"></i>
                </div>
                <div class="stat-content">
                  <small class="text-muted">Avg Per Day</small>
                  <h4>{{ data.summary.avg_completed_per_day.toFixed(1) }}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5">
        <i class="bi bi-graph-up text-muted" style="font-size: 3rem;"></i>
        <p class="text-muted mt-3">No data available for selected period</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import type { CompletionTrends } from '@/api/reports'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Props
const props = defineProps<{
  data: CompletionTrends | null
  loading?: boolean
  error?: string | null
}>()

// Emits
const emit = defineEmits<{
  'change-period': [days: number]
}>()

// State
const days = ref(30)

// Computed
const chartData = computed<ChartData<'line'>>(() => {
  if (!props.data || props.data.trends.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const trends = props.data.trends
  const labels = trends.map(t => {
    const date = new Date(t.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  return {
    labels,
    datasets: [
      {
        label: 'Completed',
        data: trends.map(t => t.completed),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5
      },
      {
        label: 'Created',
        data: trends.map(t => t.created),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  }
})

const chartOptions = computed<ChartOptions<'line'>>(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex
            const trend = props.data?.trends[index]
            if (trend) {
              const date = new Date(trend.date)
              return date.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            }
            return ''
          }
        }
      }
    }
  }
})

// Methods
const changePeriod = (newDays: number) => {
  days.value = newDays
  emit('change-period', newDays)
}
</script>

<style scoped>
.completion-trends-chart {
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
  height: 350px;
}

.btn-group-sm .btn {
  font-size: 0.8125rem;
  padding: 0.25rem 0.75rem;
}

.summary-stats {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.stat-box {
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
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-content small {
  display: block;
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 0.25rem;
}

.stat-content h4 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #374151;
}
</style>
