import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  // State
  const isLoading = ref(false)
  const loadingCount = ref(0)

  // Actions
  const startLoading = () => {
    loadingCount.value++
    isLoading.value = true
  }

  const stopLoading = () => {
    loadingCount.value--
    if (loadingCount.value <= 0) {
      loadingCount.value = 0
      isLoading.value = false
    }
  }

  const resetLoading = () => {
    loadingCount.value = 0
    isLoading.value = false
  }

  return {
    isLoading,
    loadingCount,
    startLoading,
    stopLoading,
    resetLoading,
  }
})
