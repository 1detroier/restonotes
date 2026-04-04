/**
 * Context menu shown on long press of a mesa card.
 * @param {Object} props
 * @param {Object} props.mesa - Mesa object
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onCloseCuenta - Close account handler
 * @param {Function} props.onVerTicket - View ticket handler
 */
export default function ContextMenu({ mesa, onClose, onCloseCuenta, onVerTicket }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-base-100 rounded-xl shadow-xl p-2 min-w-[200px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          <p className="px-4 py-2 text-sm font-semibold text-base-content/70 border-b border-base-200">
            Mesa #{mesa.numero} — {mesa.estado}
          </p>
        </div>

        {mesa.estado === 'ocupada' && (
          <button
            className="w-full text-left px-4 py-3 min-h-[44px] hover:bg-base-200 rounded-lg transition-colors"
            onClick={() => {
              onClose()
              onCloseCuenta?.(mesa)
            }}
          >
            🧾 Cerrar cuenta
          </button>
        )}

        <button
          className="w-full text-left px-4 py-3 min-h-[44px] hover:bg-base-200 rounded-lg transition-colors"
          onClick={() => {
            onClose()
            onVerTicket?.(mesa)
          }}
        >
          📋 Ver ticket
        </button>

        <button
          className="w-full text-left px-4 py-3 min-h-[44px] hover:bg-base-200 rounded-lg transition-colors text-error"
          onClick={onClose}
        >
          ✕ Cancelar
        </button>
      </div>
    </div>
  )
}
