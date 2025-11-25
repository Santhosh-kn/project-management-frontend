import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import layouts
import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'

// Import views
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: '/login',
        name: 'login',
        component: Login,
        meta: { requiresGuest: true },
      },
      {
        path: '/register',
        name: 'register',
        component: Register,
        meta: { requiresGuest: true },
      },
    ],
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/views/projects/ProjectsView.vue'),
      },
      {
        path: 'projects/:id',
        name: 'project-details',
        component: () => import('@/views/projects/ProjectDetailsView.vue'),
      },
      {
        path: 'tasks',
        name: 'tasks',
        component: () => import('@/views/tasks/TasksView.vue'),
      },
      {
        path: 'kanban',
        name: 'kanban',
        component: () => import('@/views/KanbanBoard.vue'),
        meta: { title: 'Kanban Board' },
      },
      {
        path: 'calendar',
        name: 'calendar',
        component: () => import('@/views/calendar/CalendarView.vue'),
      },
      {
        path: 'tags',
        name: 'tags',
        component: () => import('@/views/tags/TagsView.vue'),
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/views/reports/ReportsView.vue'),
      },
      {
        path: 'timesheet',
        name: 'timesheet',
        component: () => import('@/views/time-tracking/TimesheetView.vue'),
      },
      {
        path: 'time-reports',
        name: 'time-reports',
        component: () => import('@/views/time-tracking/TimeReportsView.vue'),
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: () => import('@/views/notifications/NotificationsView.vue'),
      },
      {
        path: 'notifications/settings',
        name: 'notification-settings',
        component: () => import('@/views/notifications/NotificationSettingsView.vue'),
      },
      {
        path: 'files',
        name: 'files',
        component: () => import('@/views/files/FilesManagementView.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/Profile.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/Settings.vue'),
        meta: { title: 'Settings' },
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: () => import('@/views/admin/UsersView.vue'),
        meta: { requiresAdmin: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // ALWAYS check storage directly for most accurate authentication state
  const tokenInStorage = localStorage.getItem('token') || sessionStorage.getItem('token')
  const isAuthenticated = !!tokenInStorage

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  // Check if route requires admin
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
