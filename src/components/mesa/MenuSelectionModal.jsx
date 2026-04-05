import { useState } from 'react'
import { CATEGORIAS_CARTA, CATEGORIA_LABELS } from '../../utils/constants'
import { formatPrice } from '../../utils/formatters'

/**
 * Modal to select 1 primero, 1 segundo, and optionally postre + bebida
 * for the daily menu. Postre is optional (can be added later).
 */
export default function MenuSelectionModal({ menuDelDia, productos, onConfirm, onCancel }) {
  const [selected, setSelected] = useState({
    primero: null,
    segundo: null,
    postre: null,
    bebida: null
  })

  // Get available products for each slot
  const primeroIds = menuDelDia.primeroIds || []
  const segundoIds = menuDelDia.segundoIds || []
  const postreIds = menuDelDia.postreIds || []
  const bebidaIds = menuDelDia.bebidaIds || []
  const incluyeBebida = menuDelDia.incluyeBebida || false

  const primeros = productos.filter(p => primeroIds.includes(p.id) && p.activo)
  const segundos = productos.filter(p => segundoIds.includes(p.id) && p.activo)
  const postres = productos.filter(p => postreIds.includes(p.id) && p.activo)
  // Use configured bebidaIds if available, fallback to all beverages
  const bebidas = bebidaIds.length > 0
    ? productos.filter(p => bebidaIds.includes(p.id) && p.activo)
    : productos.filter(p => p.categoria === 'bebidas' && p.activo)

  // Can confirm with just primero + segundo (postre is optional)
  const canConfirm = selected.primero && selected.segundo

  const handleSelect = (slot, producto) => {
    setSelected(prev => ({
      ...prev,
      [slot]: prev[slot]?.id === producto.id ? null : producto
    }))
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50" onClick={onCancel}>
      <div
        className="bg-base-100 rounded-t-2xl w-full max-w-lg max-h-[85vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-base-100 border-b border-base-200 px-4 py-3 z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">🍱 Seleccionar Menú</h3>
            <button
              className="btn btn-sm btn-ghost btn-circle min-h-[44px] min-w-[44px]"
              onClick={onCancel}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Selection sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Primero */}
          <SelectionSection
            title="Primero"
            products={primeros}
            selected={selected.primero}
            onSelect={(p) => handleSelect('primero', p)}
          />

          {/* Segundo */}
          <SelectionSection
            title="Segundo"
            products={segundos}
            selected={selected.segundo}
            onSelect={(p) => handleSelect('segundo', p)}
          />

          {/* Postre - OPTIONAL */}
          <SelectionSection
            title="Postre (opcional)"
            products={postres}
            selected={selected.postre}
            onSelect={(p) => handleSelect('postre', p)}
            optional
          />

          {/* Bebida - only if menu includes it */}
          {incluyeBebida && (
            <SelectionSection
              title="Bebida (incluida)"
              products={bebidas}
              selected={selected.bebida}
              onSelect={(p) => handleSelect('bebida', p)}
              optional
            />
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-base-100 border-t border-base-200 p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-base-content/60">
              {selected.primero ? '✓' : '○'} Primero · {selected.segundo ? '✓' : '○'} Segundo{selected.postre ? ' · ✓ Postre' : ' · ○ Postre'}{incluyeBebida ? (selected.bebida ? ' · ✓ Bebida' : ' · ○ Bebida') : ''}
            </span>
            <span className="text-lg font-bold text-primary">{formatPrice(menuDelDia.precio)}</span>
          </div>
          <button
            className={`btn w-full min-h-[44px] ${canConfirm ? 'btn-primary' : 'btn-disabled'}`}
            disabled={!canConfirm}
            onClick={() => onConfirm(selected.primero, selected.segundo, selected.postre, selected.bebida)}
          >
            Agregar Menú
          </button>
        </div>
      </div>
    </div>
  )
}

function SelectionSection({ title, products, selected, onSelect, optional }) {
  if (!products || products.length === 0) {
    return (
      <div>
        <h4 className="text-sm font-bold text-base-content/70 mb-2">{title}</h4>
        <p className="text-xs text-base-content/40">No hay opciones disponibles</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-sm font-bold text-base-content/70">{title}</h4>
        {optional && <span className="badge badge-sm badge-ghost">opcional</span>}
      </div>
      <div className="space-y-1">
        {products.map((p) => {
          const isSelected = selected?.id === p.id
          return (
            <button
              key={p.id}
              className={`w-full flex items-center gap-3 p-3 min-h-[44px] rounded-lg transition-colors text-left ${
                isSelected
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-base-200 hover:bg-base-300 border-2 border-transparent'
              }`}
              onClick={() => onSelect(p)}
            >
              <span className="text-xl">{p.emoji}</span>
              <span className="flex-1 text-sm font-medium">{p.nombre}</span>
              {isSelected && <span className="text-primary text-sm font-bold">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
