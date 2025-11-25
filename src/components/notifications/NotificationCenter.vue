<template>
  <div class="notification-center" v-click-outside="closeDropdown">
    <!-- Bell Icon Button -->
    <button
      @click="toggleDropdown"
      class="notification-button"
      :class="{ 'has-unread': store.hasUnread }"
      type="button"
    >
      <i class="bi bi-bell"></i>
      
      <!-- Unread Badge -->
      <span v-if="store.unreadCount > 0" class="unread-badge">
        {{ store.unreadCount > 99 ? '99+' : store.unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <transition name="dropdown">
      <div v-if="isOpen" class="notification-dropdown">
        <!-- Header -->
        <div class="dropdown-header">
          <h6 class="mb-0">Notifications</h6>
          <div class="header-actions">
            <button
              v-if="store.unreadCount > 0"
              @click="handleMarkAllRead"
              class="btn btn-sm btn-light"
              title="Mark all as read"
              type="button"
            >
              <i class="bi bi-check-all"></i>
            </button>
            <router-link
              to="/notifications/settings"
              class="btn btn-sm btn-light"
              title="Settings"
            >
              <i class="bi bi-gear"></i>
            </router-link>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button
            @click="activeTab = 'all'"
            class="tab"
            :class="{ 'active': activeTab === 'all' }"
            type="button"
          >
            All
          </button>
          <button
            @click="activeTab = 'unread'"
            class="tab"
            :class="{ 'active': activeTab === 'unread' }"
            type="button"
          >
            Unread <span class="badge bg-primary ms-1">{{ store.unreadCount }}</span>
          </button>
        </div>

        <!-- Notifications List -->
        <div class="notifications-list">
          <!-- Loading State -->
          <div v-if="store.loading" class="loading-state text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <!-- Notifications -->
          <div
            v-else-if="displayedNotifications.length > 0"
            class="notifications-container"
          >
            <NotificationItem
              v-for="notification in displayedNotifications"
              :key="notification.id"
              :notification="notification"
              @click="handleNotificationClick(notification)"
              @mark-read="store.markAsRead(notification.id)"
              @mark-unread="store.markAsUnread(notification.id)"
              @delete="store.deleteNotification(notification.id)"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state text-center py-5">
            <i class="bi bi-bell-slash text-muted" style="font-size: 3rem;"></i>
            <p class="text-muted mt-2 mb-0">No notifications</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="dropdown-footer">
          <router-link
            to="/notifications"
            class="view-all-btn"
            @click="closeDropdown"
          >
            View All Notifications
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import NotificationItem from './NotificationItem.vue'
import type { Notification } from '@/types/notification'

const store = useNotificationStore()
const router = useRouter()

const isOpen = ref(false)
const activeTab = ref<'all' | 'unread'>('all')

// Computed
const displayedNotifications = computed(() => {
  if (activeTab.value === 'unread') {
    return store.unreadNotifications
  }
  return store.notifications.slice(0, 10)
})

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && store.notifications.length === 0) {
    store.fetchNotifications()
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleNotificationClick = async (notification: Notification) => {
  if (!notification.read_at) {
    await store.markAsRead(notification.id)
  }

  if (notification.data.action_url) {
    closeDropdown()
    router.push(notification.data.action_url)
  }
}

const handleMarkAllRead = async () => {
  try {
    await store.markAllAsRead()
  } catch (error) {
    console.error('Failed to mark all as read:', error)
  }
}

// Click outside directive
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

// Lifecycle
onMounted(() => {
  store.fetchUnreadCount()
  
  setInterval(() => {
    store.fetchUnreadCount()
  }, 30000)
})
</script>

<style scoped>
.notification-center {
  position: relative;
}

.notification-button {
  position: relative;
  padding: 0.5rem;
  background: none;
  border: none;
  color: #64748b;
  border-radius: 0.375rem;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-button:hover {
  color: #334155;
  background-color: #f1f5f9;
}

.notification-button.has-unread {
  color: #0d6efd;
}

.notification-button i {
  font-size: 1.25rem;
}

.unread-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.125rem 0.375rem;
  background-color: #dc3545;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.notification-dropdown {
  position: absolute;
  right: 0;
  margin-top: 0.5rem;
  width: 380px;
  max-width: 90vw;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  z-index: 1050;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-header h6 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-actions .btn {
  padding: 0.25rem 0.5rem;
}

.header-actions .btn i {
  font-size: 0.875rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
}

.tab {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
}

.tab:hover {
  color: #334155;
  background-color: #f8fafc;
}

.tab.active {
  color: #0d6efd;
  border-bottom-color: #0d6efd;
}

.tab .badge {
  font-size: 0.65rem;
  padding: 0.2rem 0.4rem;
}

.notifications-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.loading-state {
  padding: 2rem 1rem;
}

.notifications-container {
  border-top: 1px solid #e2e8f0;
}

.empty-state {
  padding: 3rem 1rem;
}

.dropdown-footer {
  padding: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.view-all-btn {
  display: block;
  width: 100%;
  text-align: center;
  padding: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0d6efd;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.view-all-btn:hover {
  background-color: #f0f7ff;
  color: #0b5ed7;
}

/* Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Scrollbar */
.notifications-list::-webkit-scrollbar {
  width: 6px;
}

.notifications-list::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive */
@media (max-width: 480px) {
  .notification-dropdown {
    width: 100vw;
    right: -1rem;
    border-radius: 0;
  }
}
</style>
