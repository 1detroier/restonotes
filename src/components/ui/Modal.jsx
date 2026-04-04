import { useUIStore } from '../../store/useUIStore'

export default function Modal() {
  const { modals, setModals } = useUIStore()
  const modal = modals[0]

  if (!modal) return null

  const handleClose = () => {
    setModals((prev) => prev.slice(1))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-base-100 rounded-t-2xl p-4 pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{modal.title || 'Modal'}</h3>
          <button
            onClick={handleClose}
            className="btn btn-sm btn-ghost btn-circle min-h-[44px] min-w-[44px]"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        {modal.content}
      </div>
    </div>
  )
}
