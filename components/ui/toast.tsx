'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast provider component
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { ...toast, id }

    setToasts((prev) => [...prev, newToast])

    // Auto-remove after duration (default 5 seconds)
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast container
function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Individual toast item
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast
  onRemove: (id: string) => void
}) {
  const typeConfig = {
    success: {
      border: 'border-secondary',
      bg: 'bg-secondary/10',
      icon: '✓',
      iconColor: 'text-secondary',
      label: 'SUCCESS',
    },
    error: {
      border: 'border-destructive',
      bg: 'bg-destructive/10',
      icon: '✗',
      iconColor: 'text-destructive',
      label: 'ERROR',
    },
    warning: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-500/10',
      icon: '⚠',
      iconColor: 'text-yellow-500',
      label: 'WARNING',
    },
    info: {
      border: 'border-primary',
      bg: 'bg-primary/10',
      icon: '>',
      iconColor: 'text-primary',
      label: 'INFO',
    },
  }

  const config = typeConfig[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'border-2 p-4 backdrop-blur-sm',
        config.border,
        config.bg
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className={cn('font-terminal text-lg', config.iconColor)}>
          [{config.icon}]
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('font-terminal text-xs', config.iconColor)}>
              {config.label}:
            </span>
            <span className="font-mono text-sm text-white truncate">
              {toast.title}
            </span>
          </div>
          {toast.message && (
            <p className="font-mono text-xs text-white/60 break-words">
              {toast.message}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => onRemove(toast.id)}
          className={cn(
            'font-mono text-xs hover:text-white transition-colors',
            config.iconColor
          )}
          aria-label="Close"
        >
          [x]
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        className={cn('h-0.5 mt-3', config.border.replace('border-', 'bg-'))}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (toast.duration ?? 5000) / 1000, ease: 'linear' }}
      />
    </motion.div>
  )
}

// Convenience hooks for specific toast types
export function useSuccessToast() {
  const { addToast } = useToast()
  return useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'success', title, message })
    },
    [addToast]
  )
}

export function useErrorToast() {
  const { addToast } = useToast()
  return useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'error', title, message })
    },
    [addToast]
  )
}

export function useWarningToast() {
  const { addToast } = useToast()
  return useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'warning', title, message })
    },
    [addToast]
  )
}

export function useInfoToast() {
  const { addToast } = useToast()
  return useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'info', title, message })
    },
    [addToast]
  )
}
