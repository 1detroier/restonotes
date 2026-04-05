import { useAppStore } from '../../store/useAppStore'
import { TAKEAWAY_STATUS_COLORS } from '../../utils/constants'
import { formatPrice } from '../../utils/formatters'

/**
 * Single takeaway order card with status badge and advance button.
 * @param {Object} props
 * @param {Object} props.order - PedidoLlevar object
 */
export default function TakeawayCard({ order }) {
  const { updateTakeaway, payTakeaway, deleteTakeaway } = useAppStore()

  const statusLabels = {
    pendiente: 'Preparando',
    listo: 'Listo',
    entregado: 'Entregado',
    pagado: 'Pagado'
  }

  const badgeColor = TAKEAWAY_STATUS_COLORS[order.status] || 'ghost'

  const itemCount = order.pedidos ? order.pedidos.length : 0

  // Relative time
  const getRelativeTime = (createdAt) => {
    if (!createdAt) return ''
    const diff = Date.now() - new Date(createdAt).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'ahora'
    if (minutes < 60) return `hace ${minutes} min`
    const hours = Math.floor(minutes / 60)
    return `hace ${hours}h`
  }

  const handleAdvanceStatus = async () => {
    const flow = ['pendiente', 'listo', 'entregado', 'pagado']
    const currentIdx = flow.indexOf(order.status)
    if (currentIdx < 0 || currentIdx >= flow.length - 1) return

    const nextStatus = flow[currentIdx + 1]

    // If advancing to 'pagado', save venta first
    if (nextStatus === 'pagado') {
      await payTakeaway(order.id)
    } else {
      await updateTakeaway(order.id, { status: nextStatus })
    }
  }

  const handleDelete = async () => {
    if (order.status === 'pagado') return
    if (window.confirm(`¿Eliminar pedido de ${order.customerName}?`)) {
      await deleteTakeaway(order.id)
    }
  }

  const isPagado = order.status === 'pagado'

  return (
    <div
      className={`card bg-base-200 border border-base-300 min-h-[120px] transition-all ${
        isPagado ? 'opacity-50' : ''
      }`}
    >
      <div className="card-body p-4">
        {/* Header: customer name + status */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`font-bold text-base ${isPagado ? 'line-through' : ''}`}>
              {order.customerName}
            </h3>
            <p className="text-xs text-base-content/50">
              {getRelativeTime(order.createdAt)} · {itemCount} artículo{itemCount !== 1 ? 's' : ''}
            </p>
          </div>
          <span className={`badge badge-${badgeColor} badge-sm`}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center mt-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(order.total || 0)}
          </span>

          {/* Actions */}
          <div className="flex gap-1">
            {!isPagado && (
              <button
                className="btn btn-xs btn-outline min-h-[44px] px-3"
                onClick={handleAdvanceStatus}
              >
                {order.status === 'entregado' ? '💳 Cobrar' : 'Avanzar →'}
              </button>
            )}
            {!isPagado && (
              <button
                className="btn btn-xs btn-ghost btn-error min-h-[44px] min-w-[44px]"
                onClick={handleDelete}
                aria-label="Eliminar pedido"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
