import { useLongPress } from '../../hooks/useLongPress'

/**
 * Tappable product cards grid for quick adding to orders.
 * @param {Object} props
 * @param {Array} props.productos - Filtered product list
 * @param {Function} props.onAdd - Add handler (producto, cantidad) => void
 * @param {Function} props.onLongPressProduct - Long press handler for quantity modal
 */
export default function ProductQuickAdd({ productos, onAdd, onLongPressProduct }) {
  if (!productos || productos.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-base-content/50 text-sm">No hay productos en esta categoría</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2">
      {productos.map((prod) => (
        <ProductButton
          key={prod.id}
          producto={prod}
          onAdd={onAdd}
          onLongPress={onLongPressProduct}
        />
      ))}
    </div>
  )
}

function ProductButton({ producto, onAdd, onLongPress }) {
  const longPress = useLongPress(() => {
    onLongPress?.(producto)
  }, 500)

  return (
    <button
      className="flex flex-col items-center justify-center p-3 bg-base-200 rounded-lg
                 hover:bg-base-300 active:scale-95 transition-all min-h-[80px] touch-manipulation"
      onClick={() => onAdd?.(producto, 1)}
      onMouseDown={longPress.onMouseDown}
      onMouseUp={longPress.onMouseUp}
      onMouseLeave={longPress.onMouseLeave}
      onTouchStart={longPress.onTouchStart}
      onTouchEnd={longPress.onTouchEnd}
    >
      <span className="text-2xl">{producto.emoji || '🍽️'}</span>
      <span className="text-xs font-medium mt-1 truncate w-full text-center">
        {producto.nombre}
      </span>
      <span className="text-xs text-base-content/60">{producto.precio.toFixed(2)}€</span>
    </button>
  )
}
