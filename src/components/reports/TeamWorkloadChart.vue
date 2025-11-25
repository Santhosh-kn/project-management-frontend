<template>
  <div class="team-workload-chart card">
    <div class="card-header">
      <h5 class="mb-0">
        <i class="bi bi-people me-2"></i>
        Team Workload
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
      <div v-else-if="data && data.team_members.length > 0" class="chart-container">
        <Bar :data="chartData" :options="chartOptions" />
        
        <!-- Team Stats Table -->
        <div class="team-table mt-4">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Team Member</th>
                <th class="text-center">Total</th>
                <th class="text-center">Completed</th>
                <th class="text-center">In Progress</th>
                <th class="text-center">Completion %</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in data.team_members" :key="member.user_id">
                <td>
                  <div>
                    <strong>{{ member.user_name }}</strong>
                    <small class="text-muted d-block">{{ member.role }}</small>
                  </div>
                </td>
                <td class="text-center">
                  <span class="badge bg-secondary">{{ member.total_tasks }}</span>
                </td>
                <td class="text-center">
                  <span class="badge bg-success">{{ member.completed_tasks }}</span>
                </td>
                <td class="text-center">
                  <span class="badge bg-primary">{{ member.in_progress_tasks }}</span>
                </td>
                <td class="text-center">
                  <div class="progress" style="height: 20px;">
                    <div 
                      class="progress-bar"
                      :class="getProgressBarClass(member.completion_rate)"
                      :style="{ width: member.completion_rate + '%' }"
                    >
                      {{ member.completion_rate.toFixed(0) }}%
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5">
        <i class="bi bi-people text-muted" style="font-size: 3rem;"></i>
        <p class="text-muted mt-3">No team members with assigned tasks</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import type { TeamWorkload } from '@/api/reports'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Props
const props = defineProps<{
  data: TeamWorkload | null
  loading?: boolean
  error?: string | null
}>()

// Computed
const chartData = computed<ChartData<'bar'>>(() => {
  if (!props.data || props.data.team_members.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const members = props.data.team_members
  const labels = members.map(m => m.user_name)

  return {
    labels,
    datasets: [
      {
        label: 'To Do',
        data: members.map(m => m.todo_tasks),
        backgroundColor: '#6B7280'
      },
      {
        label: 'In Progress',
        data: members.map(m => m.in_progress_tasks),
        backgroundColor: '#3B82F6'
      },
      {
        label: 'Completed',
        data: members.map(m => m.completed_tasks),
        backgroundColor: '#10B981'
      },
      {
        label: 'Blocked',
        data: members.map(m => m.blocked_tasks),
        backgroundColor: '#EF4444'
      }
    ]
  }
})

const chartOptions = computed<ChartOptions<'bar'>>(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        }
      },
      y: {
        stacked: true,
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
        callbacks: {
          footer: (tooltipItems) => {
            const memberIndex = tooltipItems[0].dataIndex
            const member = props.data?.team_members[memberIndex]
            if (member) {
              return `Total: ${member.total_tasks} tasks`
            }
            return ''
          }
        }
      }
    }
  }
})

// Methods
const getProgressBarClass = (rate: number): string => {
  if (rate >= 75) return 'bg-success'
  if (rate >= 50) return 'bg-primary'
  if (rate >= 25) return 'bg-warning'
  return 'bg-danger'
}
</script>

<style scoped>
.team-workload-chart {
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
  height: 400px;
}

.team-table {
  overflow-x: auto;
}

.table {
  margin-bottom: 0;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 2px solid #e9ecef;
}

.table td {
  vertical-align: middle;
  font-size: 0.875rem;
}

.progress {
  background-color: #e9ecef;
}

.progress-bar {
  font-size: 0.75rem;
  font-weight: 600;
}

.badge {
  font-size: 0.875rem;
  padding: 0.375rem 0.625rem;
}
</style>
