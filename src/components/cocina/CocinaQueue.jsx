import CocinaItem from './CocinaItem'
import { COCINA_STATUS } from '../../utils/constants'

/**
 * Kitchen queue list — groups pending items by mesa.
 * @param {Object} props
 * @param {Array} props.items - Array of CocinaItem objects
 */
export default function CocinaQueue({ items, onCompleteMesa, onStartPreparing, onCancelMesa }) {
  if (!items || items.length === 0) return null

  // Determine group status based on items
  const hasPendiente = items.some((i) => i.status === COCINA_STATUS.PENDIENTE)
  const hasPreparando = items.some((i) => i.status === COCINA_STATUS.PREPARANDO)
  const hasListo = items.some((i) => i.status === COCINA_STATUS.LISTO)
  const hasCancelado = items.some((i) => i.status === COCINA_STATUS.CANCELADO)

  // Sidebar color based on status
  let sidebarColor = ''
  if (hasCancelado && !hasListo) {
    sidebarColor = 'bg-error'
  } else if (hasPreparando) {
    sidebarColor = 'bg-success'
  } else if (hasListo) {
    sidebarColor = 'bg-base-300'
  }

  // Group items by mesaId (items is already a single group)
  const mesaId = items[0]?.mesaId
  const numericId = Number(mesaId)
  const isTakeaway = !Number.isNaN(numericId) && numericId < 0
  const heading = isTakeaway ? `Para llevar #${Math.abs(numericId)}` : `Mesa #${mesaId}`
  const targetMesaId = Number.isNaN(numericId) ? mesaId : numericId

  const sortedItems = items.sort((a, b) => a.timestamp.localeCompare(b.timestamp))

  return (
    <div className={`bg-base-200 rounded-lg overflow-hidden ${sidebarColor ? 'border-l-4 ' + sidebarColor : ''}`}>
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-base-content/70 uppercase tracking-wide">
            {heading}
          </h3>
          <div className="flex gap-2">
            {/* Cancel button */}
            {onCancelMesa && !hasListo && !hasCancelado && (
              <button
                type="button"
                className="btn btn-xs btn-error btn-outline"
                onClick={() => {
                  if (window.confirm('¿Cancelar todos los pedidos de esta nota?')) {
                    onCancelMesa(targetMesaId)
                  }
                }}
              >
                Cancelar
              </button>
            )}

            {/* Start preparing button (when all items are pendiente) */}
            {onStartPreparing && hasPendiente && !hasPreparando && !hasListo && (
              <button
                type="button"
                className="btn btn-xs btn-success btn-outline"
                onClick={() => onStartPreparing(targetMesaId)}
              >
                Iniciar Preparación
              </button>
            )}

            {/* Complete button (when has preparing items) */}
            {onCompleteMesa && hasPreparando && !hasListo && (
              <button
                type="button"
                className="btn btn-xs btn-primary"
                onClick={() => onCompleteMesa(targetMesaId)}
              >
                Completar
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {sortedItems.map((item) => (
            <CocinaItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
