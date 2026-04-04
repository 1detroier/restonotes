import { useState } from 'react'
import { CATEGORIA_LABELS } from '../../utils/constants'

export default function MenuSection({
  category,
  productos,
  selectedIds,
  onToggle,
  error
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`collapse collapse-arrow bg-base-100 shadow-sm ${error ? 'border border-error' : ''}`}>
      <input type="checkbox" checked={isOpen} onChange={() => setIsOpen(!isOpen)} />
      <div className="collapse-title font-medium min-h-[44px] flex items-center justify-between">
        <span>{CATEGORIA_LABELS[category] || category}</span>
        <span className="badge badge-sm">{selectedIds.length}</span>
      </div>
      <div className="collapse-content p-2">
        {productos.length === 0 ? (
          <p className="text-sm text-base-content/50 p-2">
            No hay productos en esta categoría
          </p>
        ) : (
          productos.map((p) => (
            <label
              key={p.id}
              className="flex items-center gap-3 p-2 min-h-[44px] hover:bg-base-200 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary"
                checked={selectedIds.includes(p.id)}
                onChange={() => onToggle(category + 'Ids', p.id)}
              />
              <span className="text-lg">{p.emoji}</span>
              <span className="flex-1">{p.nombre}</span>
              <span className="text-sm text-base-content/60">
                ${parseFloat(p.precio).toFixed(2)}
              </span>
            </label>
          ))
        )}
        {error && <p className="text-error text-xs mt-1">{error}</p>}
      </div>
    </div>
  )
}
