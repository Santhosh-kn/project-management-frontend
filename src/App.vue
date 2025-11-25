<template>
  <router-view />
  <ToastNotification ref="toastRef" />
</template>

<script setup lang="ts">
import { ref, provide, onMounted } from 'vue'
import ToastNotification from '@/components/common/ToastNotification.vue'
import { useTheme } from '@/composables/useTheme'

const { loadTheme } = useTheme()

const toastRef = ref<InstanceType<typeof ToastNotification> | null>(null)

provide('toast', {
  success: (message: string) => toastRef.value?.success(message),
  error: (message: string) => toastRef.value?.error(message),
  warning: (message: string) => toastRef.value?.warning(message),
  info: (message: string) => toastRef.value?.info(message),
})

// Load theme on app mount
onMounted(() => {
  loadTheme()
})
</script>