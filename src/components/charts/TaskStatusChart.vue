<template>
  <div class="chart-container card">
    <div class="card-body">
      <div class="chart-header mb-3">
        <h6 class="mb-1">Tasks by Status</h6>
        <p class="text-muted small mb-0">Overview of task distribution</p>
      </div>
      
      <div class="chart-content">
        <canvas ref="chartCanvas"></canvas>
      </div>

      <!-- Legend -->
      <div class="chart-legend">
        <div
          v-for="(item, index) in chartData"
          :key="index"
          class="legend-item"
        >
          <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-value">{{ item.value }}</span>
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
    todo: number
    in_progress: number
    review: number
    done: number
  }
}

const props = defineProps<Props>()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const chartData = ref([
  { label: 'To Do', value: 0, color: '#6B7280' },
  { label: 'In Progress', value: 0, color: '#3B82F6' },
  { label: 'Review', value: 0, color: '#F59E0B' },
  { label: 'Done', value: 0, color: '#10B981' }
])

const createChart = () => {
  if (!chartCanvas.value) return

  // Update chart data
  chartData.value[0].value = props.data.todo
  chartData.value[1].value = props.data.in_progress
  chartData.value[2].value = props.data.review
  chartData.value[3].value = props.data.done

  const config: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: chartData.value.map(item => item.label),
      datasets: [{
        data: chartData.value.map(item => item.value),
        backgroundColor: chartData.value.map(item => item.color),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.parsed
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      },
      cutout: '70%'
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
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  max-height: 250px;
  padding: 1rem 0;
}

.chart-legend {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: 0.8125rem;
  color: #64748b;
  flex: 1;
}

.legend-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}
</style>
