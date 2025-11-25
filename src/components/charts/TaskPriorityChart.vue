<template>
  <div class="chart-container card">
    <div class="card-body">
      <div class="chart-header mb-3">
        <h6 class="mb-1">Tasks by Priority</h6>
        <p class="text-muted small mb-0">Priority distribution</p>
      </div>
      
      <div class="chart-content">
        <canvas ref="chartCanvas"></canvas>
      </div>

      <!-- Stats -->
      <div class="priority-stats">
        <div class="stat-item stat-high">
          <div class="stat-icon">
            <i class="bi bi-arrow-up-circle-fill"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">High Priority</span>
            <span class="stat-value">{{ data.high }}</span>
          </div>
        </div>

        <div class="stat-item stat-medium">
          <div class="stat-icon">
            <i class="bi bi-dash-circle-fill"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Medium Priority</span>
            <span class="stat-value">{{ data.medium }}</span>
          </div>
        </div>

        <div class="stat-item stat-low">
          <div class="stat-icon">
            <i class="bi bi-arrow-down-circle-fill"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Low Priority</span>
            <span class="stat-value">{{ data.low }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, ChartConfiguration, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  data: {
    high: number
    medium: number
    low: number
  }
}

const props = defineProps<Props>()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const createChart = () => {
  if (!chartCanvas.value) return

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['High', 'Medium', 'Low'],
      datasets: [{
        label: 'Tasks',
        data: [props.data.high, props.data.medium, props.data.low],
        backgroundColor: [
          '#EF4444',
          '#F59E0B',
          '#10B981'
        ],
        borderRadius: 8,
        barThickness: 60
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  }

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(chartCanvas.value, config)
}

watch(() => props.data, () => {
  createChart()
}, { deep: true })

onMounted(() => {
  createChart()
})
</script>

<style scoped>
.chart-container {
  height: 100%;
}

.chart-header h6 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.chart-header p {
  font-size: 0.75rem;
  color: #64748b;
}

.chart-content {
  margin-bottom: 1rem;
  max-height: 220px;
}

.priority-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.stat-item.stat-high {
  background-color: #fef2f2;
}

.stat-item.stat-medium {
  background-color: #fffbeb;
}

.stat-item.stat-low {
  background-color: #f0fdf4;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.stat-high .stat-icon {
  background-color: #fee2e2;
  color: #dc2626;
}

.stat-medium .stat-icon {
  background-color: #fef3c7;
  color: #d97706;
}

.stat-low .stat-icon {
  background-color: #d1fae5;
  color: #059669;
}

.stat-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stat-label {
  font-size: 0.8125rem;
  color: #64748b;
  margin-bottom: 0.125rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}
</style>
