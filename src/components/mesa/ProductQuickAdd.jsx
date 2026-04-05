import { useLongPress } from '../../hooks/useLongPress'
import { CATEGORIAS_CARTA, CATEGORIA_LABELS } from '../../utils/constants'

/**
 * Tappable product cards grid grouped by category with sticky headers.
 * @param {Object} props
 * @param {Array} props.productos - Product list (any categories)
 * @param {Function} props.onAdd - Add handler (producto, cantidad) => void
 * @param {Function} props.onLongPressProduct - Long press handler for quantity modal
 * @param {boolean} props.grouped - If true, group by category (default: true)
 */
export default function ProductQuickAdd({ productos, onAdd, onLongPressProduct, grouped = true }) {
  if (!productos || productos.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-base-content/50 text-sm">No hay productos en esta categoría</p>
      </div>
    )
  }

  // Group products by category
  const groupedProducts = {}
  productos.forEach((p) => {
    const cat = p.categoria || 'otros'
    if (!groupedProducts[cat]) groupedProducts[cat] = []
    groupedProducts[cat].push(p)
  })

  // If only one category or grouped=false, render flat
  const categories = Object.keys(groupedProducts)
  if (!grouped || categories.length <= 1) {
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

  // Render grouped by category with sticky headers
  return (
    <div className="p-2 space-y-3">
      {CATEGORIAS_CARTA.map((cat) => {
        const items = groupedProducts[cat]
        if (!items || items.length === 0) return null

        return (
          <div key={cat}>
            <h4 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide mb-1 px-1 sticky top-0 bg-base-100 z-10 py-1">
              {CATEGORIA_LABELS[cat] || cat}
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {items.map((prod) => (
                <ProductButton
                  key={prod.id}
                  producto={prod}
                  onAdd={onAdd}
                  onLongPress={onLongPressProduct}
                />
              ))}
            </div>
          </div>
        )
      })}
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
