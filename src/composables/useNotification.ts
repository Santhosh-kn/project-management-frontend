import { inject } from 'vue'

interface Toast {
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

export function useNotification() {
  const toast = inject<Toast>('toast')

  if (!toast) {
    console.error('Toast not provided!')
    return {
      success: (msg: string) => console.log('Success:', msg),
      error: (msg: string) => console.error('Error:', msg),
      warning: (msg: string) => console.warn('Warning:', msg),
      info: (msg: string) => console.info('Info:', msg),
    }
  }

  return toast
}
