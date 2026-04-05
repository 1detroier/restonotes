import { useState } from 'react'
import { groupByCategory, calcTotal, getCancelledCount } from '../../utils/orderHelpers'
import { formatPrice } from '../../utils/formatters'
import { CATEGORIA_LABELS } from '../../utils/constants'

/**
 * Close account confirmation modal with full order breakdown.
 * @param {Object} props
 * @param {Object} props.mesa - Mesa object with pedidos
 * @param {Function} props.onConfirm - Confirm close handler (paymentMethod) => void
 * @param {Function} props.onCancel - Cancel handler
 */
export default function CerrarCuentaModal({ mesa, takeawayOrders = [], onConfirm, onCancel }) {
  const [paymentMethod, setPaymentMethod] = useState('efectivo')

  const pedidos = mesa.pedidos || []
  const grouped = groupByCategory(pedidos)
  const total = calcTotal(pedidos)
  const takeawayTotal = takeawayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
  const displayTotal = total + takeawayTotal
  const cancelledCount = getCancelledCount(pedidos)

  const handleShare = async () => {
    const text = buildTicketText(mesa, grouped, total, takeawayOrders)
    if (navigator.share) {
      try {
        await navigator.share({ title: `Ticket Mesa #${mesa.numero}`, text })
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(text)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-base-100 rounded-xl shadow-xl p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-3 text-center">
          🧾 Cerrar Mesa #{mesa.numero}
        </h3>

        {/* Order breakdown */}
        <div className="text-sm space-y-2 mb-4">
          {Object.entries(grouped).map(([categoria, items]) => (
            <div key={categoria}>
              <p className="font-semibold text-base-content/70 text-xs uppercase">
                {CATEGORIA_LABELS[categoria] || categoria}
              </p>
              {items.map((item) => (
                <div key={item.id}>
                  <div className={`flex justify-between py-0.5 ${item.status === 'cancelado' ? 'opacity-50 line-through' : ''}`}>
                    <span>
                      {item.cantidad}× {item.nombre}
                    </span>
                    <span className="font-medium">{formatPrice(item.precio * item.cantidad)}</span>
                  </div>
                  {/* Show menu components */}
                  {item.categoria === 'menu' && item.nota && (
                    <div className="ml-4 text-xs text-base-content/50 space-y-0.5">
                      {item.nota.split(' | ').map((comp, i) => (
                        <p key={i}>{['1️⃣', '2️⃣', '3️⃣'][i] || '•'} {comp}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {takeawayOrders.length > 0 && (
            <div>
              <p className="font-semibold text-base-content/70 text-xs uppercase">
                Pedidos para llevar vinculados
              </p>
              {takeawayOrders.map((order) => (
                <div key={order.id} className="mt-1">
                  <p className="text-sm font-semibold">📦 {order.customerName}</p>
                  <div className="text-xs text-base-content/60 ml-2 space-y-0.5">
                    {(order.pedidos || []).map((item) => (
                      <p key={item.id}>{item.cantidad}× {item.nombre}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancelled count */}
        {cancelledCount > 0 && (
          <p className="text-xs text-base-content/50 mb-2">
            {cancelledCount} artículo{cancelledCount > 1 ? 's' : ''} cancelado{cancelledCount > 1 ? 's' : ''}
          </p>
        )}

        {/* Total */}
        <div className="border-t-2 border-base-300 pt-2 flex justify-between items-center mb-4">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold text-primary">{formatPrice(displayTotal)}</span>
        </div>

        {/* Payment method selector */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-base-content/70 mb-2">Método de pago</p>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
              <input
                type="radio"
                name="paymentMethod"
                value="efectivo"
                checked={paymentMethod === 'efectivo'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="radio radio-primary radio-sm"
              />
              <span className="text-sm">💵 Efectivo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
              <input
                type="radio"
                name="paymentMethod"
                value="tarjeta"
                checked={paymentMethod === 'tarjeta'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="radio radio-primary radio-sm"
              />
              <span className="text-sm">💳 Tarjeta</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-2">
          <button
            className="btn btn-outline btn-sm flex-1 min-h-[44px]"
            onClick={handleShare}
          >
            📤 Compartir
          </button>
          <button
            className="btn btn-outline btn-sm flex-1 min-h-[44px]"
            onClick={handlePrint}
          >
            🖨️ Imprimir
          </button>
        </div>

        <div className="flex gap-2">
          <button
            className="btn btn-ghost flex-1 min-h-[44px]"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary flex-1 min-h-[44px]"
            onClick={() => onConfirm(paymentMethod)}
          >
            ✓ Cobrar
          </button>
        </div>
      </div>
    </div>
  )
}

function buildTicketText(mesa, grouped, total, takeawayOrders = []) {
  let text = `TICKET - Mesa #${mesa.numero}\n${'='.repeat(30)}\n\n`
  for (const [cat, items] of Object.entries(grouped)) {
    text += `${CATEGORIA_LABELS[cat] || cat}:\n`
    for (const item of items) {
      text += `  ${item.cantidad}× ${item.nombre} - ${formatPrice(item.precio * item.cantidad)}\n`
    }
  }
  if (takeawayOrders.length > 0) {
    text += `\nPedidos para llevar:\n`
    for (const order of takeawayOrders) {
      text += `  ${order.customerName}:\n`
      for (const item of order.pedidos || []) {
        text += `    ${item.cantidad}× ${item.nombre} - ${formatPrice(item.precio * item.cantidad)}\n`
      }
    }
  }
  const totalTakeaway = takeawayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
  text += `\n${'='.repeat(30)}\nTOTAL: ${formatPrice(total + totalTakeaway)}\n`
  return text
}
