<template>
  <nav class="navbar">
    <div class="navbar-left">
      <button class="btn btn-link hamburger" @click="$emit('toggle-sidebar')">
        <i class="bi bi-list fs-4"></i>
      </button>
      <h5 class="mb-0 page-title">{{ pageTitle }}</h5>
    </div>

    <div class="navbar-right">
      <!-- Notification Center -->
      <NotificationCenter />

      <!-- User Menu -->
      <div class="dropdown">
        <button class="btn btn-link user-menu dropdown-toggle" data-bs-toggle="dropdown">
          <div class="user-avatar">
            <i class="bi bi-person-circle fs-4"></i>
          </div>
          <span class="user-name">{{ user?.name }}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <router-link class="dropdown-item" to="/profile">
              <i class="bi bi-person me-2"></i>Profile
            </router-link>
          </li>
          <li>
            <router-link class="dropdown-item" to="/settings">
              <i class="bi bi-gear me-2"></i>Settings
            </router-link>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
              <i class="bi bi-box-arrow-right me-2"></i>Logout
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NotificationCenter from '@/components/notifications/NotificationCenter.vue'

defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

const pageTitle = computed(() => {
  const name = route.name as string
  return name || 'Dashboard'
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  height: var(--navbar-height);
  background: #ffffff;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hamburger {
  padding: 8px;
  color: var(--text-dark);
}

.page-title {
  color: var(--text-dark);
  font-weight: 600;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  color: var(--text-dark);
  text-decoration: none;
}

.user-avatar {
  color: var(--primary-color);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

/* Ensure notification center fits nicely */
:deep(.notification-center) {
  display: flex;
  align-items: center;
}
</style>
