import { useUIStore } from '../../store/useUIStore'

const typeClasses = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info'
}

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  if (toasts.length === 0) return null

  return (
    <div className="toast toast-top toast-center z-[60]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`alert ${typeClasses[toast.type] || typeClasses.info} text-sm py-2 px-4 min-h-[44px]`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="btn btn-sm btn-ghost min-h-[44px] min-w-[44px]"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
