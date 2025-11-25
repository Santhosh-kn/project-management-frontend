<template>
  <div class="theme-settings">
    <!-- Dark Mode Toggle -->
    <div class="setting-section">
      <div class="setting-header">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Customize how the app looks</p>
      </div>

      <!-- Dark Mode Switch -->
      <div class="setting-item">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">Switch between light and dark themes</p>
          </div>
          <button
            @click="darkMode.toggle()"
            class="toggle-switch"
            :class="{ active: darkMode.isDark.value }"
          >
            <span class="toggle-slider"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Color Themes -->
    <div class="setting-section">
      <div class="setting-header">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Color Theme</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Choose your favorite color scheme</p>
      </div>

      <div class="themes-grid">
        <div
          v-for="theme in themes"
          :key="theme.id"
          @click="setTheme(theme.id)"
          class="theme-card"
          :class="{ active: currentTheme.id === theme.id }"
        >
          <!-- Theme Preview -->
          <div class="theme-preview">
            <div class="preview-color" :style="{ backgroundColor: theme.primary }"></div>
            <div class="preview-color" :style="{ backgroundColor: theme.secondary }"></div>
            <div class="preview-color" :style="{ backgroundColor: theme.accent }"></div>
          </div>
          
          <!-- Theme Name -->
          <div class="theme-name">
            <span class="font-medium">{{ theme.name }}</span>
            <svg
              v-if="currentTheme.id === theme.id"
              class="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Font Size (Bonus) -->
    <div class="setting-section">
      <div class="setting-header">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Font Size</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Adjust text size for better readability</p>
      </div>

      <div class="font-size-options">
        <button
          v-for="size in fontSizes"
          :key="size.value"
          @click="setFontSize(size.value)"
          class="font-size-btn"
          :class="{ active: currentFontSize === size.value }"
        >
          {{ size.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'
import { useTheme } from '@/composables/useTheme'

const darkMode = useDarkMode()
const { currentTheme, themes, setTheme } = useTheme()

const fontSizes = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' }
]

const currentFontSize = ref('medium')

const setFontSize = (size: string) => {
  currentFontSize.value = size
  const root = document.documentElement
  
  switch (size) {
    case 'small':
      root.style.fontSize = '14px'
      break
    case 'large':
      root.style.fontSize = '18px'
      break
    default:
      root.style.fontSize = '16px'
  }
  
  localStorage.setItem('fontSize', size)
}

// Load saved font size
const loadFontSize = () => {
  const saved = localStorage.getItem('fontSize')
  if (saved) {
    setFontSize(saved)
  }
}

loadFontSize()
</script>

<style scoped>
.theme-settings {
  @apply space-y-8;
}

.setting-section {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6;
}

.setting-header {
  @apply mb-6;
}

.setting-item {
  @apply py-4 border-t border-gray-200 dark:border-gray-700;
}

/* Toggle Switch */
.toggle-switch {
  @apply relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300 dark:bg-gray-600;
}

.toggle-switch.active {
  @apply bg-blue-600;
}

.toggle-slider {
  @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1;
}

.toggle-switch.active .toggle-slider {
  @apply translate-x-6;
}

/* Themes Grid */
.themes-grid {
  @apply grid grid-cols-2 md:grid-cols-3 gap-4;
}

.theme-card {
  @apply border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-all;
}

.theme-card.active {
  @apply border-blue-500 ring-2 ring-blue-500 ring-opacity-50;
}

.theme-preview {
  @apply flex gap-2 mb-3;
}

.preview-color {
  @apply flex-1 h-12 rounded;
}

.theme-name {
  @apply flex items-center justify-between text-sm text-gray-700 dark:text-gray-300;
}

/* Font Size Options */
.font-size-options {
  @apply flex gap-3;
}

.font-size-btn {
  @apply px-6 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-gray-700 dark:text-gray-300;
}

.font-size-btn.active {
  @apply border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400;
}
</style>