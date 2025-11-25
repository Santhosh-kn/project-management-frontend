<template>
  <aside class="sidebar" :class="{ 'collapsed': collapsed }">
    <div class="sidebar-header">
      <div class="brand">
        <i class="bi bi-kanban" v-if="!collapsed"></i>
        <span v-if="!collapsed" class="brand-text">{{ appName }}</span>
      </div>
      <button class="btn-collapse d-lg-none" @click="toggleSidebar">
        <i class="bi bi-x"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link to="/dashboard" class="nav-link" active-class="active">
            <i class="bi bi-speedometer2"></i>
            <span v-if="!collapsed">Dashboard</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/projects" class="nav-link" active-class="active">
            <i class="bi bi-folder"></i>
            <span v-if="!collapsed">Projects</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/tasks" class="nav-link" active-class="active">
            <i class="bi bi-check2-square"></i>
            <span v-if="!collapsed">Tasks</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/kanban" class="nav-link" active-class="active">
            <i class="bi bi-kanban"></i>
            <span v-if="!collapsed">Kanban Board</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/calendar" class="nav-link" active-class="active">
            <i class="bi bi-calendar3"></i>
            <span v-if="!collapsed">Calendar</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/tags" class="nav-link" active-class="active">
            <i class="bi bi-tags"></i>
            <span v-if="!collapsed">Tags</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/reports" class="nav-link" active-class="active">
            <i class="bi bi-bar-chart"></i>
            <span v-if="!collapsed">Reports</span>
          </router-link>
        </li>

        <!-- Admin Section -->
        <li v-if="isAdmin && !collapsed" class="nav-divider">
          <span>Admin</span>
        </li>
        
        <li v-if="isAdmin" class="nav-item">
          <router-link to="/admin/users" class="nav-link" active-class="active">
            <i class="bi bi-people"></i>
            <span v-if="!collapsed">Users</span>
          </router-link>
        </li>
      </ul>

      <div class="sidebar-footer" v-if="!collapsed">
        <div class="user-info">
          <div class="user-avatar">
            <i class="bi bi-person-circle"></i>
          </div>
          <div class="user-details" v-if="!collapsed">
            <div class="user-name">{{ userName }}</div>
            <div class="user-role text-muted">{{ userRole }}</div>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const appName = import.meta.env.VITE_APP_NAME || 'Tool'
const collapsed = ref(false)
const authStore = useAuthStore()

const emit = defineEmits<{
  toggle: [collapsed: boolean]
}>()

const userName = computed(() => authStore.userName)
const userRole = computed(() => authStore.user?.role || 'Member')
const isAdmin = computed(() => authStore.user?.role === 'admin')

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
  emit('toggle', collapsed.value)
}

defineExpose({
  toggleSidebar,
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--navbar-height);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
}

.brand i {
  font-size: 1.25rem;
}

.brand-text {
  white-space: nowrap;
}

.btn-collapse {
  background: none;
  border: none;
  color: var(--sidebar-text);
  cursor: pointer;
  padding: 0.25rem;
}

.btn-collapse:hover {
  color: white;
}

.btn-collapse i {
  font-size: 1.25rem;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-divider {
  padding: 1rem 1rem 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  color: var(--sidebar-text);
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  font-size: 0.875rem;
}

.nav-link:hover {
  background-color: var(--sidebar-hover);
  color: white;
}

.nav-link.active {
  background-color: var(--sidebar-hover);
  color: white;
  border-left-color: var(--primary-color);
}

.nav-link i {
  font-size: 1.125rem;
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  color: white;
}

.user-avatar i {
  font-size: 1.75rem;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
}

.user-role {
  font-size: 0.75rem;
  text-transform: capitalize;
  color: rgba(255, 255, 255, 0.7);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.show {
    transform: translateX(0);
  }
}
</style>
