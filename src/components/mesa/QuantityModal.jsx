import { useState } from 'react'

/**
 * Quantity selector modal for adding multiple units of a product.
 * @param {Object} props
 * @param {Object} props.producto - Producto object
 * @param {Function} props.onConfirm - Confirm handler (producto, cantidad) => void
 * @param {Function} props.onCancel - Cancel handler
 */
export default function QuantityModal({ producto, onConfirm, onCancel }) {
  const [cantidad, setCantidad] = useState(1)

  const increment = () => setCantidad((prev) => Math.min(prev + 1, 99))
  const decrement = () => setCantidad((prev) => Math.max(prev - 1, 1))

  const handleConfirm = () => {
    onConfirm?.(producto, cantidad)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-base-100 rounded-xl shadow-xl p-6 w-72 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <span className="text-4xl">{producto.emoji || '🍽️'}</span>
          <h3 className="text-lg font-bold mt-2">{producto.nombre}</h3>
          <p className="text-sm text-base-content/60">{producto.precio.toFixed(2)}€ / unidad</p>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            className="btn btn-circle btn-outline min-h-[44px] min-w-[44px] text-xl"
            onClick={decrement}
            disabled={cantidad <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            className="input input-bordered w-20 text-center text-xl font-bold"
            value={cantidad}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val)) {
                setCantidad(Math.max(1, Math.min(99, val)))
              }
            }}
            min={1}
            max={99}
          />
          <button
            className="btn btn-circle btn-outline min-h-[44px] min-w-[44px] text-xl"
            onClick={increment}
            disabled={cantidad >= 99}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Subtotal preview */}
        <p className="text-center text-sm text-base-content/60 mb-4">
          Subtotal: {(producto.precio * cantidad).toFixed(2)}€
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="btn btn-ghost flex-1 min-h-[44px]"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="btn btn-primary flex-1 min-h-[44px]"
            onClick={handleConfirm}
          >
            Añadir {cantidad}×
          </button>
        </div>
      </div>
    </div>
  )
}
