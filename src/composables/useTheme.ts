import { ref } from 'vue'

type Theme = 'light' | 'dark' | 'auto'

const currentTheme = ref<Theme>('light')

export function useTheme() {
  const applyTheme = (theme: Theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.body.classList.add('dark-theme')
      document.body.classList.remove('light-theme')
    } else if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
      document.body.classList.add('light-theme')
      document.body.classList.remove('dark-theme')
    } else if (theme === 'auto') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(prefersDark ? 'dark' : 'light')
      return
    }
    
    currentTheme.value = theme
    localStorage.setItem('theme', theme)
  }

  const loadTheme = () => {
    const saved = localStorage.getItem('theme') as Theme
    if (saved) {
      applyTheme(saved)
    } else {
      applyTheme('light')
    }
  }

  return {
    currentTheme,
    applyTheme,
    loadTheme
  }
}
