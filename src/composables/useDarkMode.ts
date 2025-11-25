import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  const toggle = () => {
    isDark.value = !isDark.value
    applyTheme()
    savePreference()
  }

  const enable = () => {
    isDark.value = true
    applyTheme()
    savePreference()
  }

  const disable = () => {
    isDark.value = false
    applyTheme()
    savePreference()
  }

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const savePreference = () => {
    localStorage.setItem('darkMode', isDark.value ? 'true' : 'false')
  }

  const loadPreference = () => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      isDark.value = saved === 'true'
    } else {
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  // Initialize on mount
  onMounted(() => {
    loadPreference()
  })

  return {
    isDark,
    toggle,
    enable,
    disable
  }
}