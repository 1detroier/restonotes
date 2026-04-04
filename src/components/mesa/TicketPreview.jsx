import { useSwipe } from '../../hooks/useSwipe'
import { groupByCategory, calcTotal } from '../../utils/orderHelpers'
import { formatPrice } from '../../utils/formatters'
import { CATEGORIA_LABELS } from '../../utils/constants'

/**
 * Ticket preview showing grouped order items with subtotals.
 * Supports swipe-left to remove items.
 * @param {Object} props
 * @param {Array} props.pedidos - Array of PedidoItem objects
 * @param {Function} props.onRemove - Remove handler (tempId) => void
 */
export default function TicketPreview({ pedidos, onRemove }) {
  if (!pedidos || pedidos.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 p-4">
        <p className="text-base-content/50 text-sm">No hay artículos en el pedido</p>
      </div>
    )
  }

  const grouped = groupByCategory(pedidos)
  const total = calcTotal(pedidos)

  return (
    <div className="p-2">
      {Object.entries(grouped).map(([categoria, items]) => (
        <div key={categoria} className="mb-3">
          <h4 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide mb-1 px-1">
            {CATEGORIA_LABELS[categoria] || categoria}
          </h4>
          <div className="bg-base-200 rounded-lg overflow-hidden">
            {items.map((item) => (
              <SwipeableItem
                key={item.id}
                item={item}
                onRemove={() => onRemove?.(item.id)}
              />
            ))}
          </div>
          {/* Category subtotal */}
          <div className="text-right text-xs text-base-content/60 px-2 py-1">
            Subtotal: {formatPrice(calcTotal(items))}
          </div>
        </div>
      ))}

      {/* Grand total */}
      <div className="border-t-2 border-base-300 pt-2 mt-2 flex justify-between items-center px-2">
        <span className="text-lg font-bold">Total</span>
        <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
      </div>
    </div>
  )
}

/**
 * Individual ticket item with swipe-to-delete.
 */
function SwipeableItem({ item, onRemove }) {
  const swipe = useSwipe(onRemove)

  return (
    <div className="relative overflow-hidden">
      {/* Delete background */}
      <div className="absolute inset-0 bg-error flex items-center justify-end pr-4">
        <span className="text-white text-sm font-medium">Eliminar</span>
      </div>

      {/* Foreground content */}
      <div
        className="relative flex justify-between items-center px-3 py-2 bg-base-200 transition-transform"
        style={{ transform: `translateX(${swipe.translateX}px)` }}
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={swipe.onTouchEnd}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">{item.cantidad}×</span>
          <span className="text-sm">{item.emoji || ''} {item.nombre}</span>
          {item.nota && (
            <span className="text-xs text-base-content/50 italic">({item.nota})</span>
          )}
        </div>
        <span className="text-sm font-medium">{formatPrice(item.precio * item.cantidad)}</span>
      </div>
    </div>
  )
}
