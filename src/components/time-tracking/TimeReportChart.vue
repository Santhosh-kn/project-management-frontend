<template>
  <div class="time-report-chart">
    <div class="chart-header">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Time Report</h3>
      <select v-model="selectedView" class="view-select">
        <option value="project">By Project</option>
        <option value="task">By Task</option>
        <option value="user">By User</option>
      </select>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="chart-content">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <div class="report-stats">
      <div class="stat-card">
        <div class="stat-label">Total Hours</div>
        <div class="stat-value">{{ formatHours(report?.total_hours || 0) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Billable Hours</div>
        <div class="stat-value text-green-600 dark:text-green-400">{{ formatHours(report?.billable_hours || 0) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Amount</div>
        <div class="stat-value text-blue-600 dark:text-blue-400">${{ (report?.total_amount || 0).toFixed(2) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Chart, ChartConfiguration, registerables } from 'chart.js'
import type { TimeReport } from '@/types/timeTracking'

Chart.register(...registerables)

interface Props {
  report: TimeReport | null
  loading?: boolean
}

const props = defineProps<Props>()

const selectedView = ref<'project' | 'task' | 'user'>('project')
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const chartData = computed(() => {
  if (!props.report) return { labels: [], data: [] }

  let data: { label: string; hours: number; billable: number }[] = []

  if (selectedView.value === 'project' && props.report.by_project) {
    data = props.report.by_project.map(p => ({
      label: p.project_name,
      hours: p.hours,
      billable: p.billable_hours
    }))
  } else if (selectedView.value === 'task' && props.report.by_task) {
    data = props.report.by_task.map(t => ({
      label: t.task_title,
      hours: t.hours,
      billable: t.billable_hours
    })).slice(0, 10) // Top 10 tasks
  } else if (selectedView.value === 'user' && props.report.by_user) {
    data = props.report.by_user.map(u => ({
      label: u.user_name,
      hours: u.hours,
      billable: u.billable_hours
    }))
  }

  return {
    labels: data.map(d => d.label),
    totalHours: data.map(d => d.hours / 3600),
    billableHours: data.map(d => d.billable / 3600)
  }
})

const createChart = () => {
  if (!chartCanvas.value || !chartData.value.labels.length) return

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: chartData.value.labels,
      datasets: [
        {
          label: 'Total Hours',
          data: chartData.value.totalHours,
          backgroundColor: '#3B82F6',
          borderRadius: 6
        },
        {
          label: 'Billable Hours',
          data: chartData.value.billableHours,
          backgroundColor: '#10B981',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}h`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value}h`
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

const formatHours = (seconds: number): string => {
  const hours = (seconds / 3600).toFixed(1)
  return `${hours}h`
}

watch([() => props.report, selectedView], () => {
  createChart()
}, { deep: true })

onMounted(() => {
  createChart()
})
</script>

<style scoped>
.time-report-chart { @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6; }
.chart-header { @apply flex items-center justify-between mb-6; }
.view-select { @apply px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white; }
.loading-state { @apply flex justify-center py-12; }
.chart-content { @apply mb-6; height: 300px; }
.report-stats { @apply grid grid-cols-3 gap-4; }
.stat-card { @apply p-4 bg-gray-50 dark:bg-gray-700 rounded-lg; }
.stat-label { @apply text-sm text-gray-600 dark:text-gray-400 mb-1; }
.stat-value { @apply text-2xl font-bold text-gray-900 dark:text-white; }
</style>
