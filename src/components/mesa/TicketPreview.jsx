import { useState } from 'react'
import { useSwipe } from '../../hooks/useSwipe'
import { groupByCategory, calcTotal, getCancelledCount } from '../../utils/orderHelpers'
import { formatPrice } from '../../utils/formatters'
import { CATEGORIA_LABELS, SWIPE_THRESHOLD } from '../../utils/constants'

/**
 * Ticket preview showing grouped order items with subtotals.
 * Supports swipe-left to remove items.
 * Cancel buttons for individual items.
 * @param {Object} props
 * @param {Array} props.pedidos - Array of PedidoItem objects
 * @param {Function} props.onRemove - Remove handler (tempId) => void
 * @param {Function} props.onUpdateQty - Update quantity handler (tempId, newQty) => void
 * @param {Function} props.onCancel - Cancel item handler (mesaId, itemId) => void
 * @param {number} props.mesaId - Mesa ID for cancellation
 */
export default function TicketPreview({ pedidos, onRemove, onUpdateQty, onCancel, mesaId }) {
  if (!pedidos || pedidos.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 p-4">
        <p className="text-base-content/50 text-sm">No hay artículos en el pedido</p>
      </div>
    )
  }

  const grouped = groupByCategory(pedidos)
  const total = calcTotal(pedidos)
  const cancelledCount = getCancelledCount(pedidos)
  const activeCount = pedidos.length - cancelledCount

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
                onUpdateQty={onUpdateQty}
                onCancel={() => onCancel?.(mesaId, item.id)}
                mesaId={mesaId}
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
        <span className="text-lg font-bold">
          Total
          {cancelledCount > 0 && (
            <span className="text-xs font-normal text-base-content/50 ml-1">
              ({activeCount} art. — {cancelledCount} cancelado{cancelledCount > 1 ? 's' : ''})
            </span>
          )}
        </span>
        <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
      </div>
    </div>
  )
}

/**
 * Individual ticket item with swipe-to-delete, +/- quantity controls, and cancel button.
 */
function SwipeableItem({ item, onRemove, onUpdateQty, onCancel, mesaId }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const swipe = useSwipe(
    () => setShowDeleteConfirm(true),
    SWIPE_THRESHOLD
  )
  const isMenu = item.categoria === 'menu'
  const isCancelled = item.status === 'cancelado'

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false)
    onRemove?.(item.id)
  }

  const handleCancel = () => {
    onCancel?.(mesaId, item.id)
  }

  return (
    <>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-base-100 p-6 rounded-xl max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-center mb-2">¿Eliminar item?</h3>
            <p className="text-sm text-base-content/70 text-center mb-6">
              ¿Eliminar <strong>{item.nombre}</strong> del pedido?
            </p>
            <div className="flex gap-3">
              <button
                className="btn btn-ghost flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-error flex-1"
                onClick={handleDeleteConfirm}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden">
      {/* Delete background */}
      <div className="absolute inset-0 bg-error flex items-center justify-end pr-4">
        <span className="text-white text-sm font-medium">Eliminar</span>
      </div>

      {/* Foreground content */}
      <div
        className={`relative flex justify-between items-start px-3 py-2 bg-base-200 transition-transform ${
          isCancelled ? 'opacity-50' : ''
        }`}
        style={{ transform: `translateX(${swipe.translateX}px)` }}
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={swipe.onTouchEnd}
      >
        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-2 ${isCancelled ? 'line-through' : ''}`}>
            <span className="text-sm font-bold text-primary">{item.cantidad}×</span>
            <span className="text-sm">{item.emoji || ''} {item.nombre}</span>
          </div>
          {item.variantOptions && item.variantOptions.length > 0 && (
            <div className="ml-6 mt-1 flex flex-wrap gap-1">
              {item.variantOptions.map((variant) => (
                <span key={`${variant.groupId}-${variant.optionId}`} className="badge badge-ghost badge-xs">
                  {variant.groupName}: {variant.optionLabel}
                </span>
              ))}
            </div>
          )}
          {/* Menu components shown as sub-items */}
          {isMenu && item.nota && (
            <div className="ml-6 mt-1 space-y-0.5">
              {item.nota.split(' | ').map((comp, i) => (
                <p key={i} className="text-xs text-base-content/50">
                  {['1️⃣', '2️⃣', '3️⃣'][i] || '•'} {comp}
                </p>
              ))}
            </div>
          )}
          {/* Regular nota (non-menu) */}
          {!isMenu && item.nota && (
            <span className="ml-6 text-xs text-base-content/50 italic">({item.nota})</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Cancel button (hidden for already-cancelled items) */}
          {!isCancelled && (
            <button
              className="btn btn-xs btn-ghost min-h-[44px] min-w-[44px] p-1 text-error"
              onClick={handleCancel}
              aria-label={`Cancelar ${item.nombre}`}
            >
              🚫
            </button>
          )}
          {/* Quantity controls */}
          <button
            className="btn btn-xs btn-ghost min-h-[32px] min-w-[32px] p-1"
            onClick={() => {
              if (item.cantidad <= 1) {
                onRemove?.(item.id)
              } else {
                onUpdateQty?.(item.id, item.cantidad - 1)
              }
            }}
            aria-label="Reducir cantidad"
          >
            −
          </button>
          <span className="text-sm font-bold text-primary w-6 text-center">
            {item.cantidad}
          </span>
          <button
            className="btn btn-xs btn-ghost min-h-[32px] min-w-[32px] p-1"
            onClick={() => onUpdateQty?.(item.id, item.cantidad + 1)}
            aria-label="Aumentar cantidad"
          >
            +
          </button>
          <span className="text-sm font-medium ml-1">{formatPrice(item.precio * item.cantidad)}</span>
        </div>
      </div>
    </div>
    </>
  )
}
