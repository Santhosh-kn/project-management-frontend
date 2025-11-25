<template>
  <nav class="navbar">
    <div class="navbar-left">
      <button class="btn-menu" @click="toggleSidebar">
        <i class="bi bi-list"></i>
      </button>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>

    <div class="navbar-right">
      <!-- Search -->
      <div class="search-box d-none d-md-block">
        <i class="bi bi-search"></i>
        <input 
          type="text" 
          class="form-control" 
          placeholder="Search..." 
          v-model="searchQuery"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- Notification Center -->
      <NotificationCenter />

      <!-- User Menu -->
      <div class="dropdown">
        <button class="btn-profile" type="button" data-bs-toggle="dropdown">
          <div class="profile-avatar">
            <i class="bi bi-person-circle"></i>
          </div>
          <span class="profile-name d-none d-md-inline">{{ userName }}</span>
          <i class="bi bi-chevron-down small-icon"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <router-link to="/profile" class="dropdown-item">
              <i class="bi bi-person me-2"></i>Profile
            </router-link>
          </li>
          <li>
            <router-link to="/settings" class="dropdown-item">
              <i class="bi bi-gear me-2"></i>Settings
            </router-link>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <button class="dropdown-item text-danger" @click="handleLogout">
              <i class="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NotificationCenter from '@/components/notifications/NotificationCenter.vue'

const emit = defineEmits(['toggle-sidebar'])
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const searchQuery = ref('')

const userName = computed(() => authStore.userName)
const pageTitle = computed(() => {
  return route.meta.title as string || route.name?.toString().charAt(0).toUpperCase() + route.name?.toString().slice(1) || 'Dashboard'
})

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value } })
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  right: 0;
  height: var(--navbar-height);
  background-color: var(--navbar-bg);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  z-index: 999;
  transition: left 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-menu {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
}

.btn-menu:hover {
  color: #334155;
  background: #f1f5f9;
}

.btn-menu i {
  font-size: 1.25rem;
}

.page-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-box i {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.875rem;
  pointer-events: none;
  z-index: 1;
}

.search-box input {
  padding-left: 2.75rem !important;
  padding-right: 0.75rem !important;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  height: 36px;
  font-size: 0.875rem;
  width: 100%;
}

.search-box input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.15rem rgba(13, 110, 253, 0.1);
  outline: none;
}

.search-box input::placeholder {
  color: #94a3b8;
}

.btn-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.btn-profile:hover {
  background-color: #f1f5f9;
}

.profile-avatar {
  color: var(--primary-color);
  display: flex;
  align-items: center;
}

.profile-avatar i {
  font-size: 1.5rem;
}

.profile-name {
  font-weight: 500;
  color: #1e293b;
  font-size: 0.875rem;
}

.small-icon {
  font-size: 0.75rem;
}

.dropdown-menu {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem;
  min-width: 200px;
  font-size: 0.875rem;
}

.dropdown-item {
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
}

.dropdown-item i {
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    left: 0;
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 1rem;
  }
}
</style>
