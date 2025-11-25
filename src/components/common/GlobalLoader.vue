<template>
  <Transition name="fade">
    <div v-if="isLoading" class="global-loader">
      <div class="loader-content">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isLoading = ref(false)
let loadingCount = 0
let timeoutId: number | null = null

const startLoading = () => {
  loadingCount++
  
  // Only show loader if request takes more than 300ms
  if (!timeoutId) {
    timeoutId = window.setTimeout(() => {
      if (loadingCount > 0) {
        isLoading.value = true
      }
    }, 300)
  }
}

const stopLoading = () => {
  loadingCount--
  
  if (loadingCount <= 0) {
    loadingCount = 0
    isLoading.value = false
    
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
}

onMounted(() => {
  window.addEventListener('api-request-start', startLoading)
  window.addEventListener('api-request-end', stopLoading)
})

onUnmounted(() => {
  window.removeEventListener('api-request-start', startLoading)
  window.removeEventListener('api-request-end', stopLoading)
  
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>

<style scoped>
.global-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loader-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
