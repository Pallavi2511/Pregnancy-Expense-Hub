import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

const TOAST_STYLES = {
    success: {
        icon: '✓',
        className: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-200',
    },
    error: {
        icon: '✗',
        className: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950 dark:border-rose-700 dark:text-rose-200',
    },
    info: {
        icon: 'ℹ',
        className: 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950 dark:border-sky-700 dark:text-sky-200',
    },
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])
    const idRef = useRef(0)

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback((type, message, duration = 3500) => {
        if (!message) return
        const id = ++idRef.current
        setToasts((prev) => [...prev, { id, type, message }])
        if (duration > 0) {
            setTimeout(() => dismissToast(id), duration)
        }
        return id
    }, [dismissToast])

    const toast = useMemo(
        () => ({
            success: (message, duration) => showToast('success', message, duration),
            error: (message, duration) => showToast('error', message, duration),
            info: (message, duration) => showToast('info', message, duration),
        }),
        [showToast]
    )

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
                {toasts.map(({ id, type, message }) => {
                    const style = TOAST_STYLES[type] || TOAST_STYLES.info
                    return (
                        <div
                            key={id}
                            role="alert"
                            className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg transition duration-300 ${style.className}`}
                        >
                            <span className="font-bold">{style.icon}</span>
                            <p className="flex-1 text-sm font-semibold">{message}</p>
                            <button
                                type="button"
                                onClick={() => dismissToast(id)}
                                aria-label="Dismiss notification"
                                className="text-current opacity-70 hover:opacity-100"
                            >
                                ✕
                            </button>
                        </div>
                    )
                })}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
