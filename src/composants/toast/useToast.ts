// composables/useToast.ts
import { ref, readonly } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'

export interface Toast {
  id: number
  type: ToastType
  title?: string
  message: string
  duration?: number        // ms (0 = persistant)
  position?: ToastPosition
  closable?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  const add = (toast: Omit<Toast, 'id'>): number => {
    const id = ++nextId
    toasts.value.push({
      id,
      duration: 4000,
      closable: true,
      ...toast,
    })
    return id
  }

  const remove = (id: number): void => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const clear = (): void => {
    toasts.value = []
  }

  // Raccourcis par type
  const success = (message: string, title?: string, options?: Partial<Toast>) =>
    add({ type: 'success', message, title, ...options })

  const error = (message: string, title?: string, options?: Partial<Toast>) =>
    add({ type: 'error', message, title, ...options })

  const warning = (message: string, title?: string, options?: Partial<Toast>) =>
    add({ type: 'warning', message, title, ...options })

  const info = (message: string, title?: string, options?: Partial<Toast>) =>
    add({ type: 'info', message, title, ...options })

  return {
    toasts: readonly(toasts),
    add,
    remove,
    clear,
    success,
    error,
    warning,
    info,
  }
}